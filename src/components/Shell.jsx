import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import { audio } from '../audio'
import { getArgState, subscribeArg } from '../arg'
import NormEmblem from './NormEmblem'

const links = [
  ['/', 'СВОДКА'],
  ['/cases', 'ДЕЛА'],
  ['/grimoire', 'ГРИМУАР'],
  ['/agents', 'АГЕНТЫ'],
  ['/archive', 'АРХИВ'],
  ['/terminal', 'ТЕРМИНАЛ'],
]

const transitionCopy = {
  '/': 'ВОЗВРАТ К ОПЕРАТИВНОЙ СВОДКЕ',
  '/cases': 'ЗАПРОС К РЕЕСТРУ ДЕЛ',
  '/grimoire': 'РАСШИФРОВКА ГРИМУАРА',
  '/agents': 'ДОСТУП К ЛИЧНЫМ ДЕЛАМ',
  '/archive': 'ПОДКЛЮЧЕНИЕ К АРХИВУ',
  '/terminal': 'ЗАПУСК ПОЛЕВОГО ТЕРМИНАЛА',
  '/restricted': 'ОТКРЫТИЕ ЗАКРЫТОГО СЕКТОРА 17-B',
  '/black': 'ПОДКЛЮЧЕНИЕ К BLACK NODE',
  '/vault': 'ROOT HANDSHAKE // ЛОКАЛЬНОЕ ХРАНИЛИЩЕ',
  '/ghost-registry': 'МОНТИРОВАНИЕ GHOSTFS // PERSONNEL RECOVERY',
  '/legacy-cases': 'ВОССТАНОВЛЕНИЕ ORPHANED CASE ROUTE',
  '/mirror-node': 'PRIVILEGED HANDSHAKE // MIRROR NODE',
  '/report': 'ОТКРЫТИЕ КАНАЛА ПРИЁМА',
}

const DEFAULT_VOLUME_PERCENT = 20
const VOLUME_STORAGE_KEY = 'norm-volume-test-percent'

function volumeGain(percent) {
  const value = Math.min(100, Math.max(0, Number(percent) || 0))
  if (value === 0) return 0.0001
  return value / DEFAULT_VOLUME_PERCENT
}

function getStoredVolumePercent() {
  if (typeof window === 'undefined') return DEFAULT_VOLUME_PERCENT
  const stored = Number(window.localStorage.getItem(VOLUME_STORAGE_KEY))
  return Number.isFinite(stored) && stored >= 0 && stored <= 100 ? stored : DEFAULT_VOLUME_PERCENT
}

function getRouteTone(pathname) {
  if (pathname.startsWith('/grimoire')) return 'grimoire'
  if (pathname.startsWith('/terminal')) return 'terminal'
  if (pathname.startsWith('/cases')) return 'case'
  if (pathname.startsWith('/agents') || pathname.startsWith('/ghost-registry')) return 'agents'
  if (pathname.startsWith('/legacy-cases')) return 'case'
  if (pathname.startsWith('/archive') || pathname.startsWith('/restricted') || pathname.startsWith('/black') || pathname.startsWith('/vault') || pathname.startsWith('/mirror-node')) return 'archive'
  if (pathname.startsWith('/report')) return 'report'
  return 'dashboard'
}

function getTransitionDuration(kind) {
  if (kind === 'grimoire') return { navigateAt: 330, endAt: 760 }
  if (kind === 'terminal') return { navigateAt: 260, endAt: 650 }
  if (kind === 'dashboard') return { navigateAt: 245, endAt: 610 }
  return { navigateAt: 245, endAt: 610 }
}

function playControlSound(control) {
  if (control.matches('.report-button, .danger, .dashboard-alert-button, [data-sound="warning"]')) { audio.warning(); return }
  if (control.matches('.case-tabs-v3 button, [role="tab"], [data-sound="tab"]')) { audio.tab(); return }
  if (control.matches('.archive-card-button, .grimoire-materials button, [data-sound="drawer"]')) { audio.drawer(); return }
  if (control.matches('.case-photo-button, .media-contact-sheet > button, .dashboard-photo-link, [data-sound="photo"]')) { audio.photo(); return }
  if (control.matches('.grimoire-plate-button, .grimoire-reveal, .grimoire-case-link, [data-sound="paper"]')) { audio.paper(); return }
  if (control.matches('.terminal-quickbar button, .terminal-result-link, .terminal-map-button, [data-sound="terminal"]')) { audio.terminal(); return }
  if (control.matches('input[type="checkbox"], input[type="radio"], [role="switch"], [data-sound="toggle"]')) { audio.toggleSwitch(); return }
  if (control.matches('a, .brand, .sidebar a, [data-sound="nav"]')) { audio.nav(); return }
  audio.click()
}

export default function Shell({ children, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [transition, setTransition] = useState(false)
  const [transitionText, setTransitionText] = useState('СИНХРОНИЗАЦИЯ АРХИВА')
  const [transitionKind, setTransitionKind] = useState('dashboard')
  const [muted, setMuted] = useState(!audio.enabled)
  const [volumePercent, setVolumePercent] = useState(getStoredVolumePercent)
  const [loggingOut, setLoggingOut] = useState(false)
  const [argProgress, setArgProgress] = useState(getArgState)
  const timersRef = useRef([])
  const lastHoverRef = useRef({ control: null, at: 0 })
  const operator = useMemo(() => sessionStorage.getItem('norm-operator') || 'GUEST-27491', [])
  const stamp = useMemo(() => new Date().toLocaleTimeString('ru-RU', { hour12: false }), [location.pathname])
  const routeTone = getRouteTone(location.pathname)

  useEffect(() => subscribeArg(setArgProgress), [])
  useEffect(() => { audio.scene(routeTone) }, [routeTone])
  useEffect(() => {
    audio.setVolume(volumeGain(volumePercent))
    window.localStorage.setItem(VOLUME_STORAGE_KEY, String(volumePercent))
  }, [volumePercent])

  useEffect(() => {
    const selector = 'button, a, [role="button"], [role="tab"], [role="switch"], input[type="checkbox"], input[type="radio"]'
    const onPointerDown = (event) => {
      if (!(event.target instanceof Element)) return
      const control = event.target.closest(selector)
      if (!control || control.hasAttribute('disabled') || control.getAttribute('aria-disabled') === 'true') return
      if (control.classList.contains('sound-toggle')) return
      playControlSound(control)
      control.classList.remove('norm-pressed')
      void control.getBoundingClientRect()
      control.classList.add('norm-pressed')
      timersRef.current.push(window.setTimeout(() => control.classList.remove('norm-pressed'), 180))
    }
    const onPointerOver = (event) => {
      if (!(event.target instanceof Element)) return
      const control = event.target.closest(selector)
      if (!control || control.hasAttribute('disabled') || control.getAttribute('aria-disabled') === 'true') return
      if (event.relatedTarget instanceof Node && control.contains(event.relatedTarget)) return
      const now = performance.now()
      if (lastHoverRef.current.control === control && now - lastHoverRef.current.at < 240) return
      if (now - lastHoverRef.current.at < 85) return
      lastHoverRef.current = { control, at: now }
      audio.hover()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('pointerover', onPointerOver, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('pointerover', onPointerOver, true)
    }
  }, [])

  useEffect(() => () => { timersRef.current.forEach(window.clearTimeout) }, [])

  const go = (to) => {
    if (location.pathname === to || transition || loggingOut) return
    const nextTone = getRouteTone(to)
    const timing = getTransitionDuration(nextTone)
    audio.transition(nextTone)
    setTransitionKind(nextTone)
    setTransitionText(transitionCopy[to] || 'СИНХРОНИЗАЦИЯ АРХИВА')
    setTransition(true)
    timersRef.current.push(window.setTimeout(() => navigate(to), timing.navigateAt))
    timersRef.current.push(window.setTimeout(() => setTransition(false), timing.endAt))
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (Math.random() < 0.055) {
        document.documentElement.classList.add('micro-glitch')
        audio.glitch()
        window.setTimeout(() => document.documentElement.classList.remove('micro-glitch'), 95)
      }
    }, 7200)
    return () => window.clearInterval(timer)
  }, [])

  const toggleSound = () => {
    const on = audio.toggle()
    setMuted(!on)
    if (on) { audio.setVolume(volumeGain(volumePercent)); audio.scene(routeTone); audio.confirm() }
  }
  const changeVolume = (event) => {
    const next = Math.min(100, Math.max(0, Number(event.target.value)))
    setVolumePercent(next)
    if (muted && next > 0) { audio.enable(); audio.setVolume(volumeGain(next)); audio.scene(routeTone); setMuted(false) }
  }
  const previewVolume = () => { if (!muted && volumePercent > 0) audio.confirm() }
  const logout = () => {
    if (loggingOut) return
    setLoggingOut(true)
    setTransitionKind('terminal')
    setTransitionText('ЗАВЕРШЕНИЕ СЕССИИ // ОЧИСТКА ДОПУСКА')
    setTransition(true)
    timersRef.current.push(window.setTimeout(() => onLogout?.(), 520))
  }

  const legacyRouteRestored = argProgress.discoveries.includes('LEGACY_ROUTE_RESTORED')
  const secretLinks = [
    argProgress.clearance >= 1 && ['/restricted','RESTRICTED 17-B','A-1'],
    argProgress.clearance >= 2 && ['/black','BLACK ARCHIVE','A-2'],
    argProgress.clearance >= 3 && ['/vault','ROOT VAULT','A-3'],
    argProgress.clearance >= 4 && ['/ghost-registry','GHOST REGISTRY','A-4'],
    legacyRouteRestored && ['/legacy-cases','LEGACY CASES','A-4'],
    argProgress.clearance >= 5 && ['/mirror-node','MIRROR NODE','A-5'],
  ].filter(Boolean)

  const highestRoute = argProgress.clearance >= 5 ? '/mirror-node' : legacyRouteRestored ? '/legacy-cases' : argProgress.clearance >= 4 ? '/ghost-registry' : argProgress.clearance >= 3 ? '/vault' : argProgress.clearance >= 2 ? '/black' : argProgress.clearance >= 1 ? '/restricted' : '/terminal'

  return (
    <div className={`norm-shell norm-shell--${routeTone}`} data-route={routeTone} data-clearance={argProgress.clearance}>
      <div className="grain" aria-hidden="true" /><div className="scanlines" aria-hidden="true" />
      <div className={`route-transition route-transition--${transitionKind} ${transition ? 'is-active' : ''}`} aria-hidden="true">
        <div className="route-transition__beam" /><div className="route-transition__glyphs">NORM // 17 // LM // 03 // ACCESS // INTERNAL</div>
        <div className="route-transition__label"><small>NORM-OS // ROUTE HANDOFF</small><strong>{transitionText}</strong></div>
      </div>
      <header className="topbar">
        <button type="button" className="brand brand--emblem" onClick={() => go('/')} aria-label="Н.О.Р.М. — на сводку"><NormEmblem compact /><span className="brand__copy"><span className="brand__logo">Н.О.Р.М.</span><span className="brand__sub">Независимый Отдел Расследований Мистики</span></span></button>
        <div className="topbar__motto">ТАМ, ГДЕ ЗАКАНЧИВАЮТСЯ ОБЪЯСНЕНИЯ — НАЧИНАЕМ МЫ.</div>
        <div className="session"><span>SESSION: {operator}</span><span className={argProgress.clearance >= 2 ? 'access-elevated' : ''}>ACCESS LEVEL: A-{argProgress.clearance}</span><span>СЕТЬ: ВНУТРЕННЯЯ <i className="status-dot" /></span></div>
      </header>
      <aside className="sidebar">
        <div className="sidebar-emblem" aria-hidden="true"><NormEmblem compact /></div>
        <nav>{links.map(([to,label]) => <NavLink key={to} to={to} end={to==='/' } onClick={(event)=>{event.preventDefault();go(to)}}><span className="nav-glyph">⌁</span>{label}</NavLink>)}</nav>
        {secretLinks.length>0 && <div className="secret-nav"><small>РАЗБЛОКИРОВАННЫЕ СЕКТОРЫ</small>{secretLinks.map(([to,label,level])=><NavLink key={to} to={to} onClick={(event)=>{event.preventDefault();go(to)}}><span>{level}</span><strong>{label}</strong><b>↗</b></NavLink>)}</div>}
        <button className="report-button" type="button" onClick={() => go('/report')}>⚠ СООБЩИТЬ<br />ОБ АНОМАЛИИ</button>
        <div className="sidebar__tagline">НАБЛЮДАЕМ.<br />ФИКСИРУЕМ.<br />РАЗБИРАЕМСЯ.</div>
        <button type="button" className={`arg-clearance-card ${argProgress.clearance >= 2 ? 'is-anomalous' : ''}`} onClick={() => go(highestRoute)}>
          <small>ДОПУСК СЕССИИ</small><strong>A-{argProgress.clearance}</strong><span>ОБНАРУЖЕНО: {argProgress.discoveries.length} / ??</span>
          {argProgress.clearance >= 1 && <em>RESTRICTED NODE VISIBLE</em>}{argProgress.clearance >= 2 && <em>BLACK NODE VISIBLE</em>}{argProgress.clearance >= 3 && <em>ROOT VAULT VISIBLE</em>}{argProgress.clearance >= 4 && <em>GHOSTFS MOUNTED</em>}{legacyRouteRestored && <em>LEGACY CASE ROUTE RESTORED</em>}{argProgress.clearance >= 5 && <em>MIRROR NODE VISIBLE</em>}
        </button>
        <div className="volume-console"><div className="volume-console__head"><span>ГРОМКОСТЬ</span><output htmlFor="norm-volume">{volumePercent}%</output></div><input id="norm-volume" className="volume-slider" type="range" min="0" max="100" step="1" value={volumePercent} onChange={changeVolume} onPointerUp={previewVolume} onKeyUp={previewVolume} aria-label={`Громкость интерфейса: ${volumePercent}%`} style={{'--volume':`${volumePercent}%`}}/><div className="volume-console__scale"><span>0</span><span className="volume-reference">20 // ТЕКУЩАЯ</span><span>100</span></div><small>ТЕСТОВАЯ ШКАЛА // 20% = ПРЕЖНЯЯ ГРОМКОСТЬ</small></div>
        <button className="sound-toggle" type="button" onClick={toggleSound} aria-pressed={!muted}>{muted?'ЗВУК: ВЫКЛ':'ЗВУК: ВКЛ'}</button>
        <button className="logout-button" type="button" data-sound="warning" onClick={logout} disabled={loggingOut}><span>{loggingOut?'ЗАВЕРШЕНИЕ СЕССИИ…':'ВЫЙТИ ИЗ СИСТЕМЫ'}</span><small>СБРОСИТЬ ДОПУСК И ВЕРНУТЬСЯ К ВХОДУ</small></button>
      </aside>
      <main className="main-area" key={location.pathname}><div className="main-area__meta">NORM-OS v2.4.1 // {stamp}</div>{children}</main>
      <footer className="footerline">Н.О.Р.М. // ДАННЫЕ ПРЕДНАЗНАЧЕНЫ ТОЛЬКО ДЛЯ ВНУТРЕННЕГО ИСПОЛЬЗОВАНИЯ.</footer>
    </div>
  )
}
