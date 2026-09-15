import { useMemo, useState } from 'react'
import { audio } from '../audio'
import { artifactRecords } from '../worldData'

function custodyFor(item) {
  const rows = []
  if (item.cases?.includes('LM-005')) rows.push(['LM-005','ВЫДАНО В ПОЛЕ','AG-SEN'],['LM-005','ВОЗВРАЩЕНО','STORAGE'])
  if (item.cases?.includes('LM-006')) rows.push(['LM-006','ВЫДАНО В ПОЛЕ','FIELD-LM'],['LM-006','ВОЗВРАЩЕНО','STORAGE'])
  if (item.cases?.some((id)=>['NO-17','AR-31','IMG-13'].includes(id))) rows.push(['LEGACY','ИЗВЛЕЧЕНО ИЗ GHOSTFS','ARCHIVE'])
  if (!rows.length) rows.push(['ARCHIVE','ПОСТАВЛЕНО НА УЧЁТ',item.custodian || 'UNKNOWN'])
  rows.push(['CURRENT','СТАТУС ПОДТВЕРЖДЁН',item.custodian || 'UNKNOWN'])
  return rows
}

function exportRecord(item) {
  const rows = custodyFor(item)
  const text = [`N.O.R.M. EQUIPMENT / OBJECT RECORD`,`ID: ${item.id}`,`NAME: ${item.name}`,`TYPE: ${item.type}`,`STATUS: ${item.status}`,`CUSTODIAN: ${item.custodian}`,`RISK: ${item.risk}`,'',item.summary,'','CUSTODY LOG:',...rows.map((r)=>`${r[0]} // ${r[1]} // ${r[2]}`),'','NOTES:',...(item.notes||[]).map((n)=>`- ${n}`)].join('\n')
  const blob = new Blob([text],{type:'text/plain;charset=utf-8'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href=url; a.download=`${item.id}.equipment.txt`; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000)
}

export default function EquipmentRegistry() {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(artifactRecords[0]?.id || null)
  const [filter, setFilter] = useState('ALL')

  const items = useMemo(() => artifactRecords.filter((item) => {
    const matchesFilter = filter==='ALL' || item.type===filter || item.risk===filter
    const hay = [item.id,item.name,item.type,item.status,item.custodian,item.risk,...(item.cases||[]),...(item.notes||[])].join(' ').toLowerCase()
    return matchesFilter && hay.includes(query.trim().toLowerCase())
  }), [query,filter])
  const selected = artifactRecords.find((item)=>item.id===selectedId) || items[0]
  const types = [...new Set(artifactRecords.map((item)=>item.type))]

  return <div className="page norm20-page equipment-page">
    <header className="norm20-hero">
      <div><small>N.O.R.M. // EQUIPMENT & EVIDENCE CONTROL</small><h1>РЕЕСТР ОБОРУДОВАНИЯ</h1><p>Приборы, улики и аномальные объекты с историей выдачи, хранения и связанных дел.</p></div>
      <div className="norm20-hero__status"><b>{artifactRecords.length}</b><span>ЗАПИСЕЙ</span><span>CHAIN OF CUSTODY</span></div>
    </header>

    <div className="equipment-toolbar"><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="ID, предмет, дело, хранитель…"/><select value={filter} onChange={(e)=>setFilter(e.target.value)}><option>ALL</option>{types.map((type)=><option key={type}>{type}</option>)}<option>LOW</option><option>MEDIUM</option><option>HIGH</option></select></div>

    <div className="equipment-layout">
      <section className="equipment-grid">{items.map((item)=><button type="button" key={item.id} className={selected?.id===item.id?'active':''} onClick={()=>{setSelectedId(item.id);audio.archive()}}><header><small>{item.id}</small><b>{item.risk}</b></header><h3>{item.name}</h3><p>{item.type}</p><dl><dt>СТАТУС</dt><dd>{item.status}</dd><dt>ХРАНИТЕЛЬ</dt><dd>{item.custodian}</dd></dl><footer>{item.cases?.map((id)=><span key={id}>{id}</span>)}</footer></button>)}</section>

      <aside className="equipment-inspector">{selected ? <>
        <small>OBJECT / EQUIPMENT DOSSIER</small><h2>{selected.name}</h2><div className="equipment-id">{selected.id}</div><p>{selected.summary}</p>
        <div className="equipment-badges"><span>{selected.type}</span><span>{selected.status}</span><span>RISK {selected.risk}</span></div>
        <h3>CHAIN OF CUSTODY</h3><ol className="custody-log">{custodyFor(selected).map((row,index)=><li key={`${row[0]}-${index}`}><time>{row[0]}</time><b>{row[1]}</b><span>{row[2]}</span></li>)}</ol>
        <h3>СЛУЖЕБНЫЕ ЗАМЕТКИ</h3><ul>{selected.notes?.map((note)=><li key={note}>{note}</li>)}</ul>
        <button type="button" className="investigation-primary" onClick={()=>{exportRecord(selected);audio.confirm()}}>ВЫГРУЗИТЬ КАРТОЧКУ ↓</button>
      </> : <div className="equipment-empty">НЕТ ЗАПИСЕЙ ПО ФИЛЬТРУ</div>}</aside>
    </div>
  </div>
}
