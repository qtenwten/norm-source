import { useEffect, useMemo, useState } from 'react'
import { audio } from '../audio'
import Photo from '../components/Photo'

const sequence = [
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

function formatTime(date) {
  return date.toLocaleTimeString('ru-RU', { hour12: false })
}

export default function Terminal() {
  const [lines, setLines] = useState([])
  const [scanState, setScanState] = useState('running')
  const startedAt = useMemo(() => new Date(), [])

  useEffect(() => {
    let index = 0
    const timers = []

    const schedule = (fn, delay) => {
      const timer = window.setTimeout(fn, delay)
      timers.push(timer)
    }

    const pushNext = () => {
      if (index >= sequence.length) {
        setScanState('complete')
        return
      }

      const [text, tone] = sequence[index]
      const timestamp = new Date(startedAt.getTime() + index * 430)
      setLines((current) => [...current, { text, tone, time: formatTime(timestamp) }])

      if (tone === 'danger' || tone === 'warn') audio.glitch()
      else audio.terminal()

      index += 1
      schedule(pushNext, index >= 8 ? 560 : 390)
    }

    // Deferring the first line also keeps React StrictMode from duplicating it in dev.
    schedule(pushNext, 80)
    return () => timers.forEach(window.clearTimeout)
  }, [startedAt])

  return (
    <div className={`page terminal-page terminal-page--${scanState}`}>
      <div className="terminal-head">
        <h1>FIELD TERMINAL <small>v2.4.1</small></h1>
        <span>СВЯЗЬ С БАЗОЙ: <b>УСТОЙЧИВА</b></span>
      </div>

      <div className="terminal-scan-state" aria-live="polite">
        <span className="terminal-scan-state__dot" />
        {scanState === 'running' ? 'СКАНИРОВАНИЕ АКТИВНО' : 'СКАНИРОВАНИЕ ЗАВЕРШЕНО // КАНАЛ ОСТАЁТСЯ ОТКРЫТЫМ'}
      </div>

      <div className="terminal-grid">
        <section className="terminal-map">
          <div className="map-faux map-faux--large">
            <span className="map-cross">×</span>
            <b>КВ.17</b>
            <span className="terminal-radar" aria-hidden="true" />
          </div>
          <div className="symptoms">☑ шум ночью　☑ движутся предметы　☑ следов нет　☑ температура падает</div>
          <div className="match">
            <div><b>Полтергейст</b><span style={{ width: '74%' }} /><strong>74%</strong></div>
            <div><b>Ночной душнила</b><span style={{ width: '18%' }} /><strong>18%</strong></div>
            <div><b>Бытовой фактор</b><span style={{ width: '8%' }} /><strong>8%</strong></div>
          </div>
        </section>

        <section className="live-feeds">
          <div>
            <div className="live-feed__frame"><Photo src="/assets/host_duo_closeup.png" alt="SEN-03" /><i>REC</i></div>
            <b>SEN-03</b>
            <small>ПУЛЬС 92 · EMF 0.8mG · TEMP 14.2°C</small>
          </div>
          <div>
            <div className="live-feed__frame"><Photo src="/assets/host_duo_closeup.png" alt="GRG-07" /><i>REC</i></div>
            <b>GRG-07</b>
            <small>ПУЛЬС 78 · EMF 0.5mG · TEMP 13.8°C</small>
          </div>
        </section>

        <section className="terminal-log" aria-live="polite">
          {lines.map((line, index) => (
            <div className={`terminal-line terminal-line--${line.tone}`} key={`${line.text}-${index}`}>
              <time>{line.time}</time>
              <span>{line.text}</span>
            </div>
          ))}
          {scanState === 'complete' && <div className="terminal-cursor" aria-hidden="true">_</div>}
        </section>
      </div>
    </div>
  )
}
