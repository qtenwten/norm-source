import { Link } from 'react-router-dom'
import Panel from '../components/Panel'
import { audio } from '../audio'
import { caseRegistry, getCaseRoute } from '../content/cases'

export default function Cases() {
  return <div className="page"><h1 className="page-title">АРХИВ ДЕЛ</h1><p className="page-lead">Зарегистрированные расследования оперативной группы LM.</p>
    <div className="case-list">
      {caseRegistry.map((item, idx) => <Link key={item.id} to={getCaseRoute(item.id)} onClick={(event) => { if (!item.route) event.preventDefault(); audio.click() }} className={`case-row ${item.route ? '' : 'case-row--summary'}`} style={{ '--delay': `${idx * 70}ms` }}>
        <span className="case-row__id">{item.id}</span><strong>{item.title}</strong><span>{item.note}</span><em>УГРОЗА {item.threat}</em><b>{item.route ? item.status : 'КРАТКАЯ ЗАПИСЬ'}</b>
      </Link>)}
    </div>
    <Panel title="СИСТЕМНОЕ ПРИМЕЧАНИЕ"><p>Реестр переведён на content-first архитектуру: новые дела добавляются как записи контента, а полноценные кинематографические досье подключаются поверх них. Часть записей скрыта уровнем допуска.</p></Panel>
  </div>
}
