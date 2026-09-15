import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { audio } from '../audio'
import Photo from '../components/Photo'
import { discover, getArgState, setArgState, subscribeArg } from '../arg'
import { availableDirectories, findVirtualFile, listVirtualDirectory, normalizePath, renderFileContent, virtualFiles } from '../argKernel'

const bootSequence = [
  ['NORM-OS // ARG KERNEL 2.1', 'ok'],
  ['PUBLIC ARCHIVE: ONLINE', 'ok'],
  ['PERSONNEL REGISTRY: ONLINE', 'ok'],
  ['VIRTUAL FILESYSTEM: ONLINE', 'ok'],
  ['ORPHAN ROUTE SCANNER: ONLINE', 'normal'],
  ['LEGACY MOUNTS: 1 DEVICE UNRESOLVED', 'warn'],
  ['PRIVILEGE ESCALATION GUARD: ACTIVE', 'normal'],
  ['TERM READY // TYPE HELP OR LEADS', 'match'],
]

const caseIndex = {
  'LM-005':['НОЧНОЙ ДУШНИЛА','/cases/lm-005'],
  'LM-006':['ЗУМЕРСКИЙ ДЕМОН','/cases/lm-006'],
}
const entityIndex = {
  'N-005':['НОЧНОЙ ДУШНИЛА','/grimoire'], 'Z-006':['ЗУМЕРСКИЙ ДЕМОН','/grimoire'], 'R-002':['РЕЧНАЯ ГАДИНА','/grimoire'], 'K-003':['ДРЕВНЮЧЕЕ КОЛДУНСТВО','/grimoire'], 'C-004':['МАРИОНЕТКА ДЬЯВОЛА','/grimoire'],
}

function stamp(){ return new Date().toLocaleTimeString('ru-RU',{hour12:false}) }
function line(text,tone='normal',extra={}){ return {text,tone,time:stamp(),...extra} }
function decodeToken(value){
  const raw=String(value||'').trim()
  if(/^[0-9a-f]+$/i.test(raw)&&raw.length%2===0){try{return raw.match(/.{2}/g).map(b=>String.fromCharCode(parseInt(b,16))).join('')}catch{/*noop*/}}
  try{return atob(raw)}catch{return null}
}
function toHex(text){
  const bytes=[...String(text)].map(ch=>ch.charCodeAt(0)&255)
  const rows=[]
  for(let i=0;i<bytes.length;i+=16){const slice=bytes.slice(i,i+16);const hex=slice.map(v=>v.toString(16).padStart(2,'0')).join(' ').padEnd(47,' ');const ascii=slice.map(v=>v>=32&&v<127?String.fromCharCode(v):'.').join('');rows.push(`${i.toString(16).padStart(8,'0')}  ${hex}  |${ascii}|`)}
  return rows.slice(0,24)
}
function printableStrings(text){return String(text).split(/[^\x20-\x7EА-Яа-яЁё/_=.:,;@+\-]+/).map(s=>s.trim()).filter(s=>s.length>=3).slice(0,40)}
function pseudoInode(text){let h=2166136261;for(const ch of String(text)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return Math.abs(h>>>0).toString(16).padStart(8,'0')}
function saveFile(file){
  const content=renderFileContent(file).join('\n')
  const blob=new Blob([content],{type:'text/plain;charset=utf-8'})
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`NORM_${file.id}.${file.path.endsWith('.log')?'log':file.path.split('.').pop()||'txt'}`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)
}

function getMainLead(progress){
  const has=(id)=>progress.discoveries.includes(id)
  if(!has('LM005_CAMERA')) return {id:'L-01',title:'LM-005 / МЕТКА КАМЕРЫ',status:'ACTIVE',soft:'В деле LM-005 есть момент, который система индексирует по времени.',next:'search 02:59'}
  if(progress.clearance<1) return {id:'L-02',title:'LM-005 / МАРКЕР АУДИО',status:'ACTIVE',soft:'Найденная фраза похожа не на описание, а на временный идентификатор.',next:'auth коричневый вомбат'}
  if(progress.clearance<2) return {id:'L-03',title:'Z-006 / АРИФМЕТИЧЕСКИЙ ПАТТЕРН',status:'ACTIVE',soft:'После A-1 появился постоперационный журнал. Остаточный запрос не случайный.',next:has('LM005_POST')?'calc 1000-7':'cat /cases/lm-005/post_operation.log'}
  if(!has('NORM0_ORIGIN')) return {id:'L-04',title:'NORM-0 / ПЕРВЫЙ ВХОД',status:'ACTIVE',soft:'BLACK NODE содержит файл с невозможной датировкой.',next:'cat /black/norm0_origin.log'}
  if(progress.clearance<3) return {id:'L-05',title:'NORM-0 / ПОСЛЕДНИЙ ЗАПРОС',status:'ACTIVE',soft:'Последняя строка файла выглядит как команда, которую никто не завершил.',next:'who are you'}
  if(!has('SYS_NORMCONF')) return {id:'L-06',title:'ROOT / СИСТЕМНЫЕ ПУТИ',status:'ACTIVE',soft:'Архив закончился. Следующий слой относится уже к самой операционной системе.',next:'ls -la /'}
  if(progress.clearance<4) return {id:'L-07',title:'GHOST DEVICE / НЕСМОНТИРОВАННЫЙ ТОМ',status:'ACTIVE',soft:'Конфигурация сообщает имя устройства и точку монтирования. Системные журналы могут подтвердить маршрут.',next:has('AG09_HISTORY')?'mount /dev/n0 /mnt/ghost':'cat /home/ag-09/.bash_history'}
  const recovered=['GHOST_AG04','GHOST_AG09','GHOST_AG13'].filter(id=>has(id)).length
  if(recovered<3) return {id:'L-08',title:'GHOSTFS / ПРОПАВШИЕ АГЕНТЫ',status:'ACTIVE',soft:`В персональном томе восстановлено ${recovered}/3 личных дел. В каждом есть фрагмент.`,next:'ls /mnt/ghost/personnel'}
  if(progress.clearance<5) return {id:'L-09',title:'PRIVILEGED TOKEN / ТРИ ФРАГМЕНТА',status:'ACTIVE',soft:'Фрагменты из трёх личных дел образуют одно слово в порядке индекса.',next:'cat /mnt/ghost/.fragments'}
  const caseRoots=['NO17_BRIEF','AR31_BRIEF','IMG13_BRIEF'].filter(id=>has(id)).length
  if(caseRoots<3) return {id:'L-10',title:'ORPHANED CASE TREES',status:'ACTIVE',soft:`GHOSTFS содержит ${3-caseRoots} неразобранных исторических ветки. У каждого пропавшего агента было своё закрытое дело.`,next:'tree /mnt/ghost/cases'}
  if(!has('MIRROR_ORPHANED')) return {id:'L-11',title:'MIRROR / УДАЛЁННЫЕ МАРШРУТЫ',status:'ACTIVE',soft:'Все три дела физически существуют, но визуальный маршрут удалён. В MIRROR могут сохраниться таблицы маршрутизации.',next:'ls -la /mirror'}
  if(!has('LEGACY_ROUTE_RESTORED')) return {id:'L-12',title:'ORPHAN REINDEX',status:'ACTIVE',soft:'Скрытая таблица сообщает, что блоки живы, а потерян только маршрут. Служебный reindex умеет восстанавливать orphaned записи.',next:'reindex --orphaned'}
  return {id:'L-13',title:'LEGACY CASE ARCHIVE',status:'OPEN',soft:'Маршрут восстановлен. Теперь можно исследовать три старых дела, выносить файлы из NORM-OS и собирать корреляционный пакет.',next:'open legacy-cases'}
}

export default function TerminalDeep(){
  const navigate=useNavigate()
  const [lines,setLines]=useState([])
  const [scanState,setScanState]=useState('running')
  const [command,setCommand]=useState('')
  const [history,setHistory]=useState([])
  const [historyIndex,setHistoryIndex]=useState(-1)
  const [cwd,setCwd]=useState('/')
  const [progress,setProgress]=useState(getArgState)
  const logRef=useRef(null);const inputRef=useRef(null)
  const lead=useMemo(()=>getMainLead(progress),[progress])
  const quickCommands=['HELP','LEADS','LS -LA /','STATUS','FIND / AG-0','PS']

  useEffect(()=>subscribeArg(setProgress),[])
  useEffect(()=>{
    audio.terminalOpen();const timers=[]
    bootSequence.forEach(([text,tone],i)=>timers.push(setTimeout(()=>{setLines(cur=>[...cur,line(text,tone)]);tone==='warn'?audio.glitch():audio.terminal();if(i===bootSequence.length-1)setScanState('complete')},160+i*215)))
    const prefill=sessionStorage.getItem('norm-terminal-prefill');if(prefill){setCommand(prefill);sessionStorage.removeItem('norm-terminal-prefill')}
    return()=>timers.forEach(clearTimeout)
  },[])
  useEffect(()=>{if(logRef.current)logRef.current.scrollTop=logRef.current.scrollHeight},[lines])

  const append=(...items)=>setLines(cur=>[...cur,...items])
  const sync=(next)=>{setProgress(next);return next}
  const unlock=(id,level=null)=>sync(discover(id,level))
  const resetFailures=()=>sync(setArgState(s=>({...s,terminalFailures:0})))
  const fail=(text='UNKNOWN COMMAND')=>{
    const next=setArgState(s=>({...s,terminalFailures:(s.terminalFailures||0)+1}));sync(next);append(line(text,'warn'))
    if(next.terminalFailures>=3){append(line('NORM-ASSIST: три неудачных запроса подряд. Используйте LEADS, HINT или HINT NEXT.','match'));sync(setArgState(s=>({...s,terminalFailures:0})))}
    audio.error()
  }
  const handoff=(path,label)=>{append(line(`${label} // ROUTE HANDOFF REQUESTED`,'match'));audio.command();setTimeout(()=>navigate(path),220)}

  const canRead=(file)=>file&&progress.clearance>=file.level
  const showFile=(file,verb='OPEN')=>{
    if(!file){fail(`${verb}: FILE NOT FOUND`);return}
    if(!canRead(file)){append(line(`ACCESS DENIED // ${file.path}`,'danger'),line(`REQUIRES ACCESS LEVEL A-${file.level}`,'warn'));audio.error();return}
    append(line(`${verb}: ${file.path}`,'ok'),...renderFileContent(file).map((t,i)=>line(t,i===0?'match':'normal')))
    let next=progress
    if(file.discovery) next=unlock(file.discovery)
    sync(setArgState(s=>({...s,lastFile:file.path})))
    const caseRoots=['NO17_BRIEF','AR31_BRIEF','IMG13_BRIEF'].filter(id=>getArgState().discoveries.includes(id)).length
    if(caseRoots===3&&!getArgState().discoveries.includes('LEGACY_ROUTE_RESTORED')) append(line('CORRELATION: 3/3 HISTORICAL CASE ROOTS RECOVERED. MIRROR ROUTE TABLE MAY BE REBUILDABLE.','warn'))
    resetFailures();audio.archive();return next
  }
  const downloadFile=(file)=>{
    if(!file||!canRead(file)){fail('DOWNLOAD: FILE NOT FOUND OR ACCESS DENIED');return}
    saveFile(file);unlock(`DOWNLOAD_${file.id}`);append(line(`EXPORT COMPLETE → ${file.id}`,'ok'),line('Файл сохранён за пределами NORM-OS.','match'));audio.drawer();resetFailures()
  }
  const doSearch=(needle)=>{
    const term=needle.trim().replace(/^["']|["']$/g,'').toLowerCase();if(!term){fail('SEARCH REQUIRES QUERY');return}
    const results=virtualFiles.filter(f=>f.level<=progress.clearance).filter(f=>`${f.path} ${f.id} ${renderFileContent(f).join(' ')}`.toLowerCase().includes(term)).slice(0,24)
    if((term==='norm-0'||term==='norm0')&&progress.clearance<1){append(line('SEARCH: NORM-0 // 17 RESULTS FOUND','warn'),line('RESULT SET REQUIRES ACCESS LEVEL A-1','danger'));return}
    if(!results.length){append(line(`SEARCH: ${needle} // 0 MATCHES`,'normal'));return}
    append(line(`SEARCH: ${needle} // ${results.length} VISIBLE MATCHES`,'ok'),...results.map(f=>line(`${f.id.padEnd(20)} ${f.path}`,'normal')));audio.terminal();resetFailures()
  }
  const doFind=(payload)=>{
    const parts=payload.trim().split(/\s+/);let base='/',term=''
    if(parts[0]?.startsWith('/')){base=normalizePath(parts.shift(),cwd)}
    term=parts.join(' ').replace(/^[-*"']+|["']+$/g,'').toLowerCase()
    const results=virtualFiles.filter(f=>f.level<=progress.clearance&&f.path.startsWith(base)).filter(f=>!term||`${f.path} ${f.id}`.toLowerCase().includes(term)).map(f=>f.path)
    append(line(`FIND ${base} ${term||'*'} // ${results.length} RESULTS`,'ok'),...results.slice(0,40).map(p=>line(p,'normal')));if(results.length)resetFailures()
  }
  const doGrep=(payload)=>{
    const tokens=payload.match(/"[^"]+"|'[^']+'|\S+/g)||[]
    const recursive=tokens.some(t=>['-R','-r'].includes(t))
    const clean=tokens.filter(t=>!t.startsWith('-')).map(t=>t.replace(/^["']|["']$/g,''))
    const term=(clean.shift()||'').toLowerCase()
    const target=clean.shift()
    if(!term){fail('GREP: SEARCH PATTERN REQUIRED');return}
    if(!target){doSearch(term);return}
    const path=normalizePath(target,cwd)
    const direct=findVirtualFile(path,'/')
    const pool=direct?[direct]:recursive?virtualFiles.filter(f=>f.level<=progress.clearance&&f.path.startsWith(path.replace(/\/$/,'')+'/')):[]
    if(!pool.length){fail('GREP: TARGET FILE OR RECURSIVE DIRECTORY NOT FOUND');return}
    const matches=[]
    pool.forEach(file=>renderFileContent(file).forEach((row,index)=>{if(row.toLowerCase().includes(term))matches.push(`${file.path}:${index+1}: ${row}`)}))
    append(line(`GREP ${term} // ${matches.length} MATCHES`,'ok'),...matches.slice(0,40).map(row=>line(row,matches.length?'normal':'warn')));if(matches.length)resetFailures()
  }
  const doCalc=(expr)=>{
    const m=expr.match(/^(-?\d+)\s*-\s*7$/);if(!m){append(line('CALC: ONLY SAFE SUBTRACTION CHANNEL AVAILABLE','warn'),line('FORMAT: calc 1000-7','normal'));return}
    const left=Number(m[1]),result=left-7;append(line(String(result),'match'))
    let state=getArgState();const starting=left===1000;const cont=state.calcStep>0&&left===state.calcExpected
    if(starting)state={...state,calcStep:1,calcExpected:result};else if(cont)state={...state,calcStep:state.calcStep+1,calcExpected:result};else{if(state.calcStep>0)append(line(`PATTERN BROKEN // EXPECTED INPUT ${state.calcExpected}-7`,'warn'));state={...state,calcStep:0,calcExpected:null}}
    state=setArgState(state);sync(state)
    if(state.calcStep===1)append(line(`PATTERN INCOMPLETE // CONTINUE WITH: calc ${result}-7`,'normal'))
    if(state.calcStep===3)append(line('...НЕ ПРОДОЛЖАЙ.','warn'))
    if(state.calcStep===4)append(line('Z-006 // LISTENING','danger'))
    if(state.calcStep>=5&&!state.discoveries.includes('Z006_SEQUENCE')){const next=unlock('Z006_SEQUENCE',2);append(line('ENTITY Z-006 IS NOW LISTENING.','danger'),line('UNAUTHORIZED PATTERN ACCEPTED AS CREDENTIAL.','warn'),line(`ACCESS LEVEL ELEVATED → A-${next.clearance}`,'ok'),line('BLACK ARCHIVE РАЗБЛОКИРОВАН','match',{link:'/black',linkLabel:'ОТКРЫТЬ НОВЫЙ СЕКТОР'}));audio.systemReply()}
    resetFailures()
  }
  const showLeads=()=>{
    const main=getMainLead(progress);append(line('NORM-OS // UNRESOLVED LEADS','ok'),line(`[${main.id}] ${main.title} // ${main.status}`,'match'),line(`↳ ${main.soft}`,'normal'))
    append(line(progress.discoveries.includes('N005_NEUTRALIZED_EGG')?'[SIDE] N-005 / FIELD PROCEDURE // RESOLVED':'[SIDE] N-005 / FIELD PROCEDURE // OPTIONAL','normal'))
    append(line(progress.clearance>=4?'[SIDE] GHOST PERSONNEL / HISTORICAL DOSSIERS // VISIBLE':'[SIDE] GHOST PERSONNEL / RECORDS MISSING // LOCKED','normal'))
    append(line(progress.discoveries.includes('LEGACY_ROUTE_RESTORED')?'[SIDE] LEGACY CASES / ORPHAN ROUTE // RESTORED':'[SIDE] LEGACY CASES / ORPHAN ROUTE // HIDDEN','normal'))
  }
  const hint=(strong=false)=>{const h=getMainLead(progress);append(line(strong?`HINT NEXT → ${h.next}`:`HINT → ${h.soft}`,strong?'match':'normal'));audio.systemReply()}
  const runScan=()=>{setScanState('running');append(line('SCAN: ПОВТОРНАЯ КАЛИБРОВКА...','normal'));audio.scan();setTimeout(()=>append(line('SCAN: SIGNAL CORRELATION → LM-005 / 02:59:51','warn')),420);setTimeout(()=>{setScanState('complete');append(line('SOFT LEAD: search 02:59','normal'));audio.systemReply()},760)}

  const execute=(raw)=>{
    const normalized=raw.trim().replace(/\s+/g,' '),upper=normalized.toUpperCase();if(!normalized){append(line('> [EMPTY INPUT]'));return}
    append(line(`> ${normalized}`,'command'));setHistory(cur=>[normalized,...cur.filter(x=>x!==normalized)].slice(0,80));setHistoryIndex(-1);audio.command()

    if(upper==='CLEAR'||upper==='CLS'){setLines([line('TERM BUFFER CLEARED','ok')]);return}
    if(upper==='HELP'||upper==='?'){
      append(line('NORM-OS COMMAND INDEX // KERNEL 2.1','ok'),line('HELP · STATUS · WHOAMI · LEADS · HINT · HINT NEXT · CLEAR · HISTORY · PWD','normal'),line('LS [-LA] [path] · CD <path> · CAT <file> · OPEN <file> · INSPECT <file> · TREE [path]','normal'),line('HEAD <file> · TAIL <file> · FILE <file> · STAT <file> · WC <file>','normal'),line('SEARCH <query> · GREP [-R] <query> [path] · FIND [path] <term> · STRINGS <file> · XXD <file>','normal'),line('PS · NETSTAT · UNAME -A · ID · ENV · DF · DMESG · WHOIS <id>','normal'),line('MOUNT <device> <target> · SUDO <command> · REINDEX --ORPHANED','normal'),line('DOWNLOAD <file> · SCP <file> LOCAL · LIST CASES|ENTITIES|AGENTS|FILES','normal'),line('CALC <expr> · AUTH <token> · DECODE <token> · SAY <phrase> · NEUTRALIZE <entity> <method>','normal'),line('Гиковский совет: ls и ls -la могут показывать разный мир. grep -R тоже умеет ходить по каталогам.','warn'));return
    }
    if(upper==='LEADS'||upper==='LEAD'){showLeads();return}
    if(upper==='HINT'){hint(false);return}
    if(upper==='HINT NEXT'||upper==='HINTNEXT'){hint(true);return}
    if(upper==='STATUS'){append(line('NORM-OS: ONLINE // NODE 04','ok'),line(`ACCESS LEVEL: A-${progress.clearance}`,'match'),line(`DISCOVERIES: ${progress.discoveries.length} / ??`,'normal'),line(`GHOSTFS: ${progress.clearance>=4?'MOUNTED':'UNRESOLVED'}`,progress.clearance>=4?'match':'warn'),line(`MIRROR NODE: ${progress.clearance>=5?'VISIBLE':'HIDDEN'}`,progress.clearance>=5?'danger':'normal'),line(`LEGACY ROUTE: ${progress.discoveries.includes('LEGACY_ROUTE_RESTORED')?'RESTORED':'ORPHANED'}`,progress.discoveries.includes('LEGACY_ROUTE_RESTORED')?'match':'warn'));return}
    if(upper==='WHOAMI'){const op=sessionStorage.getItem('norm-operator')||'GUEST-27491';append(line(`SESSION: ${op}`,'ok'),line(`ACCESS LEVEL: A-${progress.clearance}`,'match'),line('ROLE: OBSERVER / NOT IN PERSONNEL TABLE','warn'));return}
    if(upper==='WHO ARE YOU'||upper==='WHOAREYOU'){
      if(progress.clearance>=2&&progress.discoveries.includes('NORM0_ORIGIN')){const next=unlock('NORM0_HANDSHAKE',3);append(line('QUERY ROUTED OUTSIDE LOCAL COMMAND TABLE.','warn'),line('I AM THE PART THAT WAS NOT INDEXED.','danger'),line('YOU FOUND MY FIRST LOGIN.','danger'),line(`ACCESS LEVEL ELEVATED → A-${next.clearance}`,'ok'),line('ROOT STORAGE РАЗБЛОКИРОВАН','match',{link:'/vault',linkLabel:'ОТКРЫТЬ ROOT VAULT'}),line('NEXT LEAD: the archive is over. inspect the operating system.','normal'))}else append(line('QUERY ROUTED OUTSIDE LOCAL COMMAND TABLE.','warn'),line('I AM THE PART THAT WAS NOT INDEXED.','danger'));audio.systemReply();return
    }
    if(upper==='SCAN'){runScan();return}
    if(upper==='PWD'){append(line(cwd,'ok'));return}
    if(upper==='HISTORY'){append(line(`COMMAND HISTORY // ${history.length} ENTRIES`,'ok'),...history.slice(0,30).map((x,i)=>line(`${String(i+1).padStart(2,'0')}  ${x}`)));return}
    if(upper==='UNAME'||upper==='UNAME -A'){append(line('NORM-OS node04 2.4.1 archive-17 x86_ghost NORM/Linux','ok'));return}
    if(upper==='ID'){const op=sessionStorage.getItem('norm-operator')||'GUEST-27491';append(line(`uid=404(observer) gid=404(observer) groups=17(archive),${progress.clearance>=5?'0(mirror),':''}${progress.clearance>=4?'4000(ghostfs)':''}`,'ok'),line(`session=${op}`));return}
    if(upper==='ENV'){append(line('NORM_NODE=node04','ok'),line(`NORM_ACCESS=A-${progress.clearance}`),line(`PWD=${cwd}`),line(`GHOSTFS=${progress.clearance>=4?'/mnt/ghost':'unmounted'}`),line(`MIRROR=${progress.clearance>=5?'/mirror':'hidden'}`));return}
    if(upper==='DF'||upper==='DF -H'){append(line('FILESYSTEM      SIZE  USED  AVAIL  MOUNT','ok'),line('archive         142M   89M    53M   /'),line('restricted       17M    9M     8M   /restricted'),line(progress.clearance>=4?'ghostfs          31M   13M    18M   /mnt/ghost':'/dev/n0          31M    ?      ?    [unmounted]','warn'),progress.clearance>=5?line('mirror            ?     ?      ?    /mirror','danger'):line('mirror            ?     ?      ?    [hidden]'));return}
    if(upper==='DMESG'){append(line('[0.000] NORM kernel archive-17','ok'),line('[0.117] node04 archive online'),line('[0.311] /dev/n0 legacy block device detected','warn'),line('[0.312] automount denied by policy 17-B'),progress.clearance>=5?line('[17.000] mirror route attached without source device','danger'):line('[17.000] orphan route table deferred','normal'));return}

    if(/^LS(?:\s|$)|^DIR(?:\s|$)/i.test(normalized)){
      const tokens=normalized.split(' ').slice(1);const showHidden=tokens.some(t=>['-LA','-AL','-A','--ALL'].includes(t.toUpperCase()));const arg=tokens.filter(t=>!t.startsWith('-')).join(' ');const target=normalizePath(arg||cwd,cwd)
      const dirs=availableDirectories(progress);const knownLocked=['/restricted','/black','/etc','/var','/var/log','/home','/proc','/dev','/opt','/tmp','/mnt','/mnt/ghost','/mirror']
      if(!dirs.includes(target)&&!knownLocked.includes(target)){fail(`LS: ${target}: NOT A DIRECTORY`);return}
      append(line(`${target}${showHidden?' [-la]':''}:`,'ok'),...listVirtualDirectory(target,progress,showHidden).map(e=>line(e,e.includes('ACCESS')||e.includes('[A-')||e.includes('NOT MOUNTED')?'warn':'normal')));return
    }
    if(upper.startsWith('CD ')){const target=normalizePath(normalized.slice(3),cwd);if(!availableDirectories(progress).includes(target)){fail(`CD: ACCESS DENIED OR DIRECTORY NOT FOUND: ${target}`);return}setCwd(target);append(line(`CWD → ${target}`,'ok'));resetFailures();return}
    if(upper.startsWith('CAT ')){showFile(findVirtualFile(normalized.slice(4),cwd),'CAT');return}
    if(upper.startsWith('OPEN ')||upper.startsWith('INSPECT ')){const verb=upper.startsWith('OPEN ')?'OPEN':'INSPECT';const token=normalized.slice(verb.length+1);const code=token.toUpperCase();if(code==='LEGACY-CASES'||code==='LEGACY CASES'||code==='/LEGACY-CASES'){if(progress.discoveries.includes('LEGACY_ROUTE_RESTORED'))append(line('ORPHAN ROUTE ONLINE','match',{link:'/legacy-cases',linkLabel:'ОТКРЫТЬ LEGACY CASES'}));else append(line('ROUTE /legacy-cases EXISTS BUT IS ORPHANED','warn'));return}if(caseIndex[code]){const [title,path]=caseIndex[code];append(line(`${code} // ${title}`,'match',{link:path,linkLabel:'ОТКРЫТЬ ДОСЬЕ'}));return}if(entityIndex[code]){const [title,path]=entityIndex[code];append(line(`${code} // ${title}`,'match',{link:path,linkLabel:'ОТКРЫТЬ ГРИМУАР'}));return}showFile(findVirtualFile(token,cwd),verb);return}
    if(upper.startsWith('HEAD ')||upper.startsWith('TAIL ')){const isHead=upper.startsWith('HEAD ');const f=findVirtualFile(normalized.slice(5),cwd);if(!f||!canRead(f)){fail(`${isHead?'HEAD':'TAIL'}: FILE NOT FOUND OR ACCESS DENIED`);return}const rows=renderFileContent(f);const out=isHead?rows.slice(0,5):rows.slice(-5);append(line(`${isHead?'HEAD':'TAIL'} ${f.path}`,'ok'),...out.map(row=>line(row)));if(f.discovery)unlock(f.discovery);return}
    if(upper.startsWith('FILE ')){const f=findVirtualFile(normalized.slice(5),cwd);if(!f||!canRead(f)){fail('FILE: NOT FOUND OR ACCESS DENIED');return}const ext=f.path.split('.').pop();append(line(`${f.path}: ${f.binary?'NORM binary block device image':ext==='csv'?'CSV text data':ext==='meta'?'camera metadata':ext==='dos'?'legacy personnel dossier':'UTF-8 text / NORM record'}`,'ok'));return}
    if(upper.startsWith('STAT ')){const f=findVirtualFile(normalized.slice(5),cwd);if(!f||!canRead(f)){fail('STAT: NOT FOUND OR ACCESS DENIED');return}const content=renderFileContent(f).join('\n');append(line(`File: ${f.path}`,'ok'),line(`Size: ${content.length} bytes   Lines: ${renderFileContent(f).length}`),line(`Inode: ${pseudoInode(f.path)}   Access: A-${f.level}`),line(`Flags: ${[f.hidden?'hidden':null,f.system?'system':null,f.binary?'binary':null].filter(Boolean).join(', ')||'record'}`));return}
    if(upper.startsWith('WC ')){const f=findVirtualFile(normalized.slice(3),cwd);if(!f||!canRead(f)){fail('WC: NOT FOUND OR ACCESS DENIED');return}const content=renderFileContent(f).join('\n');append(line(`${renderFileContent(f).length} ${content.split(/\s+/).filter(Boolean).length} ${content.length} ${f.path}`,'ok'));return}
    if(upper.startsWith('SEARCH ')){doSearch(normalized.slice(7));return}
    if(upper.startsWith('GREP ')){doGrep(normalized.slice(5));return}
    if(upper.startsWith('FIND ')){doFind(normalized.slice(5));return}
    if(upper==='TREE'||upper.startsWith('TREE ')){const target=normalizePath(normalized.slice(5)||cwd,cwd);append(line(`TREE ${target}`,'ok'));const walk=(path,prefix='',depth=0)=>{if(depth>3)return;const entries=listVirtualDirectory(path,progress,true).filter(x=>!x.includes('ACCESS'));entries.forEach((e,i)=>{append(line(`${prefix}${i===entries.length-1?'└─':'├─'} ${e}`));if(e.endsWith('/')&&!e.includes('[')){walk(normalizePath(e,path),`${prefix}${i===entries.length-1?'   ':'│  '}`,depth+1)}})};walk(target);return}
    if(upper.startsWith('STRINGS ')){const f=findVirtualFile(normalized.slice(8),cwd);if(!f||!canRead(f)){fail('STRINGS: FILE NOT FOUND OR ACCESS DENIED');return}append(line(`STRINGS ${f.path}`,'ok'),...printableStrings(renderFileContent(f).join('\n')).map(s=>line(s)));if(f.id==='DEV_N0')unlock('DEV_N0_STRINGS');resetFailures();return}
    if(upper.startsWith('XXD ')){const f=findVirtualFile(normalized.slice(4),cwd);if(!f||!canRead(f)){fail('XXD: FILE NOT FOUND OR ACCESS DENIED');return}append(line(`XXD ${f.path}`,'ok'),...toHex(renderFileContent(f).join('\n')).map(s=>line(s)));resetFailures();return}
    if(upper==='PS'||upper==='PS AUX'){append(line('PID USER      STATE      COMMAND','ok'),line('001 norm      running    archive-index'),line('017 norm      sleeping   correlation-daemon'),progress.clearance>=3?line('000 none      ?          [norm0]','danger'):line('--- root      hidden     [requires A-3]','warn'));return}
    if(upper==='NETSTAT'||upper==='NETSTAT -AN'){append(line('LOCAL ROUTES','ok'),line('node04:443   archive       ESTABLISHED'),line('node17:17    correlation   LISTEN'),progress.clearance>=4?line('ghostfs:0    /mnt/ghost    MOUNTED','match'):line('/dev/n0      legacy        UNMOUNTED','warn'),progress.clearance>=5?line('mirror:0     observer      ESTABLISHED','danger'):line('mirror:0     hidden        DENIED','normal'));return}
    if(upper.startsWith('WHOIS ')){const id=upper.slice(6).trim();if(id==='NORM-0'||id==='NORM0'){append(line('NORM-0 // TYPE: UNKNOWN','danger'),line('PERSONNEL: NO MATCH'),line('PROCESS: NO OWNER'),line('FIRST LOGIN: 18.11.1987'),line('STATUS: ACTIVE?','warn'));return}if(['AG-04','AG04','AG-09','AG09','AG-13','AG13'].includes(id)){append(line(`${id.replace('AG0','AG-0').replace('AG1','AG-1')} // PERSONNEL RECORD ${progress.clearance>=4?'RECOVERED':'REDACTED'}`,progress.clearance>=4?'match':'warn'),line(progress.clearance>=4?'SOURCE: /mnt/ghost/personnel':'SOURCE VOLUME NOT MOUNTED'));return}fail(`WHOIS: ${id}: NO MATCH`);return}

    if(upper.startsWith('MOUNT ')){
      const payload=normalized.slice(6).trim().toLowerCase();if(payload==='/dev/n0 /mnt/ghost'){
        const knows=progress.discoveries.some(id=>['SYS_NORMCONF','AG09_HISTORY','DEV_N0','DEV_N0_STRINGS'].includes(id));if(progress.clearance<3){fail('MOUNT: PRIVILEGE A-3 REQUIRED');return}if(!knows){append(line('MOUNT: DEVICE EXISTS BUT TARGET UNKNOWN','warn'),line('INSPECT SYSTEM CONFIGURATION OR DEVICE STRINGS FIRST.'));return}
        const next=setArgState(s=>({...s,clearance:Math.max(s.clearance,4),mountedGhost:true,discoveries:[...new Set([...s.discoveries,'GHOSTFS_MOUNTED'])]}));sync(next);append(line('MOUNT /dev/n0 → /mnt/ghost','ok'),line('LEGACY PERSONNEL VOLUME ONLINE','match'),line('ACCESS LEVEL ELEVATED → A-4','ok'),line('RECOVERED PERSONNEL REGISTRY AVAILABLE','match',{link:'/ghost-registry',linkLabel:'ОТКРЫТЬ GHOST REGISTRY'}));audio.systemReply();return
      }fail('MOUNT: UNKNOWN DEVICE OR TARGET');return
    }
    if(upper==='SUDO'||upper==='SUDO -S'){append(line('sudo: command required','warn'),line('hint: privileged unlock accepts a recovered token'));return}
    if(upper.startsWith('SUDO UNLOCK ')){
      const token=upper.slice(12).trim();const recovered=['GHOST_AG04','GHOST_AG09','GHOST_AG13'].every(id=>progress.discoveries.includes(id));if(progress.clearance<4){fail('SUDO: GHOSTFS NOT AVAILABLE');return}if(!recovered){append(line('SUDO: TOKEN CONTEXT INCOMPLETE','warn'),line('READ ALL THREE RECOVERED PERSONNEL DOSSIERS FIRST.'));return}if(token==='ORPHEUS'){
        const next=unlock('MIRROR_UNLOCK',5);append(line('PRIVILEGED TOKEN ACCEPTED','ok'),line('MIRROR ROUTE ATTACHED → /mirror','danger'),line(`ACCESS LEVEL ELEVATED → A-${next.clearance}`,'ok'),line('OBSERVER LAYER UNLOCKED','match',{link:'/mirror-node',linkLabel:'ОТКРЫТЬ MIRROR NODE'}));audio.systemReply();return
      }append(line('SUDO: INVALID TOKEN','danger'),line('The token is assembled from three recovered key fragments.','normal'));audio.error();return
    }
    if(upper==='REINDEX'||upper==='REINDEX --ORPHANED'){
      if(upper==='REINDEX'){append(line('REINDEX: MODE REQUIRED','warn'),line('AVAILABLE: --orphaned'));return}
      if(progress.clearance<5){append(line('REINDEX: MIRROR INDEX REQUIRED // ACCESS A-5','danger'));return}
      const roots=['NO17_BRIEF','AR31_BRIEF','IMG13_BRIEF'].filter(id=>progress.discoveries.includes(id))
      if(roots.length<3){append(line(`REINDEX: ONLY ${roots.length}/3 ORPHAN CASE ROOTS VERIFIED`,'warn'),line('INSPECT /mnt/ghost/cases AND READ EACH brief.log FIRST.'));return}
      if(!progress.discoveries.includes('MIRROR_ORPHANED')){append(line('REINDEX: ORPHAN TABLE NOT LOADED','warn'),line('TRY: ls -la /mirror  THEN  cat /mirror/.orphaned'));return}
      unlock('LEGACY_ROUTE_RESTORED')
      append(line('REINDEX --ORPHANED','ok'),line('BLOCK SCAN: 3 CASE ROOTS','normal'),line('ROUTE TABLE: REBUILT','match'),line('/legacy-cases → ONLINE','match',{link:'/legacy-cases',linkLabel:'ОТКРЫТЬ ВОССТАНОВЛЕННЫЕ ДЕЛА'}));audio.systemReply();return
    }
    if(upper.startsWith('CHMOD ')){append(line('CHMOD: virtual permissions are immutable in this build.','warn'),line('But the attempt has been logged.'));unlock('CHMOD_ATTEMPT');return}
    if(upper.startsWith('DOWNLOAD ')){downloadFile(findVirtualFile(normalized.slice(9),cwd));return}
    if(upper.startsWith('SCP ')){const m=normalized.match(/^scp\s+(.+?)\s+(?:local|\.\/?)$/i);if(!m){append(line('SCP FORMAT: scp <file> local','warn'));return}downloadFile(findVirtualFile(m[1],cwd));return}

    if(upper==='LIST CASES'){append(line('CASE INDEX:','ok'),...Object.entries(caseIndex).map(([c,[t,p]])=>line(`${c} // ${t}`,'normal',{link:p,linkLabel:'OPEN'})),progress.clearance>=4?line('NO-17 / AR-31 / IMG-13 // INTERNAL HISTORICAL ROOTS','warn'):line('3 INTERNAL CASE ROOTS // HIDDEN','warn'),progress.discoveries.includes('LEGACY_ROUTE_RESTORED')?line('VISUAL LEGACY ROUTE ONLINE','match',{link:'/legacy-cases',linkLabel:'OPEN LEGACY CASES'}):line('VISUAL LEGACY ROUTE: ORPHANED','normal'));return}
    if(upper==='LIST ENTITIES'||upper==='GRIMOIRE'){append(line('ENTITY INDEX:','ok'),...Object.entries(entityIndex).map(([c,[t]])=>line(`${c} // ${t}`)),line('VISUAL INDEX AVAILABLE','match',{link:'/grimoire',linkLabel:'ОТКРЫТЬ ГРИМУАР'}));return}
    if(upper==='LIST AGENTS'){append(line('AG-SEN // ACTIVE'),line('AG-GRIG // ACTIVE'),line('AG-04 // ARCHIVED'),line('AG-09 // LOST'),line('AG-13 // DELETED'),progress.clearance>=4?line('GHOSTFS RECOVERY AVAILABLE','match',{link:'/ghost-registry',linkLabel:'OPEN'}):line('3 LEGACY RECORDS REQUIRE RECOVERY','warn'));return}
    if(upper==='LIST FILES'){append(line('VISIBLE FILES:','ok'),...virtualFiles.filter(f=>f.level<=progress.clearance).map(f=>line(f.path)));return}
    if(upper==='ARCHIVE'||upper==='OPEN ARCHIVE'){append(line(`ARCHIVE NODE READY // ACCESS A-${progress.clearance}`,'ok',{link:'/archive',linkLabel:'ПЕРЕЙТИ В АРХИВ'}));return}

    if(upper.startsWith('AUTH ')){const token=normalized.slice(5).trim().toUpperCase().replace(/[ _-]+/g,' ');const accepted=['BROWN WOMBAT','КОРИЧНЕВЫЙ ВОМБАТ'].includes(token);if(accepted&&progress.discoveries.includes('LM005_CAMERA')){const next=unlock('BROWN_WOMBAT_AUTH',1);append(line('TEMPORARY CREDENTIAL ACCEPTED','ok'),line(`ACCESS LEVEL ELEVATED → A-${next.clearance}`,'match'),line('RESTRICTED 17-B РАЗБЛОКИРОВАН','match',{link:'/restricted',linkLabel:'ОТКРЫТЬ НОВЫЙ СЕКТОР'}));audio.confirm()}else if(accepted)append(line('CREDENTIAL EXISTS BUT SOURCE MARKER MUST BE VERIFIED FIRST','warn'));else fail('AUTH: INVALID CREDENTIAL');return}
    if(upper.startsWith('CALC ')){doCalc(normalized.slice(5));return}
    if(upper.startsWith('DECODE ')){const decoded=decodeToken(normalized.slice(7));if(!decoded)append(line('DECODE: UNSUPPORTED OR CORRUPTED TOKEN','warn'));else{append(line(`DECODED: ${decoded}`,decoded==='NORM-0'?'danger':'match'));if(decoded==='NORM-0')unlock('NORM0_TOKEN')}return}
    if(upper.startsWith('NEUTRALIZE ')){const p=upper.slice(11);const target=p.includes('N-005')||p.includes('НОЧНОЙ');const catcher=p.includes('DREAMCATCHER')||p.includes('DREAM CATCHER')||p.includes('ЛОВЕЦ')||p.includes('ЛОВЦ');if(!target)append(line('NEUTRALIZATION TARGET NOT RECOGNIZED','warn'));else if(!catcher)append(line('METHOD REJECTED.','danger'),line('REFERENCE: GRIMOIRE / N-005'));else{const next=setArgState(s=>({...s,n005Armed:true,discoveries:[...new Set([...s.discoveries,'N005_METHOD'])]}));sync(next);append(line('METHOD ACCEPTED: DREAMCATCHER','ok'),line('COMMAND REQUIRED.','warn'))}return}
    if(upper.startsWith('SAY ')){const phrase=normalized.slice(4).replace(/^["']|["']$/g,'');if(progress.n005Armed&&phrase.toUpperCase().includes('ПОДУШИ ЭТО')){const next=setArgState(s=>({...s,n005Armed:false,discoveries:[...new Set([...s.discoveries,'N005_NEUTRALIZED_EGG'])]}));sync(next);append(line('COMMAND ACCEPTED.','ok'),line('ENTITY N-005: NEUTRALIZED','match'),line('ENTITY RESPONSE: «ля»','danger'));audio.systemReply()}else append(line(`VOICE INPUT RECORDED: «${phrase}»`),line('NO ACTIVE PROCEDURE IS WAITING FOR THIS PHRASE.','warn'));return}
    if(upper==='SOUND OFF'){audio.disable();append(line('AUDIO BUS MUTED','ok'));return}
    if(upper==='SOUND ON'){audio.enable();audio.scene('terminal');append(line('AUDIO BUS ONLINE','ok'));return}

    if(/^\d+\s*-\s*7$/.test(normalized)){append(line('ARITHMETIC PATTERN DETECTED. USE CALC CHANNEL.','match'),line(`TRY: calc ${normalized}`));return}
    if(upper==='02:59'||upper==='02:59:51'){append(line('TIMESTAMP DETECTED. SEARCH INDEX MAY CONTAIN MATCHES.','match'),line('TRY: search 02:59'));return}
    if(['КОРИЧНЕВЫЙ ВОМБАТ','BROWN WOMBAT'].includes(upper)){append(line('KNOWN CREDENTIAL PHRASE DETECTED.','match'),line('THIS IS NOT AN AUTH COMMAND.'));return}
    if(/^[0-9A-F]{8,}$/i.test(normalized)){append(line('ENCODED TOKEN SHAPE DETECTED.','match'),line(`TRY: decode ${normalized}`));return}
    if(upper==='NORM-0'||upper==='NORM0'){append(line('IDENTIFIER DETECTED. TRY: whois NORM-0 OR search NORM-0','match'));return}
    if(upper.includes('DREAMCATCHER')||upper.includes('ЛОВЕЦ СНОВ')){append(line('METHOD TOKEN DETECTED. NEUTRALIZATION PROCEDURE EXPECTS TARGET + METHOD.','match'));return}
    if(upper.includes('ПОДУШИ ЭТО')){append(line('VOICE PHRASE DETECTED. USE SAY CHANNEL WHEN A PROCEDURE IS ARMED.','match'));return}

    fail(`UNKNOWN COMMAND: ${normalized}`)
  }

  const submit=(e)=>{e.preventDefault();const raw=command;setCommand('');execute(raw)}
  const onKeyDown=(e)=>{if(e.key==='ArrowUp'){e.preventDefault();if(!history.length)return;const i=Math.min(historyIndex+1,history.length-1);setHistoryIndex(i);setCommand(history[i]);audio.terminal();return}if(e.key==='ArrowDown'){e.preventDefault();const i=Math.max(historyIndex-1,-1);setHistoryIndex(i);setCommand(i===-1?'':history[i]);audio.terminal();return}if(e.key.length===1)audio.key()}

  return <div className={`page terminal-page terminal-page--${scanState} terminal-arg terminal-deep`}>
    <div className="terminal-head"><h1>FIELD TERMINAL <small>ARG KERNEL 2.1</small></h1><div className="terminal-arg-status"><span>ACCESS <b>A-{progress.clearance}</b></span><span>DISCOVERIES <b>{progress.discoveries.length}/??</b></span><span>CWD <b>{cwd}</b></span></div></div>
    <div className="terminal-scan-state" aria-live="polite"><span className="terminal-scan-state__dot"/>{scanState==='running'?'СИНХРОНИЗАЦИЯ АРХИВА':`КАНАЛ ОТКРЫТ // ДОПУСК A-${progress.clearance}`}</div>
    <div className="terminal-grid terminal-grid--interactive terminal-grid--arg terminal-grid--deep">
      <section className="terminal-map terminal-arg-index"><div className="terminal-arg-tree"><small>VIRTUAL FILESYSTEM</small><button type="button" onClick={()=>execute('ls /')}>/</button><button type="button" onClick={()=>execute('ls /cases')}>├─ cases/</button><button type="button" onClick={()=>execute('ls /agents')}>├─ agents/</button><button type="button" className={progress.clearance>=1?'is-unlocked':'is-locked'} onClick={()=>execute('ls -la /restricted')}>├─ restricted/ {progress.clearance<1&&'[A-1]'}</button><button type="button" className={progress.clearance>=2?'is-unlocked danger':'is-locked'} onClick={()=>execute('ls -la /black')}>├─ black/ {progress.clearance<2&&'[A-2]'}</button><button type="button" className={progress.clearance>=3?'is-unlocked':'is-locked'} onClick={()=>execute('ls -la /')}>├─ .sys/ {progress.clearance<3&&'[A-3]'}</button><button type="button" className={progress.clearance>=4?'is-unlocked danger':'is-locked'} onClick={()=>execute('tree /mnt/ghost')}>├─ ghostfs/ {progress.clearance<4&&'[A-4]'}</button><button type="button" className={progress.clearance>=5?'is-unlocked danger':'is-locked'} onClick={()=>execute('ls -la /mirror')}>└─ mirror/ {progress.clearance<5&&'[A-5]'}</button></div><button className="map-faux map-faux--large terminal-map-button" type="button" onClick={runScan}><span className="map-cross">×</span><b>NODE 04</b><span className="terminal-radar" aria-hidden="true"/><small>RESCAN SIGNAL</small></button></section>
      <section className="live-feeds terminal-arg-feeds"><button type="button" onClick={()=>handoff('/agents#sen','AG-SEN')}><div className="live-feed__frame"><Photo src="/assets/agent-sen.webp" alt="SEN-03"/><i>REC</i></div><b>SEN-03</b><small>FIELD UNIT LM // ACTIVE</small></button><button type="button" onClick={()=>handoff('/agents#grig','AG-GRIG')}><div className="live-feed__frame"><Photo src="/assets/agent-grig.webp" alt="GRG-07"/><i>REC</i></div><b>GRG-07</b><small>FIELD UNIT LM // ACTIVE</small></button><div className="terminal-lead-card"><small>CURRENT LEAD // {lead.id}</small><b>{lead.title}</b><span>{lead.soft}</span><div><button type="button" onClick={()=>execute('leads')}>LEADS</button><button type="button" onClick={()=>execute('hint')}>HINT</button><button type="button" onClick={()=>execute('hint next')}>HINT NEXT</button></div></div></section>
      <section className={`terminal-console ${scanState==='complete'?'terminal-console--ready':''}`}><div className="terminal-quickbar">{quickCommands.map(item=><button type="button" key={item} onClick={()=>execute(item)}>{item}</button>)}</div><div className="terminal-log terminal-command-log" ref={logRef} aria-live="polite">{lines.map((entry,index)=><div className={`terminal-line terminal-line--${entry.tone}`} key={`${entry.text}-${index}`}><time>{entry.time}</time><span>{entry.text}</span>{entry.link&&<button type="button" className="terminal-result-link" onClick={()=>handoff(entry.link,entry.linkLabel||'OPEN')}>{entry.linkLabel||'ОТКРЫТЬ'} →</button>}</div>)}{scanState==='complete'&&<div className="terminal-cursor" aria-hidden="true">_</div>}</div><form className="terminal-input-row" onSubmit={submit} onClick={()=>inputRef.current?.focus()}><label htmlFor="terminal-command">{cwd}&gt;</label><input id="terminal-command" ref={inputRef} value={command} onChange={e=>setCommand(e.target.value)} onKeyDown={onKeyDown} autoComplete="off" spellCheck="false" placeholder="help / leads / ls -la"/><button type="submit">EXEC</button></form><div className="terminal-command-help"><span>↑↓ HISTORY</span><span>LEADS / HINT / HINT NEXT</span><span>GREP -R / STAT / FILE / REINDEX</span><span>PROGRESS SAVED LOCALLY</span></div></section>
    </div>
  </div>
}
