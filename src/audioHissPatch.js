import { audio } from './audio.js'

const INSTALL_FLAG = '__normDigitalSpyAudioInstalled'
const MASTER_GAIN = 0.42

let ctx
let master
let digitalEnabled = false
let currentScene = 'dashboard'

function ensureContext() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return null
    ctx = new AudioContextClass()
    master = ctx.createGain()
    const compressor = ctx.createDynamicsCompressor()
    compressor.threshold.value = -12
    compressor.knee.value = 10
    compressor.ratio.value = 2.2
    compressor.attack.value = 0.003
    compressor.release.value = 0.14
    master.gain.value = 0.0001
    master.connect(compressor)
    compressor.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function rampMaster(value, seconds = 0.05) {
  const c = ensureContext()
  if (!c || !master) return
  const now = c.currentTime
  master.gain.cancelScheduledValues(now)
  master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now)
  master.gain.exponentialRampToValueAtTime(Math.max(value, 0.0001), now + seconds)
}

function ping({ frequency = 900, endFrequency = frequency, duration = 0.06, gain = 0.035, type = 'sine', delay = 0, pan = 0 } = {}) {
  if (!digitalEnabled) return false
  const c = ensureContext()
  if (!c || !master) return false
  const now = c.currentTime + delay
  const osc = c.createOscillator()
  const envelope = c.createGain()
  const panner = typeof c.createStereoPanner === 'function' ? c.createStereoPanner() : null

  osc.type = type
  osc.frequency.setValueAtTime(Math.max(40, frequency), now)
  if (endFrequency !== frequency) osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFrequency), now + duration)
  envelope.gain.setValueAtTime(0.0001, now)
  envelope.gain.exponentialRampToValueAtTime(gain, now + Math.min(0.007, duration * 0.2))
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  osc.connect(envelope)
  if (panner) {
    panner.pan.value = Math.max(-1, Math.min(1, pan))
    envelope.connect(panner).connect(master)
  } else {
    envelope.connect(master)
  }
  osc.start(now)
  osc.stop(now + duration + 0.02)
  return true
}

function sequence(notes, { spacing = 0.055, gain = 0.03, duration = 0.055, type = 'sine' } = {}) {
  notes.forEach((frequency, index) => ping({
    frequency,
    endFrequency: frequency * (index % 2 ? 0.985 : 1.015),
    duration,
    gain,
    type,
    delay: index * spacing,
    pan: notes.length > 1 ? ((index / (notes.length - 1)) - 0.5) * 0.18 : 0,
  }))
}

function clickCue() { ping({ frequency: 1080, endFrequency: 860, duration: 0.045, gain: 0.026, type: 'triangle' }) }
function hoverCue() { ping({ frequency: 1760, endFrequency: 1580, duration: 0.025, gain: 0.0065 }) }
function keyCue() { ping({ frequency: 1480, endFrequency: 1320, duration: 0.028, gain: 0.012, type: 'square' }) }
function navCue() { sequence([760, 1040], { spacing: 0.045, gain: 0.022, duration: 0.05, type: 'triangle' }) }
function commandCue() { sequence([940, 1260], { spacing: 0.04, gain: 0.026, duration: 0.052, type: 'square' }) }
function confirmCue() { sequence([720, 980, 1320], { spacing: 0.055, gain: 0.028, duration: 0.065 }) }
function denyCue() { sequence([820, 610], { spacing: 0.065, gain: 0.03, duration: 0.075, type: 'triangle' }) }
function warningCue() { sequence([900, 650, 900], { spacing: 0.075, gain: 0.026, duration: 0.065, type: 'square' }) }
function messageCue() { sequence([880, 1180, 980], { spacing: 0.05, gain: 0.022, duration: 0.052 }) }
function faultCue() { sequence([1420, 1040, 720], { spacing: 0.038, gain: 0.027, duration: 0.045, type: 'square' }) }
function terminalCue() { ping({ frequency: 1640, endFrequency: 1390, duration: 0.03, gain: 0.014, type: 'square' }) }
function terminalOpenCue() { sequence([420, 760, 1120, 1560], { spacing: 0.065, gain: 0.03, duration: 0.065, type: 'triangle' }) }
function scanCue() {
  ping({ frequency: 520, endFrequency: 1850, duration: 0.24, gain: 0.022, type: 'sine' })
  sequence([980, 1320, 1680], { spacing: 0.07, gain: 0.015, duration: 0.04, type: 'square' })
}
function systemReplyCue() { sequence([920, 1380, 1120, 1660], { spacing: 0.06, gain: 0.026, duration: 0.06, type: 'triangle' }) }
function bootCue() { sequence([360, 620, 920, 1280], { spacing: 0.075, gain: 0.024, duration: 0.07, type: 'triangle' }) }
function grantCue() { sequence([620, 900, 1260, 1700], { spacing: 0.055, gain: 0.03, duration: 0.065 }) }
function archiveCue() { sequence([520, 740, 980], { spacing: 0.05, gain: 0.021, duration: 0.055, type: 'triangle' }) }
function documentCue() { sequence([1320, 1160], { spacing: 0.04, gain: 0.014, duration: 0.038, type: 'triangle' }) }
function photoCue() { sequence([1540, 980, 1760], { spacing: 0.035, gain: 0.022, duration: 0.04, type: 'square' }) }
function switchCue() { sequence([540, 1080], { spacing: 0.045, gain: 0.026, duration: 0.055, type: 'triangle' }) }
function modalCue() { sequence([480, 680], { spacing: 0.055, gain: 0.02, duration: 0.065, type: 'sine' }) }

function transitionCue(name) {
  if (name === 'terminal') return terminalOpenCue()
  if (name === 'archive') return archiveCue()
  if (name === 'grimoire') return sequence([480, 720, 960, 1240], { spacing: 0.065, gain: 0.022, duration: 0.065 })
  if (name === 'case') return sequence([1120, 860], { spacing: 0.05, gain: 0.022, duration: 0.055, type: 'square' })
  if (name === 'dashboard') return sequence([680, 920, 760], { spacing: 0.05, gain: 0.02, duration: 0.055 })
  return navCue()
}

function installDigitalSpyAudio() {
  if (audio[INSTALL_FLAG]) return
  Object.defineProperty(audio, INSTALL_FLAG, { value: true, enumerable: false })

  // This is a complete audible override. The rendered noise beds and the legacy
  // procedural noise generator stay dormant, so no white/pink/brown-noise, radio
  // static or "sea-wave" ambience can leak back through another route or event.
  Object.defineProperty(audio, 'enabled', { configurable: true, enumerable: true, get: () => digitalEnabled })

  audio.enable = function digitalEnable() {
    const wasEnabled = digitalEnabled
    digitalEnabled = true
    ensureContext()
    rampMaster(MASTER_GAIN, 0.08)
    if (!wasEnabled) bootCue()
    return true
  }
  audio.disable = function digitalDisable() {
    digitalEnabled = false
    rampMaster(0.0001, 0.05)
    return false
  }
  audio.resume = function digitalResume() {
    if (!digitalEnabled) return false
    ensureContext()
    rampMaster(MASTER_GAIN, 0.035)
    return true
  }
  audio.toggle = function digitalToggle() { return digitalEnabled ? audio.disable() : audio.enable() }
  audio.setVolume = function fixedDigitalVolume() { return 1 }

  // Deliberately no continuous ambience. N.O.R.M. now gets its atmosphere from
  // discrete interface events only, eliminating the hiss/wave bed entirely.
  audio.scene = function digitalScene(name) { currentScene = name || 'dashboard'; return currentScene }
  audio.transition = function digitalTransition(name) { if (digitalEnabled) transitionCue(name) }

  audio.click = clickCue
  audio.hover = hoverCue
  audio.key = keyCue
  audio.tab = navCue
  audio.toggleSwitch = switchCue
  audio.photo = photoCue
  audio.drawer = archiveCue
  audio.radio = messageCue
  audio.confirm = confirmCue
  audio.deny = denyCue
  audio.warning = warningCue
  audio.modal = modalCue
  audio.entity = systemReplyCue
  audio.command = commandCue
  audio.error = faultCue
  audio.scan = scanCue
  audio.archive = archiveCue
  audio.nav = navCue
  audio.stamp = () => sequence([620, 840, 620], { spacing: 0.035, gain: 0.024, duration: 0.04, type: 'square' })
  audio.paper = documentCue
  audio.glitch = faultCue
  audio.terminal = terminalCue
  audio.terminalOpen = terminalOpenCue
  audio.grimoireOpen = () => transitionCue('grimoire')
  audio.dashboardOpen = () => transitionCue('dashboard')
  audio.systemReply = systemReplyCue
  audio.boot = bootCue
  audio.grant = grantCue
}

installDigitalSpyAudio()
