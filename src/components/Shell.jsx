import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { audio } from '../audio'

const links = [
  ['/', 'СВОДКА'],
  ['/cases', 'ДЕЛА'],
  ['/grimoire', 'ГРИМУАР'],
  ['/agents', 'АГЕНТЫ'],
  ['/archive', 'АРХИВ'],
  ['/terminal', 'ТЕРМИНАЛ'],
]

export default function Shell({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [transition, setTransition] = useState(false)
  const [muted, setMuted] = useState(false)
  const stamp = useMemo(() => new Date().toLocaleTimeString('ru-RU', { hour12: false }), [location.pathname])

  const go = (to) => {
    if (location.pathname === to) return
    audio.nav()
    setTransition(true)
    setTimeout(() => navigate(to), 220)
    setTimeout(() => setTransition(false), 620)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      if (Math.random() < 0.09) {
        document.documentElement.classList.add('micro-glitch')
        setTimeout(() => document.documentElement.classList.remove('micro-glitch'), 120)
      }
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="norm-shell">
      <div className="grain" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />
      <div className={`route-transition ${transition ? 'is-active' : ''}`} aria-hidden="true">
        <div>СИНХРОНИЗАЦИЯ АРХИВА…</div>
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
            <NavLink key={to} to={to} end={to === '/'} onClick={(e) => { e.preventDefault(); go(to) }}>
              <span className="nav-glyph">⌁</span>{label}
            </NavLink>
          ))}
        </nav>
        <button className="report-button" type="button" onClick={() => go('/report')}>⚠ СООБЩИТЬ<br/>ОБ АНОМАЛИИ</button>
        <div className="sidebar__tagline">НАБЛЮДАЕМ.<br/>ФИКСИРУЕМ.<br/>РАЗБИРАЕМСЯ.</div>
        <button className="sound-toggle" type="button" onClick={() => { const on = audio.toggle(); setMuted(!on); audio.click() }}>
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
