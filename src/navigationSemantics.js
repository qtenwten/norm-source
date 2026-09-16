const ENTITY_CODES = new Set(['R-002','K-003','C-004','N-005','Z-006'])
const LEGACY_CASES = new Set(['NO-17','AR-31','IMG-13'])
const RECOVERED_AGENTS = new Set(['AG-04','AG-09','AG-13'])
const MODERN_CASES = new Set(['LM-005','LM-006'])

function isHashRouterBuild() {
  return window.location.hostname.endsWith('github.io') || window.location.pathname.startsWith('/norm-source/site')
}

function currentSemanticLocation() {
  const raw = isHashRouterBuild()
    ? (window.location.hash.replace(/^#/, '') || '/')
    : `${window.location.pathname}${window.location.hash}`
  const splitAt = raw.indexOf('#')
  return {
    pathname: splitAt >= 0 ? raw.slice(0, splitAt) : raw,
    anchor: splitAt >= 0 ? decodeURIComponent(raw.slice(splitAt + 1)) : '',
  }
}

export function semanticRouteForCode(rawCode) {
  const code = String(rawCode || '').trim().toUpperCase()
  if (ENTITY_CODES.has(code)) return `/grimoire#${code}`
  if (LEGACY_CASES.has(code)) return `/legacy-cases#${code}`
  if (RECOVERED_AGENTS.has(code)) return `/ghost-registry#${code.slice(3)}`
  if (MODERN_CASES.has(code)) return `/cases/${code.toLowerCase()}`
  if (code === 'AG-SEN') return '/agents#sen'
  if (code === 'AG-GRIG') return '/agents#grig'
  if (code === 'DC-03') return '/equipment#DC-03'
  if (code === 'GHOSTFS') return '/ghost-registry'
  if (code === 'MIRROR') return '/mirror-node'
  return null
}

export function semanticRouteForCase(rawCaseId) {
  const code = String(rawCaseId || '').trim().toUpperCase()
  if (MODERN_CASES.has(code) || LEGACY_CASES.has(code)) return semanticRouteForCode(code)
  return '/archive'
}

function navigateRaw(route) {
  if (!route) return
  if (isHashRouterBuild()) {
    window.location.hash = `#${route}`
    return
  }
  window.history.pushState({}, '', route)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function stopAndNavigate(event, route) {
  if (!route) return false
  event.preventDefault()
  event.stopPropagation()
  event.stopImmediatePropagation?.()
  navigateRaw(route)
  return true
}

function extractCode(text) {
  const value = String(text || '').toUpperCase()
  const match = value.match(/\b(?:LM-00[56]|N-005|Z-006|R-002|K-003|C-004|NO-17|AR-31|IMG-13|AG-(?:04|09|13|SEN|GRIG)|DC-03|GHOSTFS|MIRROR)\b/)
  return match?.[0] || null
}

function setReactInputValue(input, value) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
  setter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles:true }))
}

function runTerminalCommand(command) {
  const input = document.getElementById('terminal-command')
  const form = input?.closest('form')
  if (!input || !form) return false
  setReactInputValue(input, command)
  queueMicrotask(() => form.requestSubmit())
  return true
}

function replaceSelectionHash(anchor) {
  const { pathname } = currentSemanticLocation()
  if (!pathname || !anchor) return
  if (isHashRouterBuild()) {
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}#${pathname}#${encodeURIComponent(anchor)}`)
  } else {
    window.history.replaceState(window.history.state, '', `${pathname}#${encodeURIComponent(anchor)}`)
  }
}

function clickMatching(selector, predicate, activeClass) {
  const candidates = [...document.querySelectorAll(selector)]
  const target = candidates.find(predicate)
  if (!target || (activeClass && target.classList.contains(activeClass))) return false
  target.click()
  return true
}

function syncDeepLinkSelection() {
  const { pathname, anchor } = currentSemanticLocation()
  if (!anchor) return
  if (pathname === '/grimoire' && ENTITY_CODES.has(anchor.toUpperCase())) {
    clickMatching('.grimoire-record-strip button', (button) => button.querySelector('span')?.textContent?.trim().toUpperCase() === anchor.toUpperCase(), 'active')
    return
  }
  if (pathname === '/ghost-registry') {
    const code = `AG-${anchor.padStart(2, '0')}`.toUpperCase()
    clickMatching('.ghost-agent-card', (button) => button.textContent?.toUpperCase().includes(code), 'is-active')
    return
  }
  if (pathname === '/legacy-cases' && LEGACY_CASES.has(anchor.toUpperCase())) {
    clickMatching('.legacy-case-tabs button', (button) => button.querySelector('small')?.textContent?.trim().toUpperCase() === anchor.toUpperCase(), 'is-active')
    return
  }
  if (pathname === '/equipment') {
    clickMatching('.equipment-grid button', (button) => button.querySelector('header small')?.textContent?.trim().toUpperCase() === anchor.toUpperCase(), 'active')
  }
}

function enhanceStaticSemantics() {
  document.querySelectorAll('.case-row--summary').forEach((row) => {
    row.removeAttribute('href')
    row.setAttribute('aria-disabled', 'true')
    row.setAttribute('tabindex', '-1')
    row.setAttribute('title', 'Краткая архивная запись — отдельное интерактивное досье пока не оцифровано')
  })

  const archiveViewer = document.querySelector('.archive-viewer')
  if (archiveViewer?.querySelector('header strong')?.textContent?.trim() === 'EV-0064') {
    const action = [...archiveViewer.querySelectorAll('.archive-viewer__meta button')].find((button) => button.textContent?.includes('ОТКРЫТЬ ОБЪЕКТ'))
    if (action) action.textContent = 'ОТКРЫТЬ СУЩНОСТЬ →'
  }

  const inspector = document.querySelector('.correlation-inspector')
  const inspectorCode = inspector?.querySelector('h2')?.textContent?.trim().toUpperCase()
  if (inspectorCode === 'DC-03' && !inspector.querySelector('.semantic-injected-link')) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'investigation-primary semantic-injected-link'
    button.textContent = 'ОТКРЫТЬ КАРТОЧКУ ОБЪЕКТА →'
    button.addEventListener('click', () => navigateRaw('/equipment#DC-03'))
    inspector.append(button)
  }

  syncDeepLinkSelection()
}

function onCaptureClick(event) {
  if (!(event.target instanceof Element)) return
  const control = event.target.closest('button, a')
  if (!control) return
  const text = control.textContent?.replace(/\s+/g, ' ').trim() || ''

  const dashboardEntry = control.closest('.investigation-entry-grid')
  if (dashboardEntry && text.includes('УЛИКИ И ПРЕДМЕТЫ')) {
    stopAndNavigate(event, '/equipment')
    return
  }
  if (dashboardEntry && text.includes('МЕДИАХРАНИЛИЩЕ')) {
    stopAndNavigate(event, '/forensics')
    return
  }
  if (control.closest('.system-log') && text.includes('DC-03')) {
    stopAndNavigate(event, '/equipment#DC-03')
    return
  }

  if (control.closest('.object-inspector__cases')) {
    const caseId = extractCode(text)
    if (caseId) {
      stopAndNavigate(event, semanticRouteForCase(caseId))
      return
    }
  }

  if (control.closest('.correlation-inspector') && text.includes('ОТКРЫТЬ ИСХОДНУЮ ЗАПИСЬ')) {
    const code = control.closest('.correlation-inspector')?.querySelector('h2')?.textContent?.trim()
    const route = semanticRouteForCode(code)
    if (route) {
      stopAndNavigate(event, route)
      return
    }
  }

  if (control.classList.contains('terminal-result-link')) {
    const code = extractCode(control.closest('.terminal-line')?.textContent)
    const route = semanticRouteForCode(code)
    if (route) {
      stopAndNavigate(event, route)
      return
    }
  }

  if (control.closest('.terminal-arg-tree') && text.includes('.sys/')) {
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation?.()
    runTerminalCommand('ls -la /etc')
    return
  }

  if (control.closest('.legacy-personnel') && text.includes('ОТКРЫТЬ ЛИЧНОЕ ДЕЛО')) {
    const code = extractCode(control.closest('.legacy-personnel')?.textContent)
    const route = semanticRouteForCode(code)
    if (route) {
      stopAndNavigate(event, route)
      return
    }
  }

  if (control.closest('.grimoire-record-strip')) {
    const code = control.querySelector('span')?.textContent?.trim()
    if (code) queueMicrotask(() => replaceSelectionHash(code))
    return
  }
  if (control.classList.contains('ghost-agent-card')) {
    const code = extractCode(text)
    if (code) queueMicrotask(() => replaceSelectionHash(code.slice(3)))
    return
  }
  if (control.closest('.legacy-case-tabs')) {
    const code = control.querySelector('small')?.textContent?.trim()
    if (code) queueMicrotask(() => replaceSelectionHash(code))
    return
  }
  if (control.closest('.equipment-grid')) {
    const code = control.querySelector('header small')?.textContent?.trim()
    if (code) queueMicrotask(() => replaceSelectionHash(code))
  }
}

function installNavigationSemantics() {
  document.addEventListener('click', onCaptureClick, true)
  window.addEventListener('popstate', syncDeepLinkSelection)
  window.addEventListener('hashchange', syncDeepLinkSelection)
  const observer = new MutationObserver(enhanceStaticSemantics)
  const start = () => {
    enhanceStaticSemantics()
    observer.observe(document.body, { childList:true, subtree:true })
  }
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', start, { once:true })
    : start()
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') installNavigationSemantics()
