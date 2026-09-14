import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Panel from '../components/Panel'
import GrimoirePlate from '../components/GrimoirePlate'
import { audio } from '../audio'

const materials = [
  { id:'EV-0048', type:'АУДИО', access:'0', status:'ДОСТУПНО', description:'Восстановленный аудиофрагмент. На 00:17 присутствует низкочастотный импульс.', action:'/terminal', actionLabel:'АНАЛИЗИРОВАТЬ В ТЕРМИНАЛЕ' },
  { id:'EV-0051', type:'ФОТО', access:'0', status:'ДОСТУПНО', description:'Полевой кадр группы LM. Метаданные частично повреждены.', action:'/cases/lm-006#media', actionLabel:'ОТКРЫТЬ МЕДИА ДЕЛА' },
  { id:'DOC-017', type:'СКАН', access:'0', status:'ДОСТУПНО', description:'Архивный скан из Гримуара. Служебный слой обнаружен под основными чернилами.', action:'/grimoire', actionLabel:'ОТКРЫТЬ В ГРИМУАРЕ', plate:true },
  { id:'REC-009', type:'ВИДЕО', access:'0', status:'ДОСТУПНО', description:'Фрагмент записи с полевого выезда. Последние 12 кадров не индексируются.', action:'/cases/lm-006#evidence', actionLabel:'СВЯЗАННЫЕ УЛИКИ' },
  { id:'██████', type:'ИЗЪЯТО', access:'███', status:'ДОКУМЕНТ ИЗЪЯТ', description:'Материал физически присутствует в индексе, но содержимое заменено служебной заглушкой.', restricted:true },
  { id:'EV-0064', type:'ОБЪЕКТ', access:'0', status:'ДОСТУПНО', description:'Карточка объекта. Автоматическая корреляция с P-017 не подтверждена.', action:'/cases/lm-006#entity', actionLabel:'ОТКРЫТЬ ОБЪЕКТ' },
]

export default function Archive(){
  const [selected,setSelected]=useState(null)
  const navigate=useNavigate()

  const open=(item)=>{
    setSelected(item)
    item.restricted ? audio.glitch() : audio.archive()
  }

  const close=()=>{ audio.click(); setSelected(null) }
  const follow=(item)=>{
    if(!item?.action) return
    audio.transition(item.action.startsWith('/grimoire')?'grimoire':item.action.startsWith('/terminal')?'terminal':'case')
    window.setTimeout(()=>navigate(item.action),180)
  }

  return <div className="page archive-page-v4">
    <div className="archive-head-v4"><div><small>N.O.R.M. // MATERIAL STORAGE</small><h1 className="page-title">АРХИВ МАТЕРИАЛОВ</h1></div><span>INDEXED: 6<br/>RESTRICTED: 1</span></div>
    <div className="archive-grid archive-grid--interactive">
      {materials.map((item,i)=><button type="button" className={`archive-card-button ${item.restricted?'is-restricted':''}`} onClick={()=>open(item)} key={`${item.id}-${i}`}>
        <Panel title={`${item.id} / ${item.type}`}>
          <div className={`evidence-placeholder e${i} ${item.plate?'evidence-placeholder--plate':''}`}>
            {item.plate ? <GrimoirePlate/> : <span>{item.status}</span>}
          </div>
          <small>УРОВЕНЬ ДОСТУПА: {item.access}</small>
          <em>ОТКРЫТЬ МАТЕРИАЛ →</em>
        </Panel>
      </button>)}
    </div>

    {selected&&<div className="archive-viewer" role="dialog" aria-modal="true" aria-label={`${selected.id} ${selected.type}`} onClick={close}>
      <section className={`archive-viewer__panel ${selected.restricted?'is-restricted':''}`} onClick={e=>e.stopPropagation()}>
        <header><div><small>N.O.R.M. // ARCHIVE OBJECT</small><strong>{selected.id}</strong></div><button type="button" onClick={close}>×</button></header>
        <div className="archive-viewer__body">
          <div className="archive-viewer__preview">
            {selected.plate?<GrimoirePlate/>:<div className="archive-signal-visual"><i/><i/><i/><span>{selected.restricted?'ACCESS DENIED':selected.type}</span></div>}
          </div>
          <div className="archive-viewer__meta">
            <span>{selected.type}</span><h2>{selected.status}</h2><p>{selected.description}</p>
            <dl><dt>ACCESS</dt><dd>{selected.access}</dd><dt>INDEX</dt><dd>{selected.id}</dd><dt>CHECKSUM</dt><dd>{selected.restricted?'████████':'OK / 97%'}</dd></dl>
            {selected.action&&<button type="button" onClick={()=>follow(selected)}>{selected.actionLabel} →</button>}
            {selected.restricted&&<button type="button" className="danger" onClick={()=>{audio.glitch();setSelected({...selected,description:'ПОВТОРНЫЙ ЗАПРОС ОТКЛОНЁН. СОБЫТИЕ ЗАПИСАНО В ЖУРНАЛ.'})}}>ПОВТОРИТЬ ЗАПРОС</button>}
          </div>
        </div>
      </section>
    </div>}
  </div>
}
