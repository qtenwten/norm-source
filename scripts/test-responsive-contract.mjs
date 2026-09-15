import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(path, 'utf8')
const main = read('src/main.jsx')
const css = read('src/responsive-v26.css')
const html = read('index.html')

const fail = (message) => {
  console.error(`RESPONSIVE CONTRACT FAIL: ${message}`)
  process.exitCode = 1
}
const expect = (condition, message) => { if (!condition) fail(message) }

expect(main.includes("import './responsive-v26.css'"), 'responsive-v26.css is not imported')
expect(main.indexOf("./responsive-v26.css") > main.indexOf("./terminal-layout-polish.css"), 'responsive-v26.css must be the final UI override')
expect(html.includes('viewport-fit=cover'), 'viewport safe-area support is missing')
expect(html.includes('width=device-width'), 'device-width viewport is missing')

for (const token of [
  '@media(min-width:1800px)',
  '@media(min-width:1025px) and (max-width:1599px)',
  '@media(max-width:1024px)',
  '@media(max-width:720px)',
  '@media(max-width:420px)',
  '@media(max-height:560px) and (max-width:1024px) and (orientation:landscape)',
  '@media(pointer:coarse)',
  '@media(prefers-reduced-motion:reduce)',
  'env(safe-area-inset-bottom)',
  '100dvh',
  '.correlation-canvas{min-width:780px!important}',
  '.desk-board__canvas{width:760px!important',
  '.terminal-files-v2 .terminal-console{order:1!important',
  '.mail-layout{display:grid!important;grid-template-columns:1fr!important',
  '.sidebar{',
  'overflow-x:auto!important',
]) expect(css.includes(token), `missing responsive rule: ${token}`)

if (!process.exitCode) {
  console.log('RESPONSIVE CONTRACT: OK // phone + tablet + laptop + desktop + safe-area')
}
