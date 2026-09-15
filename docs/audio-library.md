# N.O.R.M. production audio library

N.O.R.M. keeps the deterministic rendered library and the legacy Web Audio engine as source material/fallback infrastructure, but the **audible runtime is now a digital spy layer** implemented in `src/audioHissPatch.js`.

The reason is practical: the older archive, terminal, radio, glitch and ambience designs all contained broadband noise textures. Even after filtering, some of them still read as a sea-wave / hiss sound in real use. The audible override therefore uses **oscillators only** for interface feedback and keeps all continuous noise beds dormant.

The user-facing master level remains fixed. Sound can only be enabled or muted from the interface; there is no volume slider.

## Current audible policy

- **no continuous ambience** on any route;
- no white/pink/brown-noise synthesis in the audible layer;
- no radio-static bursts;
- no hiss-heavy glitch samples;
- no low bass impact / drum-like hit for terminal faults;
- terminal failures use a short descending digital fault code;
- scans use a clean oscillator sweep plus decoder chirps;
- mail/system messages use compact digital notification tones;
- route transitions use short handshake-style sequences;
- clicks, hover, typing and toggles use restrained synthetic UI ticks.

This makes the interface closer to a cinematic intelligence terminal: dry decoder beeps, handshakes, access confirmations and data chirps, rather than environmental static.

## Digital spy layer

`src/audioHissPatch.js` is imported after `src/productionAudio.js` and deliberately replaces the user-facing audio methods. It owns a small Web Audio context with a compressor and uses only `OscillatorNode` + gain envelopes.

The important mappings are:

| Method | Audible design |
| --- | --- |
| `click` / `hover` / `key` | short UI data ticks |
| `nav` / `command` | two-note decoder handshake |
| `confirm` / `grant` | rising access tones |
| `deny` | short descending rejection pair |
| `error` / `glitch` | three-note digital fault code, no bass hit |
| `terminal` | tiny terminal data chirp |
| `terminalOpen` | four-step field-terminal handshake |
| `scan` | clean oscillator sweep + decoder pings |
| `radio` | digital message cue, no static |
| `systemReply` | four-note abnormal-system reply without sub-bass |
| `archive` | compact archive-access sequence |
| `paper` / `photo` / `stamp` | stylised digital document/evidence cues |

`audio.scene()` now records route context only. It does **not** start a loop or background bed.

## Retained rendered assets

The deterministic library is still generated so the project keeps a reproducible source set and can reuse individual assets later if desired:

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

The WAV files are rendered deterministically by `scripts/generate-audio-library.mjs` before `dev`/`build`. A second deterministic mastering stage, `scripts/clean-audio-library.mjs`, performs the existing cleanup pass. Generated binaries stay out of Git and are copied into the Vite output from `public/`.

The SFX file is an audio sprite containing 18 cues. These assets are currently dormant behind the digital spy layer, but keeping them generated avoids destroying the previous library and allows later A/B replacement without reconstructing history.

### Retained SFX sprite map

| Cue | Original purpose |
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
| `radio` | field-radio burst |
| `scan` | scanning pass |
| `handoff` | route/workstation handoff |
| `terminalOpen` | Field Terminal entry |
| `grimoireOpen` | Grimoire entry |
| `glitch` | corrupted-data event |
| `systemReply` | abnormal system response |

Cue offsets remain in `public/audio/audio-manifest.json`; `src/productionAudio.js` still knows how to consume that manifest if the audible policy changes later.

## Asset provenance

The five rendered audio files are original project renders created for N.O.R.M.; they do not contain third-party recordings or samples. Their source-of-truth is the deterministic renderer plus deterministic mastering pass.

The active digital spy layer is generated live with the browser Web Audio API and contains no external samples at all.
