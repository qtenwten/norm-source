import Panel from '../components/Panel'
import Photo from '../components/Photo'

export default function CaseDetail() {
 return <div className="page case-detail-page">
   <div className="tabs"><span className="active">ОТЧЁТ</span><span>ХРОНОЛОГИЯ</span><span>УЛИКИ</span><span>СУЩНОСТЬ</span><span>МЕДИА</span></div>
   <div className="dossier-grid">
    <section className="paper dossier-main"><div className="stamp">ДЕЛО ЗАКРЫТО</div><div className="case-id">LM-006</div><h1>ЗУМЕРСКИЙ ДЕМОН</h1>
      <dl><dt>ЛОКАЦИЯ</dt><dd>Солнечногорск, МО</dd><dt>ДАТЫ</dt><dd>11.10.2023 — 28.11.2023</dd><dt>КЛАСС УГРОЗЫ</dt><dd>II</dd><dt>ГРУППА</dt><dd>AG-SEN, AG-GRIG</dd></dl>
      <p>Зафиксировано повторяющееся информационное воздействие на несовершеннолетних свидетелей. Источник проявлений не подтверждён. Объект переведён в наблюдение.</p>
      <Photo src="/assets/host_duo_outdoor.png" alt="Полевой осмотр" label="Полевой осмотр / кадр 03" />
    </section>
    <aside className="dossier-side"><Panel title="КЛАССИФИКАЦИЯ" danger><b>УРОВЕНЬ II</b><p>Информационное воздействие. Риск повторной активации.</p></Panel>
      <Panel title="ХРОНОЛОГИЯ"><ol className="timeline"><li>11.10 — первое обращение</li><li>14.10 — первичный выезд</li><li>18.10 — фиксация аномального сигнала</li><li>28.11 — дело закрыто</li><li className="red">01.03.2024 — файл добавлен после закрытия</li></ol></Panel>
      <Panel title="ПОЛЕВЫЕ ЗАМЕТКИ"><blockquote>«Некоторые вещи смотрят в ответ.» — Сен</blockquote><blockquote>«Сначала данные. Потом выводы.» — Григ</blockquote></Panel>
    </aside>
   </div>
 </div>
}
