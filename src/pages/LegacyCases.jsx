import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { audio } from '../audio'
import { discover, getArgState, subscribeArg } from '../arg'
import { findVirtualFile, recoveredAgents, renderFileContent } from '../argKernel'

const cases = [
  {
    id:'NO-17', title:'ПУСТАЯ ЧАСТОТА', date:'12.02.2004', className:'СИГНАЛЬНАЯ АНОМАЛИЯ', agent:'04',
    status:'НЕ ЗАКРЫТО',
    summary:'Исторический технический выезд Н.О.Р.М. на законсервированный ретранслятор. Во время одиннадцатиминутного разрыва связи исчез инженер AG-04. После исчезновения его позывной продолжал выходить в эфир.',
    findings:['Несущая 31 Гц появляется до первого сообщения группы.','Позывной AG-04 передан через 11 минут после потери связи.','Голосовое сходство с Вороновым — 94%, но источник не локализован.','Тело и личный передатчик не обнаружены.'],
    files:['/mnt/ghost/cases/no-17/brief.log','/mnt/ghost/cases/no-17/spectrum.csv','/mnt/ghost/cases/no-17/transcript.txt'],
  },
  {
    id:'AR-31', title:'ПЕПЕЛЬНЫЙ ИНДЕКС', date:'21.10.2009', className:'АРХИВНАЯ АНОМАЛИЯ', agent:'09',
    status:'ОФИЦИАЛЬНО ЗАКРЫТО',
    summary:'Пожар старого архивного узла уничтожил значительную часть бумажного фонда. AG-09 объявлена погибшей. Через 19 месяцев её ключ снова прошёл авторизацию и открыл материалы дела NO-17.',
    findings:['Биологического подтверждения личности погибшей в восстановленном деле нет.','Терминал №03 шёл на 11 минут впереди контроллера здания.','Посмертная сессия AG-09 длилась 46 секунд.','Последняя команда: «не верьте времени файла».'],
    files:['/mnt/ghost/cases/ar-31/brief.log','/mnt/ghost/cases/ar-31/fire_report.txt','/mnt/ghost/cases/ar-31/auth_trace.log'],
  },
  {
    id:'IMG-13', title:'ЧЕТВЁРТЫЙ КАДР', date:'30.05—03.06.2013', className:'ВИЗУАЛЬНАЯ АНОМАЛИЯ', agent:'13',
    status:'МАТЕРИАЛЫ УДАЛЕНЫ',
    summary:'AG-13 снимал законсервированный коридор, связанный с AR-31. В каталоге осталось три изображения, но камера зарегистрировала четвёртый кадр. Через четыре дня оператор погиб в ДТП.',
    findings:['Файл 0004 отсутствует, но его метаданные сохранились.','Время индексации кадра отстаёт от съёмки на 11 минут.','После смерти AG-13 система трижды сопоставила его лицо с кэшем отсутствующего кадра.','После третьего совпадения карточка сотрудника была удалена неизвестным процессом.'],
    files:['/mnt/ghost/cases/img-13/brief.log','/mnt/ghost/cases/img-13/frame_04.meta','/mnt/ghost/cases/img-13/facematch.log'],
  },
]

function saveVirtualFile(path) {
  const file=findVirtualFile(path,'/')
  if(!file) return false
  const body=renderFileContent(file).join('\n')
  const ext=path.split('.').pop() || 'txt'
  const blob=new Blob([body],{type:'text/plain;charset=utf-8'})
  const url=URL.createObjectURL(blob)
  const anchor=document.createElement('a')
  anchor.href=url
  anchor.download=`NORM_${file.id}.${ext}`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(()=>URL.revokeObjectURL(url),1000)
  discover(`DOWNLOAD_${file.id}`)
  return true
}

export default function LegacyCases(){
  const navigate=useNavigate()
  const [progress,setProgress]=useState(getArgState)
  const [selectedId,setSelectedId]=useState('NO-17')
  const [preview,setPreview]=useState(null)
  useEffect(()=>subscribeArg(setProgress),[])

  const recovered=useMemo(()=>['GHOST_AG04','GHOST_AG09','GHOST_AG13'].every(id=>progress.discoveries.includes(id)),[progress.discoveries])
  const selected=cases.find(item=>item.id===selectedId) || cases[0]
  const agent=recoveredAgents.find(item=>item.id===selected.agent)
  const downloaded=selected.files.filter(path=>{const f=findVirtualFile(path,'/');return f&&progress.discoveries.includes(`DOWNLOAD_${f.id}`)}).length
  const allEvidence=cases.flatMap(item=>item.files).every(path=>{const f=findVirtualFile(path,'/');return f&&progress.discoveries.includes(`DOWNLOAD_${f.id}`)})

  useEffect(()=>{if(recovered&&progress.clearance>=4) discover('LEGACY_CASES_VISITED')},[recovered,progress.clearance])
  useEffect(()=>{if(allEvidence) discover('LEGACY_EVIDENCE_COMPLETE')},[allEvidence])

  if(progress.clearance<4 || !recovered){
    return <div className="page legacy-cases legacy-cases--locked"><section className="clearance-denied"><small>N.O.R.M. // ORPHANED CASE ROUTE</small><strong>INDEX INCOMPLETE</strong><h1>ВОССТАНОВЛЕННЫЕ ДЕЛА</h1><p>Маршрут существует, но система не может связать дела с персоналом. Сначала восстановите личные дела AG-04, AG-09 и AG-13 в GHOSTFS.</p><div><span>3 PERSONNEL FILES REQUIRED</span><span>GHOSTFS REQUIRED</span><span>ACCESS A-4</span></div><button type="button" onClick={()=>navigate('/terminal')}>FIELD TERMINAL →</button></section></div>
  }

  const openFile=(path)=>{
    const file=findVirtualFile(path,'/')
    if(!file) return
    discover(file.discovery || `OPEN_${file.id}`)
    setPreview(file)
    audio.archive()
  }
  const download=(path)=>{ if(saveVirtualFile(path)) audio.drawer() }
  const openTerminal=(path)=>{sessionStorage.setItem('norm-terminal-prefill',`cat ${path}`);navigate('/terminal')}

  return <div className="page legacy-cases">
    <header className="legacy-head"><div><small>N.O.R.M. // GHOSTFS // ORPHANED CASE TABLE</small><h1>ВОССТАНОВЛЕННЫЕ ДЕЛА</h1><p>Три внутренних расследования старых подразделений Н.О.Р.М. Они не являются публичными выпусками группы LM и не заменяют события LM-005/LM-006 — это скрытая история самой организации.</p></div><div className="legacy-head__badge"><span>ROUTE</span><b>/legacy-cases</b><small>RECOVERED FROM ORPHANED BLOCKS</small></div></header>

    <div className="legacy-linkage"><span>AG-04</span><i>NO-17</i><b>→</b><span>AG-09</span><i>AR-31</i><b>→</b><span>AG-13</span><i>IMG-13</i><em>COMMON OFFSET: 00:11:00</em></div>

    <div className="legacy-case-tabs">{cases.map(item=><button type="button" key={item.id} className={selectedId===item.id?'is-active':''} onClick={()=>{setSelectedId(item.id);audio.tab()}}><small>{item.id}</small><strong>{item.title}</strong><span>{item.date}</span></button>)}</div>

    <section className="legacy-dossier" key={selected.id}>
      <aside className="legacy-personnel"><div className="legacy-personnel__photo"><img src={agent.image} alt={agent.name} draggable="false"/></div><small>СВЯЗАННЫЙ СОТРУДНИК</small><h2>{agent.name}</h2><p>{agent.code} // {agent.role}</p><button type="button" onClick={()=>navigate('/ghost-registry')}>ОТКРЫТЬ ЛИЧНОЕ ДЕЛО →</button></aside>
      <div className="legacy-dossier__body"><div className="legacy-dossier__title"><div><small>{selected.id} // {selected.className}</small><h2>{selected.title}</h2><p>{selected.summary}</p></div><span>{selected.status}</span></div>
        <div className="legacy-findings"><h3>ВОССТАНОВЛЕННЫЕ НАБЛЮДЕНИЯ</h3>{selected.findings.map((item,index)=><article key={item}><span>{String(index+1).padStart(2,'0')}</span><p>{item}</p></article>)}</div>
        <div className="legacy-files"><div className="legacy-files__head"><div><small>CASE FILESYSTEM</small><b>{downloaded} / {selected.files.length} ЭКСПОРТИРОВАНО</b></div><button type="button" onClick={()=>openTerminal(`/mnt/ghost/cases/${selected.id.toLowerCase()}`)}>ОТКРЫТЬ КАТАЛОГ В ТЕРМИНАЛЕ →</button></div>{selected.files.map(path=>{const file=findVirtualFile(path,'/');return <article key={path}><div><small>{file?.id}</small><code>{path}</code></div><button type="button" onClick={()=>openFile(path)}>ПРОСМОТР</button><button type="button" onClick={()=>download(path)}>⇩ СКАЧАТЬ</button></article>})}</div>
      </div>
    </section>

    <section className={`legacy-correlation ${allEvidence?'is-complete':''}`}><div><small>CROSS-CASE CORRELATION</small><h2>{allEvidence?'ПАКЕТ СОПОСТАВЛЕНИЯ СОБРАН':'ЕЩЁ НЕ ВСЕ МАТЕРИАЛЫ ВЫНЕСЕНЫ ИЗ СИСТЕМЫ'}</h2><p>{allEvidence?'Во всех трёх делах повторяется одиннадцатиминутное смещение, а операции закрытия или удаления связаны с NORM-0. Это не доказывает, что NORM-0 является причиной событий — только то, что он присутствовал в их цифровой истории.':'Скачайте все девять файлов трёх дел. После этого NORM-OS сформирует отдельный корреляционный трофей текущей сессии.'}</p></div>{allEvidence?<button type="button" onClick={()=>{const text=`N.O.R.M. // LEGACY CORRELATION PACK\n\nNO-17  -> OFFSET 00:11:00 -> AG-04 missing\nAR-31  -> CLOCK +00:11:00 -> AG-09 posthumous auth\nIMG-13 -> INDEX +00:11:00 -> AG-13 posthumous face match\n\nCOMMON DIGITAL WRITER: NORM-0 [UNVERIFIED]\n\nIMPORTANT:\nCorrelation does not establish causation. Historical cases predate the modern LM field group and expand the organisation's hidden archive only.\n`;const blob=new Blob([text],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='NORM_LEGACY_CORRELATION_PACK.txt';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);discover('DOWNLOAD_LEGACY_CORRELATION');audio.confirm()}}>⇩ СКАЧАТЬ CORRELATION PACK</button>:<button type="button" onClick={()=>navigate('/terminal')}>ИССЛЕДОВАТЬ ЧЕРЕЗ ТЕРМИНАЛ →</button>}</section>

    {preview&&<div className="classified-viewer" role="dialog" aria-modal="true" onClick={()=>setPreview(null)}><section onClick={event=>event.stopPropagation()}><header><div><small>GHOSTFS // CASE PREVIEW</small><b>{preview.id}</b></div><button type="button" onClick={()=>setPreview(null)}>×</button></header><pre>{renderFileContent(preview).join('\n')}</pre><footer><span>{preview.path}</span><button type="button" onClick={()=>download(preview.path)}>⇩ СКАЧАТЬ</button></footer></section></div>}
  </div>
}
