import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Panel from '../components/Panel'
import Photo from '../components/Photo'
import { audio } from '../audio'
import { riverGeneratedImage, sorceryGeneratedImage } from '../generated/grimoire/generatedImages'

const monsters = [
  {
    key:'river', code:'R-002', caseCode:'LM-002', name:'РЕЧНАЯ ГАДИНА', alias:'ПРИБРЕЖНАЯ СУЩНОСТЬ',
    subtitle:'появляется у воды и связана с исчезновениями людей', type:'Водная сущность', category:'Криптид / прибрежная', danger:'III', origin:'Не установлено',
    image:riverGeneratedImage, fallbackImage:'/assets/grimoire-river-gadina.webp', warning:'НЕ ПРИБЛИЖАТЬСЯ К ВОДЕ В ОДИНОЧКУ В ЗОНЕ ПРОЯВЛЕНИЯ.',
    source:'«РЕЧНАЯ ГАДИНА похищает людей»', videoId:'jdN2KjOlaC8',
    facts:['в деле расследуются таинственные исчезновения людей','зона расследования связана с водой и береговой линией','сущность получила рабочее название «Речная гадина»','основная версия проверяется непосредственно на месте'],
    hotspots:[
      {n:'01',x:27,y:20,title:'СПИННОЙ ПРОФИЛЬ',body:'Силуэт маскируется под растительность и тёмную кромку воды.'},
      {n:'02',x:80,y:31,title:'ГОЛОВА',body:'Служебная реконструкция подчёркивает низкую посадку головы и амфибийные черты.'},
      {n:'03',x:17,y:62,title:'ПЕРЕДНЯЯ КОНЕЧНОСТЬ',body:'Удлинённая конечность рассчитана на опору у кромки воды.'},
      {n:'04',x:72,y:68,title:'ВОДНЫЙ СЛЕД',body:'Точка фиксации связана с мелководьем и прибрежным илом.'},
    ],
    materials:[
      {id:'R-002_F1',type:'ПОЛЕВОЙ НАБРОСОК',meta:'SHORELINE / RECON',body:'Реконструкция сущности по материалам расследования.'},
      {id:'R-002_W1',type:'КАРТА ЗОНЫ',meta:'WATERLINE / FIELD',body:'Прибрежная зона, связанная с серией исчезновений.'},
      {id:'R-002_SRC',type:'ИСТОЧНИК',meta:'YOUTUBE / VERIFIED',body:'Выпуск «РЕЧНАЯ ГАДИНА похищает людей».'},
    ],
  },
  {
    key:'sorcery', code:'K-003', caseCode:'LM-003', name:'ДРЕВНЮЧЕЕ КОЛДУНСТВО', alias:'ПРОКЛЯТИЕ ГАДАЛКИ',
    subtitle:'ритуальное воздействие, которое продолжает работать после контакта', type:'Ритуальная аномалия', category:'Проклятие / оккультное', danger:'II', origin:'Связано с гадалкой',
    image:sorceryGeneratedImage, fallbackImage:'/assets/grimoire-ancient-sorcery.webp', warning:'НЕ ПОВТОРЯТЬ ОБРЯДЫ И НЕ АКТИВИРОВАТЬ НАЙДЕННЫЕ ПРЕДМЕТЫ.',
    source:'«ДРЕВНЮЧЕЕ КОЛДУНСТВО вышло на связь»', videoId:'TUk1JwcbxEg',
    facts:['клиент связывает происходящее с проклятием гадалки','воздействие описано как длительное и навязчивое','расследование строится вокруг ритуального происхождения аномалии','источник воздействия проверяется группой в ходе выезда'],
    hotspots:[
      {n:'01',x:29,y:19,title:'АМУЛЕТЫ',body:'Набор подвесок и ритуальных предметов рассматривается как возможный носитель воздействия.'},
      {n:'02',x:76,y:14,title:'ПОКРОВ',body:'Образ скрытого лица используется как маркировка неизвестного источника.'},
      {n:'03',x:79,y:55,title:'КАРТЫ',body:'Мантические предметы отмечены как часть ритуального контекста дела.'},
      {n:'04',x:82,y:82,title:'КУРЕНИЕ',body:'Дым и ароматические смеси отмечены как элемент реконструкции обряда.'},
    ],
    materials:[
      {id:'K-003_R1',type:'РИТУАЛЬНАЯ СХЕМА',meta:'RECON / OCCULT',body:'Служебная реконструкция предполагаемого ритуального воздействия.'},
      {id:'K-003_N2',type:'ЗАМЕТКИ ГРУППЫ',meta:'FIELD / CURSE',body:'Хронология симптомов и контактов заявителя.'},
      {id:'K-003_SRC',type:'ИСТОЧНИК',meta:'YOUTUBE / VERIFIED',body:'Выпуск «ДРЕВНЮЧЕЕ КОЛДУНСТВО вышло на связь».'},
    ],
  },
  {
    key:'marionette', code:'C-004', caseCode:'LM-004', name:'МАРИОНЕТКА ДЬЯВОЛА', alias:'ОДЕРЖИМАЯ КУКЛА',
    subtitle:'аномалия привязана к кукле и проявляется через неё', type:'Аномальный объект', category:'Одержимый предмет', danger:'III', origin:'Не установлено',
    image:'/assets/grimoire-devils-marionette-generated.svg', fallbackImage:'/assets/grimoire-devils-marionette.webp', warning:'НЕ ОСТАВЛЯТЬ ОБЪЕКТ БЕЗ НАБЛЮДЕНИЯ И НЕ ПЫТАТЬСЯ РАЗОБРАТЬ.',
    source:'«МАРИОНЕТКА ДЬЯВОЛА вселилась в КУКЛУ»', videoId:'UJ4zoCABeeE',
    facts:['заявитель связывает серию событий с куклой','аномалия описывается как сущность, вселившаяся в предмет','объект является центральным элементом расследования','после контакта влияние распространяется на бытовую среду владельца'],
    hotspots:[
      {n:'01',x:25,y:21,title:'ЛИЦО',body:'Повреждения поверхности и выражение лица используются как контрольные точки сравнения.'},
      {n:'02',x:23,y:55,title:'МЕХАНИЗМ',body:'Отдельно фиксируется задняя часть и возможные механические элементы куклы.'},
      {n:'03',x:72,y:21,title:'НИТИ',body:'Образ нитей отмечает связь предмета с внешним воздействием.'},
      {n:'04',x:79,y:48,title:'ГЛАЗ',body:'Крупный план используется для сопоставления кадров до и после эпизода.'},
    ],
    materials:[
      {id:'C-004_F1',type:'ФОТОФИКСАЦИЯ',meta:'OBJECT / FRONT',body:'Основной вид аномального объекта.'},
      {id:'C-004_M2',type:'ОСМОТР МЕХАНИЗМА',meta:'OBJECT / REAR',body:'Служебная проверка подвижных частей и корпуса.'},
      {id:'C-004_SRC',type:'ИСТОЧНИК',meta:'YOUTUBE / VERIFIED',body:'Выпуск «МАРИОНЕТКА ДЬЯВОЛА вселилась в КУКЛУ».'},
    ],
  },
  {
    key:'night', code:'N-005', caseCode:'LM-005', name:'НОЧНОЙ ДУШНИЛА', alias:'НОЧНАЯ СУЩНОСТЬ',
    subtitle:'садится на грудь спящего, лишает движения и душит', type:'Ночная сущность', category:'Сон / физический контакт', danger:'II', origin:'Не установлено',
    image:'/assets/grimoire-night-dusnila-generated.svg', fallbackImage:'/assets/grimoire-night-dusnila.webp', warning:'ПОСЛЕ ПРОЯВЛЕНИЯ НЕ ОСТАВЛЯТЬ КЛИЕНТА БЕЗ НАБЛЮДЕНИЯ.',
    source:'«НОЧНОЙ ДУШНИЛА мешает ночью спать»', videoId:'bZRVUyb19qI', casePath:'/cases/lm-005#entity',
    facts:['клиент не спал более 57 часов','первичная версия группы — сонный паралич','в 02:59–03:00 камера и анализатор фиксируют аномальную активность','нейтрализация произошла после контакта с ловцом снов'],
    hotspots:[
      {n:'01',x:31,y:26,title:'СИЛУЭТ',body:'Камера подтверждает присутствие фигуры рядом со спящим клиентом.'},
      {n:'02',x:73,y:35,title:'ДАВЛЕНИЕ',body:'Проявление связано с давлением на грудь и невозможностью двигаться.'},
      {n:'03',x:34,y:66,title:'ФИЗИЧЕСКИЙ КОНТАКТ',body:'Наблюдение перестаёт быть только субъективным после фиксации взаимодействия.'},
      {n:'04',x:70,y:79,title:'НЕЙТРАЛИЗАЦИЯ',body:'В деле зафиксировано применение ловца снов непосредственно против сущности.'},
    ],
    materials:[
      {id:'N-005_V1',type:'ЗАПИСЬ КАМЕРЫ',meta:'02:59:51 / VERIFIED',body:'Ключевой фрагмент появления сущности в спальне.'},
      {id:'N-005_D1',type:'АНАЛИЗАТОР',meta:'ANOMALOUS SIGNAL',body:'Полевой прибор фиксирует всплеск во время появления фигуры.'},
      {id:'N-005_SRC',type:'ИСТОЧНИК',meta:'YOUTUBE / VERIFIED',body:'Выпуск «НОЧНОЙ ДУШНИЛА мешает ночью спать».'},
    ],
  },
  {
    key:'zoomer', code:'Z-006', caseCode:'LM-006', name:'ЗУМЕРСКИЙ ДЕМОН', alias:'DEAD INSIDE',
    subtitle:'аномальный паттерн поведения, речи и игровой символики', type:'Рабочая классификация', category:'Поведенческая / цифровая', danger:'II', origin:'Не установлено',
    image:'/assets/grimoire-zoomer-demon-generated.svg', fallbackImage:'/assets/grimoire-zoomer-demon.webp', warning:'НЕ ОТВЕЧАТЬ НА ПОВТОРЯЮЩИЙСЯ ПАТТЕРН «1000−7» КАК НА ВЫЗОВ.',
    source:'«ЗУМЕРСКИЙ ДЕМОН стращает мать»', videoId:'FQ6mBEm4Hnc', casePath:'/cases/lm-006#entity',
    facts:['субъект повторяет «1000−7»','зафиксированы реплики голосом Shadow Fiend','наблюдается физическая аномалия — поворот головы на 360°','после ритуала сохраняется остаточный речевой паттерн'],
    hotspots:[
      {n:'01',x:31,y:24,title:'ЦИФРОВОЙ ШУМ',body:'Служебная визуализация связывает проявление с экранной и игровой средой.'},
      {n:'02',x:73,y:39,title:'НОСИТЕЛЬ',body:'Рабочая классификация описывает аномалию через поведение субъекта.'},
      {n:'03',x:39,y:67,title:'ЭКРАН',body:'Игровая среда становится частью проявления и языка сущности.'},
      {n:'04',x:72,y:79,title:'ПАТТЕРН',body:'Повтор «1000−7» используется как устойчивый маркер дела.'},
    ],
    materials:[
      {id:'Z-006_A1',type:'РЕЧЕВОЙ ПАТТЕРН',meta:'1000−7 / REPEAT',body:'Повторяющаяся фраза сохраняется до и после основного проявления.'},
      {id:'Z-006_V2',type:'ВИЗУАЛЬНОЕ ПРОЯВЛЕНИЕ',meta:'WARD MESSAGE',body:'В материалах дела зафиксировано сообщение «УХОДИТЕ».'},
      {id:'Z-006_SRC',type:'ИСТОЧНИК',meta:'YOUTUBE / VERIFIED',body:'Выпуск «ЗУМЕРСКИЙ ДЕМОН стращает мать».'},
    ],
  },
]

export default function Grimoire() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [activeHotspot, setActiveHotspot] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [material, setMaterial] = useState(null)
  const navigate = useNavigate()
  const monster = monsters[activeIndex]
  const sourceUrl = monster.videoId ? `https://www.youtube.com/watch?v=${monster.videoId}` : null
  const selectedHotspot = useMemo(() => monster.hotspots.find((item) => item.n === activeHotspot) || null, [monster, activeHotspot])

  useEffect(() => { audio.grimoireOpen() }, [])

  const selectMonster = (index) => {
    if (index === activeIndex) return
    audio.paper()
    setActiveIndex(index)
    setActiveHotspot(null)
    setRevealed(false)
    setMaterial(null)
  }

  const reveal = () => {
    const next = !revealed
    setRevealed(next)
    audio.paper()
    if (next) window.setTimeout(() => audio.terminal(), 220)
  }

  const inspectHotspot = (item) => {
    setActiveHotspot((current) => current === item.n ? null : item.n)
    audio.entity()
  }

  const openMaterial = (item) => {
    setMaterial(item)
    audio.archive()
  }

  const jump = (path, sound = 'paper') => {
    audio[sound]?.()
    window.setTimeout(() => navigate(path), 120)
  }

  const openSource = () => {
    if (!sourceUrl) return
    audio.radio()
    window.open(sourceUrl, '_blank', 'noopener,noreferrer')
  }

  const useFallbackImage = (event) => {
    if (event.currentTarget.dataset.fallbackUsed === '1') return
    event.currentTarget.dataset.fallbackUsed = '1'
    event.currentTarget.src = monster.fallbackImage
  }

  return (
    <div className={`page grimoire-page grimoire-page--registry ${revealed ? 'grimoire-page--revealed' : ''}`}>
      <div className="grimoire-breadcrumb">
        <button type="button" onClick={() => audio.click()}>ГРИМУАР</button><span>›</span>
        <button type="button" onClick={() => audio.paper()}>{monster.type.toUpperCase()}</button><span>›</span>
        <b>ЗАПИСЬ #{monster.code}</b>
      </div>

      <div className="grimoire-record-strip" aria-label="Записи гримуара">
        {monsters.map((item,index) => (
          <button type="button" className={index === activeIndex ? 'active' : ''} onClick={() => selectMonster(index)} key={item.key}>
            <span>{item.code}</span><b>{item.name}</b><small>{item.caseCode}</small>
          </button>
        ))}
      </div>

      <div className="grimoire-stage grimoire-stage--illustrated">
        <div className="book-wrap grimoire-book--monster">
          <section className="book-page book-page--left grimoire-illustrated-page grimoire-monster-page">
            <div className="grimoire-page-number">{monster.code} // ARCHIVE COPY // {monster.caseCode}</div>
            <h1>{monster.name}</h1>
            <p className="hand">{monster.subtitle}</p>
            <div className="monster-plate" aria-label={`Изображение: ${monster.name}`}>
              <img src={monster.image} alt={monster.name} draggable="false" onDragStart={(event) => event.preventDefault()} onError={useFallbackImage} />
              <div className="monster-plate__shade" aria-hidden="true" />
              {monster.hotspots.map((item) => (
                <button type="button" className={`monster-hotspot ${activeHotspot === item.n ? 'active' : ''}`} style={{ left:`${item.x}%`, top:`${item.y}%` }} onClick={() => inspectHotspot(item)} aria-label={`${item.n}: ${item.title}`} key={item.n}>
                  <span>{item.n}</span>
                </button>
              ))}
              {selectedHotspot && (
                <div className="monster-hotspot-card" role="status">
                  <button type="button" onClick={() => { audio.click(); setActiveHotspot(null) }}>×</button>
                  <small>МАРКЕР {selectedHotspot.n}</small><b>{selectedHotspot.title}</b><p>{selectedHotspot.body}</p>
                </div>
              )}
            </div>
            <p className="hand grimoire-bottom-note">{monster.alias}</p>
          </section>

          <section className="book-page grimoire-classification-page">
            <div className="grimoire-classification-seal" aria-hidden="true">△<span>◉</span></div>
            <h2>КЛАССИФИКАЦИЯ</h2>
            <dl><dt>Тип</dt><dd>{monster.type}</dd><dt>Категория</dt><dd>{monster.category}</dd><dt>Степень угрозы</dt><dd>{monster.danger}</dd><dt>Происхождение</dt><dd>{monster.origin}</dd></dl>
            <h3>ПРИЗНАКИ</h3>
            <ul>{monster.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>
            <div className="warning-paper">{monster.warning}</div>
            <h3>ИСТОЧНИК / ДЕЛО</h3>
            <div className="grimoire-source-block">
              <b>{monster.source}</b>
              <span>YOUTUBE ID: {monster.videoId}</span>
              <div>
                {sourceUrl && <button type="button" onClick={openSource}>ОТКРЫТЬ ВЫПУСК ↗</button>}
                {monster.casePath && <button type="button" onClick={() => jump(monster.casePath, 'stamp')}>ОТКРЫТЬ ДЕЛО →</button>}
              </div>
            </div>
            <p className="red-pencil">Служебная визуализация Н.О.Р.М. — уникальная реконструкция сущности по материалам дела; это не кадр из выпуска. Интерактивные маркеры 01–04 нанесены поверх изображения.</p>
            <button type="button" className="grimoire-reveal" onClick={reveal} aria-pressed={revealed}>{revealed ? 'СКРЫТЬ СЛУЖЕБНЫЙ СЛОЙ' : 'ПРОЯВИТЬ СЛУЖЕБНЫЙ СЛОЙ'}</button>
            <div className="grimoire-hidden-layer" aria-hidden={!revealed}>
              <small>СЛОЙ РАСПОЗНАВАНИЯ // NORM-LINGUA</small><strong>{monster.caseCode}</strong>
              <span>СОВПАДЕНИЕ С РЕЕСТРОМ: {monster.name}</span><code>MEDIA LINK: {monster.videoId} // VERIFIED</code>
            </div>
          </section>
        </div>
      </div>

      <aside className="grimoire-side grimoire-side--v4">
        <Panel title="ТЕКУЩАЯ ЗАПИСЬ">
          <div className="grimoire-current-record">
            <span>{String(activeIndex + 1).padStart(2,'0')} / {String(monsters.length).padStart(2,'0')}</span>
            <b>{monster.name}</b><small>{monster.caseCode} // {monster.code}</small>
            <div className="grimoire-current-record__nav"><button type="button" onClick={() => selectMonster((activeIndex - 1 + monsters.length) % monsters.length)}>← ПРЕД.</button><button type="button" onClick={() => selectMonster((activeIndex + 1) % monsters.length)}>СЛЕД. →</button></div>
          </div>
        </Panel>
        <Panel title="ПОЛЕВЫЕ НАБЛЮДЕНИЯ">
          <button className="observation observation--button" type="button" onClick={() => jump('/agents#sen', 'click')}><Photo src="/assets/agent-sen.webp" alt="Сен" /><b>AG-SEN</b><p>Открыть служебную карточку агента.</p></button>
          <button className="observation observation--button" type="button" onClick={() => jump('/agents#grig', 'click')}><Photo src="/assets/agent-grig.webp" alt="Григ" /><b>AG-GRIG</b><p>Открыть служебную карточку агента.</p></button>
        </Panel>
        <Panel title="ДОПОЛНИТЕЛЬНЫЕ МАТЕРИАЛЫ">
          <div className="grimoire-materials">{monster.materials.map((item) => <button type="button" onClick={() => openMaterial(item)} key={item.id}><span>{item.type}</span><b>{item.id}</b><small>{item.meta}</small></button>)}</div>
        </Panel>
      </aside>

      {material && (
        <div className="material-viewer" role="dialog" aria-modal="true" aria-label={material.type} onClick={() => setMaterial(null)}>
          <section className="material-viewer__panel" onClick={(event) => event.stopPropagation()}>
            <header><small>N.O.R.M. // ATTACHMENT // {monster.code}</small><button type="button" onClick={() => { audio.click(); setMaterial(null) }}>×</button></header>
            <div className="material-viewer__scan monster-material-scan"><img src={monster.image} alt={monster.name} draggable="false" onDragStart={(event) => event.preventDefault()} onError={useFallbackImage} /></div>
            <div className="material-viewer__copy"><span>{material.id}</span><h2>{material.type}</h2><code>{material.meta}</code><p>{material.body}</p><button type="button" onClick={() => jump('/archive', 'archive')}>ПЕРЕЙТИ В АРХИВ →</button></div>
          </section>
        </div>
      )}
    </div>
  )
}
