import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { audio } from '../audio'
import { discover, getArgState, subscribeArg } from '../arg'

const sectors = {
  restricted: {
    level: 1,
    code: '17-B',
    eyebrow: 'N.O.R.M. // RESTRICTED DATABASE',
    title: 'ЗАКРЫТЫЙ СЕКТОР',
    subtitle: 'Материалы, исключённые из публичного архива. Доступ предоставлен текущей сессии.',
    discovery: 'RESTRICTED_VISITED',
    notice: 'Часть документов разрешено вынести за пределы NORM-OS для автономного анализа. Система не контролирует содержимое после скачивания.',
    records: [
      {
        id: '17B-LM005-POST',
        type: 'ПОСТОПЕРАЦИОННЫЙ ЖУРНАЛ',
        title: 'LM-005 // сигнал после закрытия дела',
        summary: 'Необработанная выгрузка датчиков после официальной нейтрализации Ночного Душнилы.',
        filename: '17B_LM005_POST_OPERATION.txt',
        discovery: 'DOWNLOAD_LM005_POST',
        content: `N.O.R.M. // RESTRICTED 17-B\nFILE: LM005_POST_OPERATION\nACCESS: A-1\n\n03:41:18 SIGNAL DETECTED\n03:41:21 SIGNAL DETECTED\n03:41:24 SIGNAL DETECTED\n\nOPERATOR NOTE:\nвероятно остаточный шум\n\nENTITY STATUS:\nNEUTRALIZED -> [REDACTED]\n\nLAST WRITE: NORM-0\nQUERY RESIDUE: 1000-7\n\n--- SYSTEM COMMENT ---\nПовторение — это не ответ.\nСистема распознаёт последовательность.\n`,
      },
      {
        id: '17B-AG02',
        type: 'ВОССТАНОВЛЕННОЕ ЛИЧНОЕ ДЕЛО',
        title: 'AG-02 // карточка без сотрудника',
        summary: 'Фрагмент записи, которая восстанавливается после удаления из реестра персонала.',
        filename: 'AG02_REGISTRY_MISMATCH.txt',
        discovery: 'DOWNLOAD_AG02',
        content: `N.O.R.M. // PERSONNEL RECOVERY\nFILE: AG02_REGISTRY_MISMATCH\nACCESS: A-1\n\nPERSONNEL: AG-02\nREGISTRY STATUS: DOES NOT EXIST\nCARD STATUS: RECREATED AFTER DELETION\nSOURCE NODE: UNKNOWN\nCREATED BY: NORM-0\n\nAUTOMATED NOTE:\n17 связанных результатов скрыты текущим уровнем допуска.\nПоиск по автору записи может вернуть больше, чем карточка сотрудника.\n`,
      },
      {
        id: '17B-Z006',
        type: 'АНАЛИТИЧЕСКАЯ ЗАПИСКА',
        title: 'Z-006 // арифметический паттерн',
        summary: 'Черновик отдела корреляции. В нём нет готового решения — только наблюдение за поведением системы.',
        filename: 'Z006_SEQUENCE_MEMO.txt',
        discovery: 'DOWNLOAD_Z006_MEMO',
        content: `N.O.R.M. // CORRELATION MEMO\nSUBJECT: Z-006\nACCESS: A-1\n\nKNOWN INPUT: 1000-7\nFIRST RESULT: 993\n\nTEST NOTE:\nНе начинайте новую формулу.\nИспользуйте предыдущий результат как следующий вход.\nСистема реагирует не на число, а на непрерывность серии.\n\nWARNING:\nПосле нескольких итераций ответный канал перестаёт выглядеть вычислительным.\n`,
      },
    ],
  },
  black: {
    level: 2,
    code: 'BLACK',
    eyebrow: 'N.O.R.M. // UNINDEXED STORAGE',
    title: 'ЧЁРНЫЙ АРХИВ',
    subtitle: 'Файлы, существование которых не подтверждено основным реестром Н.О.Р.М.',
    discovery: 'BLACK_ARCHIVE_VISITED',
    notice: 'BLACK NODE не входит в штатную структуру NORM-OS. Метки владельца, времени и контрольных сумм могут противоречить друг другу.',
    records: [
      {
        id: 'BLACK-N0-1987',
        type: 'ИСТОЧНИК СЕССИИ',
        title: 'NORM-0 // первый вход',
        summary: 'Выгрузка метаданных неизвестной сессии. Датировка противоречит возрасту системы.',
        filename: 'NORM0_ORIGIN_1987.txt',
        discovery: 'DOWNLOAD_NORM0_ORIGIN',
        content: `BLACK ARCHIVE // NORM-0\nACCESS: A-2\n\nFIRST LOGIN: 18.11.1987\nCURRENT NORM-OS BUILD: 2026\nCONSISTENCY CHECK: IMPOSSIBLE\nACCOUNT OWNER: NONE\nPROCESS OWNER: NONE\n\nSELF-IDENTIFICATION TOKEN:\n4e4f524d2d30\n\nLAST QUERY:\nWHO ARE YOU\n\nNOTE:\nТокен не зашифрован. Он только записан не тем алфавитом.\n`,
      },
      {
        id: 'BLACK-AG00',
        type: 'ФРАГМЕНТ РЕЕСТРА',
        title: 'AG-00 // несуществующая запись',
        summary: 'Экспорт повреждённой карточки. Первые символы строк прошли восстановление лучше остального текста.',
        filename: 'AG00_FRAGMENT_RECOVERED.txt',
        discovery: 'DOWNLOAD_AG00_FRAGMENT',
        content: `N.O.R.M. // RECOVERED BLOCK\nFILE: AG00_FRAGMENT\n\nW ake event recorded before registry initialization.\nH andshake source has no personnel owner.\nO rigin timestamp rejected by system clock.\nA ccount identifier: NORM-0.\nR ecovery loop repeats after deletion.\nE very purge recreates the pointer.\nY our session is now present in the same table.\nO bserver status cannot be determined.\nU ser query remains pending.\n\nRECOVERY NOTE:\nПервые символы строк сохранились без ошибок.\n`,
      },
      {
        id: 'BLACK-PACKET-17',
        type: 'НЕЗАПРОШЕННЫЙ ПАКЕТ',
        title: 'Packet 17 // идентификатор отправителя',
        summary: 'Короткий пакет без маршрута. Полезная нагрузка выглядит как текстовый токен.',
        filename: 'PACKET_17_PAYLOAD.txt',
        discovery: 'DOWNLOAD_PACKET17',
        content: `PACKET 17\nROUTE: NONE\nSENDER: [NULL]\nRECEIVER: CURRENT SESSION\n\nPAYLOAD:\nTk9STS0w\n\nDECODER HINT:\nСтандартный текстовый контейнер. Терминал умеет DECODE.\n`,
      },
    ],
  },
  vault: {
    level: 3,
    code: 'ROOT',
    eyebrow: 'N.O.R.M. // ROOT STORAGE',
    title: 'КОРНЕВОЕ ХРАНИЛИЩЕ',
    subtitle: 'Локальный слой, который не отображается в штатном индексе базы.',
    discovery: 'ROOT_VAULT_VISITED',
    notice: 'Это не повышение роли сотрудника. Текущая сессия получила доступ к данным, для которых в системе не существует штатной группы разрешений.',
    records: [
      {
        id: 'ROOT-FINAL',
        type: 'НЕАВТОРИЗОВАННЫЙ ФАЙЛ',
        title: 'final.txt // владелец отсутствует',
        summary: 'Файл не числится созданным Н.О.Р.М. и не имеет процесса-владельца.',
        filename: 'NORM0_FINAL_HANDSHAKE.txt',
        discovery: 'DOWNLOAD_BLACK_FINAL',
        content: `THIS FILE WAS NOT CREATED BY N.O.R.M.\n\nTHE ARCHIVE DOES NOT REMEMBER ITS FIRST OPERATOR.\nIT ONLY REMEMBERS THAT SOMEONE WAS HERE BEFORE THE ARCHIVE EXISTED.\n\nNORM-0 // SESSION STILL ACTIVE\n\nCURRENT OBSERVER:\nYOU\n\nNEXT HANDSHAKE:\n[NOT IMPLEMENTED IN THIS BUILD]\n`,
      },
      {
        id: 'ROOT-TRACE',
        type: 'СЛЕД СЕССИИ',
        title: 'trace_0000.log // текущий наблюдатель',
        summary: 'Снимок служебной таблицы после получения A-3. Некоторые поля формируются в момент скачивания.',
        filename: 'SESSION_TRACE_0000.log',
        discovery: 'DOWNLOAD_ROOT_TRACE',
        dynamic: true,
      },
      {
        id: 'ROOT-MANIFEST',
        type: 'МАНИФЕСТ',
        title: 'manifest // структура скрытого слоя',
        summary: 'Список открытых секторов и подсказка, что доступ — это не финал, а новый слой базы.',
        filename: 'ROOT_STORAGE_MANIFEST.txt',
        discovery: 'DOWNLOAD_ROOT_MANIFEST',
        content: `N.O.R.M. // ROOT STORAGE MANIFEST\n\nA-0 PUBLIC DATABASE\nA-1 RESTRICTED 17-B\nA-2 BLACK ARCHIVE\nA-3 ROOT STORAGE\n\nRULE:\nКаждый уровень должен открывать не только команду, но и новый способ изучать базу.\n\nUNINDEXED OBJECTS REMAIN: ??\n`,
      },
    ],
  },
}

function buildDynamicFile(record, progress) {
  if (!record.dynamic) return record.content
  const operator = sessionStorage.getItem('norm-operator') || 'GUEST'
  const now = new Date().toISOString()
  return `N.O.R.M. // ROOT SESSION TRACE\nGENERATED: ${now}\nOPERATOR: ${operator}\nACCESS: A-${progress.clearance}\nDISCOVERIES: ${progress.discoveries.length}\n\nSESSION OBSERVER REGISTERED.\nSOURCE OF REGISTRATION: UNKNOWN.\nNORM-0: ACTIVE\n`
}

function downloadText(record, progress) {
  const content = buildDynamicFile(record, progress)
  const blob = new Blob([content], { type:'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = record.filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1200)
}

export default function ClearanceZone({ zone = 'restricted' }) {
  const config = sectors[zone] || sectors.restricted
  const navigate = useNavigate()
  const [progress, setProgress] = useState(getArgState)
  const [selected, setSelected] = useState(null)

  useEffect(() => subscribeArg(setProgress), [])
  useEffect(() => {
    if (progress.clearance >= config.level) discover(config.discovery)
  }, [config.discovery, config.level, progress.clearance])

  const unlocked = progress.clearance >= config.level
  const downloads = useMemo(() => config.records.filter((item) => progress.discoveries.includes(item.discovery)).length, [config.records, progress.discoveries])

  const download = (record) => {
    audio.archive()
    downloadText(record, progress)
    discover(record.discovery)
  }

  if (!unlocked) {
    return <div className="page clearance-zone clearance-zone--locked">
      <section className="clearance-denied">
        <small>{config.eyebrow}</small>
        <strong>ACCESS DENIED</strong>
        <h1>{config.title}</h1>
        <p>Текущая сессия имеет уровень A-{progress.clearance}. Для этого раздела требуется A-{config.level}.</p>
        <div><span>СЕКТОР СУЩЕСТВУЕТ</span><span>СОДЕРЖИМОЕ СКРЫТО</span><span>МАРШРУТ ЗАРЕГИСТРИРОВАН</span></div>
        <button type="button" onClick={() => navigate('/terminal')}>ПЕРЕЙТИ В ТЕРМИНАЛ →</button>
      </section>
    </div>
  }

  return <div className={`page clearance-zone clearance-zone--${zone}`}>
    <header className="clearance-zone__head">
      <div><small>{config.eyebrow}</small><h1>{config.title}</h1><p>{config.subtitle}</p></div>
      <div className="clearance-zone__badge"><span>СЕКТОР</span><b>{config.code}</b><small>ACCESS A-{config.level} VERIFIED</small></div>
    </header>

    <div className="clearance-zone__notice"><span>⚠</span><p>{config.notice}</p></div>

    <div className="clearance-zone__stats">
      <span>ДОСТУП <b>A-{progress.clearance}</b></span>
      <span>ФАЙЛОВ <b>{config.records.length}</b></span>
      <span>СКАЧАНО <b>{downloads}</b></span>
      <button type="button" onClick={() => navigate('/terminal')}>FIELD TERMINAL →</button>
    </div>

    <div className="classified-grid">
      {config.records.map((record, index) => <article className="classified-file" key={record.id} style={{'--delay':`${index * 70}ms`}}>
        <div className="classified-file__mark"><span>{String(index + 1).padStart(2,'0')}</span><i/></div>
        <small>{record.type}</small>
        <h2>{record.title}</h2>
        <p>{record.summary}</p>
        <dl><dt>INDEX</dt><dd>{record.id}</dd><dt>EXPORT</dt><dd>{record.filename}</dd><dt>CHECKSUM</dt><dd>{progress.discoveries.includes(record.discovery)?'DOWNLOADED':'UNREAD'}</dd></dl>
        <div className="classified-file__actions">
          <button type="button" data-sound="drawer" onClick={() => {audio.drawer();setSelected(record)}}>ПРОСМОТРЕТЬ</button>
          <button type="button" data-sound="terminal" onClick={() => download(record)}>⇩ СКАЧАТЬ ФАЙЛ</button>
        </div>
      </article>)}
    </div>

    {selected && <div className="classified-viewer" role="dialog" aria-modal="true" onClick={() => setSelected(null)}>
      <section onClick={(event) => event.stopPropagation()}>
        <header><div><small>{config.code} // SECURE PREVIEW</small><b>{selected.id}</b></div><button type="button" onClick={() => setSelected(null)}>×</button></header>
        <pre>{buildDynamicFile(selected, progress)}</pre>
        <footer><span>Предпросмотр показывает тот же текст, который будет сохранён на компьютер.</span><button type="button" onClick={() => download(selected)}>⇩ СКАЧАТЬ {selected.filename}</button></footer>
      </section>
    </div>}
  </div>
}
