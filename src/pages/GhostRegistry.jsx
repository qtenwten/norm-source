import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { audio } from '../audio'
import { discover, getArgState, subscribeArg } from '../arg'
import { recoveredAgents } from '../argKernel'

function downloadText(agent) {
  const text = [
    'N.O.R.M. // GHOSTFS PERSONNEL RECOVERY',
    `FILE: ${agent.code}.dos`,
    `NAME: ${agent.name}`,
    `ROLE: ${agent.role}`,
    `SERVICE: ${agent.years}`,
    `STATUS: ${agent.status}`,
    `OFFICIAL: ${agent.official}`,
    `LAST TRACE: ${agent.last}`,
    `CASE: ${agent.caseId}`,
    '',
    'RECOVERED HISTORY:',
    ...agent.story.map((item, index)=>`${index+1}. ${item}`),
    '',
    `KEY FRAGMENT: ${agent.fragment}`,
    '',
    'SYSTEM NOTE:',
    'Фрагменты ключа собираются в порядке индекса персонала.',
    'Привилегированная команда требует не пароль, а собранный токен.',
  ].join('\n')
  const blob = new Blob([text], {type:'text/plain;charset=utf-8'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href=url; a.download=`${agent.code}_RECOVERED_DOSSIER.txt`; document.body.appendChild(a); a.click(); a.remove()
  setTimeout(()=>URL.revokeObjectURL(url),1000)
}

function downloadPortrait(agent) {
  const a=document.createElement('a')
  a.href=agent.image
  a.download=`${agent.code}_RECOVERED_PORTRAIT.svg`
  document.body.appendChild(a); a.click(); a.remove()
}

export default function GhostRegistry(){
  const navigate=useNavigate()
  const [progress,setProgress]=useState(getArgState)
  const [selected,setSelected]=useState(recoveredAgents[0])
  useEffect(()=>subscribeArg(setProgress),[])
  useEffect(()=>{ if(progress.clearance>=4) discover('GHOST_REGISTRY_VISITED') },[progress.clearance])

  if(progress.clearance<4) return <div className="page ghost-registry ghost-registry--locked"><section className="clearance-denied"><small>N.O.R.M. // GHOSTFS</small><strong>VOLUME NOT MOUNTED</strong><h1>ВОССТАНОВЛЕННЫЙ РЕЕСТР</h1><p>Эти записи физически отсутствуют в основном кадровом реестре. Найдите устройство, на котором сохранился старый персональный том.</p><div><span>DEVICE UNKNOWN</span><span>MOUNT REQUIRED</span><span>ACCESS A-4</span></div><button type="button" onClick={()=>navigate('/terminal')}>FIELD TERMINAL →</button></section></div>

  const openAgent=(agent)=>{setSelected(agent);discover(`GHOST_VIEW_${agent.id}`);audio.archive()}
  const saveDossier=(agent)=>{downloadText(agent);discover(`GHOST_DOWNLOAD_${agent.id}`);audio.drawer()}
  const savePortrait=(agent)=>{downloadPortrait(agent);discover(`GHOST_PHOTO_${agent.id}`);audio.photo()}

  return <div className="page ghost-registry">
    <header className="ghost-head"><div><small>N.O.R.M. // GHOSTFS // RECOVERED PERSONNEL</small><h1>ВОССТАНОВЛЕННЫЙ РЕЕСТР</h1><p>Карточки, удалённые из штатной базы. Исторические сотрудники не относятся к современной полевой группе LM; их записи расширяют внутреннюю историю Н.О.Р.М.</p></div><div className="ghost-head__badge"><span>MOUNT</span><b>/mnt/ghost</b><small>ACCESS A-4 VERIFIED</small></div></header>

    <div className="ghost-warning"><span>⚠</span><p>Даты, причины смерти и служебные статусы восстановлены из повреждённых внутренних журналов. Часть сведений противоречит официальным карточкам.</p></div>

    <div className="ghost-grid">
      {recoveredAgents.map((agent)=><button type="button" className={`ghost-agent-card ${selected.id===agent.id?'is-active':''}`} onClick={()=>openAgent(agent)} key={agent.code}>
        <div className="ghost-agent-card__photo"><img src={agent.image} alt={`Восстановленный архивный портрет ${agent.code}`} draggable="false"/></div>
        <div><small>{agent.code} // {agent.years}</small><strong>{agent.name}</strong><span>{agent.role}</span><em>{agent.official}</em></div>
      </button>)}
    </div>

    <section className="ghost-dossier" key={selected.id}>
      <div className="ghost-dossier__photo"><img src={selected.image} alt={selected.name} draggable="false"/></div>
      <div className="ghost-dossier__body">
        <div className="ghost-dossier__title"><div><small>{selected.code} // RECOVERED DOSSIER</small><h2>{selected.name}</h2><p>{selected.summary}</p></div><span>{selected.status}</span></div>
        <dl><dt>СЛУЖБА</dt><dd>{selected.years}</dd><dt>РОЛЬ</dt><dd>{selected.role}</dd><dt>ПОСЛЕДНИЙ СЛЕД</dt><dd>{selected.last}</dd><dt>ДЕЛО</dt><dd>{selected.caseId}</dd><dt>ОФИЦИАЛЬНО</dt><dd>{selected.official}</dd></dl>
        <div className="ghost-story">{selected.story.map((item,index)=><article key={item}><span>{String(index+1).padStart(2,'0')}</span><p>{item}</p></article>)}</div>
        <div className="ghost-dossier__actions"><button type="button" onClick={()=>saveDossier(selected)}>⇩ СКАЧАТЬ ЛИЧНОЕ ДЕЛО</button><button type="button" onClick={()=>savePortrait(selected)}>⇩ СКАЧАТЬ ФОТО</button><button type="button" onClick={()=>{sessionStorage.setItem('norm-terminal-prefill',`cat /mnt/ghost/personnel/${selected.code.toLowerCase()}.dos`);navigate('/terminal')}}>ОТКРЫТЬ В ТЕРМИНАЛЕ →</button></div>
        <div className="ghost-fragment"><small>RECOVERY CHECK</small><p>Внутри экспортируемого DOS-файла сохранён фрагмент привилегированного ключа. Три личных дела образуют один токен.</p></div>
      </div>
    </section>
  </div>
}
