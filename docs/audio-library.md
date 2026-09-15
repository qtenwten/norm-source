# N.O.R.M. production audio library

N.O.R.M. uses a **hybrid sample + Web Audio** architecture, but the two layers no longer play on top of each other. The file-backed production library is the primary audible layer; the older procedural Web Audio engine is retained strictly as a failure fallback when the rendered assets cannot be loaded or decoded.

This distinction matters: simultaneous procedural noise plus rendered transients created a broadband hiss/fizz during hover-heavy use. Production playback now avoids that double layer entirely.

The user-facing master level remains locked to the approved **100% calibration**. Sound can only be enabled or muted from the interface; there is no second volume slider.

## Rendered assets

```text
public/audio/
  fx/
    norm-sfx-v1.wav
  ambience/
    server-room-loop.wav
    archive-room-loop.wav
    grimoire-room-loop.wav
    terminal-radio-loop.wav
```

The WAV files are rendered deterministically by `scripts/generate-audio-library.mjs` before `dev`/`build`. A second deterministic mastering stage, `scripts/clean-audio-library.mjs`, then removes unnecessary high-frequency broadband energy and lowers ambience density before the files reach the browser. Generated binaries stay out of Git and are copied into the Vite output from `public/`.

The SFX file is an audio sprite containing 18 cues. Keeping the short effects in one PCM asset avoids a burst of small HTTP requests and preserves sample-accurate cue boundaries.

### SFX sprite map

| Cue | Purpose |
| --- | --- |
| `click` | ordinary interface press |
| `relay` | mechanical relay / archive mechanism |
| `switch` | hardware toggle |
| `key` | terminal typing |
| `confirm` | successful action / access confirmation |
| `deny` | rejected action / error |
| `warning` | anomaly / caution pulse |
| `paper` | document and Grimoire movement |
| `drawer` | archive drawer / physical storage |
| `shutter` | evidence camera / photo viewer |
| `stamp` | dossier / classified stamp |
| `radio` | short field-radio burst |
| `scan` | terminal / evidence scanning pass |
| `handoff` | route or workstation handoff |
| `terminalOpen` | entering Field Terminal |
| `grimoireOpen` | opening the Grimoire |
| `glitch` | corrupted-data / interference event |
| `systemReply` | abnormal system response |

Cue offsets are generated into `public/audio/audio-manifest.json`; `src/productionAudio.js` consumes that manifest and the audio-library contract guards the mapping.

## Scene ambience

- **dashboard / cases / agents / reports** → restrained low server-room body;
- **archive** → darker storage-room tone with very little upper-band noise;
- **grimoire** → near-silent low room tone;
- **terminal** → dry electrical/radio body without continuous white-noise hiss.

Ambience crossfades when the scene changes. It is intentionally quieter than interaction SFX. A low-pass stage exists both in the offline mastering pass and in the runtime production chain so the atmosphere reads as room tone rather than cheap static.

## Playback policy

1. Audio starts only after a user gesture and respects the explicit mute preference.
2. The production library is fetched with browser cache enabled after audio activation; startup is not blocked on asset download.
3. When the library is available, only the production layer plays. The procedural engine is not mixed underneath it.
4. Missing or undecodable files do **not** break the site: the procedural engine becomes the fallback.
5. Hover uses a very quiet, rate-varied production click with a cooldown instead of the old high-frequency procedural tick.
6. Short cues receive small pitch/pan variation where appropriate, so repeated clicks and mechanisms do not sound identical.
7. Dynamics compression and gentle runtime low-pass filtering keep the fixed 100% calibration controlled without harsh fizz.

## Asset provenance

The five rendered audio files are original project renders created for N.O.R.M.; they do not contain third-party recordings or samples. Their source-of-truth is the deterministic renderer plus deterministic mastering pass, so a clean checkout can recreate the production library without committing heavy binaries.

For future recorded-Foley replacements, prefer CC0 material. Kenney's Interface Sounds, UI Audio and Sci-fi Sounds remain suitable reference/replacement sources if a recorded library is introduced later.
