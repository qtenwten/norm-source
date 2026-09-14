import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { audio } from '../audio'
import { discover, getArgState, subscribeArg } from '../arg'

const baseAgents = [
  { id:'sen', code:'AG-SEN', name:'СЕН', status:'АКТИВЕН', category:'active', clearance:'A-3', group:'LM', image:'/assets/agent-sen.webp', position:'50%', records:['LM-001 — LM-006','FIELD MEDIA: ДОСТУПНО','ПОЛЕВАЯ ГРУППА: LM'], note:'Часть полей не синхронизирована с бумажным архивом.', actions:[['/cases/lm-006','ПОСЛЕДНЕЕ ДЕЛО'],['/archive','ПОЛЕВЫЕ МАТЕРИАЛЫ']] },
  { id:'grig', code:'AG-GRIG', name:'ГРИГ', status:'АКТИВЕН', category:'active', clearance:'A-3', group:'LM', image:'/assets/agent-grig.webp', position:'50%', records:['LM-001 — LM-006','FIELD MEDIA: ДОСТУПНО','ПОЛЕВАЯ ГРУППА: LM'], note:'Часть полей не синхронизирована с бумажным архивом.', actions:[['/cases/lm-006','ПОСЛЕДНЕЕ ДЕЛО'],['/terminal','FIELD TERMINAL']] },
  { id:'04', code:'AG-04', name:'████████', status:'ДЕАКТИВИРОВАН', category:'archive', clearance:'B-2', group:'██', records:['ПОСЛЕДНЕЕ ДЕЛО: LM-0██','ПРОТОКОЛ 17-Б','ПОЛЕВЫЕ МАТЕРИАЛЫ: ИЗЪЯТЫ'], note:'Доступ прекращён административным решением. Причина скрыта уровнем допуска.', actions:[['/archive','ЗАПРОСИТЬ АРХИВ']] },
  { id:'09', code:'AG-09', name:'██████ █.', status:'УТРАЧЕН', category:'lost', clearance:'B-4', group:'██', records:['ПОСЛЕДНИЙ СИГНАЛ: --:--:--','ПОСЛЕДНЕЕ ДЕЛО: LM-0██','СТАТУС ПОИСКА: ЗАКРЫТ'], note:'В реестре отсутствует запись о завершении службы. Файл восстановлен частично.', actions:[['/terminal','ПОИСК ПО СИГНАЛУ']] },
  { id:'13', code:'AG-13', name:'НЕТ ДАННЫХ', status:'ФАЙЛ УДАЛЁН', category:'deleted', clearance:'████', group:'██', records:['КАРТОЧКА СОТРУДНИКА: НЕДОСТУПНА','БИОМЕТРИЯ: НЕТ ДАННЫХ','СВЯЗАННЫЕ ДЕЛА: ███████'], note:'Цифровая копия была удалена до создания текущей версии NORM-OS.', actions:[['/archive','ВОССТАНОВЛЕННЫЕ ФРАГМЕНТЫ']] },
  { id:'02', code:'AG-02', name:'НЕ ЧИСЛИТСЯ', status:'НЕСООТВЕТСТВИЕ РЕЕСТРУ', category:'anomaly', clearance:'?', group:'—', records:['ДАТА СОЗДАНИЯ: НЕДОСТУПНА','ИСТОЧНИК: UNKNOWN NODE','СВЯЗАННЫЕ ДЕЛА: 0'], note:'Система не находит сотрудника с таким номером, однако карточка появляется снова после удаления.', actions:[['/terminal','ОПРОСИТЬ UNKNOWN NODE']] },
]

const filters = [['all','ВСЕ'],['active','АКТИВНЫЕ'],['archive','ДЕАКТИВИРОВАННЫЕ'],['lost','УТРАЧЕННЫЕ'],['restricted','ЗАКРЫТЫЕ']]

function matchesFilter(agent, filter) {
  if (filter === 'all') return true
  if (filter === 'restricted') return ['deleted','anomaly','phantom'].includes(agent.category)
  return agent.category === filter
}

function AgentPortrait({ agent, large = false }) {
  if (!agent.image) return <div className={`registry-portrait registry-portrait--redacted ${large ? 'is-large' : ''}`} aria-label="Фото скрыто"><span>{agent.code}</span><i/><i/><i/></div>
  return <div className={`registry-portrait ${large ? 'is-large' : ''}`}><img src={agent.image} alt={agent.name} draggable="false" onDragStart={(event)=>event.preventDefault()} style={{objectPosition:`${agent.position} center`}}/><span className="registry-portrait__code">{agent.code}</span></div>
}

export default function Agents() {
  const navigate=useNavigate()
  const [progress,setProgress]=useState(getArgState)
  const initialHash=typeof window!=='undefined'?window.location.hash.replace('#',''):''
  const [filter,setFilter]=useState('all')
  const [selectedId,setSelectedId]=useState(initialHash||'sen')

  useEffect(()=>subscribeArg(setProgress),[])

  const agents=useMemo(()=>{
    if(progress.clearance<2) return baseAgents
    const phantom={
      id:'00', code:'AG-00', name:progress.clearance>=3?'NORM-0':'НЕ СУЩЕСТВУЕТ', status:'НЕИНДЕКСИРОВАН', category:'phantom', clearance:'A-?', group:'—',
      records:progress.clearance>=3?['FIRST LOGIN: 18.11.1987','PERSONNEL ID: NONE','PROCESS OWNER: NONE','SESSION: ACTIVE']:['КАРТОЧКА СОЗДАНА БЕЗ ОПЕРАТОРА','ДАТА ПЕРВОГО ВХОДА: ████████','ИСТОЧНИК: BLACK NODE'],
      note:progress.clearance>=3?'Запись не соответствует кадровому реестру. NORM-0 никогда не был сотрудником Н.О.Р.М., но система считает его первой активной сессией.':'Карточка появилась после открытия BLACK NODE. Попытка удалить запись создаёт её заново.',
      actions:[['/terminal','ОПРОСИТЬ NORM-0'],['/archive','BLACK ARCHIVE']],
    }
    return [...baseAgents,phantom]
  },[progress.clearance])

  const visibleAgents=useMemo(()=>agents.filter(a=>matchesFilter(a,filter)),[agents,filter])
  const selected=agents.find(a=>a.id===selectedId)||agents[0]

  useEffect(()=>{
    const sync=()=>{
      const id=window.location.hash.replace('#','')
      if(agents.some(a=>a.id===id)) setSelectedId(id)
    }
    sync()
    window.addEventListener('hashchange',sync)
    return()=>window.removeEventListener('hashchange',sync)
  },[agents])

  const selectAgent=(agent)=>{
    setSelectedId(agent.id)
    window.history.replaceState(null,'',`${window.location.pathname}#${agent.id}`)
    if(agent.id==='00') discover('AG00_CARD')
    ['deleted','anomaly','lost','phantom'].includes(agent.category)?audio.glitch():audio.stamp()
  }
  const changeFilter=(next)=>{setFilter(next);audio.tab()}
  const follow=(path)=>{audio.transition(path.startsWith('/terminal')?'terminal':path.startsWith('/archive')?'archive':'case');window.setTimeout(()=>navigate(path),160)}

  return <div className="page agents-registry-page">
    <div className="registry-head"><div><small>N.O.R.M. // PERSONNEL REGISTRY</small><h1 className="page-title">РЕЕСТР ПОЛЕВЫХ СОТРУДНИКОВ</h1></div><div className="registry-head__count">ЗАПИСЕЙ: {agents.length}<br/>АКТИВНЫХ: 2<br/>ACCESS: A-{progress.clearance}</div></div>
    {progress.clearance>=2&&<button type="button" className="agent-registry-anomaly" onClick={()=>selectAgent(agents.find(agent=>agent.id==='00'))}><span>⚠</span><b>РЕЕСТР СОДЕРЖИТ {progress.clearance>=3?'ОДНУ НЕВОЗМОЖНУЮ':'НЕИНДЕКСИРОВАННУЮ'} ЗАПИСЬ</b><small>AG-00 // нажмите для проверки</small></button>}
    <div className="registry-filters" role="group" aria-label="Фильтр агентов">{filters.map(([id,label])=><button type="button" className={filter===id?'active':''} onClick={()=>changeFilter(id)} key={id}>{label}</button>)}</div>
    <div className="registry-grid">{visibleAgents.map((agent,index)=><button type="button" className={`registry-card registry-card--${agent.category} ${selected.id===agent.id?'is-selected':''}`} onClick={()=>selectAgent(agent)} style={{'--delay':`${index*70}ms`}} key={agent.code}><AgentPortrait agent={agent}/><div className="registry-card__copy"><small>{agent.code}</small><strong>{agent.name}</strong><span>{agent.status}</span><i>ДОПУСК: {agent.clearance}</i></div><em>ОТКРЫТЬ ДОСЬЕ →</em></button>)}</div>
    <section className={`agent-expanded agent-expanded--${selected.category}`} key={selected.id}>
      <div className="agent-expanded__rail"><small>ЛИЧНОЕ ДЕЛО</small><strong>{selected.code}</strong><span>{selected.status}</span></div>
      <div className="agent-expanded__photo"><AgentPortrait agent={selected} large/></div>
      <div className="agent-expanded__body">
        <div className="agent-expanded__title"><div><small>ИДЕНТИФИКАТОР</small><h2>{selected.name}</h2></div><div className={`agent-status-stamp agent-status-stamp--${selected.category}`}>{selected.status}</div></div>
        <dl><dt>КОД</dt><dd>{selected.code}</dd><dt>ДОПУСК</dt><dd>{selected.clearance}</dd><dt>ГРУППА</dt><dd>{selected.group}</dd><dt>СТАТУС</dt><dd>{selected.status}</dd></dl>
        <h3>СВЯЗАННЫЕ ЗАПИСИ</h3><ul>{selected.records.map(r=><li key={r}>{r}</li>)}</ul>
        <div className="agent-expanded__actions">{selected.actions.map(([path,label])=><button type="button" onClick={()=>follow(path)} key={`${path}-${label}`}>{label} →</button>)}</div>
        <div className="agent-expanded__note"><small>СЛУЖЕБНАЯ ПОМЕТКА</small><p>{selected.note}</p></div>
        {selected.category!=='active'&&<div className="agent-expanded__redactions" aria-hidden="true"><span/><span/><span/><span/></div>}
      </div>
    </section>
  </div>
}
