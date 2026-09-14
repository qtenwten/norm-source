import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Panel from '../components/Panel'
import GrimoirePlate from '../components/GrimoirePlate'
import { audio } from '../audio'
import { discover, getArgState, subscribeArg } from '../arg'

const materials = [
  { id:'EV-0048', type:'АУДИО', level:0, status:'ДОСТУПНО', description:'Восстановленный аудиофрагмент. На 00:17 присутствует низкочастотный импульс.', action:'/terminal', actionLabel:'АНАЛИЗИРОВАТЬ В ТЕРМИНАЛЕ' },
  { id:'EV-0051', type:'ФОТО', level:0, status:'ДОСТУПНО', description:'Полевой кадр группы LM. Метаданные частично повреждены.', action:'/cases/lm-005#media', actionLabel:'ОТКРЫТЬ МЕДИА ДЕЛА' },
  { id:'DOC-017', type:'СКАН', level:0, status:'ДОСТУПНО', description:'Архивный скан из Гримуара. Служебный слой обнаружен под основными чернилами.', action:'/grimoire', actionLabel:'ОТКРЫТЬ В ГРИМУАРЕ', plate:true },
  { id:'REC-009', type:'ВИДЕО', level:0, status:'ДОСТУПНО', description:'Фрагмент записи с полевого выезда. Последние 12 кадров не индексируются.', action:'/cases/lm-006#evidence', actionLabel:'СВЯЗАННЫЕ УЛИКИ' },
  { id:'EV-0064', type:'ОБЪЕКТ', level:0, status:'ДОСТУПНО', description:'Карточка объекта. Автоматическая корреляция с Гримуаром не подтверждена.', action:'/cases/lm-006#entity', actionLabel:'ОТКРЫТЬ ОБЪЕКТ' },
  { id:'LM005_POST', type:'ЖУРНАЛ', level:1, status:'ВОССТАНОВЛЕНО', discovery:'LM005_POST', description:'Постоперационный монитор LM-005. После официальной нейтрализации система продолжала фиксировать сигнал в 03:41.', terminalCommand:'cat /cases/lm-005/post_operation.log' },
  { id:'AG02_FRAGMENT', type:'ПЕРСОНАЛ', level:1, status:'НЕСООТВЕТСТВИЕ', discovery:'AG02_FRAGMENT', description:'Фрагмент карточки AG-02. Сотрудник отсутствует в основном реестре, однако запись автоматически восстанавливается.', terminalCommand:'cat /restricted/ag-02.log' },
  { id:'NORM0_ORIGIN', type:'BLACK FILE', level:2, status:'НЕВОЗМОЖНАЯ ДАТИРОВКА', discovery:'NORM0_ORIGIN', description:'Запись первого входа NORM-0 датирована 18.11.1987 — до существования текущей NORM-OS.', terminalCommand:'cat /black/norm0_origin.log', black:true },
  { id:'BLACK_FINAL', type:'BLACK FILE', level:3, status:'НЕ ИНДЕКСИРУЕТСЯ', discovery:'BLACK_FINAL', description:'Файл не имеет владельца процесса и указывает на скрытые системные пути NORM-OS.', terminalCommand:'cat /black/final.txt', black:true },
  { id:'SYS_MOUNT_MAP', type:'SYSTEM MAP', level:3, status:'LEGACY DEVICE', discovery:'SYS_MOUNT_MAP_CARD', description:'Фрагмент таблицы монтирования. Указывает на устройство /dev/n0, отсутствующее в обычной навигации.', terminalCommand:'cat /etc/norm.conf', black:true },
  { id:'GHOST_PERSONNEL', type:'RECOVERED VOLUME', level:4, status:'3 DOSSIERS RESTORED', discovery:'GHOST_ARCHIVE_CARD', description:'Старый персональный том восстановил личные дела AG-04, AG-09 и AG-13, а также их архивные портреты.', action:'/ghost-registry', actionLabel:'ОТКРЫТЬ ВОССТАНОВЛЕННЫЙ РЕЕСТР', black:true },
  { id:'MIRROR_OBSERVER', type:'OBSERVER LAYER', level:5, status:'PRIVILEGED', discovery:'MIRROR_ARCHIVE_CARD', description:'Зеркальный узел содержит удалённые маршруты, снимок текущей ARG-сессии и коллекционный Observer Key.', action:'/mirror-node', actionLabel:'ОТКРЫТЬ MIRROR NODE', black:true },
]

const portals = [
  { level:1, code:'17-B', label:'ЗАКРЫТЫЙ СЕКТОР', path:'/restricted', detail:'Внутренние отчёты, восстановленные карточки, экспортируемые файлы' },
  { level:2, code:'BLACK', label:'ЧЁРНЫЙ АРХИВ', path:'/black', detail:'Неиндексируемые файлы, NORM-0, повреждённые записи персонала' },
  { level:3, code:'ROOT', label:'КОРНЕВОЕ ХРАНИЛИЩЕ', path:'/vault', detail:'Системные подсказки, legacy mount и путь за пределы архива' },
  { level:4, code:'GHOST', label:'ВОССТАНОВЛЕННЫЙ РЕЕСТР', path:'/ghost-registry', detail:'Пропавшие сотрудники, архивные портреты и три фрагмента ключа' },
  { level:5, code:'MIRROR', label:'ЗЕРКАЛЬНЫЙ УЗЕЛ', path:'/mirror-node', detail:'Удалённые маршруты, Observer Key и снимок всей сессии' },
]

export default function Archive(){
  const [selected,setSelected]=useState(null)
  const [progress,setProgress]=useState(getArgState)
  const navigate=useNavigate()

  useEffect(()=>subscribeArg(setProgress),[])
  const unlockedCount=useMemo(()=>materials.filter(item=>item.level<=progress.clearance).length,[progress.clearance])

  const open=(item)=>{
    const locked=progress.clearance<item.level
    setSelected({...item,locked})
    if(locked){audio.glitch();return}
    if(item.discovery) discover(item.discovery)
    audio.archive()
  }

  const close=()=>{ audio.click(); setSelected(null) }
  const follow=(item)=>{
    if(item.terminalCommand){sessionStorage.setItem('norm-terminal-prefill',item.terminalCommand);audio.transition('terminal');window.setTimeout(()=>navigate('/terminal'),180);return}
    if(!item?.action) return
    audio.transition(item.action.startsWith('/grimoire')?'grimoire':item.action.startsWith('/terminal')?'terminal':item.action.startsWith('/ghost')||item.action.startsWith('/mirror')?'archive':'case')
    window.setTimeout(()=>navigate(item.action),180)
  }

  const status = progress.clearance===0?'ОТКРЫТ ТОЛЬКО ПУБЛИЧНЫЙ СЛОЙ':progress.clearance===1?'RESTRICTED NODE РАЗБЛОКИРОВАН':progress.clearance===2?'BLACK NODE ОБНАРУЖЕН':progress.clearance===3?'ROOT STORAGE // ИЩИТЕ СИСТЕМНЫЕ ПУТИ':progress.clearance===4?'GHOSTFS // ПЕРСОНАЛ ВОССТАНОВЛЕН':'MIRROR NODE // OBSERVER ACCESS'

  return <div className="page archive-page-v4 archive-page--arg">
    <div className="archive-head-v4"><div><small>N.O.R.M. // MATERIAL STORAGE</small><h1 className="page-title">АРХИВ МАТЕРИАЛОВ</h1></div><span>INDEXED: {materials.length}<br/>VISIBLE: {unlockedCount}<br/>ACCESS: A-{progress.clearance}</span></div>
    <div className="archive-arg-notice"><div><small>ПОЛИТИКА ДОСТУПА 17-B</small><b>{status}</b></div><button type="button" onClick={()=>navigate('/terminal')}>ОТКРЫТЬ FIELD TERMINAL →</button></div>

    <section className="archive-portals" aria-label="Секторы по уровню допуска">
      {portals.map((portal)=>{const unlocked=progress.clearance>=portal.level;return <button type="button" key={portal.code} className={unlocked?'is-unlocked':'is-locked'} onClick={()=>{if(unlocked){audio.archive();navigate(portal.path)}else{audio.glitch();navigate('/terminal')}}}><span>A-{portal.level}</span><b>{portal.code}</b><strong>{portal.label}</strong><small>{unlocked?portal.detail:`ТРЕБУЕТСЯ ДОПУСК A-${portal.level}`}</small><em>{unlocked?'ВОЙТИ В СЕКТОР →':'НЕДОСТУПНО'}</em></button>})}
    </section>

    <div className="archive-grid archive-grid--interactive">
      {materials.map((item,i)=>{const locked=progress.clearance<item.level;return <button type="button" className={`archive-card-button ${locked?'is-restricted is-locked':''} ${item.black?'is-black':''}`} onClick={()=>open(item)} key={`${item.id}-${i}`}><Panel title={`${locked?'██████':item.id} / ${item.type}`}><div className={`evidence-placeholder e${i} ${item.plate?'evidence-placeholder--plate':''}`}>{item.plate&&!locked ? <GrimoirePlate/> : <span>{locked?`ACCESS A-${item.level} REQUIRED`:item.status}</span>}</div><small>УРОВЕНЬ ДОСТУПА: A-{item.level}</small><em>{locked?'ЗАПРОСИТЬ ДОСТУП →':'ОТКРЫТЬ МАТЕРИАЛ →'}</em></Panel></button>})}
    </div>

    {selected&&<div className="archive-viewer" role="dialog" aria-modal="true" aria-label={`${selected.id} ${selected.type}`} onClick={close}><section className={`archive-viewer__panel ${selected.locked?'is-restricted':''} ${selected.black?'is-black':''}`} onClick={e=>e.stopPropagation()}><header><div><small>N.O.R.M. // ARCHIVE OBJECT</small><strong>{selected.locked?'██████':selected.id}</strong></div><button type="button" onClick={close}>×</button></header><div className="archive-viewer__body"><div className="archive-viewer__preview">{selected.plate&&!selected.locked?<GrimoirePlate/>:<div className="archive-signal-visual"><i/><i/><i/><span>{selected.locked?'ACCESS DENIED':selected.type}</span></div>}</div><div className="archive-viewer__meta"><span>{selected.type}</span><h2>{selected.locked?'ДОСТУП ОГРАНИЧЕН':selected.status}</h2><p>{selected.locked?`Материал существует, но текущая сессия имеет уровень A-${progress.clearance}. Требуется A-${selected.level}. Повышение допуска выполняется только через служебные механизмы NORM-OS.`:selected.description}</p><dl><dt>ACCESS</dt><dd>A-{selected.level}</dd><dt>INDEX</dt><dd>{selected.locked?'████████':selected.id}</dd><dt>CHECKSUM</dt><dd>{selected.locked?'████████':'OK / 97%'}</dd></dl>{!selected.locked&&(selected.action||selected.terminalCommand)&&<button type="button" onClick={()=>follow(selected)}>{selected.terminalCommand?'ОТКРЫТЬ В ТЕРМИНАЛЕ':selected.actionLabel} →</button>}{selected.locked&&<button type="button" className="danger" onClick={()=>{audio.glitch();sessionStorage.setItem('norm-terminal-prefill',`leads`);window.setTimeout(()=>navigate('/terminal'),150)}}>ИССЛЕДОВАТЬ ЧЕРЕЗ ТЕРМИНАЛ →</button>}</div></div></section></div>}
  </div>
}
