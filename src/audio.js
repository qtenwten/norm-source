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
  // Slider gain remains 0–5; the buses below carry the final +20% loudness profile.
  volume: 1,
}

const sceneProfiles = {
  dashboard: { low: 31, harmonic: 62, lowGain: 0.016, harmonicGain: 0.0044, eventMin: 15000, eventSpread: 16000 },
  case: { low: 29, harmonic: 58, lowGain: 0.015, harmonicGain: 0.004, eventMin: 17000, eventSpread: 17000 },
  agents: { low: 32, harmonic: 64, lowGain: 0.014, harmonicGain: 0.0038, eventMin: 18000, eventSpread: 17000 },
  archive: { low: 28, harmonic: 56, lowGain: 0.015, harmonicGain: 0.0038, eventMin: 19000, eventSpread: 18000 },
  report: { low: 34, harmonic: 68, lowGain: 0.015, harmonicGain: 0.004, eventMin: 16000, eventSpread: 15000 },
  grimoire: { low: 24, harmonic: 48, lowGain: 0.012, harmonicGain: 0.0028, eventMin: 22000, eventSpread: 21000 },
  terminal: { low: 38, harmonic: 76, lowGain: 0.019, harmonicGain: 0.0058, eventMin: 7000, eventSpread: 8000 },
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
    compressor.threshold.value = -10
    compressor.knee.value = 14
    compressor.ratio.value = 2.6
    compressor.attack.value = 0.003
    compressor.release.value = 0.16

    // User-approved final calibration: 20% louder than the previous 100% test position.
    ambienceBus.gain.value = 0.384
    fxBus.gain.value = 1.944
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

function mechanicalToggle(strength = 1) {
  filteredNoise({ duration: 0.018, gain: 0.07 * strength, frequency: 2700, type: 'highpass', q: 1.2, pan: -0.08 })
  oscHit({ frequency: 148, endFrequency: 104, duration: 0.07, gain: 0.028 * strength, type: 'triangle' })
  window.setTimeout(() => relayClick(0.24 * strength), 62)
}

function tabSnap(strength = 1) {
  dataTick(-0.12, 0.42 * strength)
  oscHit({ frequency: 330, endFrequency: 248, duration: 0.065, gain: 0.018 * strength, type: 'triangle', delay: 0.012 })
  filteredNoise({ duration: 0.035, gain: 0.022 * strength, frequency: 1800, type: 'bandpass', q: 3, delay: 0.02 })
}

function cameraShutter(strength = 1) {
  filteredNoise({ duration: 0.022, gain: 0.095 * strength, frequency: 3600, type: 'highpass', q: 0.7, pan: -0.12 })
  relayClick(0.42 * strength)
  window.setTimeout(() => filteredNoise({ duration: 0.032, gain: 0.055 * strength, frequency: 2500, type: 'highpass', q: 1.1, pan: 0.14 }), 78)
}

function drawerSlide(strength = 1) {
  filteredNoise({ duration: 0.18, gain: 0.038 * strength, frequency: 650, type: 'bandpass', q: 0.6, brown: true, pan: -0.18 })
  oscHit({ frequency: 62, endFrequency: 45, duration: 0.2, gain: 0.028 * strength, type: 'triangle' })
  window.setTimeout(() => relayClick(0.46 * strength), 145)
}

function radioBurst(strength = 1) {
  filteredNoise({ duration: 0.13, gain: 0.05 * strength, frequency: 2400, type: 'bandpass', q: 1.8, pan: -0.35 })
  dataTick(0.2, 0.55 * strength)
  window.setTimeout(() => dataTick(-0.18, 0.42 * strength), 70)
  window.setTimeout(() => filteredNoise({ duration: 0.08, gain: 0.035 * strength, frequency: 1200, type: 'bandpass', q: 2.4, pan: 0.28 }), 120)
}

function confirmPulse(strength = 1) {
  relayClick(0.42 * strength)
  oscHit({ frequency: 196, endFrequency: 247, duration: 0.15, gain: 0.026 * strength, type: 'sine', delay: 0.025 })
  oscHit({ frequency: 294, endFrequency: 370, duration: 0.18, gain: 0.018 * strength, type: 'sine', delay: 0.08 })
}

function denyPulse(strength = 1) {
  oscHit({ frequency: 128, endFrequency: 70, duration: 0.2, gain: 0.038 * strength, type: 'triangle' })
  filteredNoise({ duration: 0.08, gain: 0.04 * strength, frequency: 820, type: 'bandpass', q: 2.8, delay: 0.025 })
  window.setTimeout(() => relayClick(0.32 * strength), 90)
}

function warningPulse(strength = 1) {
  oscHit({ frequency: 112, endFrequency: 88, duration: 0.16, gain: 0.035 * strength, type: 'triangle' })
  window.setTimeout(() => oscHit({ frequency: 112, endFrequency: 82, duration: 0.18, gain: 0.032 * strength, type: 'triangle' }), 150)
  filteredNoise({ duration: 0.05, gain: 0.03 * strength, frequency: 1400, type: 'bandpass', q: 2 })
}

function modalThump(strength = 1) {
  oscHit({ frequency: 72, endFrequency: 42, duration: 0.28, gain: 0.044 * strength, type: 'sine' })
  filteredNoise({ duration: 0.07, gain: 0.035 * strength, frequency: 420, type: 'bandpass', q: 1.1, delay: 0.018, brown: true })
}

function entityPulse(strength = 1) {
  oscHit({ frequency: 54, endFrequency: 29, duration: 0.46, gain: 0.052 * strength, type: 'sine' })
  filteredNoise({ duration: 0.14, gain: 0.034 * strength, frequency: 980, type: 'bandpass', q: 3.6, delay: 0.06, pan: -0.25 })
  filteredNoise({ duration: 0.1, gain: 0.026 * strength, frequency: 2100, type: 'bandpass', q: 5, delay: 0.13, pan: 0.32 })
}

function hoverTick(strength = 1) {
  dataTick((Math.random() - 0.5) * 0.18, 0.16 * strength)
}

function scheduleAmbientEvent() {
  if (ambienceTimer) window.clearTimeout(ambienceTimer)
  const profile = sceneProfiles[currentScene] || sceneProfiles.dashboard
  const delay = profile.eventMin + Math.random() * profile.eventSpread

  ambienceTimer = window.setTimeout(() => {
    if (enabled) {
      const pan = (Math.random() - 0.5) * 0.7
      if (currentScene === 'terminal') {
        radioBurst(0.12)
        if (Math.random() < 0.36) window.setTimeout(() => dataTick(-pan, 0.14), 150)
      } else if (currentScene === 'grimoire') {
        paperFlick(0.2)
        oscHit({ frequency: 43, endFrequency: 36, duration: 0.42, gain: 0.008, type: 'sine' })
      } else if (currentScene === 'archive') {
        drawerSlide(0.12)
      } else if (currentScene === 'case' && Math.random() < 0.36) {
        cameraShutter(0.08)
      } else if (Math.random() < 0.55) {
        dataTick(pan, 0.15)
      } else {
        relayClick(0.12)
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
  lfoGain.gain.value = 0.0013
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
  relayClick(1.15)
  oscHit({ frequency: 52, endFrequency: 38, duration: 0.62, gain: 0.09, type: 'sine' })
  window.setTimeout(() => relayClick(0.72), 175)
  window.setTimeout(() => dataTick(-0.18, 0.9), 315)
  window.setTimeout(() => dataTick(0.22, 0.84), 390)
  window.setTimeout(() => confirmPulse(0.55), 520)
}

function grantSequence() {
  relayClick(0.82)
  oscHit({ frequency: 182, endFrequency: 230, duration: 0.22, gain: 0.026, type: 'sine' })
  oscHit({ frequency: 274, endFrequency: 344, duration: 0.28, gain: 0.018, type: 'sine', delay: 0.055 })
  window.setTimeout(() => confirmPulse(0.62), 170)
}

function dashboardTransition() {
  archiveClack(0.95)
  oscHit({ frequency: 78, endFrequency: 51, duration: 0.26, gain: 0.045, type: 'sine' })
  window.setTimeout(() => dataTick(0.15, 0.62), 140)
}

function grimoireTransition() {
  paperFlick(1.2)
  oscHit({ frequency: 49, endFrequency: 34, duration: 0.52, gain: 0.036, type: 'sine' })
  window.setTimeout(() => paperFlick(0.62), 170)
}

function terminalTransition() {
  radioBurst(0.92)
  relayClick(1.02)
  oscHit({ frequency: 92, endFrequency: 46, duration: 0.34, gain: 0.055, type: 'sine' })
  window.setTimeout(() => dataTick(-0.35, 1), 85)
  window.setTimeout(() => dataTick(0.25, 0.9), 150)
  window.setTimeout(() => dataTick(-0.05, 0.74), 205)
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
    state.volume = Math.min(5, Math.max(0.0001, Number(value) || 1))
    if (enabled) rampMaster(state.volume, 0.06)
  },

  get volume() {
    return state.volume
  },

  scene(name) {
    applyScene(name)
  },

  transition(name) {
    if (name === 'grimoire') grimoireTransition()
    else if (name === 'terminal') terminalTransition()
    else if (name === 'dashboard') dashboardTransition()
    else if (name === 'archive') drawerSlide(0.9)
    else if (name === 'case') cameraShutter(0.6)
    else {
      archiveClack(0.8)
      dataTick((Math.random() - 0.5) * 0.3, 0.55)
    }
  },

  get enabled() {
    return enabled
  },

  get initialized() {
    return initialized
  },

  click() {
    relayClick(0.48)
  },

  hover() {
    hoverTick(1)
  },

  key() {
    dataTick((Math.random() - 0.5) * 0.22, 0.3)
  },

  tab() {
    tabSnap(1)
  },

  toggleSwitch() {
    mechanicalToggle(1)
  },

  photo() {
    cameraShutter(0.85)
  },

  drawer() {
    drawerSlide(0.9)
  },

  radio() {
    radioBurst(0.85)
  },

  confirm() {
    confirmPulse(1)
  },

  deny() {
    denyPulse(1)
  },

  warning() {
    warningPulse(1)
  },

  modal() {
    modalThump(1)
  },

  entity() {
    entityPulse(1)
  },

  command() {
    relayClick(0.7)
    window.setTimeout(() => dataTick(0.12, 0.75), 55)
  },

  error() {
    denyPulse(1.05)
  },

  scan() {
    radioBurst(0.72)
    dataTick(-0.45, 0.9)
    window.setTimeout(() => dataTick(-0.1, 0.78), 90)
    window.setTimeout(() => dataTick(0.26, 0.84), 180)
    window.setTimeout(() => oscHit({ frequency: 68, endFrequency: 48, duration: 0.38, gain: 0.032, type: 'sine' }), 120)
  },

  archive() {
    drawerSlide(0.82)
    window.setTimeout(() => paperFlick(0.46), 80)
  },

  nav() {
    archiveClack(0.78)
  },

  stamp() {
    filteredNoise({ duration: 0.055, gain: 0.105, frequency: 1050, type: 'bandpass', q: 0.55 })
    oscHit({ frequency: 70, endFrequency: 38, duration: 0.22, gain: 0.09, type: 'sine' })
  },

  paper() {
    paperFlick(1.05)
  },

  glitch() {
    filteredNoise({ duration: 0.038, gain: 0.082, frequency: 3900, type: 'highpass', pan: -0.55 })
    filteredNoise({ duration: 0.028, gain: 0.068, frequency: 1450, type: 'bandpass', q: 4.5, delay: 0.041, pan: 0.5 })
    oscHit({ frequency: 138, endFrequency: 54, duration: 0.15, gain: 0.04, type: 'sine' })
  },

  terminal() {
    dataTick((Math.random() - 0.5) * 0.45, 1)
  },

  terminalOpen() {
    terminalTransition()
    window.setTimeout(() => oscHit({ frequency: 116, endFrequency: 82, duration: 0.48, gain: 0.028, type: 'sine' }), 210)
  },

  grimoireOpen() {
    grimoireTransition()
  },

  dashboardOpen() {
    dashboardTransition()
  },

  systemReply() {
    entityPulse(0.82)
    oscHit({ frequency: 44, endFrequency: 27, duration: 0.72, gain: 0.074, type: 'sine' })
    window.setTimeout(() => relayClick(0.42), 90)
    window.setTimeout(() => dataTick(-0.25, 0.66), 240)
  },

  boot() {
    bootSequence()
  },

  grant() {
    grantSequence()
  },
}
