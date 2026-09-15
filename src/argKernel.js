export const recoveredAgents = [
  {
    id:'04', code:'AG-04', name:'ИЛЬЯ ВОРОНОВ', role:'ИНЖЕНЕР СИГНАЛОВ', years:'1998—2004', status:'ПРОПАЛ', official:'ПРЕДПОЛОЖИТЕЛЬНО ПОГИБ', image:'/assets/agent-04-recovered.svg', fragment:'OR',
    born:'1974', clearance:'B-4', unit:'ТЕХНИЧЕСКАЯ ГРУППА // SIGNAL',
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
    born:'1979', clearance:'B-4', unit:'АРХИВНЫЙ ОТДЕЛ // CORRELATION',
    summary:'Архивный аналитик. Восстанавливала повреждённые журналы и сопоставляла повторяющиеся фразы между несвязанными делами.',
    story:[
      'Согласно официальной карточке, Ланская погибла при пожаре в старом архивном узле 21.10.2009. Личность подтверждена по жетону и служебным документам; биологического материала в деле нет.',
      'Через 19 месяцев после даты смерти её личный ключ успешно прошёл авторизацию в закрытом секторе. Вход длился 46 секунд и оставил одну команду: «не верьте времени файла».',
      'За несколько месяцев до пожара Ланская поднимала старую запись NO-17 и отмечала, что временные метки радиосигнала AG-04 не совпадают с журналом выезда.',
      'Карточка AG-09 на публичном уровне специально оставлена как «утрачена», чтобы не привлекать внимание к несоответствию дат.',
    ],
    last:'17.05.2011 // 04:06:12', caseId:'AR-31', cause:'Официально — пожар архивного узла. Внутренний статус: обстоятельства смерти не подтверждены.',
  },
  {
    id:'13', code:'AG-13', name:'АНТОН РУДНЕВ', role:'ПОЛЕВОЙ ОПЕРАТОР КАМЕРЫ', years:'2007—2013', status:'ФАЙЛ УДАЛЁН', official:'ПОГИБ 03.06.2013', image:'/assets/agent-13-recovered.svg', fragment:'US',
    born:'1985', clearance:'B-3', unit:'ПОЛЕВАЯ ФИКСАЦИЯ // IMAGE',
    summary:'Полевой оператор изображения. Отвечал за фиксацию объектов, которые не регистрировались штатными датчиками.',
    story:[
      'Официальная причина смерти — дорожная авария после возвращения с технического выезда. Дело закрыто как не связанное с аномальной активностью.',
      'За четыре дня до аварии Руднев снимал законсервированный архивный коридор, связанный с делом AR-31, и попросил не удалять оригиналы серии.',
      'В служебной серии было три кадра. Метаданные указывают на четвёртый файл, которого нет в каталоге. В 2014 году система распознавания лиц трижды отметила AG-13 на повреждённых копиях этого кадра.',
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
  { path:'/restricted/.audit', level:1, id:'RESTRICTED_AUDIT', discovery:'RESTRICTED_AUDIT', hidden:true, body:[
    'POLICY 17-B // AUDIT','3 personnel indexes were removed from normal navigation.','AG-04 // archived','AG-09 // lost','AG-13 // deleted','SOURCE VOLUME: legacy / not mounted'
  ]},

  { path:'/black/norm0_origin.log', level:2, id:'NORM0_ORIGIN', discovery:'NORM0_ORIGIN', body:[
    'BLACK ARCHIVE // NORM-0','FIRST LOGIN: 18.11.1987','CURRENT NORM-OS BUILD: 2026','CONSISTENCY CHECK: IMPOSSIBLE','ACCOUNT OWNER: NONE','PROCESS OWNER: NONE','SELF-IDENTIFICATION TOKEN: 4e4f524d2d30','LAST QUERY: WHO ARE YOU'
  ]},
  { path:'/black/packet17.dat', level:2, id:'PACKET17', discovery:'PACKET17_OPEN', body:[
    'PACKET 17 // ROUTE NONE','PAYLOAD: Tk9STS0w','DECODER: BASE64 COMPATIBLE','RECEIVER: CURRENT SESSION'
  ]},
  { path:'/black/.deleted-index', level:2, id:'BLACK_DELETED_INDEX', discovery:'BLACK_DELETED_INDEX', hidden:true, body:[
    'DELETED INDEX CACHE','AG-04 -> inode 4004','AG-09 -> inode 4009','AG-13 -> inode 4013','DEVICE POINTER -> /dev/n0','NOTE: delete removed routes, not blocks'
  ]},
  { path:'/black/final.txt', level:3, id:'BLACK_FINAL', discovery:'BLACK_FINAL', body:[
    'THIS FILE WAS NOT CREATED BY N.O.R.M.','THE ARCHIVE DOES NOT REMEMBER ITS FIRST OPERATOR.','NORM-0 // SESSION STILL ACTIVE','NEXT LAYER IS NOT IN THE ARCHIVE INDEX.','TRY THE OPERATING SYSTEM.'
  ]},

  { path:'/etc/norm.conf', level:3, id:'SYS_NORMCONF', discovery:'SYS_NORMCONF', system:true, body:[
    '# NORM-OS internal mount table','PUBLIC=/archive','ROOT=/vault','GHOST_DEVICE=/dev/n0','GHOST_MOUNT=/mnt/ghost','AUTO_MOUNT=false','LEGACY_CASE_ROUTE=/srv/orphaned','NOTE=legacy personnel volume removed from navigation'
  ]},
  { path:'/etc/norm-release', level:3, id:'SYS_RELEASE', discovery:'SYS_RELEASE', system:true, body:[
    'NORM-OS 2.4.1','KERNEL=archive-17','NODE=04','MIGRATION_CHAIN=1987>2004>2009>2013>2026','UNRESOLVED_LEGACY_VOLUMES=1'
  ]},
  { path:'/etc/hosts', level:3, id:'SYS_HOSTS', discovery:'SYS_HOSTS', system:true, body:[
    '127.0.0.1 localhost','10.17.0.4 node04 archive','10.17.0.17 node17 correlation','10.17.0.31 cold-archive [DECOMMISSIONED]','0.0.0.0 norm0 // invalid host record'
  ]},
  { path:'/etc/passwd', level:3, id:'SYS_PASSWD', discovery:'SYS_PASSWD', system:true, body:[
    'root:x:0:0:NORM OS:/root:/bin/false','norm:x:17:17:Archive Service:/opt/norm:/bin/normsh','observer:x:404:404:Session Observer:/tmp:/bin/normsh','ag04:x:4004:17:legacy:/home/ag-04:/bin/false','ag09:x:4009:17:legacy:/home/ag-09:/bin/false','ag13:x:4013:17:legacy:/home/ag-13:/bin/false','norm0:x:0:0::/:?'
  ]},
  { path:'/etc/ssh_config', level:3, id:'SYS_SSHCONF', discovery:'SYS_SSHCONF', system:true, body:[
    'Host node04','  Port 22','Host cold-archive','  HostName 10.17.0.31','  User observer','  IdentityFile /mirror/observer.key','  # route disabled after 2014 migration'
  ]},
  { path:'/var/log/auth.log', level:3, id:'SYS_AUTHLOG', discovery:'SYS_AUTHLOG', system:true, body:[
    '2004-02-12 03:17:44 AG-04 LINK LOST','2009-10-21 22:14:08 AG-09 STATUS DECEASED','2011-05-17 04:06:12 AG-09 AUTH SUCCESS // impossible','2013-06-03 22:51:09 AG-13 STATUS DECEASED','2014-08-19 01:11:02 AG-13 FACE MATCH // source missing','2018-11-18 18:11:87 AG-04 CALLSIGN DETECTED // ROOT','DEVICE /dev/n0 PRESENT // NOT MOUNTED'
  ]},
  { path:'/var/log/boot.log', level:3, id:'SYS_BOOTLOG', discovery:'SYS_BOOTLOG', system:true, body:[
    'NORM-OS BOOT','mount archive: ok','mount black: hidden','mount /dev/n0: skipped [policy]','start correlation-daemon: ok','start norm0: process not found','warning: watcher pid 0 already attached'
  ]},
  { path:'/var/log/correlation.log', level:3, id:'SYS_CORRELATION', discovery:'SYS_CORRELATION', system:true, body:[
    'CORRELATION SERVICE','LM-005 -> dream / compression / 02:59','LM-006 -> 1000-7 / repetition / voice marker','NO-17 -> 31Hz / 11-minute gap','AR-31 -> timestamp drift / posthumous auth','IMG-13 -> missing frame / face match','cross-link confidence: 0.81','common writer: NORM-0 [unverified]'
  ]},
  { path:'/var/log/purge.log', level:3, id:'SYS_PURGE', discovery:'SYS_PURGE', system:true, body:[
    'PURGE HISTORY','2004 AG-04 route hidden by policy','2009 AG-09 record sealed','2014 AG-13 personnel card deleted','2018 ghost volume pointer deleted','2018 ghost volume pointer recreated','2018 ghost volume pointer deleted','2018 ghost volume pointer recreated','owner of recreation task: none'
  ]},
  { path:'/home/ag-04/.fieldnote', level:3, id:'AG04_FIELDNOTE', discovery:'AG04_FIELDNOTE', hidden:true, system:true, body:[
    'AG-04 // personal note','Если основной индекс снова исчезнет, не ищите карточки в /agents.','Старый персональный том всё ещё видит устройство n0.','Это не пароль. Носитель нужно смонтировать.','target: /mnt/ghost'
  ]},
  { path:'/home/ag-04/radio.txt', level:3, id:'AG04_RADIO', discovery:'AG04_RADIO', system:true, body:[
    'AG-04 // radio bench','carrier=31Hz','rule=do not answer your own callsign','offset=00:11:00','case=NO-17','note=Ланской передать оригинал, не копию'
  ]},
  { path:'/home/ag-09/.bash_history', level:3, id:'AG09_HISTORY', discovery:'AG09_HISTORY', hidden:true, system:true, body:[
    'cat /etc/norm.conf','strings /dev/n0','mount /dev/n0 /mnt/ghost','ls -la /mnt/ghost','cat /mnt/ghost/personnel/ag-04.dos','grep -r OFFSET /mnt/ghost/cases','echo "не верьте времени файла"'
  ]},
  { path:'/home/ag-09/.cache/session', level:3, id:'AG09_SESSION_CACHE', discovery:'AG09_SESSION_CACHE', hidden:true, system:true, body:[
    'SESSION CACHE // AG-09','last-good-login=2009-10-21T19:02:11','impossible-login=2011-05-17T04:06:12','command=cat /mnt/ghost/cases/no-17/transcript.txt','logout=forced','writer=NORM-0'
  ]},
  { path:'/home/ag-13/.camera/last_frame.meta', level:3, id:'AG13_LASTFRAME', discovery:'AG13_LASTFRAME', hidden:true, system:true, body:[
    'CAMERA META // AG-13','SERIES=IMG13-CORRIDOR','FILES=0001,0002,0003','EXPECTED=0001,0002,0003,0004','MISSING=0004','OFFSET=00:11:00','ARCHIVE_TARGET=/mnt/ghost/cases/img-13/'
  ]},
  { path:'/proc/norm0/status', level:3, id:'NORM0_PROC', discovery:'NORM0_PROC', hidden:true, system:true, body:[
    'Name: norm0','State: S (sleeping?)','Pid: 0','PPid: 0','Started: 18.11.1987','Owner: none','OpenFD: /dev/n0','Watcher: current-session'
  ]},
  { path:'/proc/norm0/cmdline', level:3, id:'NORM0_CMDLINE', discovery:'NORM0_CMDLINE', hidden:true, system:true, body:[
    '[empty]','kernel reports 0 bytes','audit trail reports: --preserve-deleted-routes','source binary: not found'
  ]},
  { path:'/dev/n0', level:3, id:'DEV_N0', discovery:'DEV_N0', system:true, binary:true, body:[
    '\u0000NORMVOL\u0000GHOSTFS\u0000PERSONNEL_RECOVERY\u0000MOUNT=/mnt/ghost\u0000AG-04\u0000AG-09\u0000AG-13\u0000ORPHEUS\u0000NO-17\u0000AR-31\u0000IMG-13\u0000'
  ]},
  { path:'/opt/norm/README', level:3, id:'OPT_README', discovery:'OPT_README', system:true, body:[
    'NORM INTERNAL UTILITIES','archive-index -> visible database','correlation-daemon -> cross-case matching','reindex -> rebuild orphaned routes from surviving blocks','warning: reindex can expose records intentionally removed from navigation'
  ]},
  { path:'/opt/norm/reindex.conf', level:3, id:'REINDEX_CONF', discovery:'REINDEX_CONF', system:true, body:[
    'REINDEX_MODE=safe','ORPHAN_SCAN=true','GHOSTFS_REQUIRED=true','MIRROR_REQUIRED_FOR_ROUTE_RESTORE=true','VISUAL_ROUTE=/legacy-cases'
  ]},
  { path:'/tmp/.n0-session', level:3, id:'TMP_N0', discovery:'TMP_N0', hidden:true, system:true, body:[
    'temporary session marker','observer=current-session','created=now?','parent=0','note=if you found this, /tmp is not empty'
  ]},

  { path:'/mnt/ghost/index', level:4, id:'GHOST_INDEX', discovery:'GHOST_INDEX', body:[
    'GHOSTFS // RECOVERED PERSONNEL VOLUME','AG-04 // FILE PRESENT','AG-09 // FILE PRESENT','AG-13 // FILE PRESENT','THREE KEY FRAGMENTS DETECTED','THREE HISTORICAL CASE TREES DETECTED','VISUAL INTERFACE: /ghost-registry'
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
  { path:'/mnt/ghost/personnel/ag-04.med', level:4, id:'AG04_MED', discovery:'AG04_MED', body:[
    'MEDICAL CLEARANCE // AG-04','last exam: 04.02.2004','sleep deprivation: none','hearing: normal','post-incident exam: NOT PERFORMED','body recovery: none'
  ]},
  { path:'/mnt/ghost/personnel/ag-09.death', level:4, id:'AG09_DEATH', discovery:'AG09_DEATH', body:[
    'DEATH CERTIFICATE CACHE // AG-09','date: 21.10.2009','cause: archive fire / smoke inhalation','identification: service token + documents','biological confirmation: NONE','record closed by: [missing]'
  ]},
  { path:'/mnt/ghost/personnel/ag-13.crash', level:4, id:'AG13_CRASH', discovery:'AG13_CRASH', body:[
    'INCIDENT SUMMARY // AG-13','date: 03.06.2013','event: road collision after technical assignment','camera bag recovered: YES','storage card recovered: YES','frame count: 3','metadata expects: 4'
  ]},

  { path:'/mnt/ghost/cases/no-17/brief.log', level:4, id:'NO17_BRIEF', discovery:'NO17_BRIEF', body:[
    'NO-17 // «ПУСТАЯ ЧАСТОТА»','DATE: 12.02.2004','CLASS: SIGNAL ANOMALY','SITE: закрытый ретранслятор №17 / Подмосковье','FIELD: historical N.O.R.M. technical unit','EVENT: AG-04 vanished during an 11-minute communication blackout','BODY: NOT RECOVERED','PUBLICATION: NEVER'
  ]},
  { path:'/mnt/ghost/cases/no-17/spectrum.csv', level:4, id:'NO17_SPECTRUM', discovery:'NO17_SPECTRUM', body:[
    'time,frequency_hz,amplitude,source','03:16:44,31,0.14,ambient','03:17:44,31,0.88,unknown','03:28:44,31,0.91,AG-04_callsign','03:28:45,31,0.02,carrier_drop','OFFSET,00:11:00,,repeating'
  ]},
  { path:'/mnt/ghost/cases/no-17/transcript.txt', level:4, id:'NO17_TRANSCRIPT', discovery:'NO17_TRANSCRIPT', body:[
    'NO-17 // RADIO TRANSCRIPT','03:17:40 BASE: AG-04, подтвердите вход.','03:17:44 [carrier 31Hz]','03:28:44 VOICE: «четвёртый, не отвечай»','03:28:45 BASE: кто в эфире?','03:28:46 [silence]','NOTE: voice print similarity to AG-04 = 94%','TIMESTAMP DIFFERENCE = +00:11:00'
  ]},

  { path:'/mnt/ghost/cases/ar-31/brief.log', level:4, id:'AR31_BRIEF', discovery:'AR31_BRIEF', body:[
    'AR-31 // «ПЕПЕЛЬНЫЙ ИНДЕКС»','DATE: 21.10.2009','CLASS: ARCHIVE / RECORD ANOMALY','SITE: старый архивный узел','EVENT: fire destroyed local index; AG-09 declared dead','BIOLOGICAL IDENTIFICATION: NONE','POSTHUMOUS AUTH: CONFIRMED 2011'
  ]},
  { path:'/mnt/ghost/cases/ar-31/fire_report.txt', level:4, id:'AR31_FIRE', discovery:'AR31_FIRE', body:[
    'FIRE REPORT // AR-31','ignition point: server room B','damage: paper archive 62%, terminals 4/7','door logs: inconsistent','AG-09 token found near terminal 03','body identification: not independently verified','oddity: terminal 03 clock was +00:11:00 ahead of building controller'
  ]},
  { path:'/mnt/ghost/cases/ar-31/auth_trace.log', level:4, id:'AR31_AUTH', discovery:'AR31_AUTH', body:[
    'AUTH TRACE // AG-09','2009-10-21 status=DECEASED','2011-05-17 04:06:12 key=AG-09 result=SUCCESS','session duration=00:00:46','command[1]=cat /mnt/ghost/cases/no-17/transcript.txt','command[2]=echo "не верьте времени файла"','writer=NORM-0'
  ]},

  { path:'/mnt/ghost/cases/img-13/brief.log', level:4, id:'IMG13_BRIEF', discovery:'IMG13_BRIEF', body:[
    'IMG-13 // «ЧЕТВЁРТЫЙ КАДР»','DATE: 30.05.2013—03.06.2013','CLASS: IMAGE / RECORD ANOMALY','SITE: законсервированный коридор архива AR-31','FIELD OPERATOR: AG-13','SERIES: 3 files visible / 4 expected','AFTERCARE: operator died four days later in road collision'
  ]},
  { path:'/mnt/ghost/cases/img-13/frame_04.meta', level:4, id:'IMG13_FRAME_META', discovery:'IMG13_FRAME_META', body:[
    'IMG13-CORRIDOR-0004','FILE: MISSING','CAPTURED: 2013-05-30 19:22:08','INDEXED: 2013-05-30 19:33:08','OFFSET: +00:11:00','FACE_MATCH_AFTER_2014: AG-13 / 0.93','SOURCE_ROUTE: /mirror/deleted/IMG13-0004'
  ]},
  { path:'/mnt/ghost/cases/img-13/facematch.log', level:4, id:'IMG13_FACEMATCH', discovery:'IMG13_FACEMATCH', body:[
    'FACE MATCH SERVICE','2014-08-19 IMG13-0004 cache -> AG-13 0.93','2014-08-20 IMG13-0004 cache -> AG-13 0.93','2014-08-21 IMG13-0004 cache -> AG-13 0.94','original image: missing','cache owner: none','after third match: personnel route AG-13 deleted'
  ]},
  { path:'/mnt/ghost/.fragments', level:4, id:'GHOST_FRAGMENTS', discovery:'GHOST_FRAGMENTS', hidden:true, body:[
    'RECOVERED KEY FRAGMENTS','AG-04: OR','AG-09: PHE','AG-13: US','ASSEMBLY ORDER: personnel index order','PRIVILEGED COMMAND: sudo unlock <token>'
  ]},
  { path:'/mnt/ghost/.route-map', level:4, id:'GHOST_ROUTE_MAP', discovery:'GHOST_ROUTE_MAP', hidden:true, body:[
    'LEGACY ROUTE MAP','NO-17 -> AG-04','AR-31 -> AG-09 -> NO-17','IMG-13 -> AG-13 -> AR-31','COMMON OFFSET -> 00:11:00','VISUAL ROUTE REMOVED -> /legacy-cases','restore requires mirror index + orphan reindex'
  ]},

  { path:'/mirror/index', level:5, id:'MIRROR_INDEX', discovery:'MIRROR_INDEX', body:[
    'MIRROR NODE // OBSERVER LAYER','This node mirrors records deleted from the visible archive.','Do not assume deletion means absence.','CURRENT OBSERVER: YOU','NORM-0: WATCHING','ORPHAN ROUTES: 4'
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
  { path:'/mirror/deleted.routes', level:5, id:'MIRROR_DELETED_ROUTES', discovery:'MIRROR_DELETED_ROUTES', body:[
    'DELETED ROUTE TABLE','route=/legacy-cases state=orphaned blocks=present','route=/agents/04 state=removed blocks=moved-to-ghost','route=/agents/09 state=removed blocks=moved-to-ghost','route=/agents/13 state=removed blocks=moved-to-ghost','recovery-tool=/opt/norm/reindex','mode=orphaned'
  ]},
  { path:'/mirror/.orphaned', level:5, id:'MIRROR_ORPHANED', discovery:'MIRROR_ORPHANED', hidden:true, body:[
    'ORPHANED ROUTES // HIDDEN','/legacy-cases','required evidence: NO17_BRIEF + AR31_BRIEF + IMG13_BRIEF','recovery command: reindex --orphaned','result: visual route restored for current session'
  ]},
  { path:'/mirror/cases/no-17.shadow', level:5, id:'NO17_SHADOW', discovery:'NO17_SHADOW', body:[
    'MIRROR SHADOW // NO-17','closure operator: NORM-0','closure time: 72h after disappearance','reason: [empty]','later event: AG-04 callsign detected 2018','classification remains: unresolved'
  ]},
  { path:'/mirror/cases/ar-31.shadow', level:5, id:'AR31_SHADOW', discovery:'AR31_SHADOW', body:[
    'MIRROR SHADOW // AR-31','death closure operator: NORM-0','biological confirmation: none','posthumous login: retained despite purge','cross-reference: NO-17 transcript accessed during impossible session'
  ]},
  { path:'/mirror/cases/img-13.shadow', level:5, id:'IMG13_SHADOW', discovery:'IMG13_SHADOW', body:[
    'MIRROR SHADOW // IMG-13','personnel deletion operator: NORM-0','trigger: third posthumous face match','missing frame inode: present / route deleted','time offset: +00:11:00','content preview: denied'
  ]},
]

export const fileAliases = {
  LM005_CAM_025951:'/cases/lm-005/cam_025951.log', CAM_025951:'/cases/lm-005/cam_025951.log', LM005_POST:'/cases/lm-005/post_operation.log', Z006:'/cases/lm-006/z006.log',
  'NORM-0':'/black/norm0_origin.log', NORM0:'/black/norm0_origin.log', NORMCONF:'/etc/norm.conf', AUTHLOG:'/var/log/auth.log', AG04:'/mnt/ghost/personnel/ag-04.dos', AG09:'/mnt/ghost/personnel/ag-09.dos', AG13:'/mnt/ghost/personnel/ag-13.dos',
  NO17:'/mnt/ghost/cases/no-17/brief.log', AR31:'/mnt/ghost/cases/ar-31/brief.log', IMG13:'/mnt/ghost/cases/img-13/brief.log',
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
  if (level >= 3) dirs.push('/etc','/var','/var/log','/home','/home/ag-04','/home/ag-09','/home/ag-13','/home/ag-13/.camera','/proc','/proc/norm0','/dev','/opt','/opt/norm','/tmp','/mnt')
  if (level >= 4 || progress.mountedGhost) dirs.push('/mnt/ghost','/mnt/ghost/personnel','/mnt/ghost/cases','/mnt/ghost/cases/no-17','/mnt/ghost/cases/ar-31','/mnt/ghost/cases/img-13')
  if (level >= 5) dirs.push('/mirror','/mirror/cases')
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
    '/agents':level>=4?['AG-SEN','AG-GRIG','AG-02','AG-00','AG-04 [RECOVERED]','AG-09 [RECOVERED]','AG-13 [RECOVERED]']:level>=2?['AG-SEN','AG-GRIG','AG-02','AG-00','AG-04 [ARCHIVED]','AG-09 [LOST]','AG-13 [DELETED]']:['AG-SEN','AG-GRIG','AG-02 [RESTRICTED]','AG-04 [ARCHIVED]','AG-09 [LOST]','AG-13 [DELETED]'],
    '/restricted':level>=1?['index','ag-02.log',...(showHidden?['.audit']:[])]:['ACCESS DENIED'],
    '/black':level>=2?['norm0_origin.log','packet17.dat',level>=3?'final.txt':'final.txt [A-3]',...(showHidden?['.deleted-index']:[])]:['ACCESS DENIED'],
    '/etc':level>=3?['hosts','norm.conf','norm-release','passwd','ssh_config']:['ACCESS DENIED'],
    '/var':level>=3?['log/']:['ACCESS DENIED'],
    '/var/log':level>=3?['auth.log','boot.log','correlation.log','purge.log']:['ACCESS DENIED'],
    '/home':level>=3?['ag-04/','ag-09/','ag-13/']:['ACCESS DENIED'],
    '/home/ag-04':level>=3?(showHidden?['.','..','.fieldnote','radio.txt']:['radio.txt']):['ACCESS DENIED'],
    '/home/ag-09':level>=3?(showHidden?['.','..','.bash_history','.cache/']:[]):['ACCESS DENIED'],
    '/home/ag-09/.cache':level>=3?(showHidden?['session']:['session']):['ACCESS DENIED'],
    '/home/ag-13':level>=3?(showHidden?['.','..','.camera/']:[]):['ACCESS DENIED'],
    '/home/ag-13/.camera':level>=3?(showHidden?['last_frame.meta']:['last_frame.meta']):['ACCESS DENIED'],
    '/proc':level>=3?['norm0/']:['ACCESS DENIED'],
    '/proc/norm0':level>=3?['status','cmdline']:['ACCESS DENIED'],
    '/dev':level>=3?['n0']:['ACCESS DENIED'],
    '/opt':level>=3?['norm/']:['ACCESS DENIED'],
    '/opt/norm':level>=3?['README','reindex.conf']:['ACCESS DENIED'],
    '/tmp':level>=3?(showHidden?['.n0-session']:[]):['ACCESS DENIED'],
    '/mnt':level>=3?[(level>=4||progress.mountedGhost)?'ghost/':'ghost/ [NOT MOUNTED]']:['ACCESS DENIED'],
    '/mnt/ghost':level>=4?['index','personnel/','cases/',...(showHidden?['.fragments','.route-map']:[])]:['ACCESS DENIED'],
    '/mnt/ghost/personnel':level>=4?['ag-04.dos','ag-04.med','ag-09.dos','ag-09.death','ag-13.dos','ag-13.crash']:['ACCESS DENIED'],
    '/mnt/ghost/cases':level>=4?['no-17/','ar-31/','img-13/']:['ACCESS DENIED'],
    '/mnt/ghost/cases/no-17':level>=4?['brief.log','spectrum.csv','transcript.txt']:['ACCESS DENIED'],
    '/mnt/ghost/cases/ar-31':level>=4?['brief.log','fire_report.txt','auth_trace.log']:['ACCESS DENIED'],
    '/mnt/ghost/cases/img-13':level>=4?['brief.log','frame_04.meta','facematch.log']:['ACCESS DENIED'],
    '/mirror':level>=5?['index','personnel.continuity','norm0.snapshot','observer.key','deleted.routes','cases/',...(showHidden?['.orphaned']:[])]:['ACCESS DENIED'],
    '/mirror/cases':level>=5?['no-17.shadow','ar-31.shadow','img-13.shadow']:['ACCESS DENIED'],
  }
  let entries = map[p] || []
  if (p==='/' && showHidden && level>=3) entries=[...entries,'.sys/','etc/','var/','home/','proc/','dev/','opt/','tmp/','mnt/']
  return entries
}

export function renderFileContent(file) {
  return Array.isArray(file?.body) ? file.body : []
}
