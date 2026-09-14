import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import { audio } from '../audio'

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

export default function Shell({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [transition, setTransition] = useState(false)
  const [transitionText, setTransitionText] = useState('СИНХРОНИЗАЦИЯ АРХИВА')
  const [muted, setMuted] = useState(!audio.enabled)
  const timersRef = useRef([])
  const stamp = useMemo(
    () => new Date().toLocaleTimeString('ru-RU', { hour12: false }),
    [location.pathname],
  )
  const routeTone = getRouteTone(location.pathname)

  useEffect(() => () => {
    timersRef.current.forEach(window.clearTimeout)
  }, [])

  const go = (to) => {
    if (location.pathname === to || transition) return

    audio.nav()
    setTransitionText(transitionCopy[to] || 'СИНХРОНИЗАЦИЯ АРХИВА')
    setTransition(true)

    timersRef.current.push(window.setTimeout(() => navigate(to), 245))
    timersRef.current.push(window.setTimeout(() => setTransition(false), 610))
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (Math.random() < 0.07) {
        document.documentElement.classList.add('micro-glitch')
        audio.glitch()
        window.setTimeout(() => document.documentElement.classList.remove('micro-glitch'), 95)
      }
    }, 6200)
    return () => window.clearInterval(timer)
  }, [])

  const toggleSound = () => {
    const on = audio.toggle()
    setMuted(!on)
    if (on) audio.click()
  }

  return (
    <div className={`norm-shell norm-shell--${routeTone}`} data-route={routeTone}>
      <div className="grain" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />
      <div className={`route-transition ${transition ? 'is-active' : ''}`} aria-hidden="true">
        <div className="route-transition__beam" />
        <div className="route-transition__label">
          <small>NORM-OS // ROUTE HANDOFF</small>
          <strong>{transitionText}</strong>
        </div>
      </div>
      <header className="topbar">
        <button type="button" className="brand" onClick={() => go('/')} aria-label="Н.О.Р.М. — на сводку">
          <span className="brand__logo">Н.О.Р.М.</span>
          <span className="brand__sub">Независимый Отдел Расследований Мистики</span>
        </button>
        <div className="topbar__motto">ТАМ, ГДЕ ЗАКАНЧИВАЮТСЯ ОБЪЯСНЕНИЯ — НАЧИНАЕМ МЫ.</div>
        <div className="session">
          <span>SESSION: GUEST-27491</span>
          <span>ACCESS LEVEL: 0</span>
          <span>СЕТЬ: ВНУТРЕННЯЯ <i className="status-dot" /></span>
        </div>
      </header>
      <aside className="sidebar">
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
