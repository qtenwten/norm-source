import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { audio } from '../audio'

const agents = [
  { id:'sen', code:'AG-SEN', name:'СЕН', status:'АКТИВЕН', category:'active', clearance:'A-3', group:'LM', image:'/assets/host_duo_outdoor.png', position:'30%', records:['LM-001 — LM-006','FIELD MEDIA: ДОСТУПНО','ПОЛЕВАЯ ГРУППА: LM'], note:'Часть полей не синхронизирована с бумажным архивом.', actions:[['/cases/lm-006','ПОСЛЕДНЕЕ ДЕЛО'],['/archive','ПОЛЕВЫЕ МАТЕРИАЛЫ']] },
  { id:'grig', code:'AG-GRIG', name:'ГРИГ', status:'АКТИВЕН', category:'active', clearance:'A-3', group:'LM', image:'/assets/host_duo_outdoor.png', position:'74%', records:['LM-001 — LM-006','FIELD MEDIA: ДОСТУПНО','ПОЛЕВАЯ ГРУППА: LM'], note:'Часть полей не синхронизирована с бумажным архивом.', actions:[['/cases/lm-006','ПОСЛЕДНЕЕ ДЕЛО'],['/terminal','FIELD TERMINAL']] },
  { id:'04', code:'AG-04', name:'████████', status:'ДЕАКТИВИРОВАН', category:'archive', clearance:'B-2', group:'██', records:['ПОСЛЕДНЕЕ ДЕЛО: LM-0██','ПРОТОКОЛ 17-Б','ПОЛЕВЫЕ МАТЕРИАЛЫ: ИЗЪЯТЫ'], note:'Доступ прекращён административным решением. Причина скрыта уровнем допуска.', actions:[['/archive','ЗАПРОСИТЬ АРХИВ']] },
  { id:'09', code:'AG-09', name:'██████ █.', status:'УТРАЧЕН', category:'lost', clearance:'B-4', group:'██', records:['ПОСЛЕДНИЙ СИГНАЛ: --:--:--','ПОСЛЕДНЕЕ ДЕЛО: LM-0██','СТАТУС ПОИСКА: ЗАКРЫТ'], note:'В реестре отсутствует запись о завершении службы. Файл восстановлен частично.', actions:[['/terminal','ПОИСК ПО СИГНАЛУ']] },
  { id:'13', code:'AG-13', name:'НЕТ ДАННЫХ', status:'ФАЙЛ УДАЛЁН', category:'deleted', clearance:'████', group:'██', records:['КАРТОЧКА СОТРУДНИКА: НЕДОСТУПНА','БИОМЕТРИЯ: НЕТ ДАННЫХ','СВЯЗАННЫЕ ДЕЛА: ███████'], note:'Цифровая копия была удалена до создания текущей версии NORM-OS.', actions:[['/archive','ВОССТАНОВЛЕННЫЕ ФРАГМЕНТЫ']] },
  { id:'02', code:'AG-02', name:'НЕ ЧИСЛИТСЯ', status:'НЕСООТВЕТСТВИЕ РЕЕСТРУ', category:'anomaly', clearance:'?', group:'—', records:['ДАТА СОЗДАНИЯ: НЕДОСТУПНА','ИСТОЧНИК: UNKNOWN NODE','СВЯЗАННЫЕ ДЕЛА: 0'], note:'Система не находит сотрудника с таким номером, однако карточка появляется снова после удаления.', actions:[['/terminal','ОПРОСИТЬ UNKNOWN NODE']] },
]

const filters = [['all','ВСЕ'],['active','АКТИВНЫЕ'],['archive','ДЕАКТИВИРОВАННЫЕ'],['lost','УТРАЧЕННЫЕ'],['restricted','ЗАКРЫТЫЕ']]

function matchesFilter(agent, filter) {
  if (filter === 'all') return true
  if (filter === 'restricted') return ['deleted','anomaly'].includes(agent.category)
  return agent.category === filter
}

function AgentPortrait({ agent, large = false }) {
  if (!agent.image) return <div className={`registry-portrait registry-portrait--redacted ${large ? 'is-large' : ''}`} aria-label="Фото скрыто"><span>{agent.code}</span><i/><i/><i/></div>
  return <div className={`registry-portrait ${large ? 'is-large' : ''}`}><img src={agent.image} alt={agent.name} style={{objectPosition:`${agent.position} center`}}/><span className="registry-portrait__code">{agent.code}</span></div>
}

export default function Agents() {
  const navigate=useNavigate()
  const initialHash=typeof window!=='undefined'?window.location.hash.replace('#',''):''
  const [filter,setFilter]=useState('all')
  const [selectedId,setSelectedId]=useState(agents.some(a=>a.id===initialHash)?initialHash:'sen')
  const visibleAgents=useMemo(()=>agents.filter(a=>matchesFilter(a,filter)),[filter])
  const selected=agents.find(a=>a.id===selectedId)||agents[0]

  useEffect(()=>{
    const sync=()=>{
      const id=window.location.hash.replace('#','')
      if(agents.some(a=>a.id===id)) setSelectedId(id)
    }
    window.addEventListener('hashchange',sync)
    return()=>window.removeEventListener('hashchange',sync)
  },[])

  const selectAgent=(agent)=>{
    setSelectedId(agent.id)
    window.history.replaceState(null,'',`${window.location.pathname}#${agent.id}`)
    ['deleted','anomaly','lost'].includes(agent.category)?audio.glitch():audio.stamp()
  }
  const changeFilter=(next)=>{setFilter(next);audio.click()}
  const follow=(path)=>{audio.transition(path.startsWith('/terminal')?'terminal':path.startsWith('/archive')?'archive':'case');window.setTimeout(()=>navigate(path),160)}

  return <div className="page agents-registry-page">
    <div className="registry-head"><div><small>N.O.R.M. // PERSONNEL REGISTRY</small><h1 className="page-title">РЕЕСТР ПОЛЕВЫХ СОТРУДНИКОВ</h1></div><div className="registry-head__count">ЗАПИСЕЙ: {agents.length}<br/>АКТИВНЫХ: 2</div></div>
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
