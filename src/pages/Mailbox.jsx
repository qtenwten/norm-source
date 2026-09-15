import { useEffect, useMemo, useState } from 'react'
import { audio } from '../audio'
import { getArgState, subscribeArg } from '../arg'
import { getAvailableMail, getMailRead, markMailRead, subscribeMailRead } from '../mailState'
import { getDynamicMessages, getSystemEventState, markSystemEventRead, subscribeSystemEvents, SYSTEM_EVENTS } from '../systemEvents'

export default function Mailbox() {
  const [arg, setArg] = useState(getArgState)
  const [systemState, setSystemState] = useState(getSystemEventState)
  const [read, setRead] = useState(getMailRead)
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => subscribeArg(setArg), [])
  useEffect(() => subscribeSystemEvents(setSystemState), [])
  useEffect(() => subscribeMailRead(setRead), [])

  const liveMessages = useMemo(() => getDynamicMessages(systemState), [systemState])
  const available = useMemo(() => getAvailableMail(arg, systemState), [arg, systemState])
  const categories = useMemo(() => ({
    all: available,
    unread: available.filter((item) => !read.includes(item.id)),
    field: available.filter((item) => /AG-SEN|AG-GRIG|FIELD-LM/.test(`${item.from} ${item.to}`)),
    system: available.filter((item) => /NORM|SECURITY|SYSTEM|ROOT|CORRELATION|FACE-MATCH/.test(item.from)),
    legacy: available.filter((item) => /^MSG-(0|1)/.test(item.id) || item.tags?.some((tag) => ['AG-04','AG-09','AG-13','NO-17','IMG-13'].includes(tag))),
  }), [available,read])

  const list = (categories[category] || available).filter((item) => {
    const hay = [item.subject,item.from,item.to,...(item.tags||[]),...(item.body||[])].join(' ').toLowerCase()
    return hay.includes(query.trim().toLowerCase())
  })

  const open = (item) => {
    setSelected(item)
    if (!read.includes(item.id)) setRead(markMailRead(item.id))
    const sourceEvent = SYSTEM_EVENTS.find((event) => event.mail?.id === item.id)
    if (sourceEvent) markSystemEventRead(sourceEvent.id)
    audio.drawer()
  }

  const download = (item) => {
    const text = [`N.O.R.M. INTERNAL MAIL`,`ID: ${item.id}`,`DATE: ${item.date}`,`FROM: ${item.from}`,`TO: ${item.to}`,`SUBJECT: ${item.subject}`,'',...(item.body||[]),'',`TAGS: ${(item.tags||[]).join(', ')}`].join('\n')
    const blob = new Blob([text],{type:'text/plain;charset=utf-8'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download=`${item.id}.txt`; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000)
    audio.confirm()
  }

  return <div className="page norm20-page mail-page">
    <header className="norm20-hero">
      <div><small>N.O.R.M. // INTERNAL MAIL</small><h1>СЛУЖЕБНАЯ ПОЧТА</h1><p>Отдельный внутренний канал Н.О.Р.М. Письма могут появляться прямо во время текущей сессии после действий оператора.</p></div>
      <div className="norm20-hero__status"><b>{categories.unread.length}</b><span>НЕПРОЧИТАНО</span><span>{liveMessages.length} LIVE</span></div>
    </header>

    <div className="mail-layout">
      <aside className="mail-folders">
        <small>MAILBOX</small>
        {[['all','ВСЕ'],['unread','НЕПРОЧИТАННЫЕ'],['field','ПОЛЕВАЯ ГРУППА'],['system','СИСТЕМНЫЕ'],['legacy','АРХИВНЫЕ']].map(([id,label]) => <button key={id} type="button" className={category===id?'active':''} onClick={()=>{setCategory(id);audio.tab()}}><span>{label}</span><b>{(categories[id]||[]).length}</b></button>)}
        <div className="mail-folder-note"><b>ПРАВИЛО 17-B</b><p>Удалённое письмо не обязательно перестаёт существовать. Иногда оно просто теряет маршрут.</p></div>
      </aside>

      <section className="mail-list-pane">
        <div className="mail-search"><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="поиск по отправителю, делу, фразе…"/><span>{list.length}</span></div>
        <div className="mail-list">{list.map((item) => <button type="button" key={item.id} onClick={()=>open(item)} className={`${selected?.id===item.id?'active':''} ${read.includes(item.id)?'read':'unread'} ${item.id.startsWith('LIVE-')?'live':''}`}><i/><div><small>{item.from} → {item.to}</small><b>{item.subject}</b><span>{item.body?.[0]}</span></div><time>{item.date}</time></button>)}</div>
      </section>

      <article className="mail-reader-pane">
        {selected ? <>
          <header><small>{selected.id}</small><h2>{selected.subject}</h2><dl><dt>ОТ</dt><dd>{selected.from}</dd><dt>КОМУ</dt><dd>{selected.to}</dd><dt>ДАТА</dt><dd>{selected.date}</dd></dl></header>
          <div className="mail-reader-body">{selected.body.map((line,index)=><p key={index}>{line}</p>)}</div>
          <footer><div>{selected.tags?.map((tag)=><span key={tag}>{tag}</span>)}</div><button type="button" onClick={()=>download(selected)}>ЭКСПОРТ .TXT ↓</button></footer>
        </> : <div className="mail-empty"><b>ВЫБЕРИТЕ ПИСЬМО</b><p>Новые письма теперь отображаются отдельным индикатором в левом меню. Некоторые сообщения появляются только после событий в терминале.</p></div>}
      </article>
    </div>
  </div>
}
