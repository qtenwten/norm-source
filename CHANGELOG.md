# Changelog

## Unreleased

### Shell, audio cleanup and replay reset

- Hardened the shared sidebar as true application chrome so Dashboard, Cases, Grimoire, Agents, Archive, Mail, Investigation and Field Terminal use the same rail geometry and utility cluster at the same viewport.
- Bounded unlocked secret-sector navigation inside the rail so ARG progression cannot push access, sound and logout controls below the viewport.
- Made the file-backed production audio layer primary and stopped mixing the procedural noise engine underneath every production cue.
- Added a deterministic clean-mastering pass with DC removal and gentle low-pass filtering for the SFX sprite and all four ambience loops; hover now uses a quiet production cue instead of the old high-frequency procedural tick.
- Added the A-5 `ACCESS RESET` replay flow with aliases, a 20-second confirmation window and `CANCEL RESET`.
- Added one shared replay reset routine for terminal reset and logout; it clears ARG clearance/discoveries, live system events and ARG mail state while preserving the user's sound on/off preference.
- Added sidebar, audio and replay-reset CI contracts to protect the new behavior before normal builds and Pages publication.

### Production audio library pass

- Added a deterministic studio renderer that produces a file-backed 18-cue cinematic SFX sprite for interface, mechanical, paper, radio, transition and anomaly events.
- Added dedicated server-room, archive-room, Grimoire and terminal ambience loops with scene crossfades.
- Reworked the Web Audio engine into a hybrid sample + procedural system: samples provide physical texture while synthesis adds variation and remains a failure-safe fallback.
- Kept the approved fixed 100% audio policy and explicit mute-only control.
- Added an audio-library CI contract covering the rendered assets, sprite cue inventory and fallback architecture.
- Rewrote the README to reflect the current N.O.R.M. 2.0 feature set, cases, terminal, deployment checks and audio architecture.

### Cinematic v4 pass

- Added the N.O.R.M. tower/radio emblem and applied it to the shell and immersive login.
- Added a fully illustrated grimoire SVG plate with a room scene, apparition, floating objects, field glyphs and subtle motion.
- Expanded the Grimoire with clickable linked cases, agents, materials and an attachment viewer.
- Rebuilt Field Terminal as an interactive command console with command history, quick commands, navigation results and hidden responses.
- Added commands including `HELP`, `STATUS`, `WHOAMI`, `SCAN`, `CASE LM-006`, `AGENT ...`, `GRIMOIRE`, `ARCHIVE`, `SOUND ON/OFF` and hidden `WHO ARE YOU` behavior.
- Made archive materials open in a cinematic viewer and cross-linked them to cases, terminal and grimoire.
- Added deep links for personnel dossiers through URL hashes and actions from individual dossiers.
- Made dashboard statistics, logs, team panels, agent cards and media elements navigable.
- Added distinct animations for report, timeline, evidence, entity and media case tabs.
- Added sound events for typing, commands, scans, archive drawers, errors and material opening.
- Operator identity from the login screen is persisted for the current session and shown in the system header.

### Cinematic v3 pass

- Added theatrical operator authorization with ID and access-key fields.
- Added interactive LM-006 tabs and personnel registry.
- Removed the continuous white-noise bed in favor of low electrical ambience and rare network events.
- Added route-specific cinematic transitions and audio profiles.

### Cinematic v2 pass

- Rebuilt Web Audio sound design around filtered noise, relay transients, low-frequency impacts and subtle stereo data ticks.
- Reworked access boot sequence and full-layer exit animation.
- Replaced solid route wipe with a scan-beam handoff transition.
- Locked real photography to neutral black-and-white treatment.
- Removed hue-based glitching that could wash the interface green.
- Expanded Field Terminal scan sequence, stable timestamps and live-feed treatment.
- Added reduced-motion handling and CI build workflow.
