import { useMemo, useState } from 'react'
import { audio } from '../audio'

const frames = {
  before:'/assets/night-dusnila-monitor-before.webp',
  entity:'/assets/night-dusnila-monitor-entity.webp',
  detector:'/assets/night-dusnila-detector.webp',
}

function timestamp(position) {
  const start = 27
  const seconds = Math.round(start + (24 * position / 100))
  return `02:59:${String(seconds).padStart(2,'0')}`
}

export default function Forensics() {
  const [timeline, setTimeline] = useState(42)
  const [compare, setCompare] = useState(52)
  const [contrast, setContrast] = useState(false)
  const [edges, setEdges] = useState(false)
  const [waveform, setWaveform] = useState(true)
  const [metadata, setMetadata] = useState(true)
  const [analysis, setAnalysis] = useState(null)

  const time = timestamp(timeline)
  const entityVisible = timeline >= 78
  const current = entityVisible ? frames.entity : frames.before
  const signal = useMemo(() => Array.from({length:48}, (_,i) => {
    const base = 12 + Math.abs(Math.sin((i + timeline/9) * 0.71)) * 24
    const anomaly = timeline >= 74 && i > 29 ? (i % 5) * 10 + 22 : 0
    return Math.min(94, base + anomaly)
  }), [timeline])

  const runAnalysis = () => {
    audio.scan()
    window.setTimeout(() => {
      setAnalysis(entityVisible ? {
        status:'ANOMALY DETECTED', tone:'danger', confidence:'96.4%',
        rows:['MOTION VECTOR: NON-HUMAN','FACE MATCH: NONE','DEPTH: INCONSISTENT','AUDIO MARKER: PRESENT','ENTITY CLASS: UNREGISTERED'],
      } : {
        status:'NO VERIFIED ENTITY', tone:'ok', confidence:'18.7%',
        rows:['MOTION VECTOR: BED / SUBJECT','FACE MATCH: CLIENT','DEPTH: STABLE','AUDIO MARKER: LOW','ENTITY CLASS: NONE'],
      })
      audio.systemReply()
    }, 520)
  }

  return <div className="page norm20-page forensics-page">
    <header className="norm20-hero">
      <div><small>N.O.R.M. // MEDIA FORENSICS</small><h1>ЛАБОРАТОРИЯ МЕДИА</h1><p>Полевые материалы LM-005. Оригиналы не заменены: система работает поверх реальных кадров дела.</p></div>
      <div className="norm20-hero__status"><b>{time}</b><span>BEDROOM_01</span><span>{entityVisible ? 'SIGNAL ALERT' : 'SIGNAL NOMINAL'}</span></div>
    </header>

    <div className="forensics-layout">
      <section className="forensics-viewer">
        <div className={`forensics-frame ${contrast?'is-contrast':''} ${edges?'is-edges':''}`}>
          <img src={current} alt={`Кадр наблюдения ${time}`} draggable="false" />
          <div className="forensics-hud"><span>CAM 01 // REC</span><b>{time}</b><span>{entityVisible ? 'MOTION +++' : 'MOTION +'}</span></div>
          {edges && <div className="forensics-edge-grid" aria-hidden="true"/>}
        </div>
        <div className="forensics-timeline">
          <span>02:59:27</span><input type="range" min="0" max="100" value={timeline} onChange={(e) => { setTimeline(Number(e.target.value)); setAnalysis(null) }} /><span>02:59:51</span>
          <div className="forensics-markers"><i style={{left:'78%'}}>ENTITY</i><i style={{left:'63%'}}>AUDIO</i></div>
        </div>
        {waveform && <div className="forensics-waveform" aria-label="Сигнальный график">{signal.map((height,index) => <i key={index} style={{height:`${height}%`}} className={height>60?'hot':''}/>)}</div>}
      </section>

      <aside className="forensics-controls">
        <small>ANALYSIS CHANNELS</small>
        <label><input type="checkbox" checked={contrast} onChange={(e)=>setContrast(e.target.checked)}/> CONTRAST BOOST</label>
        <label><input type="checkbox" checked={edges} onChange={(e)=>setEdges(e.target.checked)}/> EDGE TRACE</label>
        <label><input type="checkbox" checked={waveform} onChange={(e)=>setWaveform(e.target.checked)}/> SIGNAL WAVEFORM</label>
        <label><input type="checkbox" checked={metadata} onChange={(e)=>setMetadata(e.target.checked)}/> METADATA</label>
        <button type="button" className="investigation-primary" onClick={runAnalysis}>ANALYZE FRAME</button>
        {analysis && <div className={`forensics-result tone-${analysis.tone}`}><small>COMPUTER VISION // FRAME {time}</small><b>{analysis.status}</b><span>CONFIDENCE {analysis.confidence}</span>{analysis.rows.map((row)=><code key={row}>{row}</code>)}</div>}
        {metadata && <dl className="forensics-meta"><dt>CASE</dt><dd>LM-005</dd><dt>SOURCE</dt><dd>BEDROOM_01</dd><dt>CODEC</dt><dd>RECOVERED STILL</dd><dt>CLOCK DRIFT</dt><dd>+00:00:00</dd><dt>CHAIN</dt><dd>VERIFIED</dd></dl>}
      </aside>
    </div>

    <section className="forensics-compare">
      <header><div><small>FRAME COMPARATOR</small><h2>ДО / ПРОЯВЛЕНИЕ</h2></div><span>{compare}%</span></header>
      <div className="forensics-compare__stage">
        <img src={frames.before} alt="Кадр до появления" draggable="false" />
        <img src={frames.entity} alt="Кадр с сущностью" draggable="false" className="forensics-compare__top" style={{clipPath:`inset(0 ${100-compare}% 0 0)`}}/>
        <i style={{left:`${compare}%`}}/>
      </div>
      <input type="range" min="0" max="100" value={compare} onChange={(e)=>setCompare(Number(e.target.value))}/>
    </section>

    <section className="forensics-strip">
      <article><img src={frames.before} alt="До проявления" draggable="false"/><small>02:59:27</small><b>BASELINE</b></article>
      <article><img src={frames.detector} alt="Полевой анализатор" draggable="false"/><small>FIELD EQUIPMENT</small><b>ANALYZER A17</b></article>
      <article><img src={frames.entity} alt="Сущность в комнате" draggable="false"/><small>02:59:51</small><b>UNREGISTERED ENTITY</b></article>
    </section>
  </div>
}
