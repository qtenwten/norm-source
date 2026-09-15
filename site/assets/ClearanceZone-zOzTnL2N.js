import{M as e,N as t,d as n,h as r,j as i,m as a,p as o,u as s}from"./index-uLnyDhhN.js";var c=t(e(),1),l=a(),u={restricted:{level:1,code:`17-B`,eyebrow:`N.O.R.M. // RESTRICTED DATABASE`,title:`ЗАКРЫТЫЙ СЕКТОР`,subtitle:`Материалы, исключённые из публичного архива. Доступ предоставлен текущей сессии.`,discovery:`RESTRICTED_VISITED`,notice:`Часть документов разрешено вынести за пределы NORM-OS для автономного анализа. Система не контролирует содержимое после скачивания.`,records:[{id:`17B-LM005-POST`,type:`ПОСТОПЕРАЦИОННЫЙ ЖУРНАЛ`,title:`LM-005 // сигнал после закрытия дела`,summary:`Необработанная выгрузка датчиков после официальной нейтрализации Ночного Душнилы.`,filename:`17B_LM005_POST_OPERATION.txt`,discovery:`DOWNLOAD_LM005_POST`,content:`N.O.R.M. // RESTRICTED 17-B
FILE: LM005_POST_OPERATION
ACCESS: A-1

03:41:18 SIGNAL DETECTED
03:41:21 SIGNAL DETECTED
03:41:24 SIGNAL DETECTED

OPERATOR NOTE:
вероятно остаточный шум

ENTITY STATUS:
NEUTRALIZED -> [REDACTED]

LAST WRITE: NORM-0
QUERY RESIDUE: 1000-7

--- SYSTEM COMMENT ---
Повторение — это не ответ.
Система распознаёт последовательность.
`},{id:`17B-AG02`,type:`ВОССТАНОВЛЕННОЕ ЛИЧНОЕ ДЕЛО`,title:`AG-02 // карточка без сотрудника`,summary:`Фрагмент записи, которая восстанавливается после удаления из реестра персонала.`,filename:`AG02_REGISTRY_MISMATCH.txt`,discovery:`DOWNLOAD_AG02`,content:`N.O.R.M. // PERSONNEL RECOVERY
FILE: AG02_REGISTRY_MISMATCH
ACCESS: A-1

PERSONNEL: AG-02
REGISTRY STATUS: DOES NOT EXIST
CARD STATUS: RECREATED AFTER DELETION
SOURCE NODE: UNKNOWN
CREATED BY: NORM-0

AUTOMATED NOTE:
17 связанных результатов скрыты текущим уровнем допуска.
Поиск по автору записи может вернуть больше, чем карточка сотрудника.
`},{id:`17B-Z006`,type:`АНАЛИТИЧЕСКАЯ ЗАПИСКА`,title:`Z-006 // арифметический паттерн`,summary:`Черновик отдела корреляции. В нём нет готового решения — только наблюдение за поведением системы.`,filename:`Z006_SEQUENCE_MEMO.txt`,discovery:`DOWNLOAD_Z006_MEMO`,content:`N.O.R.M. // CORRELATION MEMO
SUBJECT: Z-006
ACCESS: A-1

KNOWN INPUT: 1000-7
FIRST RESULT: 993

TEST NOTE:
Не начинайте новую формулу.
Используйте предыдущий результат как следующий вход.
Система реагирует не на число, а на непрерывность серии.

WARNING:
После нескольких итераций ответный канал перестаёт выглядеть вычислительным.
`}]},black:{level:2,code:`BLACK`,eyebrow:`N.O.R.M. // UNINDEXED STORAGE`,title:`ЧЁРНЫЙ АРХИВ`,subtitle:`Файлы, существование которых не подтверждено основным реестром Н.О.Р.М.`,discovery:`BLACK_ARCHIVE_VISITED`,notice:`BLACK NODE не входит в штатную структуру NORM-OS. Метки владельца, времени и контрольных сумм могут противоречить друг другу.`,records:[{id:`BLACK-N0-1987`,type:`ИСТОЧНИК СЕССИИ`,title:`NORM-0 // первый вход`,summary:`Выгрузка метаданных неизвестной сессии. Датировка противоречит возрасту системы.`,filename:`NORM0_ORIGIN_1987.txt`,discovery:`DOWNLOAD_NORM0_ORIGIN`,content:`BLACK ARCHIVE // NORM-0
ACCESS: A-2

FIRST LOGIN: 18.11.1987
CURRENT NORM-OS BUILD: 2026
CONSISTENCY CHECK: IMPOSSIBLE
ACCOUNT OWNER: NONE
PROCESS OWNER: NONE

SELF-IDENTIFICATION TOKEN:
4e4f524d2d30

LAST QUERY:
WHO ARE YOU

NOTE:
Токен не зашифрован. Он только записан не тем алфавитом.
`},{id:`BLACK-AG00`,type:`ФРАГМЕНТ РЕЕСТРА`,title:`AG-00 // несуществующая запись`,summary:`Экспорт повреждённой карточки. Первые символы строк прошли восстановление лучше остального текста.`,filename:`AG00_FRAGMENT_RECOVERED.txt`,discovery:`DOWNLOAD_AG00_FRAGMENT`,content:`N.O.R.M. // RECOVERED BLOCK
FILE: AG00_FRAGMENT

W ake event recorded before registry initialization.
H andshake source has no personnel owner.
O rigin timestamp rejected by system clock.
A ccount identifier: NORM-0.
R ecovery loop repeats after deletion.
E very purge recreates the pointer.
Y our session is now present in the same table.
O bserver status cannot be determined.
U ser query remains pending.

RECOVERY NOTE:
Первые символы строк сохранились без ошибок.
`},{id:`BLACK-PACKET-17`,type:`НЕЗАПРОШЕННЫЙ ПАКЕТ`,title:`Packet 17 // идентификатор отправителя`,summary:`Короткий пакет без маршрута. Полезная нагрузка выглядит как текстовый токен.`,filename:`PACKET_17_PAYLOAD.txt`,discovery:`DOWNLOAD_PACKET17`,content:`PACKET 17
ROUTE: NONE
SENDER: [NULL]
RECEIVER: CURRENT SESSION

PAYLOAD:
Tk9STS0w

DECODER HINT:
Стандартный текстовый контейнер. Терминал умеет DECODE.
`}]},vault:{level:3,code:`ROOT`,eyebrow:`N.O.R.M. // ROOT STORAGE`,title:`КОРНЕВОЕ ХРАНИЛИЩЕ`,subtitle:`Локальный слой, который не отображается в штатном индексе базы.`,discovery:`ROOT_VAULT_VISITED`,notice:`Это не финальный уровень. ROOT STORAGE содержит признаки старого системного тома, удалённого из обычной навигации.`,records:[{id:`ROOT-FINAL`,type:`НЕАВТОРИЗОВАННЫЙ ФАЙЛ`,title:`final.txt // владелец отсутствует`,summary:`Файл не числится созданным Н.О.Р.М. и указывает, что следующий слой находится не в архиве, а в самой NORM-OS.`,filename:`NORM0_FINAL_HANDSHAKE.txt`,discovery:`DOWNLOAD_BLACK_FINAL`,content:`THIS FILE WAS NOT CREATED BY N.O.R.M.

THE ARCHIVE DOES NOT REMEMBER ITS FIRST OPERATOR.
IT ONLY REMEMBERS THAT SOMEONE WAS HERE BEFORE THE ARCHIVE EXISTED.

NORM-0 // SESSION STILL ACTIVE
CURRENT OBSERVER: YOU

NEXT HANDSHAKE:
THE ARCHIVE IS OVER. INSPECT THE OPERATING SYSTEM.

TRY WHAT AN ADMINISTRATOR WOULD TRY:
ls -la /
`},{id:`ROOT-TRACE`,type:`СЛЕД СЕССИИ`,title:`trace_0000.log // текущий наблюдатель`,summary:`Снимок служебной таблицы после получения A-3. Некоторые поля формируются в момент скачивания.`,filename:`SESSION_TRACE_0000.log`,discovery:`DOWNLOAD_ROOT_TRACE`,dynamic:!0},{id:`ROOT-MANIFEST`,type:`МАНИФЕСТ`,title:`manifest // структура скрытого слоя`,summary:`Список открытых секторов и признак того, что за ROOT существует несмонтированный legacy volume.`,filename:`ROOT_STORAGE_MANIFEST.txt`,discovery:`DOWNLOAD_ROOT_MANIFEST`,content:`N.O.R.M. // ROOT STORAGE MANIFEST

A-0 PUBLIC DATABASE
A-1 RESTRICTED 17-B
A-2 BLACK ARCHIVE
A-3 ROOT STORAGE
A-4 [LEGACY VOLUME // NOT MOUNTED]
A-5 [MIRROR // PRIVILEGED]

SYSTEM NOTE:
Archive navigation intentionally omits operating-system paths.
Use the field terminal as a shell, not only as a search box.
`},{id:`ROOT-SYS-MAP`,type:`СИСТЕМНЫЙ ФРАГМЕНТ`,title:`mount.map // удалённый маршрут`,summary:`Часть старой таблицы монтирования. Этого пути нет среди обычных разделов сайта.`,filename:`LEGACY_MOUNT_MAP.txt`,discovery:`DOWNLOAD_MOUNT_MAP`,content:`NORM-OS // LEGACY MOUNT MAP

DEVICE: /dev/n0
LABEL: GHOSTFS
TARGET: /mnt/ghost
AUTO_MOUNT: false
STATUS: PRESENT / UNMOUNTED

RELATED USERS:
AG-04
AG-09
AG-13

Use system files to verify before mounting.
`}]}};function d(e,t){if(!e.dynamic)return e.content;let n=sessionStorage.getItem(`norm-operator`)||`GUEST`;return`N.O.R.M. // ROOT SESSION TRACE\nGENERATED: ${new Date().toISOString()}\nOPERATOR: ${n}\nACCESS: A-${t.clearance}\nDISCOVERIES: ${t.discoveries.length}\n\nSESSION OBSERVER REGISTERED.\nSOURCE OF REGISTRATION: UNKNOWN.\nNORM-0: ACTIVE\nSYSTEM PATHS: HIDDEN FROM ARCHIVE NAVIGATION\n`}function f(e,t){let n=d(e,t),r=new Blob([n],{type:`text/plain;charset=utf-8`}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=e.filename,document.body.appendChild(a),a.click(),a.remove(),window.setTimeout(()=>URL.revokeObjectURL(i),1200)}function p({zone:e=`restricted`}){let t=u[e]||u.restricted,a=i(),[p,m]=(0,c.useState)(n),[h,g]=(0,c.useState)(null);(0,c.useEffect)(()=>o(m),[]),(0,c.useEffect)(()=>{p.clearance>=t.level&&s(t.discovery)},[t.discovery,t.level,p.clearance]);let _=p.clearance>=t.level,v=(0,c.useMemo)(()=>t.records.filter(e=>p.discoveries.includes(e.discovery)).length,[t.records,p.discoveries]),y=e=>{r.archive(),f(e,p),s(e.discovery)};return _?(0,l.jsxs)(`div`,{className:`page clearance-zone clearance-zone--${e}`,children:[(0,l.jsxs)(`header`,{className:`clearance-zone__head`,children:[(0,l.jsxs)(`div`,{children:[(0,l.jsx)(`small`,{children:t.eyebrow}),(0,l.jsx)(`h1`,{children:t.title}),(0,l.jsx)(`p`,{children:t.subtitle})]}),(0,l.jsxs)(`div`,{className:`clearance-zone__badge`,children:[(0,l.jsx)(`span`,{children:`СЕКТОР`}),(0,l.jsx)(`b`,{children:t.code}),(0,l.jsxs)(`small`,{children:[`ACCESS A-`,t.level,` VERIFIED`]})]})]}),(0,l.jsxs)(`div`,{className:`clearance-zone__notice`,children:[(0,l.jsx)(`span`,{children:`⚠`}),(0,l.jsx)(`p`,{children:t.notice})]}),(0,l.jsxs)(`div`,{className:`clearance-zone__stats`,children:[(0,l.jsxs)(`span`,{children:[`ДОСТУП `,(0,l.jsxs)(`b`,{children:[`A-`,p.clearance]})]}),(0,l.jsxs)(`span`,{children:[`ФАЙЛОВ `,(0,l.jsx)(`b`,{children:t.records.length})]}),(0,l.jsxs)(`span`,{children:[`СКАЧАНО `,(0,l.jsx)(`b`,{children:v})]}),(0,l.jsx)(`button`,{type:`button`,onClick:()=>a(`/terminal`),children:`FIELD TERMINAL →`})]}),(0,l.jsx)(`div`,{className:`classified-grid`,children:t.records.map((e,t)=>(0,l.jsxs)(`article`,{className:`classified-file`,style:{"--delay":`${t*70}ms`},children:[(0,l.jsxs)(`div`,{className:`classified-file__mark`,children:[(0,l.jsx)(`span`,{children:String(t+1).padStart(2,`0`)}),(0,l.jsx)(`i`,{})]}),(0,l.jsx)(`small`,{children:e.type}),(0,l.jsx)(`h2`,{children:e.title}),(0,l.jsx)(`p`,{children:e.summary}),(0,l.jsxs)(`dl`,{children:[(0,l.jsx)(`dt`,{children:`INDEX`}),(0,l.jsx)(`dd`,{children:e.id}),(0,l.jsx)(`dt`,{children:`EXPORT`}),(0,l.jsx)(`dd`,{children:e.filename}),(0,l.jsx)(`dt`,{children:`CHECKSUM`}),(0,l.jsx)(`dd`,{children:p.discoveries.includes(e.discovery)?`DOWNLOADED`:`UNREAD`})]}),(0,l.jsxs)(`div`,{className:`classified-file__actions`,children:[(0,l.jsx)(`button`,{type:`button`,"data-sound":`drawer`,onClick:()=>{r.drawer(),g(e)},children:`ПРОСМОТРЕТЬ`}),(0,l.jsx)(`button`,{type:`button`,"data-sound":`terminal`,onClick:()=>y(e),children:`⇩ СКАЧАТЬ ФАЙЛ`})]})]},e.id))}),h&&(0,l.jsx)(`div`,{className:`classified-viewer`,role:`dialog`,"aria-modal":`true`,onClick:()=>g(null),children:(0,l.jsxs)(`section`,{onClick:e=>e.stopPropagation(),children:[(0,l.jsxs)(`header`,{children:[(0,l.jsxs)(`div`,{children:[(0,l.jsxs)(`small`,{children:[t.code,` // SECURE PREVIEW`]}),(0,l.jsx)(`b`,{children:h.id})]}),(0,l.jsx)(`button`,{type:`button`,onClick:()=>g(null),children:`×`})]}),(0,l.jsx)(`pre`,{children:d(h,p)}),(0,l.jsxs)(`footer`,{children:[(0,l.jsx)(`span`,{children:`Предпросмотр показывает тот же текст, который будет сохранён на компьютер.`}),(0,l.jsxs)(`button`,{type:`button`,onClick:()=>y(h),children:[`⇩ СКАЧАТЬ `,h.filename]})]})]})})]}):(0,l.jsx)(`div`,{className:`page clearance-zone clearance-zone--locked`,children:(0,l.jsxs)(`section`,{className:`clearance-denied`,children:[(0,l.jsx)(`small`,{children:t.eyebrow}),(0,l.jsx)(`strong`,{children:`ACCESS DENIED`}),(0,l.jsx)(`h1`,{children:t.title}),(0,l.jsxs)(`p`,{children:[`Текущая сессия имеет уровень A-`,p.clearance,`. Для этого раздела требуется A-`,t.level,`.`]}),(0,l.jsxs)(`div`,{children:[(0,l.jsx)(`span`,{children:`СЕКТОР СУЩЕСТВУЕТ`}),(0,l.jsx)(`span`,{children:`СОДЕРЖИМОЕ СКРЫТО`}),(0,l.jsx)(`span`,{children:`МАРШРУТ ЗАРЕГИСТРИРОВАН`})]}),(0,l.jsx)(`button`,{type:`button`,onClick:()=>a(`/terminal`),children:`ПЕРЕЙТИ В ТЕРМИНАЛ →`})]})})}export{p as default};