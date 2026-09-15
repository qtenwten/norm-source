import { existsSync, readFileSync, statSync } from 'node:fs'

const audio = readFileSync('src/audio.js', 'utf8')
const production = readFileSync('src/productionAudio.js', 'utf8')
const main = readFileSync('src/main.jsx', 'utf8')
const docs = readFileSync('docs/audio-library.md', 'utf8')
const generator = readFileSync('scripts/generate-audio-library.mjs', 'utf8')
const cleaner = readFileSync('scripts/clean-audio-library.mjs', 'utf8')
const packageJson = readFileSync('package.json', 'utf8')
const manifest = JSON.parse(readFileSync('public/audio/audio-manifest.json', 'utf8'))

const fail = (message) => {
  console.error(`AUDIO LIBRARY CONTRACT FAIL: ${message}`)
  process.exitCode = 1
}
const expect = (condition, message) => { if (!condition) fail(message) }

const assets = [
  ['public/audio/fx/norm-sfx-v1.wav', 400_000],
  ['public/audio/ambience/server-room-loop.wav', 180_000],
  ['public/audio/ambience/archive-room-loop.wav', 180_000],
  ['public/audio/ambience/grimoire-room-loop.wav', 180_000],
  ['public/audio/ambience/terminal-radio-loop.wav', 180_000],
]

for (const [path, minimumBytes] of assets) {
  expect(existsSync(path), `missing production audio asset: ${path}`)
  if (existsSync(path)) expect(statSync(path).size >= minimumBytes, `audio asset looks truncated: ${path}`)
}

for (const token of [
  'MANIFEST_URL',
  'cueManifest',
  'loadLibrary()',
  'playCue(',
  'syncAmbience(',
  'productionEnable',
  'productionDisable',
  'proceduralFallbackEnabled',
  'enableProceduralFallback()',
  "Object.defineProperty(audio, 'enabled'",
  'N.O.R.M. production SFX unavailable; procedural layer remains active.',
]) expect(production.includes(token), `production sample engine is incomplete: ${token}`)
expect(production.includes("hover: () => cueOrFallback('hover', 'click'"), 'hover must use the quiet production layer instead of raw procedural hiss')
expect(!production.includes('const result = original[name](...args)'), 'production cues must not stack the old procedural effect underneath every sound')
expect(main.includes("import './productionAudio.js'"), 'production audio layer is not installed at app bootstrap')
expect(audio.includes('const FIXED_MASTER_GAIN = 5'), 'legacy calibrated Web Audio layer must remain the procedural fallback')

for (const token of [
  'onePoleLowpass',
  'dcBlock',
  'server-room-loop.wav',
  'terminal-radio-loop.wav',
  'N.O.R.M. AUDIO MASTER: OK // hiss reduction + ambience cleanup',
]) expect(cleaner.includes(token), `clean mastering pass is incomplete: ${token}`)
expect(packageJson.includes('node scripts/generate-audio-library.mjs && node scripts/clean-audio-library.mjs'), 'prepare:audio must run the cleanup mastering pass')

const expectedCues = [
  'click', 'relay', 'switch', 'key', 'confirm', 'deny', 'warning', 'paper', 'drawer',
  'shutter', 'stamp', 'radio', 'scan', 'handoff', 'terminalOpen', 'grimoireOpen',
  'glitch', 'systemReply',
]
expect(Object.keys(manifest.cues).length === expectedCues.length, 'generated manifest must contain exactly 18 cues')
for (const cue of expectedCues) expect(manifest.cues[cue]?.duration > 0, `missing generated sprite cue: ${cue}`)

expect(generator.includes('const cueOrder = ['), 'deterministic audio renderer has no cue inventory')
expect(generator.includes('mulberry32(0x4e4f524d)'), 'audio renderer lost its deterministic seed')
expect(docs.includes('18 cues'), 'audio documentation does not describe the sprite inventory')
expect(docs.includes('hybrid sample + Web Audio'), 'audio documentation does not describe the hybrid architecture')
expect(docs.includes('only the production layer plays'), 'audio documentation must prohibit simultaneous procedural hiss layering')
expect(docs.includes('do not contain third-party recordings or samples'), 'audio provenance is not documented')

if (!process.exitCode) console.log('AUDIO LIBRARY CONTRACT: OK // clean 18-cue production layer + 4 mastered ambiences + fallback-only procedural engine')
