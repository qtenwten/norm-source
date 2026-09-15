import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { audio } from '../audio'
import { getArgState, subscribeArg } from '../arg'
import { artifactRecords, correlationEdges, correlationNodes, journalEntries, mediaRecords, storyThreads } from '../worldData'

const TABS = [
  ['map','СВЯЗИ'],
  ['objects','ОБЪЕКТЫ'],
  ['media','МЕДИА'],
  ['journal','ЖУРНАЛ'],
]

const SEEN_KEY = 'norm-investigation-seen-v1'

function loadSeen() {
  try {
    const raw = JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

function saveSeen(ids) {
  localStorage.setItem(SEEN_KEY, JSON.stringify(ids))
}

function safeTab(hash) {
  const value = (hash || '').replace('#','')
  return TABS.some(([id]) => id === value) ? value : 'map'
}

function matches(record, query) {
  if (!query.trim()) return true
  const hay = Object.values(record).flatMap((value) => Array.isArray(value) ? value : [value]).filter((value) => typeof value === 'string').join(' ').toLowerCase()
  return hay.includes(query.trim().toLowerCase())
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type:'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function InvestigationHub() {
  const location = useLocation()
  const navigate = useNavigate()
  const [tab, setTab] = useState(() => safeTab(location.hash))
  const [query, setQuery] = useState('')
  const [arg, setArg] = useState(getArgState)
  const [seen, setSeen] = useState(loadSeen)
  const [selectedNode, setSelectedNode] = useState('norm0')
  const [selectedObject, setSelectedObject] = useState(null)
  const [selectedMedia, setSelectedMedia] = useState(null)

  useEffect(() => subscribeArg(setArg), [])
  useEffect(() => { audio.archive() }, [])
  useEffect(() => setTab(safeTab(location.hash)), [location.hash])

  const discoveries = useMemo(() => new Set(arg.discoveries), [arg.discoveries])
  const canOpen = (item) => (item.clearance || 0) <= arg.clearance
  const journalResolved = (entry) => canOpen(entry) && (entry.requires || []).every((item) => discoveries.has(item))

  const markSeen = (id) => {
    if (!id || seen.includes(id)) return
    const next = [...seen, id]
    setSeen(next)
    saveSeen(next)
  }

  const changeTab = (next) => {
    setTab(next)
    setQuery('')
    audio.tab()
    navigate(`/investigation#${next}`, { replace:true })
  }

  const openRoute = (route) => {
    if (!route) return
    audio.nav()
    navigate(route)
  }

  const visibleObjects = useMemo(() => artifactRecords.filter((item) => canOpen(item)).filter((item) => matches(item, query)), [arg.clearance, query])
  const visibleMedia = useMemo(() => mediaRecords.filter((item) => canOpen(item)).filter((item) => matches(item, query)), [arg.clearance, query])
  const currentNode = correlationNodes.find((item) => item.id === selectedNode) || correlationNodes[0]
  const connected = new Set(correlationEdges.filter(([a,b]) => a === selectedNode || b === selectedNode).flatMap(([a,b]) => [a,b]))
  const journalSolved = journalEntries.filter(journalResolved).length

  const openObject = (item) => {
    setSelectedObject(item)
    markSeen(item.id)
    audio.archive()
  }

  const openMedia = (item) => {
    setSelectedMedia(item)
    markSeen(item.id)
    audio.photo()
  }

  const downloadObject = (item) => {
    const body = [`N.O.R.M. OBJECT RECORD`, `ID: ${item.id}`, `NAME: ${item.name}`, `TYPE: ${item.type}`, `STATUS: ${item.status}`, `CUSTODIAN: ${item.custodian}`, `RISK: ${item.risk}`, `LINKED CASES: ${item.cases.join(', ')}`, '', item.summary, '', 'NOTES:', ...item.notes.map((note) => `- ${note}`)].join('\n')
    downloadText(`${item.id}.object.txt`, body)
    markSeen(item.id)
    audio.confirm()
  }

  const downloadMedia = (item) => {
    const body = [`N.O.R.M. MEDIA INDEX`, `ID: ${item.id}`, `TYPE: ${item.type}`, `CASE: ${item.caseId}`, `TITLE: ${item.title}`, '', item.note, ...(item.transcript ? ['', 'TRANSCRIPT:', ...item.transcript] : [])].join('\n')
    downloadText(`${item.id}.media.txt`, body)
    markSeen(item.id)
    audio.confirm()
  }

  return (
    <div className="page investigation-page">
      <header className="investigation-hero">
        <div>
          <small>N.O.R.M. // CORRELATION & REVIEW DESK</small>
          <h1>РАССЛЕДОВАТЕЛЬСКИЙ ЦЕНТР</h1>
          <p>Рабочее место для сопоставления дел, сотрудников, объектов и системных следов. Служебная переписка вынесена в отдельный канал «ПОЧТА» в левом меню.</p>
        </div>
        <div className="investigation-hero__stats">
          <span><b>A-{arg.clearance}</b>ДОПУСК</span>
          <span><b>{correlationNodes.length}</b>УЗЛОВ</span>
          <span><b>{journalSolved}/{journalEntries.length}</b>ВЫВОДЫ</span>
          <span><b>{seen.length}</b>ИЗУЧЕНО</span>
        </div>
      </header>

      <section className="story-thread-strip" aria-label="Основные линии расследования">
        {storyThreads.map((thread) => <article key={thread.id}><small>{thread.id}</small><b>{thread.title}</b><p>{thread.copy}</p><div>{thread.items.map((item) => <span key={item}>{item}</span>)}</div></article>)}
      </section>

      <nav className="investigation-tabs" aria-label="Разделы расследовательского центра">
        {TABS.map(([id,label]) => <button type="button" className={tab === id ? 'active' : ''} onClick={() => changeTab(id)} key={id}><span>{label}</span></button>)}
      </nav>

      {tab !== 'map' && <div className="investigation-search"><span>ПОИСК ПО ТЕКУЩЕМУ РАЗДЕЛУ</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="код, дело, агент, фраза…" /><button type="button" onClick={() => setQuery('')}>ОЧИСТИТЬ</button></div>}

      {tab === 'map' && (
        <section className="correlation-layout">
          <div className="correlation-canvas-wrap">
            <div className="correlation-canvas" role="img" aria-label="Карта связей Н.О.Р.М.">
              <svg viewBox="0 0 1000 620" preserveAspectRatio="none" aria-hidden="true">
                {correlationEdges.map(([a,b,label]) => {
                  const from = correlationNodes.find((node) => node.id === a)
                  const to = correlationNodes.find((node) => node.id === b)
                  if (!from || !to) return null
                  const active = selectedNode === a || selectedNode === b
                  return <g className={active ? 'active' : ''} key={`${a}-${b}`}><line x1={from.x * 10} y1={from.y * 6.2} x2={to.x * 10} y2={to.y * 6.2}/><text x={(from.x + to.x) * 5} y={(from.y + to.y) * 3.1 - 4}>{label}</text></g>
                })}
              </svg>
              {correlationNodes.map((node) => {
                const unlocked = canOpen(node)
                return <button type="button" key={node.id} style={{left:`${node.x}%`,top:`${node.y}%`}} className={`correlation-node correlation-node--${node.kind} ${selectedNode === node.id ? 'active' : ''} ${connected.has(node.id) ? 'connected' : ''} ${unlocked ? '' : 'locked'}`} onClick={() => { setSelectedNode(node.id); markSeen(`NODE:${node.id}`); audio.terminal() }}><small>{unlocked ? node.kind.toUpperCase() : `ACCESS A-${node.clearance}`}</small><strong>{unlocked ? node.title : '██████'}</strong><span>{unlocked ? node.subtitle : 'ЗАПИСЬ ЗАКРЫТА'}</span></button>
              })}
            </div>
          </div>
          <aside className="correlation-inspector">
            <small>ACTIVE CORRELATION NODE</small>
            {canOpen(currentNode) ? <><span className={`correlation-inspector__kind kind-${currentNode.kind}`}>{currentNode.kind}</span><h2>{currentNode.title}</h2><h3>{currentNode.subtitle}</h3><p>{currentNode.summary}</p><div className="correlation-links"><b>СВЯЗИ</b>{correlationEdges.filter(([a,b]) => a === currentNode.id || b === currentNode.id).map(([a,b,label]) => { const peer = correlationNodes.find((node) => node.id === (a === currentNode.id ? b : a)); return <button type="button" onClick={() => setSelectedNode(peer.id)} key={`${a}-${b}`}>{label}<span>{canOpen(peer) ? peer.title : `A-${peer.clearance} // LOCKED`}</span></button> })}</div>{currentNode.route && <button type="button" className="investigation-primary" onClick={() => openRoute(currentNode.route)}>ОТКРЫТЬ ИСХОДНУЮ ЗАПИСЬ →</button>}</> : <div className="investigation-locked-panel"><b>ДАННЫЕ ОГРАНИЧЕНЫ</b><p>Топология связи видна, содержимое узла требует допуска A-{currentNode.clearance}. Система намеренно не раскрывает подписи соседних закрытых записей.</p><button type="button" onClick={() => openRoute('/terminal')}>ПЕРЕЙТИ В ТЕРМИНАЛ →</button></div>}
          </aside>
        </section>
      )}

      {tab === 'objects' && (
        <section className="object-workbench">
          <div className="object-grid">{visibleObjects.map((item) => <button type="button" onClick={() => openObject(item)} key={item.id} className={selectedObject?.id === item.id ? 'active' : ''}><header><span>{item.id}</span><b className={`risk-${item.risk.toLowerCase().replace('?','unknown')}`}>{item.risk}</b></header><h3>{item.name}</h3><p>{item.type}</p><dl><dt>СТАТУС</dt><dd>{item.status}</dd><dt>ХРАНИТЕЛЬ</dt><dd>{item.custodian}</dd></dl><footer>{item.cases.map((caseId) => <span key={caseId}>{caseId}</span>)}</footer></button>)}</div>
          {selectedObject && <aside className="object-inspector"><small>OBJECT REGISTRY // {selectedObject.id}</small><h2>{selectedObject.name}</h2><p>{selectedObject.summary}</p><h3>СЛУЖЕБНЫЕ ЗАМЕТКИ</h3><ul>{selectedObject.notes.map((note) => <li key={note}>{note}</li>)}</ul><div className="object-inspector__cases">{selectedObject.cases.map((caseId) => <button type="button" onClick={() => openRoute(caseId === 'LM-005' ? '/cases/lm-005' : caseId === 'LM-006' ? '/cases/lm-006' : ['/NO-17','AR-31','IMG-13'].includes(`/${caseId}`) ? '/legacy-cases' : '/archive')} key={caseId}>СВЯЗАННОЕ ДЕЛО // {caseId}</button>)}</div><button type="button" className="investigation-primary" onClick={() => downloadObject(selectedObject)}>ВЫГРУЗИТЬ КАРТОЧКУ ↓</button></aside>}
        </section>
      )}

      {tab === 'media' && (
        <section className="media-vault-grid">{visibleMedia.map((item) => <button type="button" key={item.id} onClick={() => openMedia(item)} className={seen.includes(item.id) ? 'seen' : ''}>{item.src ? <img src={item.src} alt="" draggable="false" /> : <div className="media-vault-placeholder"><b>{item.type}</b><span>{item.transcript?.[0] || 'NO PREVIEW'}</span></div>}<div><small>{item.type} // {item.caseId}</small><strong>{item.title}</strong><p>{item.note}</p></div></button>)}</section>
      )}

      {tab === 'journal' && (
        <section className="journal-layout"><div className="journal-intro"><small>INVESTIGATION JOURNAL</small><h2>НЕ ЧЕК-ЛИСТ СЕКРЕТОВ</h2><p>Журнал фиксирует только то, что оператор уже может обосновать доступными материалами. Закрытые выводы не показывают решение заранее.</p><div><span><b>{journalSolved}</b>ОБОСНОВАНО</span><span><b>{journalEntries.length - journalSolved}</b>НЕ РАЗРЕШЕНО</span></div></div><div className="journal-entries">{journalEntries.filter((entry) => matches(entry, query)).map((entry) => { const unlocked = canOpen(entry); const resolved = journalResolved(entry); return <article className={`${resolved ? 'resolved' : ''} ${unlocked ? '' : 'locked'}`} key={entry.id}><header><small>{entry.id}</small><span>{resolved ? entry.status : unlocked ? 'ДАННЫХ НЕДОСТАТОЧНО' : `ACCESS A-${entry.clearance}`}</span></header><h3>{unlocked ? entry.title : '████████████████'}</h3><p>{resolved ? entry.body : unlocked ? 'Необходимые документы ещё не были обнаружены в текущей сессии.' : 'Вывод скрыт до повышения допуска.'}</p>{resolved && <footer>{entry.routes.map((route) => <button type="button" onClick={() => openRoute(route)} key={route}>ОТКРЫТЬ ИСТОЧНИК ↗</button>)}</footer>}</article> })}</div></section>
      )}

      {selectedMedia && (
        <div className="investigation-modal" role="dialog" aria-modal="true" onClick={() => setSelectedMedia(null)}><section onClick={(event) => event.stopPropagation()}><header><small>{selectedMedia.id} // {selectedMedia.type}</small><button type="button" onClick={() => setSelectedMedia(null)}>×</button></header>{selectedMedia.src ? <img src={selectedMedia.src} alt={selectedMedia.title} draggable="false" /> : <div className="investigation-modal__data">NO VISUAL PREVIEW</div>}<div className="investigation-modal__copy"><span>{selectedMedia.caseId}</span><h2>{selectedMedia.title}</h2><p>{selectedMedia.note}</p>{selectedMedia.transcript && <pre>{selectedMedia.transcript.join('\n')}</pre>}<button type="button" onClick={() => downloadMedia(selectedMedia)}>ВЫГРУЗИТЬ ИНДЕКС ↓</button></div></section></div>
      )}
    </div>
  )
}
