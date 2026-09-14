import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Panel from '../components/Panel'
import Photo from '../components/Photo'
import GrimoirePlate from '../components/GrimoirePlate'
import { audio } from '../audio'

const materials = [
  { id:'P-017_A1', type:'АУДИОЗАПИСЬ', meta:'00:17 / RESTORED', body:'Низкочастотный импульс. Источник не совпадает с бытовым оборудованием.' },
  { id:'P-017_V2', type:'ВИДЕОФРАГМЕНТ', meta:'FRAME 248 / FIELD', body:'Движение зафиксировано вне зоны, где находились участники выезда.' },
  { id:'P-017_DOC', type:'СКАН СТРАНИЦЫ', meta:'LAYER 03 / INK', body:'Под основным слоем чернил обнаружен более ранний фрагмент маркировки.' },
]

export default function Grimoire() {
  const [revealed, setRevealed] = useState(false)
  const [material, setMaterial] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    audio.grimoireOpen()
  }, [])

  const reveal = () => {
    const next = !revealed
    setRevealed(next)
    audio.paper()
    if (next) window.setTimeout(() => audio.terminal(), 220)
  }

  const openMaterial = (item) => {
    setMaterial(item)
    audio.archive()
  }

  const jump = (path, sound = 'paper') => {
    audio[sound]?.()
    window.setTimeout(() => navigate(path), 120)
  }

  return (
    <div className={`page grimoire-page ${revealed ? 'grimoire-page--revealed' : ''}`}>
      <div className="grimoire-breadcrumb">
        <button type="button" onClick={() => audio.click()}>ГРИМУАР</button>
        <span>›</span><button type="button" onClick={() => audio.paper()}>ПОЛТЕРГЕЙСТ</button>
        <span>›</span><b>ЗАПИСЬ #P-017</b>
      </div>

      <div className="grimoire-stage grimoire-stage--illustrated">
        <div className="book-wrap">
          <section className="book-page book-page--left grimoire-illustrated-page">
            <div className="grimoire-page-number">P-017 // ARCHIVE COPY</div>
            <h1>ШУМЯЩИЙ<br />БЕЗ ЛИКА</h1>
            <p className="hand">движет то, что забыло быть на своём месте</p>
            <button className="grimoire-plate-button" type="button" onClick={() => { audio.paper(); setRevealed(true) }} aria-label="Проявить слой на иллюстрации">
              <GrimoirePlate />
            </button>
            <p className="hand grimoire-bottom-note">Стены помнят больше, чем люди.</p>
          </section>

          <section className="book-page grimoire-classification-page">
            <div className="grimoire-classification-seal" aria-hidden="true">△<span>◉</span></div>
            <h2>КЛАССИФИКАЦИЯ</h2>
            <dl><dt>Тип</dt><dd>Полтергейст</dd><dt>Категория</dt><dd>Бытовая / привязанная</dd><dt>Степень угрозы</dt><dd>III</dd><dt>Происхождение</dt><dd>Не установлено</dd></dl>
            <h3>ПРИЗНАКИ</h3>
            <ul><li>самопроизвольное перемещение предметов</li><li>аномальные шумы и удары</li><li>локальные искажения пространства</li><li>остаточные следы на аудио/видео</li><li>повторяемость проявлений при сходных условиях</li></ul>
            <div className="warning-paper">НЕ ВСТУПАТЬ В КОНТАКТ. ФИКСИРОВАТЬ ВСЕ ИЗМЕНЕНИЯ.</div>
            <h3>СВЯЗАННЫЕ ДЕЛА</h3>
            <button className="grimoire-case-link" type="button" onClick={() => jump('/cases/lm-006#entity', 'stamp')}>
              LM-006 <span>→ открыть корреляцию</span>
            </button>
            <p className="red-pencil">Запись появилась в книге раньше даты регистрации связанного дела.</p>
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

      <aside className="grimoire-side grimoire-side--v4">
        <Panel title="ПОЛЕВЫЕ НАБЛЮДЕНИЯ">
          <button className="observation observation--button" type="button" onClick={() => jump('/agents#sen', 'click')}>
            <Photo src="/assets/host_duo_closeup.png" alt="Сен" /><b>AG-SEN</b><p>Открыть служебную карточку агента.</p>
          </button>
          <button className="observation observation--button" type="button" onClick={() => jump('/agents#grig', 'click')}>
            <Photo src="/assets/host_duo_closeup.png" alt="Григ" /><b>AG-GRIG</b><p>Открыть служебную карточку агента.</p>
          </button>
        </Panel>

        <Panel title="ДОПОЛНИТЕЛЬНЫЕ МАТЕРИАЛЫ">
          <div className="grimoire-materials">
            {materials.map((item) => (
              <button type="button" onClick={() => openMaterial(item)} key={item.id}>
                <span>{item.type}</span><b>{item.id}</b><small>{item.meta}</small>
              </button>
            ))}
          </div>
        </Panel>
      </aside>

      {material && (
        <div className="material-viewer" role="dialog" aria-modal="true" aria-label={material.type} onClick={() => setMaterial(null)}>
          <section className="material-viewer__panel" onClick={(event) => event.stopPropagation()}>
            <header><small>N.O.R.M. // ATTACHMENT</small><button type="button" onClick={() => { audio.click(); setMaterial(null) }}>×</button></header>
            <div className="material-viewer__scan"><GrimoirePlate /></div>
            <div className="material-viewer__copy"><span>{material.id}</span><h2>{material.type}</h2><code>{material.meta}</code><p>{material.body}</p><button type="button" onClick={() => jump('/archive', 'archive')}>ПЕРЕЙТИ В АРХИВ →</button></div>
          </section>
        </div>
      )}
    </div>
  )
}
