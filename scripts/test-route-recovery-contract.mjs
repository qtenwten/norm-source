import { readFile } from 'node:fs/promises'

const [app, main, recovery, boundary, css, pages] = await Promise.all([
  readFile('src/App.jsx','utf8'),
  readFile('src/main.jsx','utf8'),
  readFile('src/routeRecovery.js','utf8'),
  readFile('src/components/RouteErrorBoundary.jsx','utf8'),
  readFile('src/route-recovery.css','utf8'),
  readFile('.github/workflows/pages.yml','utf8'),
])

const checks = [
  ['resilient lazy loader', app.includes('loadRouteModule(routeModules[name], name)')],
  ['route error boundary', app.includes('<RouteErrorBoundary')],
  ['idle route prefetch', app.includes('Promise.allSettled(Object.values(routeModules)')],
  ['global preload recovery', recovery.includes("vite:preloadError")],
  ['global rejection recovery', recovery.includes("unhandledrejection")],
  ['cache-busting reload', recovery.includes('__norm_reload') && recovery.includes('location.replace')],
  ['reload loop guard', recovery.includes('RECOVERY_WINDOW_MS')],
  ['visible recovery UI', boundary.includes('МОДУЛЬ НЕ ОТВЕТИЛ') && css.includes('.norm-route-failure')],
  ['recovery installed before boot', main.indexOf('installGlobalRouteRecovery()') < main.indexOf('ReactDOM.createRoot')],
  ['recovery css is final', main.trim().includes("<App />\n    </Router>\n  </React.StrictMode>,\n)\n") && main.includes("import './route-recovery.css'")],
  ['previous generation assets retained', pages.includes('Previous route chunks') && pages.includes('.current-assets.txt')],
]

const failed = checks.filter(([,ok]) => !ok)
if (failed.length) {
  console.error('ROUTE RECOVERY CONTRACT FAILED')
  for (const [name] of failed) console.error(`- ${name}`)
  process.exit(1)
}

console.log(`ROUTE RECOVERY CONTRACT: OK // ${checks.length} checks`)
