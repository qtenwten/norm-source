import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(path,'utf8')
const app = read('src/App.jsx')
const main = read('src/main.jsx')
const events = read('src/systemEvents.js')
const daemon = read('src/components/SystemEventDaemon.jsx')
const shell = read('src/components/Shell.jsx')
const investigation = read('src/pages/InvestigationHub.jsx')
const mailState = read('src/mailState.js')
const desk = read('src/pages/InvestigatorDesk.jsx')
const forensics = read('src/pages/Forensics.jsx')
const mailbox = read('src/pages/Mailbox.jsx')
const equipment = read('src/pages/EquipmentRegistry.jsx')
const terminal = read('src/terminalEnhancements.js')
const cases = read('src/content/cases/index.js')
const css = read('src/v25.css')
const mailCss = read('src/mail-notifications.css')

const fail = (message) => { console.error(`NORM 2.0 CONTRACT FAIL: ${message}`); process.exitCode = 1 }
const expect = (condition, message) => { if (!condition) fail(message) }

for (const route of ['/desk','/forensics','/mail','/equipment']) expect(app.includes(`path="${route}"`), `missing route ${route}`)
expect(app.includes('SystemEventDaemon'), 'system event daemon is not mounted')
expect(app.includes('lazyRoute(') && app.includes('loadRouteModule('), 'route-level resilient lazy loading missing')
expect(main.includes("'./terminalEnhancements.js'"), 'terminal 2.5 enhancement layer missing')
expect(main.includes("'./v25.css'"), 'v25 style layer missing')
expect(main.includes("'./mail-notifications.css'"), 'mail notification style layer missing')

for (const feature of ['norm-investigator-desk-v1','showCanonical','links:[]']) expect(desk.includes(feature), `desk feature missing: ${feature}`)
for (const feature of ['BEDROOM_01','FRAME COMPARATOR','ANALYZE FRAME','night-dusnila-monitor-entity.webp']) expect(forensics.includes(feature), `forensics feature missing: ${feature}`)
for (const feature of ['getDynamicMessages','НЕПРОЧИТАННЫЕ','ПОЛЕВАЯ ГРУППА','СИСТЕМНЫЕ','subscribeMailRead']) expect(mailbox.includes(feature), `mail feature missing: ${feature}`)
for (const feature of ['CHAIN OF CUSTODY','artifactRecords','ВЫГРУЗИТЬ КАРТОЧКУ']) expect(equipment.includes(feature), `equipment feature missing: ${feature}`)

expect(shell.includes("['/mail', 'ПОЧТА']"), 'mail is not present in the primary sidebar')
expect(shell.includes('sidebar-mail-badge'), 'sidebar unread mail badge missing')
expect(shell.includes('NEW_MAIL_EVENT'), 'sidebar new-mail pulse listener missing')
expect(!investigation.includes("['messages','СООБЩЕНИЯ']"), 'messages must not remain an investigation tab')
expect(daemon.includes('announceNewMail'), 'live mail announcement event missing')
expect(daemon.includes('audio.radio()'), 'live mail audio signal missing')
expect(mailState.includes('norm-mail-read-v2'), 'shared mail read state missing')
expect(mailCss.includes('.sidebar-mail-link.is-new-mail'), 'mail blink styling missing')

const eventIds = [...events.matchAll(/id:'(EVT-[^']+)'/g)].map((m)=>m[1])
expect(eventIds.length >= 6, 'too few live system events')
expect(new Set(eventIds).size === eventIds.length, 'duplicate live event ids')
const liveMailIds = [...events.matchAll(/id:'(LIVE-MSG-[^']+)'/g)].map((m)=>m[1])
expect(new Set(liveMailIds).size === liveMailIds.length, 'duplicate live mail ids')

for (const token of ['Tab','CTRL+L','kill 0','GLOB','PIPE TRANSLATED']) expect(terminal.toLowerCase().includes(token.toLowerCase()), `terminal enhancement missing: ${token}`)
for (const id of ['LM-001','LM-002','LM-003','LM-004','LM-005','LM-006']) expect(cases.includes(`id:'${id}'`), `case registry missing ${id}`)
for (const cls of ['.norm20-dock','.desk-layout','.forensics-layout','.mail-layout','.equipment-layout']) expect(css.includes(cls), `missing CSS contract ${cls}`)

if (!process.exitCode) console.log(`NORM 2.0 CONTRACT: OK // events=${eventIds.length} liveMail=${liveMailIds.length} routes=4`)
