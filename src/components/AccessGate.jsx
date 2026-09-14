import { useState } from 'react'
import { audio } from '../audio'

export default function AccessGate({ onEnter }) {
  const [phase, setPhase] = useState('idle')
  const enter = () => {
    if (phase !== 'idle') return
    audio.enable()
    setPhase('boot')
    setTimeout(() => setPhase('grant'), 720)
    setTimeout(() => onEnter(), 1450)
  }
  return (
    <div className={`access-gate access-gate--${phase}`}>
      <div className="access-gate__scan" />
      <div className="access-gate__box">
        <div className="norm-mark">Н.О.Р.М.</div>
        <div className="access-gate__sub">ВНУТРЕННЯЯ СЕТЬ // NORM-OS 2.4.1</div>
        <div className="access-gate__log" aria-live="polite">
          {phase === 'idle' && <>ТРЕБУЕТСЯ ПОДТВЕРЖДЕНИЕ ДОСТУПА</>}
          {phase === 'boot' && <>УСТАНОВКА ЗАЩИЩЁННОГО КАНАЛА…</>}
          {phase === 'grant' && <>ДОСТУП ПРЕДОСТАВЛЕН</>}
        </div>
        <button type="button" className="access-button" onClick={enter} disabled={phase !== 'idle'}>
          {phase === 'idle' ? 'ВОЙТИ В СИСТЕМУ' : 'ОЖИДАЙТЕ'}
        </button>
        <p>Нажатие активирует звуковой режим интерфейса.</p>
      </div>
    </div>
  )
}
