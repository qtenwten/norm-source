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

function ReportTab({ jump, openMaterial }) {
  const cover = {
    id:'LM005-FRAME-00',
    title:'ПОЛЕВАЯ ГРУППА LM',
    image:'/assets/night-dusnila-cover.webp',
    detail:'Сен и Григ во время расследования. Кадр из выпуска по делу «Ночной Душнила».',
  }

  return (
    <div className="dossier-grid case-tab-panel">
      <section className="paper dossier-main">
        <div className="stamp">ДЕЛО ЗАКРЫТО</div>
        <div className="case-id">LM-005</div>
        <h1>НОЧНОЙ ДУШНИЛА</h1>
        <dl>
          <dt>ЛОКАЦИЯ</dt><dd>жилой дом / спальня клиента</dd>
          <dt>ДАТА</dt><dd>в исходном сценарии не указана</dd>
          <dt>КЛАСС УГРОЗЫ</dt><dd>II // служебная оценка</dd>
          <dt>ГРУППА</dt><dd><button className="inline-record-link" type="button" onClick={() => jump('/agents#sen')}>AG-SEN</button>, <button className="inline-record-link" type="button" onClick={() => jump('/agents#grig')}>AG-GRIG</button></dd>
        </dl>
        <p>Клиент сообщил, что не спал более 57 часов: при попытке уснуть неизвестное присутствие давило на грудь и душило его. Первичная версия группы — сонный паралич. Во время ночного наблюдения версия была опровергнута: в 02:59–03:00 камера и анализатор зафиксировали появление сущности и прямой контакт с клиентом.</p>
        <button className="case-photo-button" type="button" onClick={() => openMaterial(cover)}><Photo src={cover.image} alt="Сен и Григ во время расследования Ночного Душнилы" label="LM-005 // ПОЛЕВАЯ ГРУППА // открыть материал" /></button>
      </section>
      <aside className="dossier-side">
        <Panel title="КЛАССИФИКАЦИЯ" danger><b>ПОДТВЕРЖДЁННОЕ ПРОЯВЛЕНИЕ</b><p>Рабочее название: «Ночной Душнила». Активность проявлялась во время сна и включала физическое давление на клиента.</p></Panel>
        <Panel title="КРАТКАЯ ХРОНОЛОГИЯ"><ol className="timeline"><li>обращение — более 57 часов без сна</li><li>первичный вывод — сонный паралич</li><li>установлена камера наблюдения</li><li>02:59 — анализатор фиксирует активность</li><li>03:00 — прямой контакт с клиентом</li><li>нейтрализация — ловец снов</li></ol></Panel>
        <Panel title="ПОЛЕВЫЕ ЗАМЕТКИ"><p>После появления сущности группа перешла от наблюдения к немедленному вмешательству. Финальная команда при нейтрализации: «Подуши это!».</p></Panel>
      </aside>
    </div>
  )
}

function TimelineTab({ selectTab }) {
  const events = [
    ['ВХОДЯЩИЙ ЗВОНОК', 'Клиент сообщает о повторяющихся эпизодах удушья и бессоннице длительностью более 57 часов.'],
    ['ПЕРВИЧНЫЙ ОСМОТР', 'Группа LM осматривает спальню. Рабочая гипотеза: сонный паралич.'],
    ['ПОДГОТОВКА К НАБЛЮДЕНИЮ', 'Использованы благовония, проветривание, ловцы снов и камера наблюдения.'],
    ['02:59:27', 'Клиент находится в спальне. Наблюдение продолжается из соседней комнаты.'],
    ['02:59:51', 'В кадре появляется неизвестная фигура. Анализатор фиксирует аномальную активность.'],
    ['03:00', 'Зафиксирован физический контакт сущности с клиентом. Рабочее обозначение: «Ночной Душнила».'],
    ['НЕЙТРАЛИЗАЦИЯ', 'Группа входит в спальню. Сущность исчезает после попадания ловца снов. Активность прекращена.'],
  ]

  return (
    <div className="case-tab-panel case-timeline-layout">
      <section className="paper case-timeline-sheet">
        <div className="case-id">LM-005 // ХРОНОЛОГИЯ</div>
        <h1>ЖУРНАЛ СОБЫТИЙ</h1>
        <div className="case-timeline">
          {events.map(([time, text], index) => (
            <button className={index >= 4 ? 'is-anomalous' : ''} type="button" onClick={() => { audio.click(); if(index>=3) selectTab(index===5?'entity':'evidence') }} key={`${time}-${index}`}>
              <time>{time}</time><span>{String(index + 1).padStart(2, '0')}</span><p>{text}</p><em>{index>=3?'ОТКРЫТЬ СВЯЗАННЫЙ МАТЕРИАЛ →':'ЖУРНАЛ'}</em>
            </button>
          ))}
        </div>
      </section>
      <Panel title="КОНТРОЛЬНАЯ ТОЧКА" danger>
        <p>Ключевой фрагмент наблюдения сохранён с таймкодом 02:59:51.</p>
        <code>LM005_CAM_025951 // VERIFIED</code>
      </Panel>
    </div>
  )
}

function EvidenceTab({ openMaterial }) {
  const evidence = [
    {id:'EV-005-01', title:'АНАЛИЗАТОР', image:'/assets/night-dusnila-detector.webp', status:'АНОМАЛЬНЫЙ СИГНАЛ', detail:'Полевой анализатор группы. Во время ночного наблюдения показания резко выросли перед появлением сущности.'},
    {id:'EV-005-02', title:'КЛИЕНТ / ПЕРВОЕ ОБРАЩЕНИЕ', image:'/assets/night-dusnila-client.webp', status:'СВИДЕТЕЛЬ', detail:'Клиент сообщил о бессоннице более 57 часов и повторяющихся эпизодах удушья во сне.'},
    {id:'EV-005-03', title:'ЗАПИСЬ 02:59:27', image:'/assets/night-dusnila-monitor-before.webp', status:'ВЕРИФИЦИРОВАНО', detail:'Камера наблюдения в спальне незадолго до появления сущности.'},
    {id:'EV-005-04', title:'ЗАПИСЬ 02:59:51', image:'/assets/night-dusnila-monitor-entity.webp', status:'КРИТИЧЕСКИЙ ФРАГМЕНТ', detail:'На записи видна неизвестная фигура, находящаяся на кровати клиента.'},
    {id:'EV-005-05', title:'ЛОВЦЫ СНОВ', image:'/assets/night-dusnila-dreamcatchers.webp', status:'ИСПОЛЬЗОВАНО ПРИ НЕЙТРАЛИЗАЦИИ', detail:'Ловцы снов были размещены в спальне. Один из них использован непосредственно во время столкновения.'},
    {id:'EV-005-06', title:'ПОЛЕВАЯ ГРУППА', image:'/assets/night-dusnila-cover.webp', status:'МАТЕРИАЛ ВЫЕЗДА', detail:'Сен и Григ во время расследования. Кадр из материалов выпуска.'},
  ]

  return (
    <section className="case-tab-panel evidence-section">
      <div className="case-section-head"><div><small>LM-005</small><h1>РЕЕСТР УЛИК</h1></div><span>6 ОБЪЕКТОВ // ИЗ МАТЕРИАЛОВ ДЕЛА</span></div>
      <div className="evidence-grid-v3">
        {evidence.map((item) => (
          <article className="evidence-card-v3" key={item.id}>
            <div className="evidence-card-v3__image"><Photo src={item.image} alt={item.title} /><b>{item.id}</b></div>
            <h2>{item.title}</h2><p>{item.status}</p><button type="button" onClick={() => openMaterial(item)}>ОТКРЫТЬ МАТЕРИАЛ</button>
          </article>
        ))}
      </div>
    </section>
  )
}

function EntityTab({ openMaterial }) {
  const entityFrame = {id:'EV-005-04',title:'ФИКСАЦИЯ СУЩНОСТИ',image:'/assets/night-dusnila-monitor-entity.webp',detail:'Кадр камеры наблюдения 02:59:51. Неизвестная фигура находится на кровати клиента.'}
  return (
    <div className="case-tab-panel entity-file-v3">
      <section className="paper entity-file-v3__paper">
        <small>СВЯЗАННАЯ ЗАПИСЬ // ПОДТВЕРЖДЕНО НА ВИДЕО</small>
        <h1>НОЧНОЙ ДУШНИЛА</h1>
        <div className="entity-file-v3__seal">НЕЙТРАЛИЗОВАНО</div>
        <dl>
          <dt>ТИП</dt><dd>ночная сущность / рабочая классификация Н.О.Р.М.</dd>
          <dt>ПРОЯВЛЕНИЕ</dt><dd>давление на грудь, удушье, обездвиживание во время сна</dd>
          <dt>СРЕДА</dt><dd>спальня клиента / ночное время</dd>
          <dt>ФИКСАЦИЯ</dt><dd>камера наблюдения + полевой анализатор</dd>
          <dt>НЕЙТРАЛИЗАЦИЯ</dt><dd>непосредственное вмешательство группы и ловец снов</dd>
        </dl>
        <button className="case-photo-button" type="button" onClick={() => openMaterial(entityFrame)}><Photo src={entityFrame.image} alt="Ночной Душнила на записи камеры" label="02:59:51 // открыть зафиксированный кадр" /></button>
        <div className="entity-file-v3__warning">ПЕРВОНАЧАЛЬНАЯ ВЕРСИЯ «СОННЫЙ ПАРАЛИЧ» НЕ ОБЪЯСНЯЕТ ПОЯВЛЕНИЕ ФИГУРЫ НА ЗАПИСИ И РЕАКЦИЮ АНАЛИЗАТОРА.</div>
      </section>
      <Panel title="СТАТУС">
        <p>После столкновения повторная активность в материалах дела не зафиксирована. Клиенту оставлены ловцы снов.</p>
      </Panel>
    </div>
  )
}

function MediaTab({ openMaterial }) {
  const media = [
    {id:'FRAME-01',title:'ПОЛЕВАЯ ГРУППА',image:'/assets/night-dusnila-cover.webp',detail:'Сен и Григ во время расследования.'},
    {id:'FRAME-02',title:'КЛИЕНТ',image:'/assets/night-dusnila-client.webp',detail:'Первичный разговор с клиентом.'},
    {id:'FRAME-03',title:'АНАЛИЗАТОР',image:'/assets/night-dusnila-detector.webp',detail:'Полевой анализатор, использованный во время наблюдения.'},
    {id:'FRAME-04',title:'02:59:27',image:'/assets/night-dusnila-monitor-before.webp',detail:'Запись спальни до появления сущности.'},
    {id:'FRAME-05',title:'02:59:51',image:'/assets/night-dusnila-monitor-entity.webp',detail:'Ключевой кадр появления сущности.'},
    {id:'FRAME-06',title:'ЛОВЦЫ СНОВ',image:'/assets/night-dusnila-dreamcatchers.webp',detail:'Защитные предметы, использованные в спальне.'},
  ]

  return (
    <section className="case-tab-panel media-v3">
      <div className="case-section-head"><div><small>LM-005</small><h1>МЕДИА-АРХИВ</h1></div><span>КАДРЫ ИЗ МАТЕРИАЛОВ ВЫПУСКА</span></div>
      <div className="media-contact-sheet">
        {media.map(item=><button type="button" onClick={()=>openMaterial(item)} key={item.id}><Photo src={item.image} alt={item.title} label={`${item.id} // ${item.title}`} /></button>)}
      </div>
    </section>
  )
}

export default function NightCaseDetail() {
  const navigate = useNavigate()
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
      <div className="tabs case-tabs-v3" role="tablist" aria-label="Разделы дела LM-005">
        {tabs.map(([id, label]) => <button type="button" role="tab" aria-selected={activeTab === id} className={activeTab === id ? 'active' : ''} onClick={() => selectTab(id)} key={id}>{label}</button>)}
      </div>
      <div className={`case-tab-stage case-tab-stage--${activeTab}`} key={activeTab}>
        <ActivePanel jump={jump} selectTab={selectTab} openMaterial={openMaterial}/>
      </div>
      {material&&<div className="case-material-viewer" role="dialog" aria-modal="true" onClick={()=>setMaterial(null)}>
        <section onClick={e=>e.stopPropagation()}>
          <header><small>LM-005 // MATERIAL VIEWER</small><button type="button" onClick={()=>{audio.click();setMaterial(null)}}>×</button></header>
          <div className="case-material-viewer__preview"><Photo src={material.image} alt={material.title}/></div>
          <div className="case-material-viewer__copy"><b>{material.id}</b><h2>{material.title}</h2><p>{material.detail}</p><button type="button" onClick={()=>{setMaterial(null);selectTab('media')}}>ОТКРЫТЬ МЕДИА-АРХИВ →</button></div>
        </section>
      </div>}
    </div>
  )
}
