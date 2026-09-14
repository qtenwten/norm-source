import { useEffect, useState } from 'react'
import Panel from '../components/Panel'
import Photo from '../components/Photo'
import { audio } from '../audio'

const tabs = [
  ['report', 'ОТЧЁТ'],
  ['timeline', 'ХРОНОЛОГИЯ'],
  ['evidence', 'УЛИКИ'],
  ['entity', 'СУЩНОСТЬ'],
  ['media', 'МЕДИА'],
]

const validTabs = new Set(tabs.map(([id]) => id))

function ReportTab() {
  return (
    <div className="dossier-grid case-tab-panel">
      <section className="paper dossier-main">
        <div className="stamp">ДЕЛО ЗАКРЫТО</div>
        <div className="case-id">LM-006</div>
        <h1>ЗУМЕРСКИЙ ДЕМОН</h1>
        <dl>
          <dt>ЛОКАЦИЯ</dt><dd>Солнечногорск, МО</dd>
          <dt>ДАТЫ</dt><dd>11.10.2023 — 28.11.2023</dd>
          <dt>КЛАСС УГРОЗЫ</dt><dd>II</dd>
          <dt>ГРУППА</dt><dd>AG-SEN, AG-GRIG</dd>
        </dl>
        <p>Зафиксировано повторяющееся информационное воздействие. Источник проявлений не подтверждён. Объект переведён в наблюдение.</p>
        <Photo src="/assets/host_duo_outdoor.png" alt="Полевой осмотр" label="Полевой осмотр / кадр 03" />
      </section>
      <aside className="dossier-side">
        <Panel title="КЛАССИФИКАЦИЯ" danger><b>УРОВЕНЬ II</b><p>Рабочая классификация. Риск повторной активации.</p></Panel>
        <Panel title="КРАТКАЯ ХРОНОЛОГИЯ"><ol className="timeline"><li>11.10 — первое обращение</li><li>14.10 — первичный выезд</li><li>18.10 — фиксация аномального сигнала</li><li>28.11 — дело закрыто</li><li className="red">01.03.2024 — файл добавлен после закрытия</li></ol></Panel>
        <Panel title="ПОЛЕВЫЕ ЗАМЕТКИ"><p>Часть заметок изъята до сверки с бумажным архивом.</p><div className="redactions"><span /><span /><span /></div></Panel>
      </aside>
    </div>
  )
}

function TimelineTab() {
  const events = [
    ['11.10.2023 / 20:14', 'Получено первичное обращение. Создан временный инцидент CIV-006.'],
    ['14.10.2023 / 18:42', 'Первичный выезд группы LM. Зафиксированы свидетельские показания.'],
    ['18.10.2023 / 23:06', 'В архив добавлен фрагмент сигнала с неизвестным источником.'],
    ['28.11.2023 / 16:30', 'Дело переведено в статус «закрыто / наблюдение».'],
    ['01.03.2024 / --:--', 'Система зарегистрировала новый файл после даты закрытия дела.'],
  ]

  return (
    <div className="case-tab-panel case-timeline-layout">
      <section className="paper case-timeline-sheet">
        <div className="case-id">LM-006 // ХРОНОЛОГИЯ</div>
        <h1>ЖУРНАЛ СОБЫТИЙ</h1>
        <div className="case-timeline">
          {events.map(([time, text], index) => (
            <article className={index === events.length - 1 ? 'is-anomalous' : ''} key={time}>
              <time>{time}</time><span>{String(index + 1).padStart(2, '0')}</span><p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <Panel title="СИСТЕМНАЯ ПРОВЕРКА" danger>
        <p>Последняя запись не совпадает с контрольной датой закрытия.</p>
        <code>DELTA: +94 DAYS</code>
      </Panel>
    </div>
  )
}

function EvidenceTab() {
  const evidence = [
    ['EV-006-01', 'ПОЛЕВОЙ КАДР', '/assets/host_duo_outdoor.png', 'ВЕРИФИЦИРОВАНО'],
    ['EV-006-02', 'КАМЕРА ГРУППЫ LM', '/assets/host_duo_indoor_camera.png', 'ВЕРИФИЦИРОВАНО'],
    ['EV-006-03', 'ФРАГМЕНТ СИГНАЛА', null, 'ИСТОЧНИК НЕИЗВЕСТЕН'],
    ['EV-006-04', 'АУДИО / 00:17', null, 'ПОВРЕЖДЕНО'],
  ]

  return (
    <section className="case-tab-panel evidence-section">
      <div className="case-section-head"><div><small>LM-006</small><h1>РЕЕСТР УЛИК</h1></div><span>4 ОБЪЕКТА // 2 ОГРАНИЧЕНЫ</span></div>
      <div className="evidence-grid-v3">
        {evidence.map(([id, title, image, status]) => (
          <article className={`evidence-card-v3 ${!image ? 'is-redacted' : ''}`} key={id}>
            <div className="evidence-card-v3__image">
              {image ? <Photo src={image} alt={title} /> : <div className="evidence-redacted"><span>NO PREVIEW</span></div>}
              <b>{id}</b>
            </div>
            <h2>{title}</h2>
            <p>{status}</p>
            <button type="button" onClick={() => audio.click()}>ОТКРЫТЬ МАТЕРИАЛ</button>
          </article>
        ))}
      </div>
    </section>
  )
}

function EntityTab() {
  return (
    <div className="case-tab-panel entity-file-v3">
      <section className="paper entity-file-v3__paper">
        <small>СВЯЗАННАЯ ЗАПИСЬ // РАБОЧАЯ КЛАССИФИКАЦИЯ</small>
        <h1>ОБЪЕКТ LM-006</h1>
        <div className="entity-file-v3__seal">НЕ ПОДТВЕРЖДЕНО</div>
        <dl>
          <dt>ТИП</dt><dd>не установлен</dd>
          <dt>ПРОЯВЛЕНИЕ</dt><dd>информационное / поведенческое</dd>
          <dt>ФИЗИЧЕСКАЯ ФОРМА</dt><dd>не зафиксирована</dd>
          <dt>УВЕРЕННОСТЬ</dt><dd>недостаточно данных</dd>
        </dl>
        <div className="entity-file-v3__warning">СИСТЕМА НЕ ПОДТВЕРЖДАЕТ СВЕРХЪЕСТЕСТВЕННОЕ ПРОИСХОЖДЕНИЕ ОБЪЕКТА.</div>
      </section>
      <Panel title="СВЯЗЬ С ГРИМУАРОМ">
        <p>Автоматическая корреляция обнаружена, но достоверность связи не подтверждена.</p>
        <button className="case-inline-action" type="button" onClick={() => { window.location.hash = 'entity'; audio.glitch() }}>ПОВТОРИТЬ КОРРЕЛЯЦИЮ</button>
      </Panel>
    </div>
  )
}

function MediaTab() {
  return (
    <section className="case-tab-panel media-v3">
      <div className="case-section-head"><div><small>LM-006</small><h1>МЕДИА-АРХИВ</h1></div><span>FIELD / PHOTO / VIDEO / AUDIO</span></div>
      <div className="media-contact-sheet">
        <Photo src="/assets/host_duo_outdoor.png" alt="Полевой кадр 01" label="FRAME 03 // FIELD" />
        <Photo src="/assets/host_duo_indoor_camera.png" alt="Полевой кадр 02" label="FRAME 11 // CAMERA" />
        <Photo src="/assets/host_duo_closeup.png" alt="Полевой кадр 03" label="FRAME 17 // CLOSE" />
        <div className="media-corrupt"><span>RECOVERING</span><b>FILE_006_██.AVI</b></div>
      </div>
    </section>
  )
}

const renderers = {
  report: ReportTab,
  timeline: TimelineTab,
  evidence: EvidenceTab,
  entity: EntityTab,
  media: MediaTab,
}

export default function CaseDetail() {
  const getInitialTab = () => {
    const fromHash = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : ''
    return validTabs.has(fromHash) ? fromHash : 'report'
  }

  const [activeTab, setActiveTab] = useState(getInitialTab)

  useEffect(() => {
    const onHashChange = () => {
      const next = window.location.hash.replace('#', '')
      if (validTabs.has(next)) setActiveTab(next)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const selectTab = (id) => {
    if (id === activeTab) return
    audio.click()
    setActiveTab(id)
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${id}`)
  }

  const ActivePanel = renderers[activeTab]

  return (
    <div className="page case-detail-page">
      <div className="tabs case-tabs-v3" role="tablist" aria-label="Разделы дела LM-006">
        {tabs.map(([id, label]) => (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            className={activeTab === id ? 'active' : ''}
            onClick={() => selectTab(id)}
            key={id}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="case-tab-stage" key={activeTab}>
        <ActivePanel />
      </div>
    </div>
  )
}
