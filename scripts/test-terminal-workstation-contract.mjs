import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(path, 'utf8')
const main = read('src/main.jsx')
const css = read('src/terminal-workstation.css')
const polish = read('src/terminal-layout-polish.css')
const terminal = read('src/pages/TerminalDeep.jsx')

const fail = (message) => {
  console.error(`TERMINAL WORKSTATION CONTRACT FAIL: ${message}`)
  process.exitCode = 1
}
const expect = (condition, message) => { if (!condition) fail(message) }

expect(main.includes("import './terminal-workstation.css'"), 'terminal workstation stylesheet is not imported')
expect(main.includes("import './terminal-layout-polish.css'"), 'terminal layout polish stylesheet is not imported')
expect(main.indexOf("./terminal-workstation.css") > main.indexOf("./mail-notifications.css"), 'terminal workstation stylesheet must follow general UI overrides')
expect(main.indexOf("./terminal-layout-polish.css") > main.indexOf("./terminal-workstation.css"), 'terminal layout polish must be the final terminal override')

for (const token of [
  '--terminal-workstation-height',
  '.terminal-files-v2 .terminal-grid--deep',
  'height:var(--terminal-workstation-height)!important',
  'max-height:var(--terminal-workstation-height)!important',
  'grid-template-rows:auto minmax(0,1fr) auto auto!important',
  '.terminal-files-v2 .terminal-command-log',
  'overflow-y:auto!important',
  'scrollbar-gutter:stable both-edges',
  'overscroll-behavior:contain!important',
  '@media(max-width:900px)',
  '@media(min-width:901px) and (max-height:720px)',
]) expect(css.includes(token), `missing fixed-workstation rule: ${token}`)

for (const token of [
  'calc(100dvh - 150px)',
  'grid-template-areas:',
  '"uplinks"',
  '"lead"',
  '"inspector"',
  'grid-template-columns:repeat(2,minmax(0,1fr))!important',
  'grid-template-columns:repeat(3,minmax(0,1fr))!important',
  'grid-template-columns:repeat(auto-fit,minmax(88px,1fr))!important',
  '.terminal-files-v2 .terminal-resource-inspector',
  'overflow-y:auto!important',
  'margin-top:auto!important',
  '@media(min-width:901px) and (max-height:820px)',
]) expect(polish.includes(token), `missing terminal polish rule: ${token}`)

expect(terminal.includes('logRef.current.scrollTop=logRef.current.scrollHeight'), 'terminal no longer follows newest output')
expect(terminal.includes('ref={logRef}'), 'terminal transcript ref missing')
expect(terminal.includes('terminal-input-row'), 'terminal prompt row missing')
expect(terminal.includes('terminal-command-help'), 'terminal status/help row missing')
expect(terminal.includes('terminal-lead-card'), 'terminal lead card missing')
expect(terminal.includes('terminal-resource-inspector'), 'terminal resource inspector missing')

if (!process.exitCode) {
  console.log('TERMINAL WORKSTATION CONTRACT: OK // fixed viewport + dense intel rail + contained controls')
}
