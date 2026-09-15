import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(path, 'utf8')
const audio = read('src/audio.js')
const shell = read('src/components/Shell.jsx')
const gate = read('src/components/AccessGate.jsx')

const fail = (message) => {
  console.error(`AUDIO POLICY CONTRACT FAIL: ${message}`)
  process.exitCode = 1
}
const expect = (condition, message) => { if (!condition) fail(message) }

for (const token of [
  'const FIXED_MASTER_GAIN = 5',
  'volume: FIXED_MASTER_GAIN',
  'resume() {',
  'state.volume = FIXED_MASTER_GAIN',
  'setVolume() {',
  'rampMaster(FIXED_MASTER_GAIN',
]) expect(audio.includes(token), `audio engine is not locked to full gain: ${token}`)

expect(!audio.includes('Math.min(5, Math.max(0.0001, Number(value)'), 'audio.setVolume still accepts arbitrary gain values')
expect(audio.includes('if (!wasEnabled) bootSequence()'), 'resume-safe enable guard is missing')

for (const token of [
  'const FIXED_VOLUME_PERCENT = 100',
  'const FIXED_AUDIO_GAIN = 5',
  "window.localStorage.removeItem(LEGACY_VOLUME_STORAGE_KEY)",
  'audio.resume()',
  "window.addEventListener('focus', restoreAudio)",
  "window.addEventListener('pageshow', restoreAudio)",
  "document.addEventListener('visibilitychange', onVisibilityChange)",
  'value={FIXED_VOLUME_PERCENT}',
  '100 // LOCKED',
  'ИЗМЕНЯЕТСЯ ТОЛЬКО MUTE',
]) expect(shell.includes(token), `shell full-volume policy is incomplete: ${token}`)

expect(!shell.includes('changeVolume'), 'interactive volume change handler still exists')
expect(!shell.includes('setVolumePercent'), 'mutable volume state still exists')
expect(!shell.includes('getStoredVolumePercent'), 'legacy stored volume can still affect playback')

expect(gate.includes("window.localStorage.getItem(SOUND_STORAGE_KEY) !== '0'"), 'access gate does not respect explicit mute preference')
expect(gate.includes('audio.setVolume(FIXED_AUDIO_GAIN)'), 'access gate does not force full gain before audio starts')
expect(gate.includes('audio.resume()'), 'access gate cannot safely resume an existing audio context')

if (!process.exitCode) {
  console.log('AUDIO POLICY CONTRACT: OK // 100% locked + explicit mute only + lifecycle recovery')
}
