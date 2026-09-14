import { Link } from 'react-router-dom'
import Panel from '../components/Panel'
import { cases } from '../data'
import { audio } from '../audio'

const caseRoute = (id) => {
  if (id === 'LM-005') return '/cases/lm-005'
  if (id === 'LM-006') return '/cases/lm-006'
  return '#'
}

export default function Cases() {
  return <div className="page"><h1 className="page-title">АРХИВ ДЕЛ</h1><p className="page-lead">Зарегистрированные расследования оперативной группы LM.</p>
    <div className="case-list">
      {cases.map((item, idx) => <Link key={item.id} to={caseRoute(item.id)} onClick={() => audio.click()} className="case-row" style={{ '--delay': `${idx * 70}ms` }}>
        <span className="case-row__id">{item.id}</span><strong>{item.title}</strong><span>{item.note}</span><em>УГРОЗА {item.threat}</em><b>{item.status}</b>
      </Link>)}
    </div>
    <Panel title="СИСТЕМНОЕ ПРИМЕЧАНИЕ"><p>Часть записей скрыта уровнем допуска. Количество записей в индексе может не совпадать с фактическим количеством файлов.</p></Panel>
  </div>
}
