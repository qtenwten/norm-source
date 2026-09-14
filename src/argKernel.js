export const recoveredAgents = [
  {
    id:'04', code:'AG-04', name:'ИЛЬЯ ВОРОНОВ', role:'ИНЖЕНЕР СИГНАЛОВ', years:'1998—2004', status:'ПРОПАЛ', official:'ПРЕДПОЛОЖИТЕЛЬНО ПОГИБ', image:'/assets/agent-04-recovered.svg', fragment:'OR',
    summary:'Полевой инженер Н.О.Р.М., специализация — низкочастотные аномалии, радиопомехи и автономные регистраторы.',
    story:[
      'Последний подтверждённый выезд: внутреннее дело NO-17 «Пустая частота». Публичных материалов по делу нет.',
      '12.02.2004 группа потеряла связь с Вороновым на 11 минут. После восстановления канала его передатчик продолжал работать, но сотрудник на месте отсутствовал.',
      'Тело не найдено. Через 72 часа кадровый реестр автоматически сменил статус на «предположительно погиб». Решение о закрытии поиска подписал неизвестный оператор.',
      'В 2018 году контрольная система зарегистрировала старый позывной AG-04 внутри ROOT STORAGE. Источник сигнала не определён.',
    ],
    last:'12.02.2004 // 03:17:44', caseId:'NO-17', cause:'Исчезновение во время разрыва сигнала. Официальная версия — гибель без обнаружения тела.',
  },
  {
    id:'09', code:'AG-09', name:'ВЕРА ЛАНСКАЯ', role:'КРИПТОАНАЛИТИК АРХИВА', years:'2002—2009', status:'УТРАЧЕНА', official:'ПОГИБЛА 21.10.2009', image:'/assets/agent-09-recovered.svg', fragment:'PHE',
    summary:'Архивный аналитик. Восстанавливала повреждённые журналы и сопоставляла повторяющиеся фразы между несвязанными делами.',
    story:[
      'Согласно официальной карточке, Ланская погибла при пожаре в старом архивном узле 21.10.2009. Личность подтверждена по жетону и служебным документам; биологического материала в деле нет.',
      'Через 19 месяцев после даты смерти её личный ключ успешно прошёл авторизацию в закрытом секторе. Вход длился 46 секунд и оставил одну команду: «не верьте времени файла».',
      'Все последующие попытки проверить журнал завершались самопроизвольным восстановлением удалённых строк.',
      'Карточка AG-09 на публичном уровне специально оставлена как «утрачена», чтобы не привлекать внимание к несоответствию дат.',
    ],
    last:'17.05.2011 // 04:06:12', caseId:'AR-31', cause:'Официально — пожар архивного узла. Внутренний статус: обстоятельства смерти не подтверждены.',
  },
  {
    id:'13', code:'AG-13', name:'АНТОН РУДНЕВ', role:'ПОЛЕВОЙ ОПЕРАТОР КАМЕРЫ', years:'2007—2013', status:'ФАЙЛ УДАЛЁН', official:'ПОГИБ 03.06.2013', image:'/assets/agent-13-recovered.svg', fragment:'US',
    summary:'Полевой оператор изображения. Отвечал за фиксацию объектов, которые не регистрировались штатными датчиками.',
    story:[
      'Официальная причина смерти — дорожная авария после возвращения с технического выезда. Дело закрыто как не связанное с аномальной активностью.',
      'За четыре дня до аварии Руднев отправил в архив снимок пустого коридора и попросил не удалять оригинал. На копиях ничего необычного не обнаружено.',
      'В 2014 году система распознавания лиц трижды отметила AG-13 на повреждённых кадрах из закрытого хранилища. Исходные изображения отсутствуют.',
      'После третьего совпадения цифровая карточка сотрудника была удалена неизвестным процессом. Остался только индекс и контрольная сумма.',
    ],
    last:'03.06.2013 // 22:51:09', caseId:'IMG-13', cause:'Официально — ДТП. Связь с аномальной активностью не доказана.',
  },
]

export const virtualFiles = [
  { path:'/README', level:0, id:'README', body:[
    'N.O.R.M. FIELD TERMINAL // INTERNAL NODE',
    'Команды терминала работают как с кодами Н.О.Р.М., так и с UNIX-подобным синтаксисом.',
    'Начните с: ls · list cases · leads · search 02:59',
    'Подсказка для любопытных: обычный ls показывает не всё. Системные администраторы любят флаг -la.',
  ]},
  { path:'/cases/lm-005/cam_025951.log', level:0, id:'LM005_CAM_025951', discovery:'LM005_CAMERA', body:[
    'LM-005 // CAMERA BEDROOM_01','TIMESTAMP: 02:59:51','STATUS: VERIFIED','FRAME: UNREGISTERED ENTITY PRESENT','AUDIO MARKER: «КОРИЧНЕВЫЙ ВОМБАТ»','NOTE: маркер отсутствует в официальном отчёте.'
  ]},
  { path:'/cases/lm-005/post_operation.log', level:1, id:'LM005_POST', discovery:'LM005_POST', body:[
    'LM-005 // POST-OPERATION MONITOR','03:41:18 SIGNAL DETECTED','03:41:21 SIGNAL DETECTED','03:41:24 SIGNAL DETECTED','ENTITY STATUS: NEUTRALIZED → ███████████','LAST WRITE: NORM-0','QUERY RESIDUE: 1000-7'
  ]},
  { path:'/cases/lm-006/z006.log', level:0, id:'Z006', discovery:'Z006_FILE', body:[
    'LM-006 // Z-006 // DEAD INSIDE','KNOWN PHRASE: 1000-7','KNOWN VOICE MARKERS: «ДУШИ ЖДУТ» / «НУЖНО БОЛЬШЕ ДУШ»','RESIDUAL: арифметический паттерн сохранён'
  ]},
  { path:'/restricted/index', level:1, id:'RESTRICTED_INDEX', discovery:'RESTRICTED_INDEX', body:[
    'RESTRICTED NODE // ACCESS A-1','/restricted/ag-02.log','/cases/lm-005/post_operation.log','1 ENTRY OMITTED BY POLICY 17-B'
  ]},
  { path:'/restricted/ag-02.log', level:1, id:'AG02_FRAGMENT', discovery:'AG02_FRAGMENT', body:[
    'PERSONNEL: AG-02','REGISTRY STATUS: DOES NOT EXIST','CARD STATUS: RECREATED AFTER DELETION','CREATED BY: NORM-0','SOURCE NODE: UNKNOWN'
  ]},
  { path:'/black/norm0_origin.log', level:2, id:'NORM0_ORIGIN', discovery:'NORM0_ORIGIN', body:[
    'BLACK ARCHIVE // NORM-0','FIRST LOGIN: 18.11.1987','CURRENT NORM-OS BUILD: 2026','CONSISTENCY CHECK: IMPOSSIBLE','ACCOUNT OWNER: NONE','PROCESS OWNER: NONE','SELF-IDENTIFICATION TOKEN: 4e4f524d2d30','LAST QUERY: WHO ARE YOU'
  ]},
  { path:'/black/packet17.dat', level:2, id:'PACKET17', discovery:'PACKET17_OPEN', body:[
    'PACKET 17 // ROUTE NONE','PAYLOAD: Tk9STS0w','DECODER: BASE64 COMPATIBLE','RECEIVER: CURRENT SESSION'
  ]},
  { path:'/black/final.txt', level:3, id:'BLACK_FINAL', discovery:'BLACK_FINAL', body:[
    'THIS FILE WAS NOT CREATED BY N.O.R.M.','THE ARCHIVE DOES NOT REMEMBER ITS FIRST OPERATOR.','NORM-0 // SESSION STILL ACTIVE','NEXT LAYER IS NOT IN THE ARCHIVE INDEX.','TRY THE OPERATING SYSTEM.'
  ]},

  { path:'/etc/norm.conf', level:3, id:'SYS_NORMCONF', discovery:'SYS_NORMCONF', system:true, body:[
    '# NORM-OS internal mount table','PUBLIC=/archive','ROOT=/vault','GHOST_DEVICE=/dev/n0','GHOST_MOUNT=/mnt/ghost','AUTO_MOUNT=false','NOTE=legacy personnel volume removed from navigation'
  ]},
  { path:'/var/log/auth.log', level:3, id:'SYS_AUTHLOG', discovery:'SYS_AUTHLOG', system:true, body:[
    '2004-02-12 03:17:44 AG-04 LINK LOST','2009-10-21 22:14:08 AG-09 STATUS DECEASED','2011-05-17 04:06:12 AG-09 AUTH SUCCESS // impossible','2013-06-03 22:51:09 AG-13 STATUS DECEASED','2014-08-19 01:11:02 AG-13 FACE MATCH // source missing','2018-11-18 18:11:87 AG-04 CALLSIGN DETECTED // ROOT','DEVICE /dev/n0 PRESENT // NOT MOUNTED'
  ]},
  { path:'/home/ag-04/.fieldnote', level:3, id:'AG04_FIELDNOTE', discovery:'AG04_FIELDNOTE', hidden:true, system:true, body:[
    'AG-04 // personal note','Если основной индекс снова исчезнет, не ищите карточки в /agents.','Старый персональный том всё ещё видит устройство n0.','Это не пароль. Носитель нужно смонтировать.','target: /mnt/ghost'
  ]},
  { path:'/home/ag-09/.bash_history', level:3, id:'AG09_HISTORY', discovery:'AG09_HISTORY', hidden:true, system:true, body:[
    'cat /etc/norm.conf','strings /dev/n0','mount /dev/n0 /mnt/ghost','ls -la /mnt/ghost','cat /mnt/ghost/personnel/ag-04.dos','echo "не верьте времени файла"'
  ]},
  { path:'/proc/norm0/status', level:3, id:'NORM0_PROC', discovery:'NORM0_PROC', hidden:true, system:true, body:[
    'Name: norm0','State: S (sleeping?)','Pid: 0','PPid: 0','Started: 18.11.1987','Owner: none','OpenFD: /dev/n0','Watcher: current-session'
  ]},
  { path:'/dev/n0', level:3, id:'DEV_N0', discovery:'DEV_N0', system:true, binary:true, body:[
    '\u0000NORMVOL\u0000GHOSTFS\u0000PERSONNEL_RECOVERY\u0000MOUNT=/mnt/ghost\u0000AG-04\u0000AG-09\u0000AG-13\u0000ORPHEUS\u0000'
  ]},

  { path:'/mnt/ghost/index', level:4, id:'GHOST_INDEX', discovery:'GHOST_INDEX', body:[
    'GHOSTFS // RECOVERED PERSONNEL VOLUME','AG-04 // FILE PRESENT','AG-09 // FILE PRESENT','AG-13 // FILE PRESENT','THREE KEY FRAGMENTS DETECTED','VISUAL INTERFACE: /ghost-registry'
  ]},
  { path:'/mnt/ghost/personnel/ag-04.dos', level:4, id:'GHOST_AG04', discovery:'GHOST_AG04', body:[
    'AG-04 // ИЛЬЯ ВОРОНОВ','ROLE: SIGNAL ENGINEER','STATUS: MISSING / PRESUMED DEAD','LAST CASE: NO-17 «ПУСТАЯ ЧАСТОТА»','BODY: NOT RECOVERED','KEY FRAGMENT: OR','NOTE: позывной обнаружен в ROOT STORAGE спустя 14 лет.'
  ]},
  { path:'/mnt/ghost/personnel/ag-09.dos', level:4, id:'GHOST_AG09', discovery:'GHOST_AG09', body:[
    'AG-09 // ВЕРА ЛАНСКАЯ','ROLE: ARCHIVE CRYPTANALYST','OFFICIAL DEATH: 21.10.2009','POSTHUMOUS AUTH: 17.05.2011','KEY FRAGMENT: PHE','LAST COMMAND: «не верьте времени файла»'
  ]},
  { path:'/mnt/ghost/personnel/ag-13.dos', level:4, id:'GHOST_AG13', discovery:'GHOST_AG13', body:[
    'AG-13 // АНТОН РУДНЕВ','ROLE: FIELD CAMERA OPERATOR','OFFICIAL DEATH: 03.06.2013','FACE MATCHES AFTER DEATH: 3','KEY FRAGMENT: US','DIGITAL CARD: DELETED BY UNKNOWN PROCESS'
  ]},
  { path:'/mnt/ghost/cases/no-17.log', level:4, id:'NO17_LOG', discovery:'NO17_LOG', body:[
    'NO-17 // «ПУСТАЯ ЧАСТОТА»','CLASS: SIGNAL ANOMALY','PUBLICATION: NEVER','FIELD TEAM: HISTORICAL N.O.R.M. UNIT','AG-04 LOST DURING 11-MINUTE LINK INTERRUPTION','LAST AUDIO CONTAINS AG-04 CALLSIGN TRANSMITTED FROM UNASSIGNED TIME INDEX','CASE SEALED BEFORE CURRENT FIELD UNIT LM WAS FORMED.'
  ]},
  { path:'/mnt/ghost/.fragments', level:4, id:'GHOST_FRAGMENTS', discovery:'GHOST_FRAGMENTS', hidden:true, body:[
    'RECOVERED KEY FRAGMENTS','AG-04: OR','AG-09: PHE','AG-13: US','ASSEMBLY ORDER: personnel index order','PRIVILEGED COMMAND: sudo unlock <token>'
  ]},

  { path:'/mirror/index', level:5, id:'MIRROR_INDEX', discovery:'MIRROR_INDEX', body:[
    'MIRROR NODE // OBSERVER LAYER','This node mirrors records deleted from the visible archive.','Do not assume deletion means absence.','CURRENT OBSERVER: YOU','NORM-0: WATCHING'
  ]},
  { path:'/mirror/personnel.continuity', level:5, id:'MIRROR_CONTINUITY', discovery:'MIRROR_CONTINUITY', body:[
    'PERSONNEL CONTINUITY REPORT','Historical units and the modern LM field group are separate generations of the same archive tradition.','LM-001—LM-006 remain the current field record.','NO-17 / AR-31 / IMG-13 are internal historical incidents and were never public episodes.','No historical file supersedes the documented events of LM-005 or LM-006.'
  ]},
  { path:'/mirror/norm0.snapshot', level:5, id:'MIRROR_NORM0', discovery:'MIRROR_NORM0', body:[
    'SNAPSHOT 0000','NORM-0 is not listed as an employee.','NORM-0 is not listed as software.','Every archive migration preserved the identifier without a migration source.','Hypothesis: NORM-0 is a continuity marker created by the archive itself.','Counter-hypothesis: someone has been inside the system since before the system existed.'
  ]},
  { path:'/mirror/observer.key', level:5, id:'OBSERVER_KEY', discovery:'OBSERVER_KEY', body:[
    'OBSERVER KEY // LOCAL TROPHY','CLEARANCE: A-5','STATUS: ACQUIRED','This key grants no real-world access.','It certifies that the current session reached the deepest implemented ARG layer.','EXPORT WITH: download /mirror/observer.key'
  ]},
]

export const fileAliases = {
  LM005_CAM_025951:'/cases/lm-005/cam_025951.log', CAM_025951:'/cases/lm-005/cam_025951.log', LM005_POST:'/cases/lm-005/post_operation.log', Z006:'/cases/lm-006/z006.log',
  'NORM-0':'/black/norm0_origin.log', NORM0:'/black/norm0_origin.log', NORMCONF:'/etc/norm.conf', AUTHLOG:'/var/log/auth.log', AG04:'/mnt/ghost/personnel/ag-04.dos', AG09:'/mnt/ghost/personnel/ag-09.dos', AG13:'/mnt/ghost/personnel/ag-13.dos',
}

export function normalizePath(value, cwd = '/') {
  const raw = String(value || '').trim()
  if (!raw) return cwd
  const absolute = raw.startsWith('/') ? raw : `${cwd.replace(/\/$/, '')}/${raw}`
  const parts = []
  absolute.split('/').forEach((part) => {
    if (!part || part === '.') return
    if (part === '..') parts.pop()
    else parts.push(part.toLowerCase())
  })
  return `/${parts.join('/')}` || '/'
}

export function findVirtualFile(token, cwd = '/') {
  const cleaned = String(token || '').trim().replace(/^['"]|['"]$/g, '')
  const alias = fileAliases[cleaned.toUpperCase()]
  const path = alias || normalizePath(cleaned, cwd)
  return virtualFiles.find((item) => item.path.toLowerCase() === path.toLowerCase()) || null
}

export function availableDirectories(progress) {
  const level = progress.clearance || 0
  const dirs = ['/', '/cases', '/cases/lm-005', '/cases/lm-006', '/entities', '/agents']
  if (level >= 1) dirs.push('/restricted')
  if (level >= 2) dirs.push('/black')
  if (level >= 3) dirs.push('/etc', '/var', '/var/log', '/home', '/home/ag-04', '/home/ag-09', '/proc', '/proc/norm0', '/dev', '/mnt')
  if (level >= 4 || progress.mountedGhost) dirs.push('/mnt/ghost', '/mnt/ghost/personnel', '/mnt/ghost/cases')
  if (level >= 5) dirs.push('/mirror')
  return dirs
}

export function listVirtualDirectory(path, progress, showHidden = false) {
  const p = normalizePath(path)
  const level = progress.clearance || 0
  const map = {
    '/':['README','cases/','entities/','agents/', level>=1?'restricted/':'restricted/ [A-1]', level>=2?'black/':'black/ [A-2]'],
    '/cases':['lm-005/','lm-006/'],
    '/cases/lm-005':['cam_025951.log',level>=1?'post_operation.log':'post_operation.log [A-1]'],
    '/cases/lm-006':['z006.log'],
    '/entities':['N-005','Z-006','R-002','K-003','C-004'],
    '/agents':level>=2?['AG-SEN','AG-GRIG','AG-02','AG-00','AG-04 [ARCHIVED]','AG-09 [LOST]','AG-13 [DELETED]']:['AG-SEN','AG-GRIG','AG-02 [RESTRICTED]','AG-04 [ARCHIVED]','AG-09 [LOST]','AG-13 [DELETED]'],
    '/restricted':level>=1?['index','ag-02.log']:['ACCESS DENIED'],
    '/black':level>=2?['norm0_origin.log','packet17.dat',level>=3?'final.txt':'final.txt [A-3]']:['ACCESS DENIED'],
    '/etc':level>=3?['norm.conf']:['ACCESS DENIED'],
    '/var':level>=3?['log/']:['ACCESS DENIED'],
    '/var/log':level>=3?['auth.log']:['ACCESS DENIED'],
    '/home':level>=3?['ag-04/','ag-09/']:['ACCESS DENIED'],
    '/home/ag-04':level>=3?(showHidden?['.','..','.fieldnote']:[]):['ACCESS DENIED'],
    '/home/ag-09':level>=3?(showHidden?['.','..','.bash_history']:[]):['ACCESS DENIED'],
    '/proc':level>=3?['norm0/']:['ACCESS DENIED'],
    '/proc/norm0':level>=3?(showHidden?['status']:['status']):['ACCESS DENIED'],
    '/dev':level>=3?['n0']:['ACCESS DENIED'],
    '/mnt':level>=3?[(level>=4||progress.mountedGhost)?'ghost/':'ghost/ [NOT MOUNTED]']:['ACCESS DENIED'],
    '/mnt/ghost':level>=4?['index','personnel/','cases/',...(showHidden?['.fragments']:[])]:['ACCESS DENIED'],
    '/mnt/ghost/personnel':level>=4?['ag-04.dos','ag-09.dos','ag-13.dos']:['ACCESS DENIED'],
    '/mnt/ghost/cases':level>=4?['no-17.log']:['ACCESS DENIED'],
    '/mirror':level>=5?['index','personnel.continuity','norm0.snapshot','observer.key']:['ACCESS DENIED'],
  }
  let entries = map[p] || []
  if (p==='/' && showHidden && level>=3) entries=[...entries,'.sys/','etc/','var/','home/','proc/','dev/','mnt/']
  return entries
}

export function renderFileContent(file) {
  return Array.isArray(file?.body) ? file.body : []
}
