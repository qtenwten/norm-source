import { useEffect, useState } from 'react'
import Panel from '../components/Panel'
import Photo from '../components/Photo'
import { audio } from '../audio'

export default function Grimoire() {
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    audio.grimoireOpen()
  }, [])

  const reveal = () => {
    const next = !revealed
    setRevealed(next)
    audio.paper()
    if (next) window.setTimeout(() => audio.terminal(), 220)
  }

  return (
    <div className={`page grimoire-page ${revealed ? 'grimoire-page--revealed' : ''}`}>
      <div className="grimoire-breadcrumb">ГРИМУАР › ПОЛТЕРГЕЙСТ › ЗАПИСЬ #P-017</div>
      <div className="grimoire-stage">
        <div className="book-wrap">
          <section className="book-page book-page--left">
            <h1>ШУМЯЩИЙ<br />БЕЗ ЛИКА</h1>
            <p className="hand">движет то, что забыло быть на своём месте</p>
            <div className="entity-sketch"><span>◉</span></div>
            <p className="hand bottom">Стены помнят больше, чем люди.</p>
          </section>
          <section className="book-page">
            <h2>КЛАССИФИКАЦИЯ</h2>
            <dl><dt>Тип</dt><dd>Полтергейст</dd><dt>Категория</dt><dd>Бытовая / привязанная</dd><dt>Степень угрозы</dt><dd>III</dd></dl>
            <h3>ПРИЗНАКИ</h3>
            <ul><li>самопроизвольное перемещение предметов</li><li>аномальные шумы и удары</li><li>локальные искажения пространства</li><li>остаточные следы на аудио/видео</li></ul>
            <div className="warning-paper">НЕ ВСТУПАТЬ В КОНТАКТ. ФИКСИРОВАТЬ ВСЕ ИЗМЕНЕНИЯ.</div>
            <h3>СВЯЗАННЫЕ ДЕЛА</h3>
            <p className="red-pencil">LM-006 — запись появилась в книге раньше даты регистрации дела.</p>
            <button type="button" className="grimoire-reveal" onClick={reveal} aria-pressed={revealed}>
              {revealed ? 'СКРЫТЬ СЛУЖЕБНЫЙ СЛОЙ' : 'ПРОЯВИТЬ СЛУЖЕБНЫЙ СЛОЙ'}
            </button>
            <div className="grimoire-hidden-layer" aria-hidden={!revealed}>
              <small>СЛОЙ РАСПОЗНАВАНИЯ // NORM-LINGUA</small>
              <strong>LM-006</strong>
              <span>ФРАГМЕНТ ОБНАРУЖЕН ПОД ЧЕРНИЛАМИ ОСНОВНОГО ТЕКСТА</span>
              <code>ДАТИРОВКА СЛОЯ: ████.██.18██ // НЕСОВМЕСТИМО</code>
            </div>
          </section>
        </div>
      </div>
      <div className="grimoire-side">
        <Panel title="ПОЛЕВЫЕ НАБЛЮДЕНИЯ">
          <div className="observation"><Photo src="/assets/host_duo_closeup.png" alt="Сен" /><b>AG-SEN</b><p>«Активность возрастает при полном отсутствии людей в комнате.»</p></div>
          <div className="observation"><Photo src="/assets/host_duo_closeup.png" alt="Григ" /><b>AG-GRIG</b><p>«После фиксации активность на время затухает.»</p></div>
        </Panel>
      </div>
    </div>
  )
}
