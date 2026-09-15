import { useEffect, useMemo, useRef, useState } from 'react'
import { audio } from '../audio'
import NormEmblem from './NormEmblem'

const AUTH_STEPS = [
  ['uplink', 'ПЕРЕДАЧА УЧЁТНЫХ ДАННЫХ…'],
  ['lookup', 'ПОИСК ПРОФИЛЯ В ЛОКАЛЬНОМ РЕЕСТРЕ…'],
  ['verify', 'СВЕРКА КЛЮЧА ДОСТУПА…'],
  ['session', 'СОЗДАНИЕ ЗАЩИЩЁННОЙ СЕССИИ…'],
  ['grant', 'ДОСТУП ПРЕДОСТАВЛЕН // LEVEL 0'],
]

const FIXED_AUDIO_GAIN = 5
const SOUND_STORAGE_KEY = 'norm-audio-enabled-v1'

function soundAllowed() {
  if (typeof window === 'undefined') return true
  return window.localStorage.getItem(SOUND_STORAGE_KEY) !== '0'
}

function restoreGateAudio() {
  if (!soundAllowed()) return false
  audio.setVolume(FIXED_AUDIO_GAIN)
  if (!audio.enabled) audio.enable()
  else audio.resume()
  return true
}

export default function AccessGate({ onEnter }) {
  const [phase, setPhase] = useState('idle')
  const [message, setMessage] = useState('ОЖИДАНИЕ ИДЕНТИФИКАЦИИ ОПЕРАТОРА')
  const [operator, setOperator] = useState('')
  const [accessKey, setAccessKey] = useState('')
  const [authStep, setAuthStep] = useState(-1)
  const [resolvedIdentity, setResolvedIdentity] = useState('')
  const timersRef = useRef([])

  const activity = useMemo(() => {
    const chars = operator.length + accessKey.length
    return Math.min(99, 18 + chars * 5)
  }, [operator, accessKey])

  useEffect(() => () => {
    timersRef.current.forEach(window.clearTimeout)
  }, [])

  const schedule = (fn, delay) => {
    const timer = window.setTimeout(fn, delay)
    timersRef.current.push(timer)
  }

  const primeAudio = () => {
    restoreGateAudio()
  }

  const authenticate = (event) => {
    event.preventDefault()
    if (phase !== 'idle') return

    const identity = operator.trim().toUpperCase() || 'GUEST-27491'
    sessionStorage.setItem('norm-operator', identity)
    setResolvedIdentity(identity)
    setPhase('auth')
    setAuthStep(0)
    setMessage(AUTH_STEPS[0][1])
    if (restoreGateAudio()) audio.command()

    AUTH_STEPS.slice(1).forEach(([nextPhase, text], index) => {
      schedule(() => {
        const step = index + 1
        setPhase(nextPhase)
        setAuthStep(step)
        setMessage(text)
        if (nextPhase === 'grant') audio.grant()
        else audio.terminal()
      }, 360 + index * 360)
    })

    schedule(() => setPhase('exit'), 1880)
    schedule(onEnter, 2280)
  }

  const onFieldKeyDown = (event) => {
    if (event.key === 'Escape') event.currentTarget.blur()
    else if (event.key.length === 1 && soundAllowed()) {
      audio.setVolume(FIXED_AUDIO_GAIN)
      audio.key()
    }
  }

  return (
    <div className={`access-gate access-gate--${phase}`}>
      <div className="access-gate__noise" aria-hidden="true" />
      <div className="access-gate__scan" aria-hidden="true" />
      <div className="access-gate__box access-login">
        <div className="access-login__identity-mark">
          <NormEmblem />
          <div>
            <div className="norm-mark">Н.О.Р.М.</div>
            <div className="access-gate__sub">ВНУТРЕННЯЯ СЕТЬ // NORM-OS 2.4.1</div>
          </div>
        </div>

        {phase === 'idle' ? (
          <form className="access-login__form" onSubmit={authenticate} onPointerDown={primeAudio} autoComplete="off">
            <div className="access-login__caption">
              <span>УЗЕЛ ДОПУСКА // 04</span>
              <b>ИДЕНТИФИКАЦИЯ ОПЕРАТОРА</b>
            </div>

            <label className="access-login__field">
              <span>ID ОПЕРАТОРА</span>
              <input
                value={operator}
                onChange={(event) => setOperator(event.target.value)}
                onKeyDown={onFieldKeyDown}
                name="operator-id"
                spellCheck="false"
                autoCapitalize="off"
                autoCorrect="off"
                placeholder="_"
                aria-label="ID оператора"
              />
              <i aria-hidden="true" />
            </label>

            <label className="access-login__field">
              <span>КЛЮЧ ДОСТУПА</span>
              <input
                value={accessKey}
                onChange={(event) => setAccessKey(event.target.value)}
                onKeyDown={onFieldKeyDown}
                name="access-key"
                type="password"
                spellCheck="false"
                autoComplete="off"
                placeholder="_"
                aria-label="Ключ доступа"
              />
              <i aria-hidden="true" />
            </label>

            <div className="access-login__telemetry" aria-hidden="true">
              <span>LOCAL NODE</span>
              <span>INPUT SIGNAL {activity}%</span>
              <span>ENCRYPTION READY</span>
            </div>

            <button type="submit" className="access-button access-login__submit">
              АВТОРИЗОВАТЬСЯ
            </button>
          </form>
        ) : (
          <div className="access-auth" aria-live="polite">
            <div className="access-auth__identity">
              <small>ЗАПРОС ОТ</small>
              <strong>{resolvedIdentity || 'GUEST-27491'}</strong>
              <span>SESSION: TEMP / ACCESS: 0</span>
            </div>

            <div className="access-auth__steps">
              {AUTH_STEPS.map(([key, text], index) => (
                <div
                  className={`access-auth__step ${index < authStep ? 'is-done' : ''} ${index === authStep ? 'is-current' : ''}`}
                  key={key}
                >
                  <span>{index < authStep ? '✓' : index === authStep ? '›' : '·'}</span>
                  <b>{text}</b>
                </div>
              ))}
            </div>

            <div className="access-gate__log">{message}</div>
            <div className="access-gate__bars" aria-hidden="true">
              <span /><span /><span /><span /><span /><span />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}