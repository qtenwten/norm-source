import { Link } from 'react-router-dom'
import Panel from '../components/Panel'
import { cases } from '../data'
import { audio } from '../audio'

export default function Cases() {
  return <div className="page"><h1 className="page-title">АРХИВ ДЕЛ</h1><p className="page-lead">Зарегистрированные расследования оперативной группы LM.</p>
    <div className="case-list">
      {cases.map((item, idx) => <Link key={item.id} to={item.id === 'LM-006' ? '/cases/lm-006' : '#'} onClick={() => audio.click()} className="case-row" style={{ '--delay': `${idx * 70}ms` }}>
        <span className="case-row__id">{item.id}</span><strong>{item.title}</strong><span>{item.note}</span><em>УГРОЗА {item.threat}</em><b>{item.status}</b>
      </Link>)}
    </div>
    <Panel title="СИСТЕМНОЕ ПРИМЕЧАНИЕ"><p>Часть записей скрыта уровнем допуска. Количество записей в индексе может не совпадать с фактическим количеством файлов.</p></Panel>
  </div>
}
