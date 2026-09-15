import { audio } from './audio.js'

const AUDIO_BASE = `${import.meta.env.BASE_URL || '/'}audio/`
const MANIFEST_URL = `${AUDIO_BASE}audio-manifest.json`
const INSTALL_FLAG = '__normProductionAudioInstalled'

let ctx
let master
let fxBus
let ambienceBus
let spriteBuffer
let cueManifest = {}
let ambienceBuffers = new Map()
let ambienceSource
let loadPromise
let layerEnabled = false
let currentScene = 'dashboard'
const cueLastStartedAt = new Map()

const sceneAmbience = {
  dashboard: ['server', 0.11],
  case: ['server', 0.09],
  agents: ['server', 0.085],
  report: ['server', 0.09],
  archive: ['archive', 0.12],
  grimoire: ['grimoire', 0.13],
  terminal: ['terminal', 0.115],
}

function ensureContext() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return null
    ctx = new AudioContextClass()
    master = ctx.createGain()
    fxBus = ctx.createGain()
    ambienceBus = ctx.createGain()
    const compressor = ctx.createDynamicsCompressor()
    compressor.threshold.value = -12
    compressor.knee.value = 16
    compressor.ratio.value = 3
    compressor.attack.value = 0.004
    compressor.release.value = 0.2
    fxBus.gain.value = 0.72
    ambienceBus.gain.value = 0.28
    master.gain.value = layerEnabled ? 0.95 : 0.0001
    fxBus.connect(master)
    ambienceBus.connect(master)
    master.connect(compressor)
    compressor.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function ramp(param, value, seconds = 0.1) {
  if (!ctx || !param) return
  const now = ctx.currentTime
  param.cancelScheduledValues(now)
  param.setValueAtTime(Math.max(param.value, 0.0001), now)
  param.exponentialRampToValueAtTime(Math.max(value, 0.0001), now + seconds)
}

async function decode(url) {
  const c = ensureContext()
  if (!c) return null
  const response = await fetch(url, { cache: 'force-cache' })
  if (!response.ok) throw new Error(`${response.status} ${url}`)
  return c.decodeAudioData((await response.arrayBuffer()).slice(0))
}

async function loadLibrary() {
  if (loadPromise) return loadPromise
  loadPromise = (async () => {
    const response = await fetch(MANIFEST_URL, { cache: 'force-cache' })
    if (!response.ok) throw new Error(`${response.status} ${MANIFEST_URL}`)
    const manifest = await response.json()
    const [sprite, ...ambience] = await Promise.all([
      decode(`${AUDIO_BASE}${manifest.sprite}`),
      ...Object.entries(manifest.ambience).map(async ([key, path]) => [key, await decode(`${AUDIO_BASE}${path}`)]),
    ])
    spriteBuffer = sprite
    cueManifest = manifest.cues || {}
    ambienceBuffers = new Map(ambience)
    if (layerEnabled) syncAmbience(true)
    return true
  })().catch((error) => {
    console.warn('N.O.R.M. production SFX unavailable; procedural layer remains active.', error)
    return false
  })
  return loadPromise
}

function playCue(name, { gain = 0.28, pan = 0, rate = 1, delay = 0, cooldown = 0.055 } = {}) {
  if (!layerEnabled || !spriteBuffer) return false
  const wallNow = typeof performance !== 'undefined' ? performance.now() : Date.now()
  const lastStarted = cueLastStartedAt.get(name) || -Infinity
  if (wallNow - lastStarted < cooldown * 1000) return false
  const cue = cueManifest[name]
  const c = ensureContext()
  if (!cue || !c || !fxBus) return false
  const source = c.createBufferSource()
  const envelope = c.createGain()
  const panner = typeof c.createStereoPanner === 'function' ? c.createStereoPanner() : null
  source.buffer = spriteBuffer
  source.playbackRate.value = Math.max(0.9, Math.min(1.1, rate))
  envelope.gain.value = gain
  source.connect(envelope)
  if (panner) {
    panner.pan.value = Math.max(-1, Math.min(1, pan))
    envelope.connect(panner).connect(fxBus)
  } else {
    envelope.connect(fxBus)
  }
  source.start(c.currentTime + delay, cue.start, cue.duration)
  cueLastStartedAt.set(name, wallNow)
  return true
}

function syncAmbience(immediate = false) {
  if (!layerEnabled || !ctx || !ambienceBus) return
  const [key, targetGain] = sceneAmbience[currentScene] || sceneAmbience.dashboard
  const buffer = ambienceBuffers.get(key)
  if (!buffer) return
  if (ambienceSource?.key === key) {
    ramp(ambienceSource.gain.gain, targetGain, immediate ? 0.03 : 0.7)
    return
  }
  const now = ctx.currentTime
  if (ambienceSource) {
    const previous = ambienceSource
    previous.gain.gain.cancelScheduledValues(now)
    previous.gain.gain.setValueAtTime(Math.max(previous.gain.gain.value, 0.0001), now)
    previous.gain.gain.exponentialRampToValueAtTime(0.0001, now + (immediate ? 0.04 : 0.8))
    window.setTimeout(() => {
      try { previous.source.stop() } catch { /* source already stopped */ }
    }, immediate ? 80 : 900)
  }
  const source = ctx.createBufferSource()
  const gain = ctx.createGain()
  source.buffer = buffer
  source.loop = true
  gain.gain.value = 0.0001
  source.connect(gain).connect(ambienceBus)
  source.start(now)
  ambienceSource = { key, source, gain }
  ramp(gain.gain, targetGain, immediate ? 0.04 : 0.95)
}

function enableLayer() {
  layerEnabled = true
  ensureContext()
  ramp(master?.gain, 0.95, 0.12)
  void loadLibrary()
  syncAmbience(true)
}

function disableLayer() {
  layerEnabled = false
  ramp(master?.gain, 0.0001, 0.08)
}

function randomRate(amount = 0.035) {
  return 1 + (Math.random() - 0.5) * amount * 2
}

function install() {
  if (audio[INSTALL_FLAG]) return
  Object.defineProperty(audio, INSTALL_FLAG, { value: true, enumerable: false })

  const original = {}
  for (const name of [
    'enable', 'disable', 'resume', 'scene', 'transition', 'click', 'key', 'tab', 'toggleSwitch',
    'photo', 'drawer', 'radio', 'confirm', 'deny', 'warning', 'modal', 'command', 'error', 'scan',
    'archive', 'nav', 'stamp', 'paper', 'glitch', 'terminalOpen', 'grimoireOpen', 'dashboardOpen',
    'systemReply', 'boot', 'grant',
  ]) original[name] = audio[name].bind(audio)

  audio.enable = function productionEnable() {
    const result = original.enable()
    enableLayer()
    return result
  }
  audio.disable = function productionDisable() {
    disableLayer()
    return original.disable()
  }
  audio.resume = function productionResume() {
    const result = original.resume()
    if (audio.enabled) enableLayer()
    return result
  }
  audio.scene = function productionScene(name) {
    const result = original.scene(name)
    currentScene = sceneAmbience[name] ? name : 'dashboard'
    syncAmbience()
    return result
  }
  audio.transition = function productionTransition(name) {
    const result = original.transition(name)
    if (name === 'grimoire') playCue('grimoireOpen', { gain: 0.34, rate: randomRate(0.012) })
    else if (name === 'terminal') playCue('terminalOpen', { gain: 0.35, rate: randomRate(0.012) })
    else if (name === 'archive') playCue('drawer', { gain: 0.28, rate: randomRate() })
    else if (name === 'case') playCue('shutter', { gain: 0.25, rate: randomRate(0.02) })
    else playCue('handoff', { gain: 0.24, rate: randomRate(0.02) })
    return result
  }

  const layered = {
    click: () => playCue('click', { gain: 0.18, rate: randomRate(0.045), pan: (Math.random() - 0.5) * 0.08 }),
    key: () => playCue('key', { gain: 0.105, rate: randomRate(0.06), pan: (Math.random() - 0.5) * 0.16 }),
    tab: () => playCue('click', { gain: 0.15, rate: 1.04 }),
    toggleSwitch: () => playCue('switch', { gain: 0.27, rate: randomRate(0.025) }),
    photo: () => playCue('shutter', { gain: 0.31, rate: randomRate(0.018) }),
    drawer: () => playCue('drawer', { gain: 0.31, rate: randomRate(0.025) }),
    radio: () => playCue('radio', { gain: 0.25, rate: randomRate(0.025), pan: (Math.random() - 0.5) * 0.18 }),
    confirm: () => playCue('confirm', { gain: 0.27, rate: randomRate(0.012) }),
    deny: () => playCue('deny', { gain: 0.29, rate: randomRate(0.018) }),
    warning: () => playCue('warning', { gain: 0.3 }),
    modal: () => playCue('handoff', { gain: 0.18, rate: 0.94 }),
    command: () => playCue('relay', { gain: 0.21, rate: randomRate(0.025) }),
    error: () => playCue('deny', { gain: 0.31, rate: 0.96 }),
    scan: () => playCue('scan', { gain: 0.32, pan: -0.03 }),
    archive: () => playCue('drawer', { gain: 0.28, rate: randomRate(0.02) }),
    nav: () => playCue('relay', { gain: 0.17, rate: randomRate(0.035) }),
    stamp: () => playCue('stamp', { gain: 0.36, rate: randomRate(0.018) }),
    paper: () => playCue('paper', { gain: 0.25, rate: randomRate(0.035), pan: (Math.random() - 0.5) * 0.12 }),
    glitch: () => playCue('glitch', { gain: 0.29, rate: randomRate(0.02), pan: (Math.random() - 0.5) * 0.16 }),
    terminalOpen: () => playCue('terminalOpen', { gain: 0.35, rate: randomRate(0.012) }),
    grimoireOpen: () => playCue('grimoireOpen', { gain: 0.34, rate: randomRate(0.012) }),
    dashboardOpen: () => playCue('handoff', { gain: 0.23, rate: 0.96 }),
    systemReply: () => playCue('systemReply', { gain: 0.36 }),
    boot: () => playCue('handoff', { gain: 0.25, rate: 0.92 }),
    grant: () => playCue('confirm', { gain: 0.3 }),
  }

  for (const [name, layer] of Object.entries(layered)) {
    audio[name] = function productionLayeredMethod(...args) {
      const result = original[name](...args)
      layer(...args)
      return result
    }
  }
}

install()
