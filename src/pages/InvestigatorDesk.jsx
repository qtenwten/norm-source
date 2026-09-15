import { useEffect, useMemo, useState } from 'react'
import { audio } from '../audio'
import { getArgState, subscribeArg } from '../arg'
import { correlationEdges, correlationNodes } from '../worldData'

const STORAGE_KEY = 'norm-investigator-desk-v1'
const defaultState = { pinned:['lm005','n005','dreamcatcher'], links:[], note:'', showCanonical:true }

function loadBoard() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return {...defaultState, ...raw, pinned:Array.isArray(raw.pinned) ? raw.pinned : defaultState.pinned, links:Array.isArray(raw.links) ? raw.links : []}
  } catch { return defaultState }
}

function saveBoard(next) { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) }

export default function InvestigatorDesk() {
  const [arg, setArg] = useState(getArgState)
  const [board, setBoard] = useState(loadBoard)
  const [linkSource, setLinkSource] = useState(null)
  const [linkLabel, setLinkLabel] = useState('ПОДОЗРЕВАЕМАЯ СВЯЗЬ')

  useEffect(() => subscribeArg(setArg), [])
  useEffect(() => saveBoard(board), [board])

  const accessible = useMemo(() => correlationNodes.filter((item) => (item.clearance || 0) <= arg.clearance), [arg.clearance])
  const pinnedNodes = board.pinned.map((id) => correlationNodes.find((item) => item.id === id)).filter(Boolean).filter((item) => (item.clearance || 0) <= arg.clearance)
  const canonical = board.showCanonical ? correlationEdges.filter(([a,b]) => board.pinned.includes(a) && board.pinned.includes(b)) : []

  const togglePinned = (id) => {
    audio.click()
    setBoard((state) => ({...state, pinned:state.pinned.includes(id) ? state.pinned.filter((item) => item !== id) : [...state.pinned,id]}))
  }

  const linkNode = (id) => {
    audio.terminal()
    if (!linkSource) { setLinkSource(id); return }
    if (linkSource === id) { setLinkSource(null); return }
    const exists = board.links.some((item) => (item.a === linkSource && item.b === id) || (item.a === id && item.b === linkSource))
    if (!exists) setBoard((state) => ({...state, links:[...state.links,{a:linkSource,b:id,label:linkLabel || 'СВЯЗЬ'}]}))
    setLinkSource(null)
  }

  const reset = () => {
    setBoard(defaultState)
    setLinkSource(null)
    audio.warning()
  }

  return <div className="page norm20-page desk-page">
    <header className="norm20-hero">
      <div><small>N.O.R.M. // PERSONAL CORRELATION BOARD</small><h1>РАБОЧАЯ ДОСКА СЛЕДОВАТЕЛЯ</h1><p>Добавляй только те материалы, которые считаешь важными. Система не отличает хорошую гипотезу от красивой паранойи.</p></div>
      <div className="norm20-hero__status"><b>A-{arg.clearance}</b><span>{pinnedNodes.length} УЗЛОВ</span><span>{board.links.length} СВОИХ СВЯЗЕЙ</span></div>
    </header>

    <div className="desk-layout">
      <aside className="desk-library">
        <header><small>ДОСТУПНЫЕ УЗЛЫ</small><b>{accessible.length}</b></header>
        {accessible.map((node) => <button type="button" key={node.id} className={board.pinned.includes(node.id) ? 'active' : ''} onClick={() => togglePinned(node.id)}><span>{node.title}</span><small>{node.subtitle}</small><b>{board.pinned.includes(node.id) ? '−' : '+'}</b></button>)}
      </aside>

      <section className="desk-board">
        <div className="desk-board__toolbar">
          <label><input type="checkbox" checked={board.showCanonical} onChange={(e) => setBoard((state) => ({...state,showCanonical:e.target.checked}))}/> ПОКАЗЫВАТЬ КАНОНИЧЕСКИЕ СВЯЗИ</label>
          <input value={linkLabel} onChange={(e) => setLinkLabel(e.target.value)} aria-label="Подпись новой связи" />
          <button type="button" onClick={reset}>СБРОСИТЬ ДОСКУ</button>
        </div>
        <div className="desk-board__canvas">
          <svg viewBox="0 0 1000 620" preserveAspectRatio="none" aria-hidden="true">
            {canonical.map(([a,b,label]) => {
              const from = correlationNodes.find((n) => n.id === a), to = correlationNodes.find((n) => n.id === b)
              return from && to ? <g className="canonical" key={`${a}-${b}`}><line x1={from.x*10} y1={from.y*6.2} x2={to.x*10} y2={to.y*6.2}/><text x={(from.x+to.x)*5} y={(from.y+to.y)*3.1}>{label}</text></g> : null
            })}
            {board.links.map((edge,index) => {
              const from = correlationNodes.find((n) => n.id === edge.a), to = correlationNodes.find((n) => n.id === edge.b)
              return from && to ? <g className="manual" key={`${edge.a}-${edge.b}-${index}`}><line x1={from.x*10} y1={from.y*6.2} x2={to.x*10} y2={to.y*6.2}/><text x={(from.x+to.x)*5} y={(from.y+to.y)*3.1-8}>{edge.label}</text></g> : null
            })}
          </svg>
          {pinnedNodes.map((node) => <button type="button" key={node.id} className={`desk-pin desk-pin--${node.kind} ${linkSource===node.id?'link-source':''}`} style={{left:`${node.x}%`,top:`${node.y}%`}} onClick={() => linkNode(node.id)}><small>{node.kind}</small><b>{node.title}</b><span>{node.subtitle}</span><em>{linkSource===node.id ? 'ВЫБЕРИ ВТОРОЙ УЗЕЛ' : 'СВЯЗАТЬ'}</em></button>)}
          {!pinnedNodes.length && <div className="desk-empty">ДОСКА ПУСТА // ДОБАВЬ УЗЛЫ СЛЕВА</div>}
        </div>
      </section>

      <aside className="desk-notes">
        <small>ЛИЧНАЯ ЗАМЕТКА ОПЕРАТОРА</small>
        <textarea value={board.note} onChange={(e) => setBoard((state) => ({...state,note:e.target.value}))} placeholder="Что здесь не сходится? Что проверить? Кому не доверять?" />
        <div className="desk-links"><b>МОИ СВЯЗИ</b>{board.links.length ? board.links.map((edge,index) => <button type="button" key={`${edge.a}-${edge.b}-${index}`} onClick={() => setBoard((state) => ({...state,links:state.links.filter((_,i)=>i!==index)}))}><span>{edge.a.toUpperCase()} ↔ {edge.b.toUpperCase()}</span><small>{edge.label}</small><b>×</b></button>) : <p>Пока нет пользовательских связей.</p>}</div>
      </aside>
    </div>
  </div>
}
