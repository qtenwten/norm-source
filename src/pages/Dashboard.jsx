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

  const go = (path, tone = 'dashboard') => {
    if (tone === 'archive') audio.archive()
    else if (tone === 'grimoire') audio.paper()
    else if (tone === 'terminal') audio.command()
    else audio.stamp()
    window.setTimeout(() => navigate(path), 130)
  }

  return (
    <div className="page dashboard-page">
      <button className="city-banner city-banner--button" type="button" onClick={() => go('/cases')}>
        <div><strong>МИР ПРЕЖНИЙ.<br />НО УЖЕ НЕ ТОЛЬКО ОН.</strong><span>ДЕЛА ПРОДОЛЖАЮТСЯ.</span></div>
        <blockquote>«РЕАЛЬНОСТЬ ШИРЕ, ЧЕМ НАМ РАЗРЕШЕНО ПОМНИТЬ»</blockquote>
      </button>
      <Panel title="ОПЕРАТИВНАЯ СВОДКА" className="summary">
        <div className="stat-grid stat-grid--buttons">
          <button type="button" className={phantomSync ? 'stat-anomaly' : ''} onClick={() => go('/cases')}><b>{phantomSync ? '143' : '142'}</b><span>ОТКРЫТЫХ ДЕЛ</span><em>{phantomSync ? '+8' : '+7'}</em></button>
          <button type="button" onClick={() => go('/cases')}><b>317</b><span>ЗАКРЫТЫХ ДЕЛ</span><em>+2</em></button>
          <button type="button" onClick={() => go('/grimoire','grimoire')}><b>89</b><span>АНОМАЛИЙ</span><em>+3</em></button>
          <button type="button" onClick={() => go('/agents')}><b>12</b><span>АКТИВНЫХ АГЕНТОВ</span><em>+1</em></button>
        </div>
      </Panel>
      <div className="dashboard-grid">
        <Panel title="ПОСЛЕДНЕЕ ДЕЛО" className="latest-case">
          <div className="case-paper">
            <button className="dashboard-photo-link" type="button" onClick={() => go('/cases/lm-006#media','archive')}><Photo src="/assets/host_duo_outdoor.png" alt="Полевой снимок Сена и Грига" label="ПОЛЕВАЯ ГРУППА LM // КАДР 03" /></button>
            <div className="case-paper__copy">
              <div className="case-id">LM-006</div>
              <h1>ЗУМЕРСКИЙ ДЕМОН</h1>
              <div className="stamp">ДЕЛО ЗАКРЫТО</div>
              <dl><dt>ЛОКАЦИЯ</dt><dd>Солнечногорск, МО</dd><dt>КАТЕГОРИЯ</dt><dd>Информационная аномалия</dd><dt>СТАТУС</dt><dd>Закрыто</dd></dl>
              <p>Серия навязчивых проявлений с цифровым источником. Часть данных не прошла техническую верификацию.</p>
              <div className="dashboard-case-actions"><button type="button" onClick={() => go('/cases/lm-006')}>ОТКРЫТЬ ДОСЬЕ →</button><button type="button" onClick={() => go('/grimoire','grimoire')}>СВЕРИТЬ С ГРИМУАРОМ</button></div>
            </div>
          </div>
        </Panel>
        <Panel title="АКТИВНОСТЬ СИСТЕМЫ" className="system-log">
          <button className="alert dashboard-alert-button" type="button" onClick={() => go('/terminal','terminal')}>⚠ РОСТ АКТИВНОСТИ В СЕВЕРО-ЗАПАДНОМ СЕКТОРЕ</button>
          <ul>
            <li><button type="button" onClick={() => go('/archive','archive')}><time>17:24</time> Восстановлена запись <code>2003_11/f0-17.avi</code></button></li>
            <li><button type="button" onClick={() => go('/archive','archive')}><time>16:53</time> <span className="red">Удалена запись tmp_4487.log</span></button></li>
            <li><button type="button" onClick={() => go('/terminal','terminal')}><time>15:12</time> Неизвестное подключение: 3 сек.</button></li>
            <li><button type="button" onClick={() => go('/grimoire','grimoire')}><time>14:03</time> Запрос к архиву: Гримуар</button></li>
            <li><button type="button" onClick={() => go('/agents#02')}><time>02:56</time> <span className="red">Попытка доступа к удалённым данным</span></button></li>
            <li className="ghost-log"><button type="button" onClick={() => go('/agents#sen')}><time>--:--</time> ВХОДЯЩИЙ ЗАПРОС ОТ AG-SEN. АГЕНТ ОФЛАЙН.</button></li>
            {phantomSync && <li className="phantom-log"><button type="button" onClick={() => go('/terminal','terminal')}><time>--:--</time> РЕЕСТР САМОСТОЯТЕЛЬНО ДОБАВИЛ ЗАПИСЬ LM-███</button></li>}
          </ul>
        </Panel>
      </div>
      <div className="lower-grid lower-grid--clickable">
        <Panel title="ПОЛЕВАЯ ГРУППА LM / НА СВЯЗИ"><button type="button" className="panel-link-fill" onClick={() => go('/agents')}><div className="field-team"><Photo src="/assets/host_duo_indoor_camera.png" alt="Сен и Григ с камерой" /><div><b>ЛОВЦЫ МИСТИКИ</b><span>ГРУППА: LM</span><span>СТАТУС: В ПОЛЕ</span><span>СВЯЗЬ: УСТОЙЧИВАЯ</span></div></div></button></Panel>
        <Panel title="ОПЕРАТИВНЫЕ АГЕНТЫ"><div className="agent-mini-grid"><button type="button" onClick={() => go('/agents#sen')}><Photo src="/assets/host_duo_closeup.png" alt="Сен и Григ" /><strong>AG-SEN</strong><small>ОТКРЫТЬ ДОСЬЕ</small></button><button type="button" onClick={() => go('/agents#grig')}><Photo src="/assets/host_duo_closeup.png" alt="Сен и Григ" /><strong>AG-GRIG</strong><small>ОТКРЫТЬ ДОСЬЕ</small></button></div></Panel>
        <Panel title="ПОСЛЕДНИЕ КООРДИНАТЫ"><button type="button" className="panel-link-fill" onClick={() => go('/terminal','terminal')}><div className="map-faux"><span className="map-cross">×</span><b>LM-006</b><i>Следы не заканчиваются здесь?</i></div></button></Panel>
      </div>
    </div>
  )
}
