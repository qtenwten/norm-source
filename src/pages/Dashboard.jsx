import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Panel from '../components/Panel'
import Photo from '../components/Photo'
import { audio } from '../audio'

export default function Dashboard() {
  const navigate = useNavigate()
  const [phantomSync, setPhantomSync] = useState(false)

  useEffect(() => {
    audio.dashboardOpen()
    const show = window.setTimeout(() => {
      setPhantomSync(true)
      audio.terminal()
    }, 9200)
    const hide = window.setTimeout(() => setPhantomSync(false), 10800)
    return () => {
      window.clearTimeout(show)
      window.clearTimeout(hide)
    }
  }, [])

  const open = () => {
    audio.stamp()
    navigate('/cases/lm-006')
  }

  return (
    <div className="page dashboard-page">
      <section className="city-banner">
        <div><strong>МИР ПРЕЖНИЙ.<br />НО УЖЕ НЕ ТОЛЬКО ОН.</strong><span>ДЕЛА ПРОДОЛЖАЮТСЯ.</span></div>
        <blockquote>«РЕАЛЬНОСТЬ ШИРЕ, ЧЕМ НАМ РАЗРЕШЕНО ПОМНИТЬ»</blockquote>
      </section>
      <Panel title="ОПЕРАТИВНАЯ СВОДКА" className="summary">
        <div className="stat-grid">
          <div className={phantomSync ? 'stat-anomaly' : ''}>
            <b>{phantomSync ? '143' : '142'}</b><span>ОТКРЫТЫХ ДЕЛ</span><em>{phantomSync ? '+8' : '+7'}</em>
          </div>
          <div><b>317</b><span>ЗАКРЫТЫХ ДЕЛ</span><em>+2</em></div>
          <div><b>89</b><span>АНОМАЛИЙ</span><em>+3</em></div>
          <div><b>12</b><span>АКТИВНЫХ АГЕНТОВ</span><em>+1</em></div>
        </div>
      </Panel>
      <div className="dashboard-grid">
        <Panel title="ПОСЛЕДНЕЕ ДЕЛО" className="latest-case">
          <div className="case-paper">
            <Photo src="/assets/host_duo_outdoor.png" alt="Полевой снимок Сена и Грига" label="ПОЛЕВАЯ ГРУППА LM // КАДР 03" />
            <div className="case-paper__copy">
              <div className="case-id">LM-006</div>
              <h1>ЗУМЕРСКИЙ ДЕМОН</h1>
              <div className="stamp">ДЕЛО ЗАКРЫТО</div>
              <dl><dt>ЛОКАЦИЯ</dt><dd>Солнечногорск, МО</dd><dt>КАТЕГОРИЯ</dt><dd>Информационная аномалия</dd><dt>СТАТУС</dt><dd>Закрыто</dd></dl>
              <p>Серия навязчивых проявлений с цифровым источником. Часть данных не прошла техническую верификацию.</p>
              <button type="button" onClick={open}>ОТКРЫТЬ ДОСЬЕ →</button>
            </div>
          </div>
        </Panel>
        <Panel title="АКТИВНОСТЬ СИСТЕМЫ" className="system-log">
          <div className="alert">⚠ РОСТ АКТИВНОСТИ В СЕВЕРО-ЗАПАДНОМ СЕКТОРЕ</div>
          <ul>
            <li><time>17:24</time> Восстановлена запись <code>2003_11/f0-17.avi</code></li>
            <li><time>16:53</time> <span className="red">Удалена запись tmp_4487.log</span></li>
            <li><time>15:12</time> Неизвестное подключение: 3 сек.</li>
            <li><time>14:03</time> Запрос к архиву: Гримуар</li>
            <li><time>02:56</time> <span className="red">Попытка доступа к удалённым данным</span></li>
            <li className="ghost-log"><time>--:--</time> ВХОДЯЩИЙ ЗАПРОС ОТ AG-SEN. АГЕНТ ОФЛАЙН.</li>
            {phantomSync && <li className="phantom-log"><time>--:--</time> РЕЕСТР САМОСТОЯТЕЛЬНО ДОБАВИЛ ЗАПИСЬ LM-███</li>}
          </ul>
        </Panel>
      </div>
      <div className="lower-grid">
        <Panel title="ПОЛЕВАЯ ГРУППА LM / НА СВЯЗИ">
          <div className="field-team">
            <Photo src="/assets/host_duo_indoor_camera.png" alt="Сен и Григ с камерой" />
            <div><b>ЛОВЦЫ МИСТИКИ</b><span>ГРУППА: LM</span><span>СТАТУС: В ПОЛЕ</span><span>СВЯЗЬ: УСТОЙЧИВАЯ</span></div>
          </div>
        </Panel>
        <Panel title="ОПЕРАТИВНЫЕ АГЕНТЫ">
          <div className="agent-mini-grid">
            <div><Photo src="/assets/host_duo_closeup.png" alt="Сен и Григ" /><strong>AG-SEN</strong><small>СЕН — ФИКСАЦИЯ</small></div>
            <div><Photo src="/assets/host_duo_closeup.png" alt="Сен и Григ" /><strong>AG-GRIG</strong><small>ГРИГ — АНАЛИЗ</small></div>
          </div>
        </Panel>
        <Panel title="ПОСЛЕДНИЕ КООРДИНАТЫ">
          <div className="map-faux"><span className="map-cross">×</span><b>LM-006</b><i>Следы не заканчиваются здесь?</i></div>
        </Panel>
      </div>
    </div>
  )
}
