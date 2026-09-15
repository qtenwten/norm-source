import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import { audio } from '../audio'
import { getArgState, subscribeArg } from '../arg'
import { getMailRead, getUnreadMail, NEW_MAIL_EVENT, subscribeMailRead } from '../mailState'
import { getSystemEventState, subscribeSystemEvents } from '../systemEvents'
import NormEmblem from './NormEmblem'

const links = [
  ['/', 'СВОДКА'],
  ['/cases', 'ДЕЛА'],
  ['/grimoire', 'ГРИМУАР'],
  ['/agents', 'АГЕНТЫ'],
  ['/archive', 'АРХИВ'],
  ['/mail', 'ПОЧТА'],
  ['/investigation', 'РАССЛЕДОВАНИЕ'],
  ['/terminal', 'ТЕРМИНАЛ'],
]

const transitionCopy = {
  '/': 'ВОЗВРАТ К ОПЕРАТИВНОЙ СВОДКЕ',
  '/cases': 'ЗАПРОС К РЕЕСТРУ ДЕЛ',
  '/grimoire': 'РАСШИФРОВКА ГРИМУАРА',
  '/agents': 'ДОСТУП К ЛИЧНЫМ ДЕЛАМ',
  '/archive': 'ПОДКЛЮЧЕНИЕ К АРХИВУ',
  '/mail': 'ПОДКЛЮЧЕНИЕ К INTERNAL MAIL',
  '/investigation': 'СИНХРОНИЗАЦИЯ CORRELATION DESK',
  '/terminal': 'ЗАПУСК ПОЛЕВОГО ТЕРМИНАЛА',
  '/restricted': 'ОТКРЫТИЕ ЗАКРЫТОГО СЕКТОРА 17-B',
  '/black': 'ПОДКЛЮЧЕНИЕ К BLACK NODE',
  '/vault': 'ROOT HANDSHAKE // ЛОКАЛЬНОЕ ХРАНИЛИЩЕ',
  '/ghost-registry': 'МОНТИРОВАНИЕ GHOSTFS // PERSONNEL RECOVERY',
  '/legacy-cases': 'ВОССТАНОВЛЕНИЕ ORPHANED CASE ROUTE',
  '/mirror-node': 'PRIVILEGED HANDSHAKE // MIRROR NODE',
  '/report': 'ОТКРЫТИЕ КАНАЛА ПРИЁМА',
}

const FIXED_AUDIO_GAIN = 5
const LEGACY_VOLUME_STORAGE_KEY = 'norm-volume-test-percent'
const SOUND_STORAGE_KEY = 'norm-audio-enabled-v1'

function getStoredSoundEnabled() {
  if (typeof window === 'undefined') return true
  return window.localStorage.getItem(SOUND_STORAGE_KEY) !== '0'
}

function getRouteTone(pathname) {
  if (pathname.startsWith('/grimoire')) return 'grimoire'
  if (pathname.startsWith('/terminal')) return 'terminal'
  if (pathname.startsWith('/investigation') || pathname.startsWith('/mail')) return 'archive'
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
  const [muted, setMuted] = useState(() => !getStoredSoundEnabled())
  const [loggingOut, setLoggingOut] = useState(false)
  const [argProgress, setArgProgress] = useState(getArgState)
  const [mailRead, setMailRead] = useState(getMailRead)
  const [systemEvents, setSystemEvents] = useState(getSystemEventState)
  const [mailPulse, setMailPulse] = useState(false)
  const timersRef = useRef([])
  const mailPulseTimerRef = useRef(null)
  const lastHoverRef = useRef({ control: null, at: 0 })
  const operator = useMemo(() => sessionStorage.getItem('norm-operator') || 'GUEST-27491', [])
  const stamp = useMemo(() => new Date().toLocaleTimeString('ru-RU', { hour12: false }), [location.pathname])
  const routeTone = getRouteTone(location.pathname)
  const unreadMail = useMemo(() => getUnreadMail(argProgress, systemEvents, mailRead).length, [argProgress, systemEvents, mailRead])

  useEffect(() => subscribeArg(setArgProgress), [])
  useEffect(() => subscribeMailRead(setMailRead), [])
  useEffect(() => subscribeSystemEvents(setSystemEvents), [])
  useEffect(() => {
    if (!muted) {
      audio.setVolume(FIXED_AUDIO_GAIN)
      audio.scene(routeTone)
    }
  }, [routeTone, muted])

  useEffect(() => {
    const onNewMail = () => {
      setMailPulse(true)
      if (mailPulseTimerRef.current) window.clearTimeout(mailPulseTimerRef.current)
      mailPulseTimerRef.current = window.setTimeout(() => setMailPulse(false), 12000)
    }
    window.addEventListener(NEW_MAIL_EVENT, onNewMail)
    return () => {
      window.removeEventListener(NEW_MAIL_EVENT, onNewMail)
      if (mailPulseTimerRef.current) window.clearTimeout(mailPulseTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (location.pathname === '/mail') setMailPulse(false)
  }, [location.pathname])

  // Legacy per-volume state is intentionally retired. N.O.R.M. now has one audible
  // level: 100%. The only persistent audio preference is the explicit mute button.
  useEffect(() => {
    window.localStorage.removeItem(LEGACY_VOLUME_STORAGE_KEY)
    if (muted) {
      if (audio.enabled) audio.disable()
      return
    }
    audio.setVolume(FIXED_AUDIO_GAIN)
    if (!audio.enabled) audio.enable()
    else audio.resume()
    audio.scene(routeTone)
  }, [])

  useEffect(() => {
    const restoreAudio = () => {
      if (muted) return
      audio.setVolume(FIXED_AUDIO_GAIN)
      if (!audio.enabled) audio.enable()
      else audio.resume()
      audio.scene(routeTone)
    }
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') restoreAudio()
    }
    window.addEventListener('focus', restoreAudio)
    window.addEventListener('pageshow', restoreAudio)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      window.removeEventListener('focus', restoreAudio)
      window.removeEventListener('pageshow', restoreAudio)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [muted, routeTone])

  useEffect(() => {
    const selector = 'button, a, [role="button"], [role="tab"], [role="switch"], input[type="checkbox"], input[type="radio"]'
    const restoreAudioOnGesture = () => {
      if (muted) return
      audio.setVolume(FIXED_AUDIO_GAIN)
      if (!audio.enabled) audio.enable()
      else audio.resume()
      audio.scene(routeTone)
    }
    const onPointerDown = (event) => {
      restoreAudioOnGesture()
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
    const onKeyDown = () => restoreAudioOnGesture()
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
    document.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('pointerover', onPointerOver, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown, true)
      document.removeEventListener('pointerover', onPointerOver, true)
    }
  }, [muted, routeTone])

  useEffect(() => () => { timersRef.current.forEach(window.clearTimeout) }, [])

  const go = (to) => {
    if (to === '/mail') setMailPulse(false)
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
    if (muted) {
      audio.setVolume(FIXED_AUDIO_GAIN)
      audio.enable()
      audio.scene(routeTone)
      window.localStorage.setItem(SOUND_STORAGE_KEY, '1')
      setMuted(false)
      audio.confirm()
      return
    }
    audio.disable()
    window.localStorage.setItem(SOUND_STORAGE_KEY, '0')
    setMuted(true)
  }
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
        <nav>{links.map(([to,label]) => <NavLink key={to} to={to} end={to==='/' } className={to === '/mail' ? `sidebar-mail-link ${mailPulse ? 'is-new-mail' : ''}` : undefined} onClick={(event)=>{event.preventDefault();go(to)}}><span className="nav-glyph">⌁</span>{label}{to === '/mail' && unreadMail > 0 && <b className="sidebar-mail-badge" aria-label={`${unreadMail} непрочитанных сообщений`}>{unreadMail > 99 ? '99+' : unreadMail}</b>}{to === '/mail' && mailPulse && <em className="sidebar-mail-flash">НОВОЕ</em>}</NavLink>)}</nav>
        {secretLinks.length>0 && <div className="secret-nav"><small>РАЗБЛОКИРОВАННЫЕ СЕКТОРЫ</small>{secretLinks.map(([to,label,level])=><NavLink key={to} to={to} onClick={(event)=>{event.preventDefault();go(to)}}><span>{level}</span><strong>{label}</strong><b>↗</b></NavLink>)}</div>}
        <button className="report-button" type="button" onClick={() => go('/report')}>⚠ СООБЩИТЬ<br />ОБ АНОМАЛИИ</button>
        <div className="sidebar__tagline">НАБЛЮДАЕМ.<br />ФИКСИРУЕМ.<br />РАЗБИРАЕМСЯ.</div>
        <button type="button" className={`arg-clearance-card ${argProgress.clearance >= 2 ? 'is-anomalous' : ''}`} onClick={() => go(highestRoute)}>
          <small>ДОПУСК СЕССИИ</small><strong>A-{argProgress.clearance}</strong><span>ОБНАРУЖЕНО: {argProgress.discoveries.length} / ??</span>
          {argProgress.clearance >= 1 && <em>RESTRICTED NODE VISIBLE</em>}{argProgress.clearance >= 2 && <em>BLACK NODE VISIBLE</em>}{argProgress.clearance >= 3 && <em>ROOT VAULT VISIBLE</em>}{argProgress.clearance >= 4 && <em>GHOSTFS MOUNTED</em>}{legacyRouteRestored && <em>LEGACY CASE ROUTE RESTORED</em>}{argProgress.clearance >= 5 && <em>MIRROR NODE VISIBLE</em>}
        </button>
        <button className="sound-toggle" type="button" onClick={toggleSound} aria-pressed={!muted}>{muted?'ЗВУК: ВЫКЛ':'ЗВУК: ВКЛ'}</button>
        <button className="logout-button" type="button" data-sound="warning" onClick={logout} disabled={loggingOut}><span>{loggingOut?'ЗАВЕРШЕНИЕ СЕССИИ…':'ВЫЙТИ ИЗ СИСТЕМЫ'}</span><small>СБРОСИТЬ ДОПУСК И ВЕРНУТЬСЯ К ВХОДУ</small></button>
      </aside>
      <main className="main-area" key={location.pathname}><div className="main-area__meta">NORM-OS v2.4.1 // {stamp}</div>{children}</main>
      <footer className="footerline">Н.О.Р.М. // ДАННЫЕ ПРЕДНАЗНАЧЕНЫ ТОЛЬКО ДЛЯ ВНУТРЕННЕГО ИСПОЛЬЗОВАНИЯ.</footer>
    </div>
  )
}
