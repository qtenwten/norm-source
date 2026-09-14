# N.O.R.M. prototype v2 audit

## Problems found in the first prototype

1. The initial audio engine leaned on square / saw oscillators and short synthetic beeps. That reads as retro-game audio rather than cinematic hacker / classified-system sound design.
2. The route transition was a full-screen solid overlay. On some displays this can feel like the interface has been replaced by a flat color instead of a deliberate transition.
3. The access gate used a strong green radial treatment and did not animate the whole gate out, only the central box. The v2 pass makes the whole layer explicitly fade out.
4. The global micro-glitch used hue rotation. Because the base interface is already green-gray, a glitch could temporarily push a large part of the frame toward green. V2 uses contrast / alignment / scanline disruption instead.
5. The Field Terminal log used generated current time during render and an interval sequence. V2 records stable timestamps with each line and uses a timeout chain that is safe under React StrictMode.
6. Real-photo treatment was already grayscale in the base stylesheet, but `mix-blend-mode: multiply` allowed the surrounding green / paper colors to tint photos. V2 forces neutral monochrome rendering and removes that blend mode.

## v2 direction

- 95% neutral graphite / black / paper, 5% restrained signal colors.
- Human photography and evidence imagery stay strictly black-and-white.
- Green is a system-status accent, not a full-screen color wash.
- Red is reserved for warnings, recording state, stamps and anomaly flags.
- Route changes use a scan beam + brief route handoff label rather than a solid-screen wipe.
- Sound is built from filtered noise, relay-like transients, low-frequency impacts and stereo data ticks rather than square-wave bleeps.
- The audio architecture remains ready for a later real-SFX library pass.
