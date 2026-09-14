let ctx
let master
let hum
let enabled = false

function ensure() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
    master = ctx.createGain()
    master.gain.value = 0.22
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone(freq = 220, duration = 0.08, type = 'sine', gain = 0.04, slideTo) {
  if (!enabled) return
  const c = ensure()
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, c.currentTime)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + duration)
  g.gain.setValueAtTime(gain, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration)
  osc.connect(g).connect(master)
  osc.start()
  osc.stop(c.currentTime + duration)
}

function noise(duration = 0.13, gain = 0.025) {
  if (!enabled) return
  const c = ensure()
  const length = Math.floor(c.sampleRate * duration)
  const buffer = c.createBuffer(1, length, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length)
  const src = c.createBufferSource()
  const g = c.createGain()
  g.gain.value = gain
  src.buffer = buffer
  src.connect(g).connect(master)
  src.start()
}

export const audio = {
  enable() {
    enabled = true
    const c = ensure()
    if (!hum) {
      hum = c.createOscillator()
      const hg = c.createGain()
      hum.type = 'sine'
      hum.frequency.value = 46
      hg.gain.value = 0.012
      hum.connect(hg).connect(master)
      hum.start()
    }
    tone(72, 0.42, 'sine', 0.06, 48)
    setTimeout(() => tone(410, 0.08, 'square', 0.025, 520), 120)
  },
  toggle() {
    enabled = !enabled
    if (enabled) ensure()
    return enabled
  },
  get enabled() { return enabled },
  click() { tone(520, 0.045, 'square', 0.02, 390) },
  nav() { tone(150, 0.16, 'sawtooth', 0.035, 70); noise(0.09, 0.012) },
  stamp() { tone(68, 0.18, 'triangle', 0.055, 42); noise(0.08, 0.035) },
  glitch() { noise(0.18, 0.05); tone(920, 0.09, 'square', 0.022, 180) },
  terminal() { tone(760, 0.035, 'square', 0.018, 540) },
}
