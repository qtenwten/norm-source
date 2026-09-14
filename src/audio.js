let ctx
let master
let ambienceBus
let fxBus
let ambienceNodes
let ambienceTimer
let enabled = false
let initialized = false
let currentScene = 'dashboard'

const state = {
  volume: 0.72,
}

const sceneProfiles = {
  dashboard: { low: 31, harmonic: 62, lowGain: 0.012, harmonicGain: 0.0032, eventMin: 18000, eventSpread: 18000 },
  case: { low: 29, harmonic: 58, lowGain: 0.011, harmonicGain: 0.0028, eventMin: 21000, eventSpread: 19000 },
  agents: { low: 32, harmonic: 64, lowGain: 0.01, harmonicGain: 0.0026, eventMin: 22000, eventSpread: 19000 },
  archive: { low: 28, harmonic: 56, lowGain: 0.0105, harmonicGain: 0.0026, eventMin: 24000, eventSpread: 21000 },
  report: { low: 34, harmonic: 68, lowGain: 0.0105, harmonicGain: 0.0028, eventMin: 19000, eventSpread: 17000 },
  grimoire: { low: 24, harmonic: 48, lowGain: 0.008, harmonicGain: 0.0018, eventMin: 30000, eventSpread: 26000 },
  terminal: { low: 38, harmonic: 76, lowGain: 0.014, harmonicGain: 0.0042, eventMin: 9000, eventSpread: 9000 },
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

    ambienceBus.gain.value = 0.2
    fxBus.gain.value = 0.86
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

function rampParam(param, value, seconds = 0.4) {
  if (!ctx || !param) return
  const now = ctx.currentTime
  param.cancelScheduledValues(now)
  param.setValueAtTime(Math.max(param.value, 0.0001), now)
  param.exponentialRampToValueAtTime(Math.max(value, 0.0001), now + seconds)
}

function rampMaster(target, seconds = 0.09) {
  if (!ctx || !master) return
  rampParam(master.gain, target, seconds)
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

function relayClick(strength = 1) {
  filteredNoise({ duration: 0.026, gain: 0.08 * strength, frequency: 3100, type: 'highpass', q: 0.9 })
  filteredNoise({ duration: 0.052, gain: 0.026 * strength, frequency: 460, type: 'bandpass', q: 2.1, delay: 0.009 })
  oscHit({ frequency: 92, endFrequency: 61, duration: 0.065, gain: 0.02 * strength, type: 'sine' })
}

function dataTick(pan = 0, strength = 1) {
  filteredNoise({ duration: 0.018, gain: 0.017 * strength, frequency: 4200 + Math.random() * 1200, type: 'bandpass', q: 6, pan })
  oscHit({ frequency: 860 + Math.random() * 130, endFrequency: 710, duration: 0.028, gain: 0.0055 * strength, type: 'sine', pan })
}

function paperFlick(strength = 1) {
  filteredNoise({ duration: 0.085, gain: 0.032 * strength, frequency: 1800, type: 'bandpass', q: 0.65, brown: true, pan: -0.15 })
  filteredNoise({ duration: 0.11, gain: 0.018 * strength, frequency: 900, type: 'bandpass', q: 0.5, brown: true, delay: 0.035, pan: 0.12 })
}

function archiveClack(strength = 1) {
  relayClick(0.34 * strength)
  oscHit({ frequency: 84, endFrequency: 52, duration: 0.17, gain: 0.022 * strength, type: 'triangle', delay: 0.025 })
}

function scheduleAmbientEvent() {
  if (ambienceTimer) window.clearTimeout(ambienceTimer)
  const profile = sceneProfiles[currentScene] || sceneProfiles.dashboard
  const delay = profile.eventMin + Math.random() * profile.eventSpread

  ambienceTimer = window.setTimeout(() => {
    if (enabled) {
      const pan = (Math.random() - 0.5) * 0.7
      if (currentScene === 'terminal') {
        dataTick(pan, 0.16)
        if (Math.random() < 0.3) window.setTimeout(() => dataTick(-pan, 0.11), 120)
      } else if (currentScene === 'grimoire') {
        paperFlick(0.16)
        oscHit({ frequency: 43, endFrequency: 36, duration: 0.42, gain: 0.006, type: 'sine' })
      } else if (currentScene === 'archive') {
        archiveClack(0.18)
      } else if (Math.random() < 0.55) {
        dataTick(pan, 0.12)
      } else {
        relayClick(0.09)
      }
    }
    scheduleAmbientEvent()
  }, delay)
}

function startAmbience() {
  const c = ensure()
  if (!c || ambienceNodes) return

  const low = c.createOscillator()
  const lowGain = c.createGain()
  const harmonic = c.createOscillator()
  const harmonicGain = c.createGain()
  const lfo = c.createOscillator()
  const lfoGain = c.createGain()

  low.type = 'sine'
  harmonic.type = 'triangle'
  lfo.type = 'sine'
  lfo.frequency.value = 0.04
  lfoGain.gain.value = 0.0011
  lfo.connect(lfoGain).connect(harmonicGain.gain)
  low.connect(lowGain).connect(ambienceBus)
  harmonic.connect(harmonicGain).connect(ambienceBus)

  ambienceNodes = { low, lowGain, harmonic, harmonicGain, lfo, lfoGain }
  low.start()
  harmonic.start()
  lfo.start()
  applyScene(currentScene, true)
  scheduleAmbientEvent()
}

function applyScene(name, immediate = false) {
  currentScene = sceneProfiles[name] ? name : 'dashboard'
  if (!ambienceNodes || !ctx) return
  const profile = sceneProfiles[currentScene]
  const seconds = immediate ? 0.02 : 0.75

  rampParam(ambienceNodes.low.frequency, profile.low, seconds)
  rampParam(ambienceNodes.harmonic.frequency, profile.harmonic, seconds)
  rampParam(ambienceNodes.lowGain.gain, profile.lowGain, seconds)
  rampParam(ambienceNodes.harmonicGain.gain, profile.harmonicGain, seconds)
  scheduleAmbientEvent()
}

function bootSequence() {
  relayClick(0.95)
  oscHit({ frequency: 52, endFrequency: 38, duration: 0.62, gain: 0.075, type: 'sine' })
  window.setTimeout(() => relayClick(0.55), 175)
  window.setTimeout(() => dataTick(-0.18, 0.7), 315)
  window.setTimeout(() => dataTick(0.22, 0.65), 390)
}

function grantSequence() {
  relayClick(0.6)
  oscHit({ frequency: 182, endFrequency: 230, duration: 0.22, gain: 0.018, type: 'sine' })
  oscHit({ frequency: 274, endFrequency: 344, duration: 0.28, gain: 0.011, type: 'sine', delay: 0.055 })
}

function dashboardTransition() {
  archiveClack(0.7)
  oscHit({ frequency: 78, endFrequency: 51, duration: 0.26, gain: 0.033, type: 'sine' })
  window.setTimeout(() => dataTick(0.15, 0.45), 140)
}

function grimoireTransition() {
  paperFlick(0.95)
  oscHit({ frequency: 49, endFrequency: 34, duration: 0.52, gain: 0.026, type: 'sine' })
  window.setTimeout(() => paperFlick(0.48), 170)
}

function terminalTransition() {
  relayClick(0.85)
  oscHit({ frequency: 92, endFrequency: 46, duration: 0.34, gain: 0.042, type: 'sine' })
  window.setTimeout(() => dataTick(-0.35, 0.8), 85)
  window.setTimeout(() => dataTick(0.25, 0.72), 150)
  window.setTimeout(() => dataTick(-0.05, 0.6), 205)
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

  scene(name) {
    applyScene(name)
  },

  transition(name) {
    if (name === 'grimoire') grimoireTransition()
    else if (name === 'terminal') terminalTransition()
    else if (name === 'dashboard') dashboardTransition()
    else {
      archiveClack(0.55)
      dataTick((Math.random() - 0.5) * 0.3, 0.38)
    }
  },

  get enabled() {
    return enabled
  },

  get initialized() {
    return initialized
  },

  click() {
    relayClick(0.28)
  },

  key() {
    dataTick((Math.random() - 0.5) * 0.22, 0.16)
  },

  command() {
    relayClick(0.44)
    window.setTimeout(() => dataTick(0.12, 0.5), 55)
  },

  error() {
    oscHit({ frequency: 118, endFrequency: 74, duration: 0.18, gain: 0.025, type: 'triangle' })
    window.setTimeout(() => relayClick(0.18), 50)
  },

  scan() {
    dataTick(-0.45, 0.6)
    window.setTimeout(() => dataTick(-0.1, 0.5), 90)
    window.setTimeout(() => dataTick(0.26, 0.55), 180)
    window.setTimeout(() => oscHit({ frequency: 68, endFrequency: 48, duration: 0.38, gain: 0.021, type: 'sine' }), 120)
  },

  archive() {
    archiveClack(0.82)
    window.setTimeout(() => paperFlick(0.3), 60)
  },

  nav() {
    archiveClack(0.5)
  },

  stamp() {
    filteredNoise({ duration: 0.055, gain: 0.078, frequency: 1050, type: 'bandpass', q: 0.55 })
    oscHit({ frequency: 70, endFrequency: 38, duration: 0.22, gain: 0.07, type: 'sine' })
  },

  paper() {
    paperFlick(0.7)
  },

  glitch() {
    filteredNoise({ duration: 0.038, gain: 0.058, frequency: 3900, type: 'highpass', pan: -0.55 })
    filteredNoise({ duration: 0.028, gain: 0.048, frequency: 1450, type: 'bandpass', q: 4.5, delay: 0.041, pan: 0.5 })
    oscHit({ frequency: 138, endFrequency: 54, duration: 0.15, gain: 0.028, type: 'sine' })
  },

  terminal() {
    dataTick((Math.random() - 0.5) * 0.45, 0.72)
  },

  terminalOpen() {
    terminalTransition()
    window.setTimeout(() => oscHit({ frequency: 116, endFrequency: 82, duration: 0.48, gain: 0.018, type: 'sine' }), 210)
  },

  grimoireOpen() {
    grimoireTransition()
  },

  dashboardOpen() {
    dashboardTransition()
  },

  systemReply() {
    oscHit({ frequency: 44, endFrequency: 27, duration: 0.72, gain: 0.055, type: 'sine' })
    window.setTimeout(() => relayClick(0.26), 90)
    window.setTimeout(() => dataTick(-0.25, 0.45), 240)
  },

  boot() {
    bootSequence()
  },

  grant() {
    grantSequence()
  },
}
