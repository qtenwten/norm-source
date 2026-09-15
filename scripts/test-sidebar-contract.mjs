import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const main = read('src/main.jsx')
const shell = read('src/components/Shell.jsx')
const css = read('src/sidebar-unified.css')

const failures = []
const expect = (condition, message) => { if (!condition) failures.push(message) }

const unifiedImport = main.indexOf("import './sidebar-unified.css'")
const routeRecoveryImport = main.indexOf("import './route-recovery.css'")
const terminalFitImport = main.indexOf("import './terminal-fullhd-fit.css'")

expect(unifiedImport >= 0, 'sidebar-unified.css must be imported')
expect(unifiedImport > routeRecoveryImport, 'sidebar-unified.css must load after route-recovery.css')
expect(unifiedImport > terminalFitImport, 'sidebar-unified.css must load after terminal-fullhd-fit.css')
expect((shell.match(/<aside className="sidebar">/g) || []).length === 1, 'Shell must expose exactly one shared sidebar')
expect(shell.includes("data-route={routeTone}"), 'Shell must expose route state without duplicating sidebar markup')

expect(css.includes('.norm-shell[data-route] .sidebar'), 'unified CSS must target the shared shell sidebar')
expect(css.includes('height:calc(100dvh - var(--norm-sidebar-header-h) - var(--norm-sidebar-footer-h))!important'), 'desktop sidebar height must be viewport-bound, not page-content-bound')
expect(css.includes('position:sticky!important'), 'desktop sidebar must use stable sticky chrome geometry')
expect(css.includes('@media (min-width:1280px) and (max-height:900px)'), 'short desktop viewport must have one shared compact profile')
expect(css.includes('@media (max-width:1024px)'), 'responsive sidebar must retain a shared mobile/tablet visual contract')
expect(!/norm-shell--(?:grimoire|terminal|archive|case|agents|dashboard)[^{]*\.sidebar/.test(css), 'unified sidebar CSS must not contain route-specific sidebar selectors')
expect(!css.includes(':has(.terminal-files-v2) .sidebar'), 'unified sidebar CSS must not special-case the terminal route')

if (failures.length) {
  console.error('Sidebar consistency contract failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('Sidebar consistency contract passed')
