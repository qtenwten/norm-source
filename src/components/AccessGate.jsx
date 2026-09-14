import { useEffect, useRef, useState } from 'react'
import { audio } from '../audio'

const BOOT_STEPS = [
  ['channel', 'УСТАНОВКА ЗАЩИЩЁННОГО КАНАЛА…'],
  ['auth', 'ПРОВЕРКА КЛЮЧЕЙ ДОСТУПА…'],
  ['sync', 'СИНХРОНИЗАЦИЯ АРХИВА Н.О.Р.М.…'],
  ['grant', 'ДОСТУП ПРЕДОСТАВЛЕН'],
]

export default function AccessGate({ onEnter }) {
  const [phase, setPhase] = useState('idle')
  const [message, setMessage] = useState('ТРЕБУЕТСЯ ПОДТВЕРЖДЕНИЕ ДОСТУПА')
  const timersRef = useRef([])

  useEffect(() => () => {
    timersRef.current.forEach(window.clearTimeout)
  }, [])

  const schedule = (fn, delay) => {
    const timer = window.setTimeout(fn, delay)
    timersRef.current.push(timer)
  }

  const enter = () => {
    if (phase !== 'idle') return

    audio.enable()
    setPhase('boot')

    BOOT_STEPS.forEach(([nextPhase, text], index) => {
      schedule(() => {
        setPhase(nextPhase)
        setMessage(text)
        if (nextPhase === 'grant') audio.grant()
        else audio.terminal()
      }, 360 + index * 360)
    })

    schedule(() => setPhase('exit'), 1800)
    schedule(onEnter, 2240)
  }

  return (
    <div className={`access-gate access-gate--${phase}`}>
      <div className="access-gate__noise" aria-hidden="true" />
      <div className="access-gate__scan" aria-hidden="true" />
      <div className="access-gate__box">
        <div className="norm-mark">Н.О.Р.М.</div>
        <div className="access-gate__sub">ВНУТРЕННЯЯ СЕТЬ // NORM-OS 2.4.1</div>
        <div className="access-gate__log" aria-live="polite">{message}</div>
        <div className="access-gate__bars" aria-hidden="true">
          <span /><span /><span /><span /><span /><span />
        </div>
        <button type="button" className="access-button" onClick={enter} disabled={phase !== 'idle'}>
          {phase === 'idle' ? 'ВОЙТИ В СИСТЕМУ' : 'КАНАЛ АКТИВЕН'}
        </button>
        <p>Нажатие активирует звуковой режим интерфейса.</p>
      </div>
    </div>
  )
}
