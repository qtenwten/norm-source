const RECOVERY_KEY = 'norm-route-recovery-v1'
const RECOVERY_WINDOW_MS = 20_000

export function isRecoverableRouteError(error) {
  const message = String(error?.message || error || '')
  return /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk|ChunkLoadError|Unable to preload CSS|dynamically imported module/i.test(message)
}

function readRecoveryStamp() {
  try {
    return JSON.parse(window.sessionStorage.getItem(RECOVERY_KEY) || 'null')
  } catch {
    return null
  }
}

export function requestFreshRouteReload(reason = 'route-module') {
  if (typeof window === 'undefined') return false

  const previous = readRecoveryStamp()
  const now = Date.now()
  if (previous?.at && now - previous.at < RECOVERY_WINDOW_MS) return false

  try {
    window.sessionStorage.setItem(RECOVERY_KEY, JSON.stringify({ at: now, reason }))
  } catch {
    // sessionStorage can be unavailable in hardened/private browsing modes.
  }

  const url = new URL(window.location.href)
  url.searchParams.set('__norm_reload', String(now))
  window.location.replace(url.toString())
  return true
}

export async function loadRouteModule(importer, routeKey) {
  try {
    const module = await importer()
    try { window.sessionStorage.removeItem(RECOVERY_KEY) } catch { /* noop */ }
    return module
  } catch (error) {
    if (isRecoverableRouteError(error) && requestFreshRouteReload(`chunk:${routeKey}`)) {
      // Keep Suspense pending while location.replace hands control to the fresh build.
      return new Promise(() => {})
    }
    throw error
  }
}

export function installGlobalRouteRecovery() {
  if (typeof window === 'undefined') return () => {}

  const onPreloadError = (event) => {
    event.preventDefault?.()
    requestFreshRouteReload('vite:preloadError')
  }

  const onUnhandledRejection = (event) => {
    if (!isRecoverableRouteError(event.reason)) return
    event.preventDefault?.()
    requestFreshRouteReload('unhandledrejection')
  }

  const onWindowError = (event) => {
    if (!isRecoverableRouteError(event.error || event.message)) return
    event.preventDefault?.()
    requestFreshRouteReload('window:error')
  }

  window.addEventListener('vite:preloadError', onPreloadError)
  window.addEventListener('unhandledrejection', onUnhandledRejection)
  window.addEventListener('error', onWindowError)

  return () => {
    window.removeEventListener('vite:preloadError', onPreloadError)
    window.removeEventListener('unhandledrejection', onUnhandledRejection)
    window.removeEventListener('error', onWindowError)
  }
}
