import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const FX_SR = 22050
const LOOP_SR = 11025
const OUT = resolve('public/audio')
const rand = mulberry32(0x4e4f524d)

function mulberry32(seed) {
  return () => {
    let t = seed += 0x6D2B79F5
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const clamp = (v, lo = -1, hi = 1) => Math.max(lo, Math.min(hi, v))
const seconds = (value, sr) => Math.max(1, Math.round(value * sr))
const zeros = (duration, sr) => new Float64Array(seconds(duration, sr))

function whiteNoise(length) {
  const out = new Float64Array(length)
  for (let i = 0; i < length; i += 1) out[i] = rand() * 2 - 1
  return out
}

function lowpass(input, cutoff, sr) {
  const out = new Float64Array(input.length)
  const dt = 1 / sr
  const rc = 1 / (2 * Math.PI * cutoff)
  const a = dt / (rc + dt)
  let y = 0
  for (let i = 0; i < input.length; i += 1) {
    y += a * (input[i] - y)
    out[i] = y
  }
  return out
}

function highpass(input, cutoff, sr) {
  const lp = lowpass(input, cutoff, sr)
  const out = new Float64Array(input.length)
  for (let i = 0; i < input.length; i += 1) out[i] = input[i] - lp[i]
  return out
}

function bandpass(input, low, high, sr) {
  return highpass(lowpass(input, high, sr), low, sr)
}

function pinkishNoise(length, sr) {
  const a = lowpass(whiteNoise(length), 650, sr)
  const b = lowpass(whiteNoise(length), 2200, sr)
  const c = whiteNoise(length)
  const out = new Float64Array(length)
  for (let i = 0; i < length; i += 1) out[i] = a[i] * 1.25 + b[i] * 0.55 + c[i] * 0.14
  return out
}

function expEnvelope(length, sr, attack = 0.002, decay = 0.12) {
  const out = new Float64Array(length)
  for (let i = 0; i < length; i += 1) {
    const t = i / sr
    const a = Math.min(1, t / Math.max(attack, 0.00001))
    out[i] = a * Math.exp(-t / Math.max(decay, 0.0001))
  }
  return out
}

function tone(duration, sr, f0, f1 = f0, gain = 1, decay = duration * 0.6, phase = rand() * Math.PI * 2) {
  const length = seconds(duration, sr)
  const out = new Float64Array(length)
  const env = expEnvelope(length, sr, 0.002, decay)
  const slope = (f1 - f0) / duration
  for (let i = 0; i < length; i += 1) {
    const t = i / sr
    const p = 2 * Math.PI * (f0 * t + 0.5 * slope * t * t) + phase
    out[i] = Math.sin(p) * env[i] * gain
  }
  return out
}

function transient(duration, sr, low = 1200, high = 7000, gain = 1, decay = duration * 0.38) {
  const length = seconds(duration, sr)
  const source = bandpass(whiteNoise(length), low, Math.min(high, sr * 0.46), sr)
  const env = expEnvelope(length, sr, 0.0014, decay)
  const out = new Float64Array(length)
  for (let i = 0; i < length; i += 1) out[i] = source[i] * env[i] * gain
  return out
}

function paperTexture(duration, sr, gain = 1) {
  const length = seconds(duration, sr)
  const source = bandpass(pinkishNoise(length, sr), 220, Math.min(5600, sr * 0.46), sr)
  const out = new Float64Array(length)
  for (let i = 0; i < length; i += 1) {
    const x = i / Math.max(1, length - 1)
    out[i] = source[i] * Math.pow(Math.sin(Math.PI * x), 1.5) * gain
  }
  return out
}

function add(target, source, startSeconds = 0, sr = FX_SR, gain = 1) {
  const start = Math.round(startSeconds * sr)
  const n = Math.min(source.length, target.length - start)
  for (let i = 0; i < n; i += 1) target[start + i] += source[i] * gain
}

function simpleRoom(input, sr, amount = 0.12) {
  const out = Float64Array.from(input)
  const taps = [
    [0.013, 0.22],
    [0.029, -0.14],
    [0.047, 0.1],
    [0.071, -0.065],
    [0.103, 0.042],
  ]
  for (const [delay, amp] of taps) {
    const d = Math.round(delay * sr)
    for (let i = d; i < out.length; i += 1) out[i] += input[i - d] * amp * amount
  }
  return out
}

function finish(input, sr, peak = 0.72, room = 0.1, drive = 1.45) {
  const wet = simpleRoom(input, sr, room)
  let mean = 0
  for (const v of wet) mean += v
  mean /= wet.length
  let max = 1e-9
  const shaped = new Float64Array(wet.length)
  const norm = Math.tanh(drive)
  for (let i = 0; i < wet.length; i += 1) {
    const v = Math.tanh((wet[i] - mean) * drive) / norm
    shaped[i] = v
    max = Math.max(max, Math.abs(v))
  }
  const scale = peak / max
  for (let i = 0; i < shaped.length; i += 1) shaped[i] *= scale
  return shaped
}

function makeCue(name) {
  const sr = FX_SR
  let x
  switch (name) {
    case 'click':
      x = zeros(0.13, sr)
      add(x, transient(0.045, sr, 1400, 9000, 0.9, 0.014), 0, sr)
      add(x, tone(0.09, sr, 170, 110, 0.22, 0.045), 0.002, sr)
      return finish(x, sr, 0.55, 0.04, 1.8)
    case 'relay':
      x = zeros(0.18, sr)
      add(x, transient(0.055, sr, 900, 9000, 1, 0.018), 0, sr)
      add(x, tone(0.14, sr, 110, 55, 0.44, 0.09), 0.006, sr)
      add(x, transient(0.025, sr, 3200, 9800, 0.36, 0.009), 0.036, sr)
      return finish(x, sr, 0.72, 0.09, 1.65)
    case 'switch':
      x = zeros(0.24, sr)
      add(x, transient(0.035, sr, 1800, 9000, 0.82, 0.012), 0, sr)
      add(x, tone(0.12, sr, 190, 92, 0.3, 0.07), 0, sr)
      add(x, transient(0.04, sr, 1600, 8000, 0.66, 0.014), 0.085, sr)
      add(x, tone(0.11, sr, 145, 75, 0.25, 0.06), 0.086, sr)
      return finish(x, sr, 0.7, 0.09, 1.6)
    case 'key':
      x = zeros(0.09, sr)
      add(x, transient(0.028, sr, 2500, 9800, 0.82, 0.009), 0, sr)
      add(x, tone(0.06, sr, 240, 170, 0.11, 0.025), 0, sr)
      return finish(x, sr, 0.38, 0.02, 1.7)
    case 'confirm':
      x = zeros(0.42, sr)
      add(x, transient(0.035, sr, 1800, 7000, 0.46, 0.012), 0, sr)
      add(x, tone(0.18, sr, 230, 236, 0.24, 0.09), 0.035, sr)
      add(x, tone(0.18, sr, 345, 353, 0.2, 0.09), 0.13, sr)
      add(x, tone(0.22, sr, 95, 58, 0.18, 0.14), 0.01, sr)
      return finish(x, sr, 0.62, 0.14, 1.4)
    case 'deny':
      x = zeros(0.38, sr)
      add(x, transient(0.065, sr, 400, 2200, 0.56, 0.03), 0, sr)
      add(x, tone(0.32, sr, 135, 48, 0.72, 0.18), 0, sr)
      return finish(x, sr, 0.66, 0.12, 1.7)
    case 'warning':
      x = zeros(0.5, sr)
      for (const start of [0, 0.19]) {
        add(x, transient(0.04, sr, 700, 2700, 0.5, 0.018), start, sr)
        add(x, tone(0.15, sr, 118, 76, 0.56, 0.09), start, sr)
      }
      return finish(x, sr, 0.66, 0.1, 1.55)
    case 'paper':
      x = zeros(0.34, sr)
      add(x, paperTexture(0.34, sr, 0.52), 0, sr)
      for (const start of [0.015, 0.07, 0.16, 0.235]) add(x, transient(0.05, sr, 1000, 9000, 0.22 + rand() * 0.13, 0.018), start, sr)
      return finish(x, sr, 0.55, 0.18, 1.25)
    case 'drawer':
      x = zeros(0.62, sr)
      add(x, paperTexture(0.48, sr, 0.55), 0, sr)
      add(x, tone(0.25, sr, 64, 38, 0.58, 0.15), 0.03, sr)
      add(x, transient(0.07, sr, 500, 3600, 0.74, 0.025), 0.43, sr)
      add(x, tone(0.14, sr, 105, 55, 0.36, 0.08), 0.44, sr)
      return finish(x, sr, 0.75, 0.22, 1.38)
    case 'shutter':
      x = zeros(0.32, sr)
      for (const [start, gain] of [[0, 0.95], [0.085, 0.7], [0.145, 0.46]]) {
        add(x, transient(0.045, sr, 1500, 9800, gain, 0.012), start, sr)
        add(x, tone(0.08, sr, 130, 85, 0.18 * gain, 0.035), start, sr)
      }
      return finish(x, sr, 0.73, 0.13, 1.58)
    case 'stamp':
      x = zeros(0.36, sr)
      add(x, transient(0.055, sr, 180, 2300, 0.92, 0.024), 0, sr)
      add(x, tone(0.3, sr, 78, 35, 0.96, 0.15), 0, sr)
      add(x, transient(0.05, sr, 1200, 8000, 0.34, 0.015), 0.008, sr)
      return finish(x, sr, 0.8, 0.2, 1.7)
    case 'radio':
      x = zeros(0.52, sr)
      add(x, paperTexture(0.52, sr, 0.5), 0, sr)
      for (const [start, f] of [[0.05, 920], [0.17, 1350], [0.29, 760]]) add(x, tone(0.07, sr, f, f * 1.08, 0.16, 0.035), start, sr)
      return finish(x, sr, 0.6, 0.06, 1.48)
    case 'scan':
      x = zeros(0.82, sr)
      add(x, paperTexture(0.82, sr, 0.28), 0, sr)
      for (const [start, f0, f1] of [[0.03, 420, 2600], [0.24, 650, 4300], [0.47, 900, 6000]]) add(x, tone(0.22, sr, f0, f1, 0.13, 0.12), start, sr)
      return finish(x, sr, 0.62, 0.12, 1.38)
    case 'handoff':
      x = zeros(0.62, sr)
      add(x, tone(0.48, sr, 88, 34, 0.56, 0.25), 0, sr)
      add(x, transient(0.09, sr, 400, 5200, 0.5, 0.035), 0.04, sr)
      add(x, transient(0.05, sr, 2500, 9800, 0.42, 0.015), 0.26, sr)
      return finish(x, sr, 0.7, 0.24, 1.42)
    case 'terminalOpen':
      x = zeros(0.9, sr)
      add(x, transient(0.07, sr, 500, 6000, 0.68, 0.02), 0, sr)
      add(x, tone(0.6, sr, 96, 41, 0.62, 0.3), 0, sr)
      for (const [start, f] of [[0.16, 980], [0.25, 1260], [0.34, 820], [0.44, 1540]]) add(x, tone(0.05, sr, f, f, 0.12, 0.025), start, sr)
      add(x, paperTexture(0.38, sr, 0.18), 0.12, sr)
      return finish(x, sr, 0.72, 0.22, 1.38)
    case 'grimoireOpen':
      x = zeros(1.15, sr)
      add(x, paperTexture(0.9, sr, 0.44), 0.02, sr)
      add(x, tone(0.85, sr, 48, 26, 0.64, 0.48), 0.08, sr)
      for (const start of [0.18, 0.43, 0.69]) add(x, transient(0.07, sr, 800, 5200, 0.23, 0.025), start, sr)
      return finish(x, sr, 0.68, 0.32, 1.28)
    case 'glitch':
      x = zeros(1, sr)
      add(x, paperTexture(1, sr, 0.4), 0, sr)
      for (const [start, f0, f1] of [[0.08, 160, 55], [0.42, 95, 240], [0.67, 310, 72]]) add(x, tone(0.24, sr, f0, f1, 0.2, 0.11), start, sr)
      return finish(x, sr, 0.7, 0.13, 1.78)
    case 'systemReply':
      x = zeros(1.15, sr)
      add(x, tone(0.95, sr, 54, 23, 0.82, 0.5), 0, sr)
      add(x, transient(0.06, sr, 1400, 8000, 0.35, 0.02), 0.08, sr)
      for (const [start, f] of [[0.24, 410], [0.34, 615], [0.5, 307]]) add(x, tone(0.18, sr, f, f * 0.97, 0.14, 0.09), start, sr)
      return finish(x, sr, 0.72, 0.3, 1.38)
    default:
      throw new Error(`Unknown cue: ${name}`)
  }
}

function makeAmbience(kind) {
  const sr = LOOP_SR
  const duration = 10
  const length = seconds(duration, sr)
  const t = new Float64Array(length)
  const base = lowpass(pinkishNoise(length, sr), 1500, sr)
  const hi = bandpass(whiteNoise(length), 1700, Math.min(5000, sr * 0.46), sr)
  for (let i = 0; i < length; i += 1) t[i] = i / sr
  const x = new Float64Array(length)
  for (let i = 0; i < length; i += 1) {
    if (kind === 'server') {
      x[i] = base[i] * 0.16 + hi[i] * 0.024 + Math.sin(2 * Math.PI * 50 * t[i]) * 0.08 + Math.sin(2 * Math.PI * 100 * t[i]) * 0.033
      x[i] *= 0.92 + 0.08 * Math.sin(2 * Math.PI * 0.13 * t[i])
    } else if (kind === 'archive') {
      x[i] = base[i] * 0.13 + hi[i] * 0.016 + Math.sin(2 * Math.PI * 29 * t[i]) * 0.052
    } else if (kind === 'grimoire') {
      x[i] = base[i] * 0.1 + hi[i] * 0.011 + Math.sin(2 * Math.PI * 24 * t[i]) * 0.068 + Math.sin(2 * Math.PI * 48 * t[i]) * 0.024
      x[i] *= 0.9 + 0.1 * Math.sin(2 * Math.PI * 0.07 * t[i])
    } else {
      x[i] = base[i] * 0.12 + hi[i] * 0.038 + Math.sin(2 * Math.PI * 38 * t[i]) * 0.052
    }
  }
  const events = kind === 'archive' ? [1.8, 5.1, 8.2] : kind === 'terminal' ? [1.1, 3.7, 6.3, 8.9] : []
  for (const start of events) add(x, transient(0.055, sr, 700, Math.min(4800, sr * 0.46), 0.04, 0.018), start, sr)

  // Equalised end/start overlap so AudioBufferSource looping has no hard edge.
  const overlap = seconds(0.8, sr)
  const first = x.slice(0, overlap)
  const last = x.slice(length - overlap)
  for (let i = 0; i < overlap; i += 1) {
    const a = i / Math.max(1, overlap - 1)
    const v = first[i] * (1 - a) + last[i] * a
    x[i] = v
    x[length - overlap + i] = v
  }
  return finish(x, sr, 0.22, 0.025, 1.08)
}

function wavBuffer(samples, sr) {
  const buffer = Buffer.alloc(44 + samples.length * 2)
  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + samples.length * 2, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(1, 22)
  buffer.writeUInt32LE(sr, 24)
  buffer.writeUInt32LE(sr * 2, 28)
  buffer.writeUInt16LE(2, 32)
  buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(samples.length * 2, 40)
  for (let i = 0; i < samples.length; i += 1) buffer.writeInt16LE(Math.round(clamp(samples[i]) * 32767), 44 + i * 2)
  return buffer
}

function writeWav(path, samples, sr) {
  const full = resolve(path)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, wavBuffer(samples, sr))
}

const cueOrder = [
  'click', 'relay', 'switch', 'key', 'confirm', 'deny', 'warning', 'paper', 'drawer',
  'shutter', 'stamp', 'radio', 'scan', 'handoff', 'terminalOpen', 'grimoireOpen', 'glitch', 'systemReply',
]
const gap = zeros(0.06, FX_SR)
const cueAudio = cueOrder.map((name) => [name, makeCue(name)])
const spriteLength = cueAudio.reduce((sum, [, audio]) => sum + audio.length + gap.length, 0)
const sprite = new Float64Array(spriteLength)
const cues = {}
let cursor = 0
for (const [name, audio] of cueAudio) {
  cues[name] = { start: Number((cursor / FX_SR).toFixed(6)), duration: Number((audio.length / FX_SR).toFixed(6)) }
  sprite.set(audio, cursor)
  cursor += audio.length + gap.length
}

writeWav(`${OUT}/fx/norm-sfx-v1.wav`, sprite, FX_SR)
for (const [key, file] of Object.entries({
  server: 'server-room-loop.wav',
  archive: 'archive-room-loop.wav',
  grimoire: 'grimoire-room-loop.wav',
  terminal: 'terminal-radio-loop.wav',
})) writeWav(`${OUT}/ambience/${file}`, makeAmbience(key), LOOP_SR)

const manifest = {
  version: 1,
  generated: true,
  sprite: 'fx/norm-sfx-v1.wav',
  sampleRate: FX_SR,
  cues,
  ambience: {
    server: 'ambience/server-room-loop.wav',
    archive: 'ambience/archive-room-loop.wav',
    grimoire: 'ambience/grimoire-room-loop.wav',
    terminal: 'ambience/terminal-radio-loop.wav',
  },
}
mkdirSync(OUT, { recursive: true })
writeFileSync(`${OUT}/audio-manifest.json`, `${JSON.stringify(manifest, null, 2)}\n`)
console.log(`N.O.R.M. AUDIO RENDER: OK // ${cueOrder.length} cues + 4 ambience loops`)
