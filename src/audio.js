let ctx
let master
let ambienceBus
let fxBus
let ambienceSource
let ambienceLfo
let ambienceLfoGain
let enabled = false
let initialized = false

const state = {
  volume: 0.72,
}

function ensure() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return null

    ctx = new AudioContextClass()
    master = ctx.createGain()
    ambienceBus = ctx.createGain()
    fxBus = ctx.createGain()

    const compressor = ctx.createDynamicsCompressor()
    compressor.threshold.value = -20
    compressor.knee.value = 18
    compressor.ratio.value = 4
    compressor.attack.value = 0.004
    compressor.release.value = 0.18

    ambienceBus.gain.value = 0.38
    fxBus.gain.value = 0.88
    master.gain.value = enabled ? state.volume : 0

    ambienceBus.connect(master)
    fxBus.connect(master)
    master.connect(compressor)
    compressor.connect(ctx.destination)
    initialized = true
  }

  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function rampMaster(target, seconds = 0.09) {
  if (!ctx || !master) return
  const now = ctx.currentTime
  master.gain.cancelScheduledValues(now)
  master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now)
  master.gain.exponentialRampToValueAtTime(Math.max(target, 0.0001), now + seconds)
}

function createNoiseBuffer(duration = 0.25, brown = false) {
  const c = ensure()
  if (!c) return null
  const length = Math.max(1, Math.floor(c.sampleRate * duration))
  const buffer = c.createBuffer(1, length, c.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0

  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1
    if (brown) {
      last = (last + 0.018 * white) / 1.018
      data[i] = last * 3.2
    } else {
      data[i] = white
    }
  }
  return buffer
}

function filteredNoise({
  duration = 0.12,
  gain = 0.04,
  frequency = 1200,
  type = 'bandpass',
  q = 0.8,
  destination = fxBus,
  delay = 0,
  pan = 0,
  brown = false,
} = {}) {
  if (!enabled) return
  const c = ensure()
  if (!c || !destination) return

  const src = c.createBufferSource()
  const filter = c.createBiquadFilter()
  const envelope = c.createGain()
  const panner = typeof c.createStereoPanner === 'function' ? c.createStereoPanner() : null
  const now = c.currentTime + delay

  src.buffer = createNoiseBuffer(duration, brown)
  filter.type = type
  filter.frequency.setValueAtTime(frequency, now)
  filter.Q.value = q
  envelope.gain.setValueAtTime(0.0001, now)
  envelope.gain.exponentialRampToValueAtTime(gain, now + Math.min(0.008, duration * 0.2))
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  src.connect(filter)
  if (panner) {
    panner.pan.value = pan
    filter.connect(envelope).connect(panner).connect(destination)
  } else {
    filter.connect(envelope).connect(destination)
  }

  src.start(now)
  src.stop(now + duration + 0.02)
}

function oscHit({
  frequency = 110,
  endFrequency,
  duration = 0.15,
  gain = 0.04,
  type = 'sine',
  delay = 0,
  pan = 0,
} = {}) {
  if (!enabled) return
  const c = ensure()
  if (!c) return

  const osc = c.createOscillator()
  const envelope = c.createGain()
  const panner = typeof c.createStereoPanner === 'function' ? c.createStereoPanner() : null
  const now = c.currentTime + delay

  osc.type = type
  osc.frequency.setValueAtTime(frequency, now)
  if (endFrequency && endFrequency > 0) {
    osc.frequency.exponentialRampToValueAtTime(endFrequency, now + duration)
  }
  envelope.gain.setValueAtTime(0.0001, now)
  envelope.gain.exponentialRampToValueAtTime(gain, now + Math.min(0.012, duration * 0.2))
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  if (panner) {
    panner.pan.value = pan
    osc.connect(envelope).connect(panner).connect(fxBus)
  } else {
    osc.connect(envelope).connect(fxBus)
  }

  osc.start(now)
  osc.stop(now + duration + 0.02)
}

function startAmbience() {
  const c = ensure()
  if (!c || ambienceSource) return

  const src = c.createBufferSource()
  const lowpass = c.createBiquadFilter()
  const highpass = c.createBiquadFilter()
  const gain = c.createGain()
  const lfo = c.createOscillator()
  const lfoGain = c.createGain()

  src.buffer = createNoiseBuffer(4.5, true)
  src.loop = true
  lowpass.type = 'lowpass'
  lowpass.frequency.value = 430
  highpass.type = 'highpass'
  highpass.frequency.value = 35
  gain.gain.value = 0.055

  lfo.type = 'sine'
  lfo.frequency.value = 0.075
  lfoGain.gain.value = 0.012
  lfo.connect(lfoGain).connect(gain.gain)

  src.connect(highpass).connect(lowpass).connect(gain).connect(ambienceBus)
  src.start()
  lfo.start()

  ambienceSource = src
  ambienceLfo = lfo
  ambienceLfoGain = lfoGain
}

function relayClick(strength = 1) {
  filteredNoise({ duration: 0.034, gain: 0.105 * strength, frequency: 2600, type: 'highpass', q: 0.7 })
  filteredNoise({ duration: 0.065, gain: 0.035 * strength, frequency: 520, type: 'bandpass', q: 2.4, delay: 0.012 })
  oscHit({ frequency: 96, endFrequency: 64, duration: 0.07, gain: 0.025 * strength, type: 'sine' })
}

function dataTick(pan = 0) {
  filteredNoise({ duration: 0.025, gain: 0.023, frequency: 3800 + Math.random() * 1500, type: 'bandpass', q: 5, pan })
  oscHit({ frequency: 920 + Math.random() * 180, endFrequency: 680, duration: 0.032, gain: 0.0075, type: 'sine', pan })
}

function bootSequence() {
  relayClick(1.15)
  oscHit({ frequency: 52, endFrequency: 38, duration: 0.72, gain: 0.105, type: 'sine' })
  filteredNoise({ duration: 0.42, gain: 0.035, frequency: 980, type: 'bandpass', q: 0.55, brown: true, delay: 0.05 })
  setTimeout(() => relayClick(0.78), 170)
  setTimeout(() => dataTick(-0.18), 320)
  setTimeout(() => dataTick(0.22), 390)
}

function grantSequence() {
  relayClick(0.75)
  oscHit({ frequency: 182, endFrequency: 230, duration: 0.22, gain: 0.022, type: 'sine' })
  oscHit({ frequency: 274, endFrequency: 344, duration: 0.28, gain: 0.014, type: 'sine', delay: 0.055 })
  filteredNoise({ duration: 0.22, gain: 0.018, frequency: 1700, type: 'highpass', delay: 0.02 })
}

export const audio = {
  enable() {
    enabled = true
    ensure()
    rampMaster(state.volume, 0.14)
    startAmbience()
    bootSequence()
    return true
  },

  disable() {
    enabled = false
    rampMaster(0.0001, 0.08)
    return false
  },

  toggle() {
    return enabled ? this.disable() : this.enable()
  },

  setVolume(value) {
    state.volume = Math.min(1, Math.max(0.05, Number(value) || 0.72))
    if (enabled) rampMaster(state.volume, 0.06)
  },

  get enabled() {
    return enabled
  },

  get initialized() {
    return initialized
  },

  click() {
    relayClick(0.4)
  },

  nav() {
    relayClick(0.75)
    filteredNoise({ duration: 0.24, gain: 0.032, frequency: 1250, type: 'bandpass', q: 0.7, pan: -0.12 })
    filteredNoise({ duration: 0.16, gain: 0.02, frequency: 2500, type: 'highpass', delay: 0.08, pan: 0.18 })
    oscHit({ frequency: 76, endFrequency: 48, duration: 0.24, gain: 0.045, type: 'sine' })
  },

  stamp() {
    filteredNoise({ duration: 0.075, gain: 0.12, frequency: 1200, type: 'bandpass', q: 0.5 })
    oscHit({ frequency: 72, endFrequency: 39, duration: 0.24, gain: 0.095, type: 'sine' })
    setTimeout(() => filteredNoise({ duration: 0.06, gain: 0.045, frequency: 360, type: 'lowpass', brown: true }), 26)
  },

  glitch() {
    filteredNoise({ duration: 0.045, gain: 0.085, frequency: 3600, type: 'highpass', pan: -0.55 })
    filteredNoise({ duration: 0.032, gain: 0.075, frequency: 1350, type: 'bandpass', q: 4.2, delay: 0.043, pan: 0.5 })
    filteredNoise({ duration: 0.07, gain: 0.055, frequency: 5400, type: 'highpass', delay: 0.082, pan: -0.2 })
    oscHit({ frequency: 148, endFrequency: 57, duration: 0.17, gain: 0.038, type: 'sine' })
  },

  terminal() {
    dataTick((Math.random() - 0.5) * 0.45)
  },

  boot() {
    bootSequence()
  },

  grant() {
    grantSequence()
  },
}
