import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

function ReportTab({ jump }) {
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
          <dt>ГРУППА</dt><dd><button className="inline-record-link" type="button" onClick={() => jump('/agents#sen')}>AG-SEN</button>, <button className="inline-record-link" type="button" onClick={() => jump('/agents#grig')}>AG-GRIG</button></dd>
        </dl>
        <p>Зафиксировано повторяющееся информационное воздействие. Источник проявлений не подтверждён. Объект переведён в наблюдение.</p>
        <button className="case-photo-button" type="button" onClick={() => jump('/archive')}><Photo src="/assets/host_duo_outdoor.png" alt="Полевой осмотр" label="Полевой осмотр / кадр 03 — открыть архив" /></button>
      </section>
      <aside className="dossier-side">
        <Panel title="КЛАССИФИКАЦИЯ" danger><b>УРОВЕНЬ II</b><p>Рабочая классификация. Риск повторной активации.</p></Panel>
        <Panel title="КРАТКАЯ ХРОНОЛОГИЯ"><ol className="timeline"><li>11.10 — первое обращение</li><li>14.10 — первичный выезд</li><li>18.10 — фиксация аномального сигнала</li><li>28.11 — дело закрыто</li><li className="red">01.03.2024 — файл добавлен после закрытия</li></ol></Panel>
        <Panel title="ПОЛЕВЫЕ ЗАМЕТКИ"><p>Часть заметок изъята до сверки с бумажным архивом.</p><div className="redactions"><span /><span /><span /></div></Panel>
      </aside>
    </div>
  )
}

function TimelineTab({ selectTab }) {
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
            <button className={index === events.length - 1 ? 'is-anomalous' : ''} type="button" onClick={() => { audio.click(); if(index===2||index===4) selectTab('evidence') }} key={time}>
              <time>{time}</time><span>{String(index + 1).padStart(2, '0')}</span><p>{text}</p><em>{index===2||index===4?'СВЯЗАННАЯ УЛИКА →':'ЖУРНАЛ'}</em>
            </button>
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

function EvidenceTab({ openMaterial }) {
  const evidence = [
    {id:'EV-006-01', title:'ПОЛЕВОЙ КАДР', image:'/assets/host_duo_outdoor.png', status:'ВЕРИФИЦИРОВАНО', detail:'Полевой кадр группы LM. Файл прошёл первичную проверку.'},
    {id:'EV-006-02', title:'КАМЕРА ГРУППЫ LM', image:'/assets/host_duo_indoor_camera.png', status:'ВЕРИФИЦИРОВАНО', detail:'Кадр с основной камеры группы. Время синхронизировано с журналом.'},
    {id:'EV-006-03', title:'ФРАГМЕНТ СИГНАЛА', image:null, status:'ИСТОЧНИК НЕИЗВЕСТЕН', detail:'Сигнал восстановлен из локального буфера. Источник не идентифицирован.'},
    {id:'EV-006-04', title:'АУДИО / 00:17', image:null, status:'ПОВРЕЖДЕНО', detail:'Часть спектра отсутствует. Система предлагает повторную обработку в Field Terminal.'},
  ]

  return (
    <section className="case-tab-panel evidence-section">
      <div className="case-section-head"><div><small>LM-006</small><h1>РЕЕСТР УЛИК</h1></div><span>4 ОБЪЕКТА // 2 ОГРАНИЧЕНЫ</span></div>
      <div className="evidence-grid-v3">
        {evidence.map((item) => (
          <article className={`evidence-card-v3 ${!item.image ? 'is-redacted' : ''}`} key={item.id}>
            <div className="evidence-card-v3__image">
              {item.image ? <Photo src={item.image} alt={item.title} /> : <div className="evidence-redacted"><span>NO PREVIEW</span></div>}
              <b>{item.id}</b>
            </div>
            <h2>{item.title}</h2>
            <p>{item.status}</p>
            <button type="button" onClick={() => openMaterial(item)}>ОТКРЫТЬ МАТЕРИАЛ</button>
          </article>
        ))}
      </div>
    </section>
  )
}

function EntityTab({ jump }) {
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
        <button className="case-inline-action" type="button" onClick={() => { audio.glitch(); jump('/grimoire') }}>ОТКРЫТЬ ЗАПИСЬ P-017 →</button>
      </Panel>
    </div>
  )
}

function MediaTab({ openMaterial }) {
  const media=[
    {id:'FRAME-03',title:'FIELD',image:'/assets/host_duo_outdoor.png',detail:'Полевой кадр 03.'},
    {id:'FRAME-11',title:'CAMERA',image:'/assets/host_duo_indoor_camera.png',detail:'Основная камера группы LM.'},
    {id:'FRAME-17',title:'CLOSE',image:'/assets/host_duo_closeup.png',detail:'Крупный полевой кадр.'},
  ]
  return (
    <section className="case-tab-panel media-v3">
      <div className="case-section-head"><div><small>LM-006</small><h1>МЕДИА-АРХИВ</h1></div><span>FIELD / PHOTO / VIDEO / AUDIO</span></div>
      <div className="media-contact-sheet">
        {media.map(item=><button type="button" onClick={()=>openMaterial(item)} key={item.id}><Photo src={item.image} alt={item.title} label={`${item.id} // ${item.title}`} /></button>)}
        <button type="button" className="media-corrupt" onClick={()=>openMaterial({id:'FILE_006_██.AVI',title:'RECOVERING',detail:'Файл восстановлен частично. Последние кадры отсутствуют.'})}><span>RECOVERING</span><b>FILE_006_██.AVI</b></button>
      </div>
    </section>
  )
}

export default function CaseDetail() {
  const navigate=useNavigate()
  const getInitialTab = () => {
    const fromHash = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : ''
    return validTabs.has(fromHash) ? fromHash : 'report'
  }

  const [activeTab, setActiveTab] = useState(getInitialTab)
  const [material,setMaterial]=useState(null)

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
    id==='evidence'||id==='media'?audio.archive():id==='entity'?audio.glitch():audio.click()
    setActiveTab(id)
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${id}`)
  }
  const jump=(path)=>{audio.nav();window.setTimeout(()=>navigate(path),140)}
  const openMaterial=(item)=>{audio.archive();setMaterial(item)}
  const ActivePanel = {report:ReportTab,timeline:TimelineTab,evidence:EvidenceTab,entity:EntityTab,media:MediaTab}[activeTab]

  return (
    <div className="page case-detail-page">
      <div className="tabs case-tabs-v3" role="tablist" aria-label="Разделы дела LM-006">
        {tabs.map(([id, label]) => (
          <button type="button" role="tab" aria-selected={activeTab === id} className={activeTab === id ? 'active' : ''} onClick={() => selectTab(id)} key={id}>{label}</button>
        ))}
      </div>
      <div className={`case-tab-stage case-tab-stage--${activeTab}`} key={activeTab}>
        <ActivePanel jump={jump} selectTab={selectTab} openMaterial={openMaterial}/>
      </div>

      {material&&<div className="case-material-viewer" role="dialog" aria-modal="true" onClick={()=>setMaterial(null)}>
        <section onClick={e=>e.stopPropagation()}>
          <header><small>LM-006 // MATERIAL VIEWER</small><button type="button" onClick={()=>{audio.click();setMaterial(null)}}>×</button></header>
          <div className="case-material-viewer__preview">{material.image?<Photo src={material.image} alt={material.title}/>:<div className="archive-signal-visual"><i/><i/><i/><span>{material.title||material.id}</span></div>}</div>
          <div className="case-material-viewer__copy"><b>{material.id}</b><h2>{material.title}</h2><p>{material.detail}</p><button type="button" onClick={()=>jump('/archive')}>ОТКРЫТЬ В ОБЩЕМ АРХИВЕ →</button></div>
        </section>
      </div>}
    </div>
  )
}
