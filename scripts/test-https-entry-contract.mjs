import { readFileSync } from 'node:fs'

const html = readFileSync('index.html', 'utf8')
const fail = (message) => {
  console.error(`HTTPS ENTRY CONTRACT FAIL: ${message}`)
  process.exitCode = 1
}
const expect = (condition, message) => { if (!condition) fail(message) }

expect(html.includes("location.protocol === 'http:'"), 'HTTP protocol guard is missing')
expect(html.includes("location.replace(`https://${location.host}${location.pathname}${location.search}${location.hash}`)"), 'HTTPS upgrade redirect is missing')
expect(html.indexOf("location.protocol === 'http:'") < html.indexOf("/norm-source/site/"), 'HTTPS upgrade must happen before published-path redirect')
expect(html.includes("location.hostname === 'qsen.ru'"), 'qsen.ru is not covered by published-host guard')
expect(html.includes("location.hostname === 'www.qsen.ru'"), 'www.qsen.ru is not covered by published-host guard')

if (!process.exitCode) console.log('HTTPS ENTRY CONTRACT: OK // HTTP is upgraded before routing')
