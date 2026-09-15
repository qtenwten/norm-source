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
          <dt>ЛОКАЦИЯ</dt><dd>жилая квартира / комната Вадика</dd>
          <dt>ДАТА</dt><dd>в исходном сценарии не указана</dd>
          <dt>КЛАСС УГРОЗЫ</dt><dd>II // служебная оценка</dd>
          <dt>ГРУППА</dt><dd><button className="inline-record-link" type="button" onClick={() => jump('/agents#sen')}>AG-SEN</button>, <button className="inline-record-link" type="button" onClick={() => jump('/agents#grig')}>AG-GRIG</button></dd>
        </dl>
        <p>Мать подростка сообщила о резком изменении поведения сына: изоляция в комнате, агрессия, фразы «1000−7», реплики голосом Shadow Fiend и навязчивая игровая символика. Во время осмотра зафиксированы аномальные проявления, после чего группа провела ритуал изгнания. Финальный признак завершения операции — удаление Dota 2 с компьютера субъекта. В послесловии сохраняется остаточная фраза «тысяча минус семь».</p>
        <button className="case-photo-button" type="button" onClick={() => jump('/agents')}><Photo src="/assets/host_duo_outdoor.png" alt="Оперативная группа LM" label="ОПЕРАТИВНАЯ ГРУППА LM // служебный снимок" /></button>
      </section>
      <aside className="dossier-side">
        <Panel title="КЛАССИФИКАЦИЯ" danger><b>РАБОЧЕЕ ОБОЗНАЧЕНИЕ: DEAD INSIDE</b><p>Термин «зумерский демон» использован группой как оперативная классификация в ходе расследования.</p></Panel>
        <Panel title="КРАТКАЯ ХРОНОЛОГИЯ"><ol className="timeline"><li>обращение матери</li><li>фиксация паттерна «1000−7»</li><li>аномальная речь голосом SF</li><li>надпись «УХОДИТЕ» на мониторе</li><li>ритуал изгнания</li><li>Dota 2 удалена</li><li className="red">остаточная фраза сохраняется</li></ol></Panel>
        <Panel title="ПОЛЕВЫЕ ЗАМЕТКИ"><p>Версия обычного пубертата рассматривалась в начале выезда, но была отвергнута после серии аномальных проявлений.</p></Panel>
      </aside>
    </div>
  )
}

function TimelineTab({ selectTab }) {
  const events = [
    ['ОБРАЩЕНИЕ', 'Мать сообщает о резком изменении поведения сына и предполагаемой одержимости.'],
    ['ПЕРВИЧНЫЙ ОСМОТР', 'В комнате обнаружены игровая и аниме-атрибутика. Субъект агрессивно реагирует на группу.'],
    ['1000−7', 'Субъект обращается к группе фразой «1000−7». Григ отвечает: 993.'],
    ['АНОМАЛЬНАЯ РЕЧЬ', 'Во время игры субъект использует реплики Shadow Fiend; затем поворачивает голову на 360 градусов.'],
    ['СИГНАЛ', 'Анализатор реагирует. На мониторе вардами появляется сообщение «УХОДИТЕ».'],
    ['ИДЕНТИФИКАЦИЯ', 'Группа вводит рабочее обозначение «Dead Inside / зумерский демон» и готовит ритуал.'],
    ['ИЗГНАНИЕ', 'Проведён ритуал. В тексте обряда используются игровые термины, Omniknight и Roshan.'],
    ['ПОСЛЕ ОПЕРАЦИИ', 'На компьютере удаляется Dota 2. Позднее субъект продолжает шептать «тысяча минус семь».'],
  ]

  return (
    <div className="case-tab-panel case-timeline-layout">
      <section className="paper case-timeline-sheet">
        <div className="case-id">LM-006 // ХРОНОЛОГИЯ</div>
        <h1>ЖУРНАЛ СОБЫТИЙ</h1>
        <div className="case-timeline">
          {events.map(([time, text], index) => (
            <button className={index >= 3 ? 'is-anomalous' : ''} type="button" onClick={() => { audio.click(); if(index>=2) selectTab(index===5?'entity':'evidence') }} key={`${time}-${index}`}>
              <time>{time}</time><span>{String(index + 1).padStart(2, '0')}</span><p>{text}</p><em>{index>=2?'СВЯЗАННАЯ ЗАПИСЬ →':'ЖУРНАЛ'}</em>
            </button>
          ))}
        </div>
      </section>
      <Panel title="ПОСЛЕОПЕРАЦИОННЫЙ КОНТРОЛЬ" danger>
        <p>Основное проявление прекращено, однако остаточный речевой паттерн не исчез полностью.</p>
        <code>RESIDUAL: 1000−7</code>
      </Panel>
    </div>
  )
}

function EvidenceTab({ openMaterial }) {
  const evidence = [
    {id:'EV-006-01', title:'СВИДЕТЕЛЬСТВО МАТЕРИ', image:null, status:'ПОКАЗАНИЯ', detail:'Сообщение о резком изменении поведения Вадика, изоляции в комнате и подозрении на одержимость.'},
    {id:'EV-006-02', title:'ПАТТЕРН 1000−7', image:null, status:'ПОВТОРЯЮЩАЯСЯ ФРАЗА', detail:'Фраза используется субъектом при первом контакте и сохраняется после завершения операции.'},
    {id:'EV-006-03', title:'ГОЛОС SHADOW FIEND', image:null, status:'АУДИО-ПРОЯВЛЕНИЕ', detail:'Во время игры субъект периодически переходит на реплики Shadow Fiend.'},
    {id:'EV-006-04', title:'СООБЩЕНИЕ «УХОДИТЕ»', image:null, status:'ВИЗУАЛЬНОЕ ПРОЯВЛЕНИЕ', detail:'После выхода Вадика из комнаты группа обнаруживает на мониторе сообщение «УХОДИТЕ», составленное вардами.'},
    {id:'EV-006-05', title:'ФИЗИЧЕСКАЯ АНОМАЛИЯ', image:null, status:'НАБЛЮДЕНИЕ ГРУППЫ', detail:'После игровой сессии субъект поворачивает голову на 360 градусов.'},
    {id:'EV-006-06', title:'ФИНАЛЬНЫЙ ПРИЗНАК', image:null, status:'ПОСЛЕ РИТУАЛА', detail:'После завершения ритуала Dota 2 удаляется с компьютера субъекта.'},
  ]

  return (
    <section className="case-tab-panel evidence-section">
      <div className="case-section-head"><div><small>LM-006</small><h1>РЕЕСТР УЛИК</h1></div><span>6 ЗАПИСЕЙ // СЦЕНАРНЫЙ АРХИВ</span></div>
      <div className="evidence-grid-v3">
        {evidence.map((item) => (
          <article className="evidence-card-v3 is-redacted" key={item.id}>
            <div className="evidence-card-v3__image"><div className="evidence-redacted"><span>TEXT RECORD</span></div><b>{item.id}</b></div>
            <h2>{item.title}</h2><p>{item.status}</p><button type="button" onClick={() => openMaterial(item)}>ОТКРЫТЬ ЗАПИСЬ</button>
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
        <h1>DEAD INSIDE / «ЗУМЕРСКИЙ ДЕМОН»</h1>
        <div className="entity-file-v3__seal">УСЛОВНО НЕЙТРАЛИЗОВАНО</div>
        <dl>
          <dt>НОСИТЕЛЬ</dt><dd>Вадик</dd>
          <dt>ПРОЯВЛЕНИЕ</dt><dd>поведенческое, речевое, физическое</dd>
          <dt>МАРКЕРЫ</dt><dd>«1000−7», реплики SF, игровая символика</dd>
          <dt>ФИЗИЧЕСКИЙ ПРИЗНАК</dt><dd>поворот головы на 360°</dd>
          <dt>СТАТУС</dt><dd>основное проявление прекращено; остаточный речевой паттерн сохраняется</dd>
        </dl>
        <div className="entity-file-v3__warning">ТЕРМИН «ЗУМЕРСКИЙ ДЕМОН» ЯВЛЯЕТСЯ ОПЕРАТИВНЫМ ОБОЗНАЧЕНИЕМ ГРУППЫ, А НЕ ПОДТВЕРЖДЁННОЙ ТАКСОНОМИЕЙ.</div>
      </section>
      <Panel title="РИТУАЛ">
        <p>Для изгнания группа использовала Энциклопедию призраков, пиктограмму и адаптированный текст обряда с игровыми терминами.</p>
      </Panel>
    </div>
  )
}

function MediaTab({ openMaterial }) {
  const media = [
    {id:'MEDIA-006-01',title:'ВИДЕО ВЫПУСКА',detail:'Кадры выпуска по делу пока не загружены в локальный архив сайта.'},
    {id:'MEDIA-006-02',title:'РЕКОНСТРУКЦИЯ',detail:'Материалы реконструкции поведения Вадика ожидают импорта.'},
    {id:'MEDIA-006-03',title:'РИТУАЛ',detail:'Видеофрагмент изгнания не добавлен в текущую сборку.'},
  ]
  return (
    <section className="case-tab-panel media-v3">
      <div className="case-section-head"><div><small>LM-006</small><h1>МЕДИА-АРХИВ</h1></div><span>МАТЕРИАЛЫ ОЖИДАЮТ ИМПОРТА</span></div>
      <div className="media-contact-sheet">
        {media.map(item=><button type="button" className="media-corrupt" onClick={()=>openMaterial(item)} key={item.id}><span>NOT LOADED</span><b>{item.id}</b></button>)}
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
        {tabs.map(([id, label]) => <button type="button" role="tab" aria-selected={activeTab === id} className={activeTab === id ? 'active' : ''} onClick={() => selectTab(id)} key={id}>{label}</button>)}
      </div>
      <div className={`case-tab-stage case-tab-stage--${activeTab}`} key={activeTab}>
        <ActivePanel jump={jump} selectTab={selectTab} openMaterial={openMaterial}/>
      </div>

      {material&&<div className="case-material-viewer" role="dialog" aria-modal="true" onClick={()=>setMaterial(null)}>
        <section onClick={e=>e.stopPropagation()}>
          <header><small>LM-006 // MATERIAL VIEWER</small><button type="button" onClick={()=>{audio.click();setMaterial(null)}}>×</button></header>
          <div className="case-material-viewer__preview"><div className="archive-signal-visual"><i/><i/><i/><span>{material.title||material.id}</span></div></div>
          <div className="case-material-viewer__copy"><b>{material.id}</b><h2>{material.title}</h2><p>{material.detail}</p><button type="button" onClick={()=>setMaterial(null)}>ЗАКРЫТЬ ЗАПИСЬ</button></div>
        </section>
      </div>}
    </div>
  )
}
