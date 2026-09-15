import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const targets = [
  ['public/audio/fx/norm-sfx-v1.wav', 5200, 0.96],
  ['public/audio/ambience/server-room-loop.wav', 900, 0.58],
  ['public/audio/ambience/archive-room-loop.wav', 760, 0.56],
  ['public/audio/ambience/grimoire-room-loop.wav', 620, 0.52],
  ['public/audio/ambience/terminal-radio-loop.wav', 1250, 0.54],
]

function findDataChunk(buffer) {
  let offset = 12
  while (offset + 8 <= buffer.length) {
    const id = buffer.toString('ascii', offset, offset + 4)
    const size = buffer.readUInt32LE(offset + 4)
    if (id === 'data') return { offset: offset + 8, size }
    offset += 8 + size + (size % 2)
  }
  throw new Error('WAV data chunk not found')
}

function onePoleLowpass(samples, cutoff, sampleRate) {
  const out = new Float64Array(samples.length)
  const dt = 1 / sampleRate
  const rc = 1 / (2 * Math.PI * cutoff)
  const alpha = dt / (rc + dt)
  let y = 0
  for (let i = 0; i < samples.length; i += 1) {
    y += alpha * (samples[i] - y)
    out[i] = y
  }
  return out
}

function dcBlock(samples) {
  const out = new Float64Array(samples.length)
  let prevIn = 0
  let prevOut = 0
  const r = 0.995
  for (let i = 0; i < samples.length; i += 1) {
    const x = samples[i]
    const y = x - prevIn + r * prevOut
    out[i] = y
    prevIn = x
    prevOut = y
  }
  return out
}

function masterWav(path, cutoff, gain) {
  const full = resolve(path)
  const buffer = readFileSync(full)
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error(`${path}: unsupported WAV container`)
  }
  const audioFormat = buffer.readUInt16LE(20)
  const channels = buffer.readUInt16LE(22)
  const sampleRate = buffer.readUInt32LE(24)
  const bits = buffer.readUInt16LE(34)
  if (audioFormat !== 1 || channels !== 1 || bits !== 16) {
    throw new Error(`${path}: expected PCM mono 16-bit WAV`)
  }

  const { offset, size } = findDataChunk(buffer)
  const count = Math.floor(size / 2)
  const samples = new Float64Array(count)
  for (let i = 0; i < count; i += 1) samples[i] = buffer.readInt16LE(offset + i * 2) / 32768

  // Two gentle low-pass stages remove the cheap broadband fizz without turning
  // mechanical transients into dull clicks. A DC blocker keeps long loops clean.
  let cleaned = dcBlock(samples)
  cleaned = onePoleLowpass(cleaned, Math.min(cutoff, sampleRate * 0.42), sampleRate)
  cleaned = onePoleLowpass(cleaned, Math.min(cutoff * 1.16, sampleRate * 0.44), sampleRate)

  let peak = 1e-9
  for (const value of cleaned) peak = Math.max(peak, Math.abs(value))
  const safeGain = Math.min(gain, 0.92 / peak)
  const output = Buffer.from(buffer)
  for (let i = 0; i < cleaned.length; i += 1) {
    const shaped = Math.tanh(cleaned[i] * 1.04) / Math.tanh(1.04)
    const value = Math.max(-1, Math.min(1, shaped * safeGain))
    output.writeInt16LE(Math.round(value * 32767), offset + i * 2)
  }
  writeFileSync(full, output)
}

for (const [path, cutoff, gain] of targets) masterWav(path, cutoff, gain)
console.log('N.O.R.M. AUDIO MASTER: OK // hiss reduction + ambience cleanup')
