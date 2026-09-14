import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { audio } from '../audio'
import { discover, getArgState, subscribeArg } from '../arg'

function save(name, content, type='text/plain;charset=utf-8') {
  const blob=new Blob([content],{type})
  const url=URL.createObjectURL(blob)
  const a=document.createElement('a'); a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove()
  setTimeout(()=>URL.revokeObjectURL(url),1000)
}

export default function MirrorNode(){
  const navigate=useNavigate()
  const [progress,setProgress]=useState(getArgState)
  useEffect(()=>subscribeArg(setProgress),[])
  useEffect(()=>{if(progress.clearance>=5)discover('MIRROR_NODE_VISITED')},[progress.clearance])
  const operator=useMemo(()=>sessionStorage.getItem('norm-operator')||'GUEST',[])

  if(progress.clearance<5) return <div className="page mirror-node mirror-node--locked"><section className="clearance-denied"><small>N.O.R.M. // MIRROR NODE</small><strong>PRIVILEGE REQUIRED</strong><h1>ЗЕРКАЛЬНЫЙ УЗЕЛ</h1><p>Узел существует вне штатного индекса и принимает только привилегированный токен из восстановленного персонального тома.</p><div><span>ROOT ACCESS</span><span>TOKEN REQUIRED</span><span>ACCESS A-5</span></div><button type="button" onClick={()=>navigate('/terminal')}>ВЕРНУТЬСЯ В ТЕРМИНАЛ →</button></section></div>

  const downloadKey=()=>{
    const payload=`N.O.R.M. OBSERVER KEY\nSESSION=${operator}\nACCESS=A-5\nISSUED=${new Date().toISOString()}\nNODE=MIRROR\nTOKEN=OBSERVER-${btoa(operator).replace(/=/g,'').slice(0,12).toUpperCase()}\n\nThis is an ARG collectible and grants no real-world access.\n`
    save('NORM_OBSERVER_KEY.normkey',payload); discover('DOWNLOAD_OBSERVER_KEY'); audio.confirm()
  }
  const downloadSnapshot=()=>{
    const data={system:'NORM-OS',node:'MIRROR',observer:operator,access:'A-5',generated:new Date().toISOString(),discoveries:progress.discoveries,continuity:{currentFieldUnit:'LM',publicCases:['LM-005','LM-006'],historicalInternal:['NO-17','AR-31','IMG-13']},note:'Historical internal records expand N.O.R.M. lore and do not replace the documented events of current LM cases.'}
    save('MIRROR_NODE_SNAPSHOT.json',JSON.stringify(data,null,2),'application/json;charset=utf-8'); discover('DOWNLOAD_MIRROR_SNAPSHOT'); audio.archive()
  }
  const downloadManifest=()=>{
    save('DELETED_PATHS_MANIFEST.txt',`MIRROR NODE // DELETED PATHS\n\n/restored/personnel/AG-04\n/restored/personnel/AG-09\n/restored/personnel/AG-13\n/deleted/cases/NO-17\n/deleted/cases/AR-31\n/deleted/cases/IMG-13\n/system/process/NORM-0\n\nRULE:\nThe visible archive is not the whole archive.\nDeletion only removes a route, not necessarily the record.\n`);discover('DOWNLOAD_DELETED_MANIFEST');audio.drawer()
  }

  return <div className="page mirror-node">
    <header className="mirror-head"><div><small>N.O.R.M. // MIRROR NODE // OBSERVER LAYER</small><h1>ЗЕРКАЛЬНЫЙ УЗЕЛ</h1><p>Глубочайший реализованный слой базы. Здесь отображаются записи, которые были удалены из обычной навигации, но сохранились в истории миграций.</p></div><div className="mirror-head__badge"><span>OBSERVER</span><b>{operator}</b><small>ACCESS A-5 // ROOT MIRROR</small></div></header>

    <div className="mirror-processes">
      <article><small>PID 0000</small><b>NORM-0</b><span>state: watching</span><em>owner: none</em></article>
      <article><small>MOUNT</small><b>/mnt/ghost</b><span>state: recovered</span><em>3 personnel records</em></article>
      <article><small>FIELD UNIT</small><b>LM</b><span>state: active</span><em>current public layer</em></article>
      <article><small>OBSERVER</small><b>{operator}</b><span>state: registered</span><em>session not in personnel table</em></article>
    </div>

    <section className="mirror-console">
      <div className="mirror-console__map"><small>INTERNAL ROUTE MAP</small><pre>{`/\n├─ archive/        [PUBLIC]\n├─ restricted/     [A-1]\n├─ black/          [A-2]\n├─ vault/          [A-3]\n├─ mnt/ghost/      [A-4]\n└─ mirror/         [A-5]\n   ├─ personnel.continuity\n   ├─ norm0.snapshot\n   └─ observer.key`}</pre></div>
      <div className="mirror-console__copy"><small>CONTINUITY NOTE</small><h2>СТАРЫЙ АРХИВ НЕ РАВЕН ТЕКУЩЕЙ ГРУППЕ LM</h2><p>Восстановленные сотрудники относятся к более ранним внутренним поколениям Н.О.Р.М. Современные дела LM-005 и LM-006 остаются документированными событиями «Ловцов мистики». Скрытый слой добавляет историю самой организации вокруг них.</p><p className="danger-copy">NORM-0 не числится ни сотрудником, ни программой. Идентификатор пережил каждую миграцию архива без исходного владельца.</p></div>
    </section>

    <div className="mirror-rewards"><article><small>КОЛЛЕКЦИОННЫЙ КЛЮЧ</small><h3>OBSERVER KEY</h3><p>Уникальный файл текущей сессии с ID оператора и временем прохождения.</p><button type="button" onClick={downloadKey}>⇩ СКАЧАТЬ .NORMKEY</button></article><article><small>СНИМОК СЕССИИ</small><h3>MIRROR SNAPSHOT</h3><p>JSON со списком найденных открытий и состоянием текущей ARG-сессии.</p><button type="button" onClick={downloadSnapshot}>⇩ СКАЧАТЬ JSON</button></article><article><small>УДАЛЁННЫЕ МАРШРУТЫ</small><h3>DELETED PATHS</h3><p>Манифест путей, которых нет в обычной навигации Н.О.Р.М.</p><button type="button" onClick={downloadManifest}>⇩ СКАЧАТЬ MANIFEST</button></article></div>

    <div className="mirror-actions"><button type="button" onClick={()=>{sessionStorage.setItem('norm-terminal-prefill','tree /mirror');navigate('/terminal')}}>ИССЛЕДОВАТЬ /mirror В ТЕРМИНАЛЕ →</button><button type="button" onClick={()=>navigate('/ghost-registry')}>ВЕРНУТЬСЯ К GHOSTFS →</button></div>
  </div>
}
