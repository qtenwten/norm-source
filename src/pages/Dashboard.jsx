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
        <Panel title="ПОСЛЕДНЕЕ ДОБАВЛЕННОЕ ДЕЛО" className="latest-case">
          <div className="case-paper">
            <button className="dashboard-photo-link" type="button" onClick={() => go('/cases/lm-005#media','archive')}><Photo src="/assets/night-dusnila-cover.webp" alt="Сен и Григ во время расследования дела Ночной Душнила" label="LM-005 // ПОЛЕВАЯ ГРУППА // КАДР ИЗ ДЕЛА" /></button>
            <div className="case-paper__copy">
              <div className="case-id">LM-005</div>
              <h1>НОЧНОЙ ДУШНИЛА</h1>
              <div className="stamp">ДЕЛО ЗАКРЫТО</div>
              <dl><dt>ЛОКАЦИЯ</dt><dd>Жилой дом / спальня клиента</dd><dt>КАТЕГОРИЯ</dt><dd>Ночная сущность</dd><dt>СТАТУС</dt><dd>Нейтрализована</dd></dl>
              <p>Клиент не спал более 57 часов из-за повторяющихся приступов удушья. В 02:59 сущность попала в поле камеры наблюдения.</p>
              <div className="dashboard-case-actions"><button type="button" onClick={() => go('/cases/lm-005')}>ОТКРЫТЬ ДОСЬЕ →</button><button type="button" onClick={() => go('/cases/lm-005#entity','grimoire')}>СВЕРИТЬ СУЩНОСТЬ</button></div>
            </div>
          </div>
        </Panel>
        <Panel title="АКТИВНОСТЬ СИСТЕМЫ" className="system-log">
          <button className="alert dashboard-alert-button" type="button" onClick={() => go('/cases/lm-005#timeline','terminal')}>⚠ LM-005 // АНОМАЛЬНАЯ АКТИВНОСТЬ ЗАФИКСИРОВАНА В 02:59</button>
          <ul>
            <li><button type="button" onClick={() => go('/cases/lm-005#evidence','archive')}><time>03:20</time> LM-005: активность прекращена после нейтрализации</button></li>
            <li><button type="button" onClick={() => go('/cases/lm-005#media','archive')}><time>02:59</time> В архив добавлена запись камеры <code>LM005_CAM_025951</code></button></li>
            <li><button type="button" onClick={() => go('/cases/lm-005#entity','terminal')}><time>02:59</time> Анализатор: подтверждён аномальный сигнал</button></li>
            <li><button type="button" onClick={() => go('/grimoire','grimoire')}><time>23:10</time> Запрос к архиву: ловцы снов / ночные сущности</button></li>
            <li><button type="button" onClick={() => go('/agents#sen')}><time>22:30</time> <span className="red">Рабочая версия «сонный паралич» помечена как неполная</span></button></li>
            <li className="ghost-log"><button type="button" onClick={() => go('/cases/lm-006')}><time>--:--</time> LM-006 // В буфере обнаружена строка: 1000−7</button></li>
            {phantomSync && <li className="phantom-log"><button type="button" onClick={() => go('/terminal','terminal')}><time>--:--</time> РЕЕСТР САМОСТОЯТЕЛЬНО ДОБАВИЛ ЗАПИСЬ LM-███</button></li>}
          </ul>
        </Panel>
      </div>
      <div className="lower-grid lower-grid--clickable">
        <Panel title="ПОЛЕВАЯ ГРУППА LM / НА СВЯЗИ"><button type="button" className="panel-link-fill" onClick={() => go('/agents')}><div className="field-team"><Photo src="/assets/host_duo_indoor_camera.png" alt="Сен и Григ во время разговора с клиентом" /><div><b>ЛОВЦЫ МИСТИКИ</b><span>ГРУППА: LM</span><span>СТАТУС: В ПОЛЕ</span><span>СВЯЗЬ: УСТОЙЧИВАЯ</span></div></div></button></Panel>
        <Panel title="ОПЕРАТИВНЫЕ АГЕНТЫ"><div className="agent-mini-grid"><button type="button" onClick={() => go('/agents#sen')}><Photo src="/assets/host_duo_closeup.png" alt="Сен и Григ" /><strong>AG-SEN</strong><small>ОТКРЫТЬ ДОСЬЕ</small></button><button type="button" onClick={() => go('/agents#grig')}><Photo src="/assets/host_duo_closeup.png" alt="Сен и Григ" /><strong>AG-GRIG</strong><small>ОТКРЫТЬ ДОСЬЕ</small></button></div></Panel>
        <Panel title="ПОСЛЕДНИЕ КООРДИНАТЫ"><button type="button" className="panel-link-fill" onClick={() => go('/cases/lm-005','terminal')}><div className="map-faux"><span className="map-cross">×</span><b>LM-005</b><i>Источник активности локализован в спальне.</i></div></button></Panel>
      </div>
    </div>
  )
}
