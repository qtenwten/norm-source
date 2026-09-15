import { audio } from './audio.js'

const AUDIO_BASE = `${import.meta.env.BASE_URL || '/'}audio/`
const AUDIO_RELEASE = 'clean-20260915-r2'
const withRelease = (url) => `${url}${url.includes('?') ? '&' : '?'}v=${encodeURIComponent(AUDIO_RELEASE)}`
const MANIFEST_URL = withRelease(`${AUDIO_BASE}audio-manifest.json`)
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
let productionReady = false
let proceduralFallbackEnabled = false
let currentScene = 'dashboard'
const cueLastStartedAt = new Map()

const sceneAmbience = {
  dashboard: ['server', 0.068],
  case: ['server', 0.055],
  agents: ['server', 0.052],
  report: ['server', 0.052],
  archive: ['archive', 0.072],
  grimoire: ['grimoire', 0.078],
  terminal: ['terminal', 0.074],
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

    const fxFilter = ctx.createBiquadFilter()
    fxFilter.type = 'lowpass'
    fxFilter.frequency.value = 6400
    fxFilter.Q.value = 0.38

    const ambienceFilter = ctx.createBiquadFilter()
    ambienceFilter.type = 'lowpass'
    ambienceFilter.frequency.value = 1750
    ambienceFilter.Q.value = 0.32

    const compressor = ctx.createDynamicsCompressor()
    compressor.threshold.value = -14
    compressor.knee.value = 18
    compressor.ratio.value = 2.5
    compressor.attack.value = 0.006
    compressor.release.value = 0.22

    // Keep interaction sounds present while ambience stays underneath the interface.
    // The previous build doubled a procedural noise layer with the rendered library,
    // which produced the dirty broadband hiss reported during real use.
    fxBus.gain.value = 0.82
    ambienceBus.gain.value = 0.19
    master.gain.value = layerEnabled ? 0.92 : 0.0001

    fxBus.connect(fxFilter).connect(master)
    ambienceBus.connect(ambienceFilter).connect(master)
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
      decode(withRelease(`${AUDIO_BASE}${manifest.sprite}`)),
      ...Object.entries(manifest.ambience).map(async ([key, path]) => [key, await decode(withRelease(`${AUDIO_BASE}${path}`))]),
    ])
    spriteBuffer = sprite
    cueManifest = manifest.cues || {}
    ambienceBuffers = new Map(ambience)
    productionReady = Boolean(spriteBuffer)
    if (productionReady && proceduralFallbackEnabled) {
      originalMethods.disable?.()
      proceduralFallbackEnabled = false
    }
    if (layerEnabled) syncAmbience(true)
    return productionReady
  })().catch((error) => {
    console.warn('N.O.R.M. production SFX unavailable; procedural layer remains active.', error)
    productionReady = false
    enableProceduralFallback()
    return false
  })
  return loadPromise
}

function playCue(name, { gain = 0.28, pan = 0, rate = 1, delay = 0, cooldown = 0.055 } = {}) {
  if (!layerEnabled || !productionReady || !spriteBuffer) return false
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
  source.playbackRate.value = Math.max(0.91, Math.min(1.09, rate))
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
  if (!layerEnabled || !productionReady || !ctx || !ambienceBus) return
  const [key, targetGain] = sceneAmbience[currentScene] || sceneAmbience.dashboard
  const buffer = ambienceBuffers.get(key)
  if (!buffer) return
  if (ambienceSource?.key === key) {
    ramp(ambienceSource.gain.gain, targetGain, immediate ? 0.03 : 0.8)
    return
  }

  const now = ctx.currentTime
  if (ambienceSource) {
    const previous = ambienceSource
    previous.gain.gain.cancelScheduledValues(now)
    previous.gain.gain.setValueAtTime(Math.max(previous.gain.gain.value, 0.0001), now)
    previous.gain.gain.exponentialRampToValueAtTime(0.0001, now + (immediate ? 0.04 : 0.9))
    window.setTimeout(() => {
      try { previous.source.stop() } catch { /* already stopped */ }
    }, immediate ? 90 : 980)
  }

  const source = ctx.createBufferSource()
  const gain = ctx.createGain()
  source.buffer = buffer
  source.loop = true
  gain.gain.value = 0.0001
  source.connect(gain).connect(ambienceBus)
  source.start(now)
  ambienceSource = { key, source, gain }
  ramp(gain.gain, targetGain, immediate ? 0.04 : 1.0)
}

function randomRate(amount = 0.035) {
  return 1 + (Math.random() - 0.5) * amount * 2
}

const originalMethods = {}

function enableProceduralFallback() {
  if (!layerEnabled || productionReady || proceduralFallbackEnabled) return
  proceduralFallbackEnabled = true
  originalMethods.enable?.()
  originalMethods.scene?.(currentScene)
}

function enableLayer() {
  layerEnabled = true
  ensureContext()
  ramp(master?.gain, 0.92, 0.12)
  void loadLibrary()
  if (productionReady) syncAmbience(true)
}

function disableLayer() {
  layerEnabled = false
  ramp(master?.gain, 0.0001, 0.08)
  if (proceduralFallbackEnabled) {
    originalMethods.disable?.()
    proceduralFallbackEnabled = false
  }
}

function cueOrFallback(method, cue, options) {
  if (playCue(cue, options)) return true
  if (proceduralFallbackEnabled) originalMethods[method]?.()
  return false
}

function install() {
  if (audio[INSTALL_FLAG]) return
  Object.defineProperty(audio, INSTALL_FLAG, { value: true, enumerable: false })

  for (const name of [
    'enable', 'disable', 'resume', 'scene', 'transition', 'click', 'hover', 'key', 'tab', 'toggleSwitch',
    'photo', 'drawer', 'radio', 'confirm', 'deny', 'warning', 'modal', 'entity', 'command', 'error', 'scan',
    'archive', 'nav', 'stamp', 'paper', 'glitch', 'terminalOpen', 'grimoireOpen', 'dashboardOpen',
    'systemReply', 'boot', 'grant',
  ]) originalMethods[name] = audio[name]?.bind(audio)

  // Expose the state of the production layer to Shell. The procedural engine remains
  // a true failure fallback instead of playing simultaneously underneath every cue.
  Object.defineProperty(audio, 'enabled', { configurable: true, enumerable: true, get: () => layerEnabled })

  audio.enable = function productionEnable() {
    enableLayer()
    return true
  }
  audio.disable = function productionDisable() {
    disableLayer()
    return false
  }
  audio.resume = function productionResume() {
    if (!layerEnabled) return false
    ensureContext()
    ramp(master?.gain, 0.92, 0.05)
    void loadLibrary()
    if (productionReady) syncAmbience()
    return true
  }
  audio.scene = function productionScene(name) {
    currentScene = sceneAmbience[name] ? name : 'dashboard'
    if (productionReady) syncAmbience()
    else if (proceduralFallbackEnabled) originalMethods.scene?.(name)
  }
  audio.transition = function productionTransition(name) {
    if (!layerEnabled) return
    if (!productionReady) {
      if (proceduralFallbackEnabled) originalMethods.transition?.(name)
      return
    }
    if (name === 'grimoire') playCue('grimoireOpen', { gain: 0.29, rate: randomRate(0.012) })
    else if (name === 'terminal') playCue('terminalOpen', { gain: 0.3, rate: randomRate(0.012) })
    else if (name === 'archive') playCue('drawer', { gain: 0.23, rate: randomRate() })
    else if (name === 'case') playCue('shutter', { gain: 0.21, rate: randomRate(0.02) })
    else playCue('handoff', { gain: 0.2, rate: randomRate(0.02) })
  }

  const layered = {
    click: () => cueOrFallback('click', 'click', { gain: 0.14, rate: randomRate(0.035), pan: (Math.random() - 0.5) * 0.06 }),
    hover: () => cueOrFallback('hover', 'click', { gain: 0.032, rate: 1.055 + Math.random() * 0.015, pan: (Math.random() - 0.5) * 0.05, cooldown: 0.11 }),
    key: () => cueOrFallback('key', 'key', { gain: 0.07, rate: randomRate(0.045), pan: (Math.random() - 0.5) * 0.1, cooldown: 0.045 }),
    tab: () => cueOrFallback('tab', 'click', { gain: 0.11, rate: 1.025 }),
    toggleSwitch: () => cueOrFallback('toggleSwitch', 'switch', { gain: 0.23, rate: randomRate(0.02) }),
    photo: () => cueOrFallback('photo', 'shutter', { gain: 0.26, rate: randomRate(0.015) }),
    drawer: () => cueOrFallback('drawer', 'drawer', { gain: 0.25, rate: randomRate(0.02) }),
    radio: () => cueOrFallback('radio', 'radio', { gain: 0.18, rate: randomRate(0.018), pan: (Math.random() - 0.5) * 0.12 }),
    confirm: () => cueOrFallback('confirm', 'confirm', { gain: 0.23, rate: randomRate(0.01) }),
    deny: () => cueOrFallback('deny', 'deny', { gain: 0.24, rate: randomRate(0.015) }),
    warning: () => cueOrFallback('warning', 'warning', { gain: 0.25 }),
    modal: () => cueOrFallback('modal', 'handoff', { gain: 0.15, rate: 0.95 }),
    entity: () => cueOrFallback('entity', 'systemReply', { gain: 0.22, rate: 0.93 }),
    command: () => cueOrFallback('command', 'relay', { gain: 0.18, rate: randomRate(0.02) }),
    error: () => cueOrFallback('error', 'deny', { gain: 0.25, rate: 0.97 }),
    scan: () => cueOrFallback('scan', 'scan', { gain: 0.25, pan: -0.02 }),
    archive: () => cueOrFallback('archive', 'drawer', { gain: 0.23, rate: randomRate(0.018) }),
    nav: () => cueOrFallback('nav', 'relay', { gain: 0.14, rate: randomRate(0.025) }),
    stamp: () => cueOrFallback('stamp', 'stamp', { gain: 0.29, rate: randomRate(0.015) }),
    paper: () => cueOrFallback('paper', 'paper', { gain: 0.2, rate: randomRate(0.025), pan: (Math.random() - 0.5) * 0.08 }),
    glitch: () => cueOrFallback('glitch', 'glitch', { gain: 0.22, rate: randomRate(0.015), pan: (Math.random() - 0.5) * 0.1 }),
    terminalOpen: () => cueOrFallback('terminalOpen', 'terminalOpen', { gain: 0.29, rate: randomRate(0.01) }),
    grimoireOpen: () => cueOrFallback('grimoireOpen', 'grimoireOpen', { gain: 0.28, rate: randomRate(0.01) }),
    dashboardOpen: () => cueOrFallback('dashboardOpen', 'handoff', { gain: 0.19, rate: 0.97 }),
    systemReply: () => cueOrFallback('systemReply', 'systemReply', { gain: 0.29 }),
    boot: () => cueOrFallback('boot', 'handoff', { gain: 0.2, rate: 0.94 }),
    grant: () => cueOrFallback('grant', 'confirm', { gain: 0.25 }),
  }

  for (const [name, layer] of Object.entries(layered)) {
    audio[name] = function productionLayeredMethod() {
      if (!layerEnabled) return
      layer()
    }
  }
}

install()
