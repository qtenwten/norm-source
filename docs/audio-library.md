# N.O.R.M. audio library plan

The prototype now uses a layered Web Audio engine instead of square-wave / retro-game bleeps. The next audio pass can replace or reinforce individual procedural cues with real SFX without changing page logic.

## Recommended legal sources

- Kenney Interface Sounds — CC0: https://kenney.nl/assets/interface-sounds
- Kenney Sci-fi Sounds — CC0: https://kenney.nl/assets/sci-fi-sounds
- Kenney UI Audio — CC0: https://kenney.nl/assets/ui-audio
- Mixkit Technology SFX — Mixkit license: https://mixkit.co/free-sound-effects/technology/
- Mixkit Glitch SFX — Mixkit license: https://mixkit.co/free-sound-effects/glitch/
- Mixkit Radio SFX — Mixkit license: https://mixkit.co/free-sound-effects/radio/

Prefer CC0 material for the permanent production library when equivalent sounds exist.

## Target folders

```text
public/audio/
  ambience/
    server-room-loop.ogg
    archive-room-loop.ogg
    grimoire-room-loop.ogg
    field-radio-loop.ogg
  ui/
    click-01.ogg
    confirm.ogg
    deny.ogg
    terminal-key-01.ogg
  transitions/
    route-handoff.ogg
    dossier-open.ogg
    grimoire-open.ogg
    terminal-enter.ogg
  mechanical/
    relay-01.ogg
    switch-01.ogg
    stamp-01.ogg
    paper-01.ogg
  anomaly/
    interference-01.ogg
    radio-burst-01.ogg
    corrupted-data-01.ogg
    low-drone-01.ogg
```

## Sound direction

N.O.R.M. should sound industrial and cinematic rather than arcade-like. Build most cues from two or three layers: a mechanical transient, filtered radio/noise texture, and a very quiet low-frequency body. Avoid bright square-wave beeps as the dominant layer.

Sections should eventually have their own ambience: server/electrical room for the dashboard, paper/tape room tone for the archive, dry radio/sensor noise for Field Terminal, and almost-silent low-frequency ambience for the Grimoire.
