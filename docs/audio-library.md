# N.O.R.M. production audio library

N.O.R.M. uses a **hybrid sample + Web Audio** sound system. The file-backed library provides the physical texture (switches, relays, paper, drawers, camera mechanics, radio interference and room tone); the procedural layer adds subtle variation, low-frequency body, stereo ticks and a safe fallback if an asset fails to load.

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

The WAV files are rendered deterministically by `scripts/generate-audio-library.mjs` before `dev`/`build`; generated binaries stay out of Git and are copied into the Vite output from `public/`. The SFX file is an audio sprite containing 18 cues. Keeping the short effects in one PCM asset avoids a burst of small HTTP requests and preserves sample-accurate cue boundaries.

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

- **dashboard / cases / agents / reports** → restrained server/electrical room bed;
- **archive** → darker storage-room tone with distant physical movement;
- **grimoire** → nearly silent low-frequency room with paper-like air;
- **terminal** → dry radio/electrical bed with sparse high-frequency texture.

Ambience crossfades when the scene changes. The original procedural bed remains available underneath, so transitions never become silent while the generated library is still decoding or unavailable.

## Playback policy

1. Audio starts only after a user gesture and respects the explicit mute preference.
2. The library is fetched with browser cache enabled after audio activation; startup is not blocked on asset download.
3. Missing or undecodable files do **not** break the site: procedural effects remain active.
4. Short cues receive small pitch/pan variation where appropriate, so repeated clicks and mechanisms do not sound identical.
5. A dynamics compressor remains on the production-file master chain to keep stacked cinematic layers controlled at the fixed 100% calibration.

## Asset provenance

The five rendered audio files are original project renders created for N.O.R.M.; they do not contain third-party recordings or samples. Their source-of-truth is the deterministic renderer, so a clean checkout can recreate the exact production library without committing heavy binaries.

For future recorded-Foley replacements, prefer CC0 material. Kenney's Interface Sounds, UI Audio and Sci-fi Sounds are currently published under Creative Commons CC0 and remain suitable reference/replacement sources if a recorded library is introduced later.
