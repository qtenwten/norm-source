import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getArgState, subscribeArg } from '../arg'
import { audio } from '../audio'
import { getSystemEventState, getUnreadSystemEvents, markSystemEventRead, subscribeSystemEvents, syncSystemEvents } from '../systemEvents'

const tools = [
  ['/desk','ДОСКА'],
  ['/forensics','FORENSICS'],
  ['/mail','ПОЧТА'],
  ['/equipment','ОБОРУДОВАНИЕ'],
]

export default function SystemEventDaemon() {
  const navigate = useNavigate()
  const [arg, setArg] = useState(getArgState)
  const [events, setEvents] = useState(getSystemEventState)
  const [open, setOpen] = useState(false)

  useEffect(() => subscribeArg(setArg), [])
  useEffect(() => subscribeSystemEvents(setEvents), [])
  useEffect(() => {
    syncSystemEvents(arg)
    const timer = window.setInterval(() => syncSystemEvents(getArgState()), 2000)
    return () => window.clearInterval(timer)
  }, [arg])

  const unread = useMemo(() => getUnreadSystemEvents(events), [events])
  const latest = unread[unread.length - 1]

  useEffect(() => {
    if (!latest) return
    audio.glitch()
  }, [latest?.id])

  const acknowledge = () => {
    if (!latest) return
    markSystemEventRead(latest.id)
    if (latest.mail) navigate('/mail')
  }

  return <>
    <div className={`norm20-dock ${open ? 'is-open' : ''}`}>
      <button type="button" className="norm20-dock__toggle" onClick={() => setOpen((value) => !value)}>
        <span>NORM//OPS</span><b>{unread.length || '•'}</b>
      </button>
      <div className="norm20-dock__panel">
        <small>ОПЕРАТИВНЫЕ ИНСТРУМЕНТЫ</small>
        {tools.map(([route,label]) => <button key={route} type="button" onClick={() => { setOpen(false); audio.nav(); navigate(route) }}>{label}<span>↗</span></button>)}
      </div>
    </div>
    {latest && <button type="button" className={`norm20-system-toast tone-${latest.tone || 'normal'}`} onClick={acknowledge}>
      <small>NORM-OS // LIVE EVENT</small>
      <strong>{latest.text}</strong>
      <span>{latest.mail ? 'ОТКРЫТЬ СООБЩЕНИЕ →' : 'ПОДТВЕРДИТЬ'}</span>
    </button>}
  </>
}
