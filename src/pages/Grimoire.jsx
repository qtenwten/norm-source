import Panel from '../components/Panel'
import Photo from '../components/Photo'
import { grimoire } from '../data'

export default function Grimoire() {
  return <div className="page grimoire-page"><div className="grimoire-breadcrumb">ГРИМУАР › ПОЛТЕРГЕЙСТ › ЗАПИСЬ #P-017</div>
    <div className="book-wrap">
      <section className="book-page book-page--left"><h1>ШУМЯЩИЙ<br/>БЕЗ ЛИКА</h1><p className="hand">движет то, что забыло быть на своём месте</p><div className="entity-sketch"><span>◉</span></div><p className="hand bottom">Стены помнят больше, чем люди.</p></section>
      <section className="book-page"><h2>КЛАССИФИКАЦИЯ</h2><dl><dt>Тип</dt><dd>Полтергейст</dd><dt>Категория</dt><dd>Бытовая / привязанная</dd><dt>Степень угрозы</dt><dd>III</dd></dl><h3>ПРИЗНАКИ</h3><ul><li>самопроизвольное перемещение предметов</li><li>аномальные шумы и удары</li><li>локальные искажения пространства</li><li>остаточные следы на аудио/видео</li></ul><div className="warning-paper">НЕ ВСТУПАТЬ В КОНТАКТ. ФИКСИРОВАТЬ ВСЕ ИЗМЕНЕНИЯ.</div><h3>СВЯЗАННЫЕ ДЕЛА</h3><p className="red-pencil">LM-006 — запись появилась в книге раньше даты регистрации дела.</p></section>
    </div>
    <div className="grimoire-side"><Panel title="ПОЛЕВЫЕ НАБЛЮДЕНИЯ"><div className="observation"><Photo src="/assets/host_duo_closeup.png" alt="Сен" /><b>AG-SEN</b><p>«Активность возрастает при полном отсутствии людей в комнате.»</p></div><div className="observation"><Photo src="/assets/host_duo_closeup.png" alt="Григ" /><b>AG-GRIG</b><p>«После фиксации активность на время затухает.»</p></div></Panel></div>
  </div>
}
