import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { audio } from '../audio'
import Photo from '../components/Photo'

const bootSequence = [
  ['ИНИЦИАЛИЗАЦИЯ СЕНСОРОВ...', 'normal'],
  ['КАНАЛ SEN-03: В СЕТИ', 'ok'],
  ['КАНАЛ GRG-07: В СЕТИ', 'ok'],
  ['КАЛИБРОВКА EMF / ТЕМПЕРАТУРА / АУДИО...', 'normal'],
  ['ПОИСК ПО БАЗЕ ЯВЛЕНИЙ...', 'normal'],
  ['СОВПАДЕНИЕ: ПОЛТЕРГЕЙСТ 74%', 'match'],
  ['СОВПАДЕНИЕ: НОЧНОЙ ДУШНИЛА 18%', 'normal'],
  ['СОВПАДЕНИЕ: БЫТОВОЙ ФАКТОР 8%', 'normal'],
  ['[СИСТЕМА] ОБНАРУЖЕН НЕЗАПРОШЕННЫЙ ПАКЕТ', 'warn'],
  ['[СИСТЕМА] ДОПОЛНИТЕЛЬНЫЙ ОТВЕТ СГЕНЕРИРОВАН', 'warn'],
  ['> ОБЪЕКТ УЖЕ НАБЛЮДАЕТ ЗА ВАМИ.', 'danger'],
]

const quickCommands = ['HELP', 'STATUS', 'CASE LM-006', 'AGENT SEN', 'GRIMOIRE', 'ARCHIVE', 'SCAN']

function formatTime(date = new Date()) {
  return date.toLocaleTimeString('ru-RU', { hour12: false })
}

function line(text, tone = 'normal', extra = {}) {
  return { text, tone, time: formatTime(), ...extra }
}

export default function Terminal() {
  const navigate = useNavigate()
  const [lines, setLines] = useState([])
  const [scanState, setScanState] = useState('running')
  const [command, setCommand] = useState('')
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const startedAt = useMemo(() => new Date(), [])
  const logRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    audio.terminalOpen()
    let index = 0
    const timers = []

    const schedule = (fn, delay) => {
      const timer = window.setTimeout(fn, delay)
      timers.push(timer)
    }

    const pushNext = () => {
      if (index >= bootSequence.length) {
        setScanState('complete')
        setLines((current) => [...current, line('TERM READY // TYPE HELP FOR COMMAND INDEX', 'ok')])
        return
      }

      const [text, tone] = bootSequence[index]
      const timestamp = new Date(startedAt.getTime() + index * 430)
      setLines((current) => [...current, { text, tone, time: formatTime(timestamp) }])

      if (tone === 'danger') audio.systemReply()
      else if (tone === 'warn') audio.glitch()
      else audio.terminal()

      index += 1
      schedule(pushNext, index >= 8 ? 560 : 390)
    }

    schedule(pushNext, 260)
    return () => timers.forEach(window.clearTimeout)
  }, [startedAt])

  useEffect(() => {
    const log = logRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [lines])

  const append = (...nextLines) => setLines((current) => [...current, ...nextLines])

  const handoff = (path, label) => {
    append(line(`${label} // ROUTE HANDOFF REQUESTED`, 'match'))
    audio.command()
    window.setTimeout(() => navigate(path), 280)
  }

  const runScan = () => {
    setScanState('running')
    append(line('SCAN: ПОВТОРНАЯ КАЛИБРОВКА...', 'normal'))
    audio.scan()
    window.setTimeout(() => append(line('SCAN: EMF 0.8mG // TEMP 14.2°C // AUDIO BAND 31Hz', 'match')), 420)
    window.setTimeout(() => append(line('SCAN: НЕИЗВЕСТНЫЙ СИГНАЛ СОХРАНЁН В BUFFER://17', 'warn')), 820)
    window.setTimeout(() => { setScanState('complete'); audio.systemReply() }, 980)
  }

  const execute = (raw) => {
    const normalized = raw.trim().replace(/\s+/g, ' ')
    const upper = normalized.toUpperCase()
    if (!upper) {
      append(line('> [EMPTY INPUT]', 'normal'))
      audio.terminal()
      return
    }

    append(line(`> ${normalized}`, 'command'))
    setHistory((current) => [normalized, ...current.filter((item) => item !== normalized)].slice(0, 24))
    setHistoryIndex(-1)
    audio.command()

    if (upper === 'CLEAR' || upper === 'CLS') {
      window.setTimeout(() => setLines([line('TERM BUFFER CLEARED', 'ok')]), 80)
      return
    }

    if (upper === 'HELP' || upper === '?') {
      append(
        line('COMMAND INDEX:', 'ok'),
        line('HELP · STATUS · WHOAMI · SCAN · CLEAR', 'normal'),
        line('CASE LM-006 · OPEN CASE LM-006 · AGENT SEN · AGENT GRIG', 'normal'),
        line('GRIMOIRE · ENTITY P-017 · ARCHIVE · SOUND ON/OFF · NORM', 'normal'),
        line('Подсказка: некоторые команды понимают больше, чем указано в индексе.', 'warn'),
      )
      return
    }

    if (upper === 'STATUS') {
      append(
        line('NORM-OS: ONLINE // NODE 04', 'ok'),
        line('ARCHIVE: CONNECTED // PERSONNEL: CONNECTED // GRIMOIRE: DEGRADED', 'normal'),
        line('UNRESOLVED SIGNALS: 1', 'warn'),
      )
      return
    }

    if (upper === 'WHOAMI') {
      append(line('SESSION: GUEST-27491 // ACCESS LEVEL: 0', 'ok'), line('PERSONNEL MATCH: NONE', 'normal'))
      return
    }

    if (upper === 'WHO ARE YOU' || upper === 'WHOAREYOU') {
      append(line('QUERY ROUTED OUTSIDE LOCAL COMMAND TABLE.', 'warn'))
      window.setTimeout(() => append(line('I AM THE PART THAT WAS NOT INDEXED.', 'danger')), 520)
      audio.systemReply()
      return
    }

    if (upper === 'SCAN') {
      runScan()
      return
    }

    if (upper === 'NORM' || upper === 'ABOUT NORM') {
      append(
        line('Н.О.Р.М. // НЕЗАВИСИМЫЙ ОТДЕЛ РАССЛЕДОВАНИЙ МИСТИКИ', 'ok'),
        line('FIELD UNIT: LM // ARCHIVE ACCESS: GUEST', 'normal'),
        line('MOTTO: ЕСЛИ ЧТО-ТО НЕ НОРМ — ЭТО НАША РАБОТА.', 'match'),
      )
      return
    }

    if (upper === 'GRIMOIRE' || upper === 'ENTITY P-017' || upper === 'ENTITY POLTERGEIST' || upper === 'P-017') {
      append(line('MATCH: GRIMOIRE RECORD P-017 // ШУМЯЩИЙ БЕЗ ЛИКА', 'match', { link:'/grimoire', linkLabel:'ОТКРЫТЬ P-017' }))
      audio.paper()
      return
    }

    if (upper === 'ARCHIVE' || upper === 'OPEN ARCHIVE') {
      append(line('ARCHIVE NODE READY // 6 MATERIALS INDEXED', 'ok', { link:'/archive', linkLabel:'ПЕРЕЙТИ В АРХИВ' }))
      audio.archive()
      return
    }

    if (upper === 'CASE LM-006' || upper === 'LM-006') {
      append(
        line('LM-006 // ЗУМЕРСКИЙ ДЕМОН // STATUS: CLOSED / OBSERVATION', 'match'),
        line('CORRELATION: GRIMOIRE P-017 [UNVERIFIED]', 'warn', { link:'/cases/lm-006', linkLabel:'ОТКРЫТЬ ДОСЬЕ' }),
      )
      return
    }

    if (upper === 'OPEN CASE LM-006' || upper === 'OPEN LM-006') {
      handoff('/cases/lm-006', 'LM-006')
      return
    }

    if (upper.startsWith('AGENT ')) {
      const agent = upper.replace('AGENT ', '').replace('AG-', '')
      const map = {
        SEN: ['AG-SEN // ACTIVE // FIELD UNIT LM', '/agents#sen'],
        GRIG: ['AG-GRIG // ACTIVE // FIELD UNIT LM', '/agents#grig'],
        '04': ['AG-04 // DEACTIVATED // RESTRICTED', '/agents#04'],
        '09': ['AG-09 // LOST // PARTIAL RECORD', '/agents#09'],
        '13': ['AG-13 // FILE DELETED', '/agents#13'],
        '02': ['AG-02 // REGISTRY MISMATCH', '/agents#02'],
      }
      const found = map[agent]
      if (found) {
        append(line(found[0], agent === '02' ? 'danger' : 'match', { link:found[1], linkLabel:'ОТКРЫТЬ ЛИЧНОЕ ДЕЛО' }))
        agent === '02' ? audio.glitch() : audio.stamp()
      } else {
        append(line(`PERSONNEL LOOKUP: ${agent} // NO MATCH`, 'warn'))
        audio.error()
      }
      return
    }

    if (upper === 'SOUND OFF') {
      audio.disable()
      append(line('AUDIO BUS MUTED', 'ok'))
      return
    }

    if (upper === 'SOUND ON') {
      audio.enable()
      audio.scene('terminal')
      append(line('AUDIO BUS ONLINE', 'ok'))
      return
    }

    append(line(`UNKNOWN COMMAND: ${normalized}`, 'warn'), line('TYPE HELP FOR COMMAND INDEX', 'normal'))
    audio.error()
  }

  const submit = (event) => {
    event.preventDefault()
    const raw = command
    setCommand('')
    execute(raw)
  }

  const onKeyDown = (event) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!history.length) return
      const nextIndex = Math.min(historyIndex + 1, history.length - 1)
      setHistoryIndex(nextIndex)
      setCommand(history[nextIndex])
      audio.terminal()
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const nextIndex = Math.max(historyIndex - 1, -1)
      setHistoryIndex(nextIndex)
      setCommand(nextIndex === -1 ? '' : history[nextIndex])
      audio.terminal()
      return
    }
    if (event.key.length === 1) audio.key()
  }

  return (
    <div className={`page terminal-page terminal-page--${scanState}`}>
      <div className="terminal-head">
        <h1>FIELD TERMINAL <small>v2.4.1</small></h1>
        <span>СВЯЗЬ С БАЗОЙ: <b>УСТОЙЧИВА</b></span>
      </div>

      <div className="terminal-scan-state" aria-live="polite">
        <span className="terminal-scan-state__dot" />
        {scanState === 'running' ? 'СКАНИРОВАНИЕ АКТИВНО' : 'КАНАЛ ОТКРЫТ // КОМАНДНАЯ СТРОКА ДОСТУПНА'}
      </div>

      <div className="terminal-grid terminal-grid--interactive">
        <section className="terminal-map">
          <button className="map-faux map-faux--large terminal-map-button" type="button" onClick={runScan} title="Повторить сканирование">
            <span className="map-cross">×</span>
            <b>КВ.17</b>
            <span className="terminal-radar" aria-hidden="true" />
            <small>CLICK TO RESCAN</small>
          </button>
          <div className="symptoms">☑ шум ночью　☑ движутся предметы　☑ следов нет　☑ температура падает</div>
          <div className="match">
            <button type="button" onClick={() => execute('GRIMOIRE')}><b>Полтергейст</b><span style={{ width: '74%' }} /><strong>74%</strong></button>
            <button type="button" onClick={() => { audio.click(); append(line('ENTITY LOOKUP: НОЧНОЙ ДУШНИЛА // ARCHIVE RECORD RESTRICTED', 'warn')) }}><b>Ночной душнила</b><span style={{ width: '18%' }} /><strong>18%</strong></button>
            <button type="button" onClick={() => { audio.click(); append(line('CONTROL HYPOTHESIS: БЫТОВОЙ ФАКТОР // 8%', 'normal')) }}><b>Бытовой фактор</b><span style={{ width: '8%' }} /><strong>8%</strong></button>
          </div>
        </section>

        <section className="live-feeds">
          <button type="button" onClick={() => handoff('/agents#sen', 'AG-SEN')}>
            <div className="live-feed__frame"><Photo src="/assets/host_duo_closeup.png" alt="SEN-03" /><i>REC</i></div>
            <b>SEN-03</b><small>ПУЛЬС 92 · EMF 0.8mG · TEMP 14.2°C</small>
          </button>
          <button type="button" onClick={() => handoff('/agents#grig', 'AG-GRIG')}>
            <div className="live-feed__frame"><Photo src="/assets/host_duo_closeup.png" alt="GRG-07" /><i>REC</i></div>
            <b>GRG-07</b><small>ПУЛЬС 78 · EMF 0.5mG · TEMP 13.8°C</small>
          </button>
        </section>

        <section className={`terminal-console ${scanState === 'complete' ? 'terminal-console--ready' : ''}`}>
          <div className="terminal-quickbar">
            {quickCommands.map((item) => <button type="button" key={item} onClick={() => execute(item)}>{item}</button>)}
          </div>
          <div className="terminal-log terminal-command-log" ref={logRef} aria-live="polite">
            {lines.map((entry, index) => (
              <div className={`terminal-line terminal-line--${entry.tone}`} key={`${entry.text}-${index}`}>
                <time>{entry.time}</time>
                <span>{entry.text}</span>
                {entry.link && <button type="button" className="terminal-result-link" onClick={() => handoff(entry.link, entry.linkLabel || 'OPEN')}>{entry.linkLabel || 'ОТКРЫТЬ'} →</button>}
              </div>
            ))}
            {scanState === 'complete' && <div className="terminal-cursor" aria-hidden="true">_</div>}
          </div>
          <form className="terminal-prompt" onSubmit={submit} onClick={() => inputRef.current?.focus()}>
            <span>GUEST-27491@NORM:~$</span>
            <input ref={inputRef} value={command} onChange={(event) => setCommand(event.target.value)} onKeyDown={onKeyDown} spellCheck="false" autoComplete="off" aria-label="Команда терминала" placeholder="HELP" />
            <button type="submit">EXEC</button>
          </form>
        </section>
      </div>
    </div>
  )
}
