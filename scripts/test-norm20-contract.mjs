import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(path,'utf8')
const app = read('src/App.jsx')
const main = read('src/main.jsx')
const events = read('src/systemEvents.js')
const desk = read('src/pages/InvestigatorDesk.jsx')
const forensics = read('src/pages/Forensics.jsx')
const mailbox = read('src/pages/Mailbox.jsx')
const equipment = read('src/pages/EquipmentRegistry.jsx')
const terminal = read('src/terminalEnhancements.js')
const cases = read('src/content/cases/index.js')
const css = read('src/v25.css')

const fail = (message) => { console.error(`NORM 2.0 CONTRACT FAIL: ${message}`); process.exitCode = 1 }
const expect = (condition, message) => { if (!condition) fail(message) }

for (const route of ['/desk','/forensics','/mail','/equipment']) expect(app.includes(`path="${route}"`), `missing route ${route}`)
expect(app.includes('SystemEventDaemon'), 'system event daemon is not mounted')
expect(app.includes('lazy(() => import('), 'route-level lazy loading missing')
expect(main.includes("'./terminalEnhancements.js'"), 'terminal 2.5 enhancement layer missing')
expect(main.includes("'./v25.css'"), 'v25 style layer missing')

for (const feature of ['norm-investigator-desk-v1','showCanonical','links:[]']) expect(desk.includes(feature), `desk feature missing: ${feature}`)
for (const feature of ['BEDROOM_01','FRAME COMPARATOR','ANALYZE FRAME','night-dusnila-monitor-entity.webp']) expect(forensics.includes(feature), `forensics feature missing: ${feature}`)
for (const feature of ['getDynamicMessages','НЕПРОЧИТАННЫЕ','ПОЛЕВАЯ ГРУППА','СИСТЕМНЫЕ']) expect(mailbox.includes(feature), `mail feature missing: ${feature}`)
for (const feature of ['CHAIN OF CUSTODY','artifactRecords','ВЫГРУЗИТЬ КАРТОЧКУ']) expect(equipment.includes(feature), `equipment feature missing: ${feature}`)

const eventIds = [...events.matchAll(/id:'(EVT-[^']+)'/g)].map((m)=>m[1])
expect(eventIds.length >= 6, 'too few live system events')
expect(new Set(eventIds).size === eventIds.length, 'duplicate live event ids')
const liveMailIds = [...events.matchAll(/id:'(LIVE-MSG-[^']+)'/g)].map((m)=>m[1])
expect(new Set(liveMailIds).size === liveMailIds.length, 'duplicate live mail ids')

for (const token of ['Tab','CTRL+L','kill 0','GLOB','PIPE TRANSLATED']) expect(terminal.toLowerCase().includes(token.toLowerCase()), `terminal enhancement missing: ${token}`)
for (const id of ['LM-001','LM-002','LM-003','LM-004','LM-005','LM-006']) expect(cases.includes(`id:'${id}'`), `case registry missing ${id}`)
for (const cls of ['.norm20-dock','.desk-layout','.forensics-layout','.mail-layout','.equipment-layout']) expect(css.includes(cls), `missing CSS contract ${cls}`)

if (!process.exitCode) console.log(`NORM 2.0 CONTRACT: OK // events=${eventIds.length} liveMail=${liveMailIds.length} routes=4`)
