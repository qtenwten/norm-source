import Photo from '../components/Photo'

const agents = [
 { code:'AG-SEN', call:'SEN', role:'СТАРШИЙ ОПЕРАТИВНИК / ФИКСАЦИЯ', img:'/assets/host_duo_closeup.png', quote:'Чем страннее — тем интереснее.', traits:['стрессоустойчивость: высокая','полевой опыт: высокий','склонность к риску: умеренная'] },
 { code:'AG-GRIG', call:'GRIG', role:'ОПЕРАТИВНИК / АНАЛИЗ', img:'/assets/host_duo_closeup.png', quote:'Сначала данные. Потом выводы.', traits:['наблюдательность: высокая','систематизация: высокая','нарушения протокола: ███'] },
]
export default function Agents(){return <div className="page"><h1 className="page-title">ПОЛЕВАЯ ГРУППА LM</h1><div className="agents-grid">{agents.map((a,i)=><section className="paper agent-file" key={a.code} style={{'--delay':`${i*120}ms`}}><div className="stamp stamp--green">АКТИВЕН</div><Photo src={a.img} alt={a.call}/><h2>{a.code}</h2><p>ПОЗЫВНОЙ: <b>{a.call}</b></p><p>РОЛЬ: {a.role}</p><p>ДОПУСК: A-3</p><ul>{a.traits.map(x=><li key={x}>{x}</li>)}</ul><blockquote>«{a.quote}»</blockquote><div className="redactions"><span/><span/><span/></div></section>)}</div><div className="field-strip"><Photo src="/assets/host_duo_outdoor.png" alt="Совместный полевой выезд" label="Совместный выезд / архив LM"/></div></div>}
