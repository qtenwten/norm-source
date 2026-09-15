import { readFileSync } from 'node:fs'

const reset = readFileSync('src/sessionReset.js','utf8')
const app = readFileSync('src/App.jsx','utf8')
const terminal = readFileSync('src/terminalEnhancements.js','utf8')

const failures = []
const expect = (condition, message) => { if (!condition) failures.push(message) }

for (const key of ['norm-arg-progress-v1','norm-system-events-v2','norm-mail-read-v2','norm-entered','norm-operator','norm-terminal-prefill']) {
  expect(reset.includes(key), `reset routine does not clear required replay key: ${key}`)
}
expect(reset.includes("SESSION_RESET_EVENT = 'norm:session-reset'"), 'shared reset event missing')
expect(app.includes('resetReplaySession'), 'logout is not routed through shared reset routine')
expect(app.includes('SESSION_RESET_EVENT'), 'App does not listen for terminal-issued reset')
expect(app.includes("navigate('/',{replace:true})"), 'reset must return to the authorization route')

for (const command of ['ACCESS RESET','RESET ACCESS','SESSION RESET','CLEARANCE RESET','CONFIRM RESET','CANCEL RESET']) {
  expect(terminal.includes(command), `terminal reset command missing: ${command}`)
}
expect(terminal.includes('currentClearance()'), 'terminal reset must inspect current access level')
expect(terminal.includes('clearance < 5'), 'replay reset must be gated behind A-5')
expect(terminal.includes("resetReplaySession('terminal-access-reset')"), 'terminal confirm does not call shared reset routine')
expect(terminal.includes('resetArmedUntil = Date.now() + 20000'), 'dangerous reset must require an expiring confirmation window')

if (failures.length) {
  console.error('SESSION RESET CONTRACT: FAILED')
  failures.forEach((failure) => console.error(` - ${failure}`))
  process.exit(1)
}

console.log('SESSION RESET CONTRACT: OK // A-5 confirm flow + shared logout reset + replay cleanup')
