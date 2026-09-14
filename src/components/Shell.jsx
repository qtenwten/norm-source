import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import { audio } from '../audio'
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
  '/report': 'ОТКРЫТИЕ КАНАЛА ПРИЁМА',
}

function getRouteTone(pathname) {
  if (pathname.startsWith('/grimoire')) return 'grimoire'
  if (pathname.startsWith('/terminal')) return 'terminal'
  if (pathname.startsWith('/cases')) return 'case'
  if (pathname.startsWith('/agents')) return 'agents'
  if (pathname.startsWith('/archive')) return 'archive'
  if (pathname.startsWith('/report')) return 'report'
  return 'dashboard'
}

function getTransitionDuration(kind) {
  if (kind === 'grimoire') return { navigateAt: 330, endAt: 760 }
  if (kind === 'terminal') return { navigateAt: 260, endAt: 650 }
  if (kind === 'dashboard') return { navigateAt: 245, endAt: 610 }
  return { navigateAt: 245, endAt: 610 }
}

export default function Shell({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [transition, setTransition] = useState(false)
  const [transitionText, setTransitionText] = useState('СИНХРОНИЗАЦИЯ АРХИВА')
  const [transitionKind, setTransitionKind] = useState('dashboard')
  const [muted, setMuted] = useState(!audio.enabled)
  const timersRef = useRef([])
  const operator = useMemo(() => sessionStorage.getItem('norm-operator') || 'GUEST-27491', [])
  const stamp = useMemo(
    () => new Date().toLocaleTimeString('ru-RU', { hour12: false }),
    [location.pathname],
  )
  const routeTone = getRouteTone(location.pathname)

  useEffect(() => {
    audio.scene(routeTone)
  }, [routeTone])

  useEffect(() => {
    audio.setVolume(0.94)

    const onPointerDown = (event) => {
      if (!(event.target instanceof Element)) return
      const control = event.target.closest('button, a, [role="button"], input[type="checkbox"], input[type="radio"]')
      if (!control || control.hasAttribute('disabled') || control.getAttribute('aria-disabled') === 'true') return
      if (control.classList.contains('sound-toggle')) return

      audio.click()
      control.classList.remove('norm-pressed')
      void control.getBoundingClientRect()
      control.classList.add('norm-pressed')
      timersRef.current.push(window.setTimeout(() => control.classList.remove('norm-pressed'), 180))
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [])

  useEffect(() => () => {
    timersRef.current.forEach(window.clearTimeout)
  }, [])

  const go = (to) => {
    if (location.pathname === to || transition) return

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
    if (on) {
      audio.setVolume(0.94)
      audio.scene(routeTone)
      audio.click()
    }
  }

  return (
    <div className={`norm-shell norm-shell--${routeTone}`} data-route={routeTone}>
      <div className="grain" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />
      <div
        className={`route-transition route-transition--${transitionKind} ${transition ? 'is-active' : ''}`}
        aria-hidden="true"
      >
        <div className="route-transition__beam" />
        <div className="route-transition__glyphs">NORM // 17 // LM // 03 // ACCESS // INTERNAL</div>
        <div className="route-transition__label">
          <small>NORM-OS // ROUTE HANDOFF</small>
          <strong>{transitionText}</strong>
        </div>
      </div>
      <header className="topbar">
        <button type="button" className="brand brand--emblem" onClick={() => go('/')} aria-label="Н.О.Р.М. — на сводку">
          <NormEmblem compact />
          <span className="brand__copy">
            <span className="brand__logo">Н.О.Р.М.</span>
            <span className="brand__sub">Независимый Отдел Расследований Мистики</span>
          </span>
        </button>
        <div className="topbar__motto">ТАМ, ГДЕ ЗАКАНЧИВАЮТСЯ ОБЪЯСНЕНИЯ — НАЧИНАЕМ МЫ.</div>
        <div className="session">
          <span>SESSION: {operator}</span>
          <span>ACCESS LEVEL: 0</span>
          <span>СЕТЬ: ВНУТРЕННЯЯ <i className="status-dot" /></span>
        </div>
      </header>
      <aside className="sidebar">
        <div className="sidebar-emblem" aria-hidden="true"><NormEmblem compact /></div>
        <nav>
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={(event) => {
                event.preventDefault()
                go(to)
              }}
            >
              <span className="nav-glyph">⌁</span>{label}
            </NavLink>
          ))}
        </nav>
        <button className="report-button" type="button" onClick={() => go('/report')}>⚠ СООБЩИТЬ<br />ОБ АНОМАЛИИ</button>
        <div className="sidebar__tagline">НАБЛЮДАЕМ.<br />ФИКСИРУЕМ.<br />РАЗБИРАЕМСЯ.</div>
        <button className="sound-toggle" type="button" onClick={toggleSound} aria-pressed={!muted}>
          {muted ? 'ЗВУК: ВЫКЛ' : 'ЗВУК: ВКЛ'}
        </button>
      </aside>
      <main className="main-area" key={location.pathname}>
        <div className="main-area__meta">NORM-OS v2.4.1 // {stamp}</div>
        {children}
      </main>
      <footer className="footerline">Н.О.Р.М. // ДАННЫЕ ПРЕДНАЗНАЧЕНЫ ТОЛЬКО ДЛЯ ВНУТРЕННЕГО ИСПОЛЬЗОВАНИЯ.</footer>
    </div>
  )
}
