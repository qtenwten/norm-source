import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(path, 'utf8')
const main = read('src/main.jsx')
const semantics = read('src/navigationSemantics.js')
const css = read('src/navigation-semantics.css')
const pkg = JSON.parse(read('package.json'))

const failures = []
const expect = (condition, message) => { if (!condition) failures.push(message) }

expect(main.includes("import './navigationSemantics.js'"), 'navigation semantic layer must load globally')
expect(main.includes("import './navigation-semantics.css'"), 'navigation semantic CSS must load globally')
expect(pkg.scripts?.['test:navigation'] === 'node scripts/test-navigation-semantics-contract.mjs', 'test:navigation script missing')

for (const token of [
  "'/grimoire#${code}'",
  "'/legacy-cases#${code}'",
  "'/ghost-registry#${code.slice(3)}'",
  "'/equipment#DC-03'",
  "runTerminalCommand('ls -la /etc')",
  "text.includes('УЛИКИ И ПРЕДМЕТЫ')",
  "text.includes('МЕДИАХРАНИЛИЩЕ')",
  "text.includes('ОТКРЫТЬ ИСХОДНУЮ ЗАПИСЬ')",
  "text.includes('ОТКРЫТЬ ЛИЧНОЕ ДЕЛО')",
  "action.textContent = 'ОТКРЫТЬ СУЩНОСТЬ →'",
]) expect(semantics.includes(token), `semantic route contract missing: ${token}`)

for (const code of ['N-005','Z-006','NO-17','AR-31','IMG-13','AG-04','AG-09','AG-13','DC-03']) {
  expect(semantics.includes(`'${code}'`), `semantic code missing: ${code}`)
}

for (const selector of ['.grimoire-record-strip button','.ghost-agent-card','.legacy-case-tabs button','.equipment-grid button']) {
  expect(semantics.includes(selector), `deep-link selector missing: ${selector}`)
}

expect(semantics.includes("row.removeAttribute('href')"), 'summary cases must stop behaving like dead links')
expect(semantics.includes("row.setAttribute('aria-disabled', 'true')"), 'summary cases must expose disabled semantics')
expect(css.includes('.case-row--summary') && css.includes('pointer-events:none!important'), 'summary case pointer contract missing')

if (failures.length) {
  console.error('NAVIGATION SEMANTICS CONTRACT FAILED:')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log('NAVIGATION SEMANTICS CONTRACT: OK // deep links + semantic destinations + dead-link guard')
