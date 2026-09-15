import { audio } from './audio.js'

const INSTALL_FLAG = '__normHissFreeAudioInstalled'

function installHissFreeAudioPatch() {
  if (audio[INSTALL_FLAG]) return
  Object.defineProperty(audio, INSTALL_FLAG, { value: true, enumerable: false })

  const productionScene = audio.scene?.bind(audio)
  const productionTransition = audio.transition?.bind(audio)

  // Archive/mail and terminal used dedicated noise-based ambience loops. They are the
  // audible "shhh" layer reported in real use, so route them to the quieter server
  // room bed instead of the archive/terminal noise beds. We keep the rest of the
  // production library intact rather than rolling the whole site back.
  audio.scene = function hissFreeScene(name) {
    if (name === 'archive' || name === 'terminal') return productionScene?.('agents')
    return productionScene?.(name)
  }

  // Route handoffs for these sections should be a short dry mechanical cue, not a
  // noise/paper/radio texture. `nav` resolves to the production relay click and to a
  // similarly short procedural fallback if the sample library is unavailable.
  audio.transition = function hissFreeTransition(name) {
    if (name === 'archive' || name === 'terminal') return audio.nav?.()
    return productionTransition?.(name)
  }

  // Autonomous system events previously used the one-second `glitch` noise texture;
  // incoming mail used a radio burst with a broadband paper/noise bed. Both are now
  // deliberately dry so nothing can suddenly hiss while the user is reading/typing.
  audio.glitch = function hissFreeGlitch() {
    return audio.nav?.()
  }

  audio.radio = function hissFreeRadio() {
    return audio.confirm?.()
  }

  // Some terminal flows call this cue directly instead of going through transition().
  audio.terminalOpen = function hissFreeTerminalOpen() {
    return audio.nav?.()
  }
}

installHissFreeAudioPatch()
