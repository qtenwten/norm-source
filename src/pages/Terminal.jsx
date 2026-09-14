import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { audio } from '../audio'
import Photo from '../components/Photo'
import { discover, getArgState, setArgState, subscribeArg } from '../arg'

const bootSequence = [
  ['NORM-OS // ARG KERNEL 1.0', 'ok'],
  ['АРХИВНЫЙ ИНДЕКС: ONLINE', 'ok'],
  ['ПЕРСОНАЛ: ONLINE', 'ok'],
  ['ГРИМУАР: ONLINE', 'ok'],
  ['FIELD UNIT LM: LINKED', 'normal'],
  ['ПРОВЕРКА УРОВНЯ ДОПУСКА...', 'normal'],
  ['НЕИНДЕКСИРОВАННЫХ ССЫЛОК: 17', 'warn'],
  ['TERM READY // TYPE HELP', 'match'],
]

const quickCommands = ['HELP', 'LS', 'STATUS', 'SEARCH 02:59', 'OPEN LM005_CAM_025951', 'WHOAMI']

const files = [
  {
    path:'/README', level:0, id:'README',
    body:[
      'N.O.R.M. FIELD TERMINAL // INTERNAL NODE',
      'Команды терминала работают как с кодами Н.О.Р.М., так и с частью UNIX-подобного синтаксиса.',
      'Начните с: ls · list cases · search 02:59 · open LM005_CAM_025951',
      'Не все файлы присутствуют в визуальном интерфейсе.',
    ],
  },
  {
    path:'/cases/lm-005/cam_025951.log', level:0, id:'LM005_CAM_025951', discovery:'LM005_CAMERA',
    body:[
      'LM-005 // CAMERA BEDROOM_01',
      'TIMESTAMP: 02:59:51',
      'STATUS: VERIFIED',
      'FRAME: UNREGISTERED ENTITY PRESENT',
      'AUDIO MARKER: «КОРИЧНЕВЫЙ ВОМБАТ»',
      'NOTE: маркер отсутствует в официальном отчёте.',
    ],
  },
  {
    path:'/cases/lm-005/post_operation.log', level:1, id:'LM005_POST', discovery:'LM005_POST',
    body:[
      'LM-005 // POST-OPERATION MONITOR',
      '03:41:18 SIGNAL DETECTED',
      '03:41:21 SIGNAL DETECTED',
      '03:41:24 SIGNAL DETECTED',
      'OPERATOR NOTE: вероятно остаточный шум',
      'ENTITY STATUS: NEUTRALIZED → ███████████',
      'LAST WRITE: NORM-0',
      'QUERY RESIDUE: 1000-7',
    ],
  },
  {
    path:'/cases/lm-006/z006.log', level:0, id:'Z006', discovery:'Z006_FILE',
    body:[
      'LM-006 // Z-006 // DEAD INSIDE',
      'KNOWN PHRASE: 1000-7',
      'KNOWN VOICE MARKERS: «ДУШИ ЖДУТ» / «НУЖНО БОЛЬШЕ ДУШ»',
      'AFTERCARE: основной эпизод прекращён',
      'RESIDUAL: арифметический паттерн сохранён',
    ],
  },
  {
    path:'/restricted/index', level:1, id:'RESTRICTED_INDEX', discovery:'RESTRICTED_INDEX',
    body:[
      'RESTRICTED NODE // ACCESS A-1',
      '/restricted/ag-02.log',
      '/cases/lm-005/post_operation.log',
      '1 ENTRY OMITTED BY POLICY 17-B',
    ],
  },
  {
    path:'/restricted/ag-02.log', level:1, id:'AG02_FRAGMENT', discovery:'AG02_FRAGMENT',
    body:[
      'PERSONNEL: AG-02',
      'REGISTRY STATUS: DOES NOT EXIST',
      'CARD STATUS: RECREATED AFTER DELETION',
      'CREATED BY: NORM-0',
      'SOURCE NODE: UNKNOWN',
    ],
  },
  {
    path:'/black/norm0_origin.log', level:2, id:'NORM0_ORIGIN', discovery:'NORM0_ORIGIN',
    body:[
      'BLACK ARCHIVE // NORM-0',
      'FIRST LOGIN: 18.11.1987',
      'CURRENT NORM-OS BUILD: 2026',
      'CONSISTENCY CHECK: IMPOSSIBLE',
      'ACCOUNT OWNER: NONE',
      'PROCESS OWNER: NONE',
      'SELF-IDENTIFICATION TOKEN: 4e4f524d2d30',
      'LAST QUERY: WHO ARE YOU',
    ],
  },
  {
    path:'/black/final.txt', level:3, id:'BLACK_FINAL', discovery:'BLACK_FINAL',
    body:[
      'THIS FILE WAS NOT CREATED BY N.O.R.M.',
      'THE ARCHIVE DOES NOT REMEMBER ITS FIRST OPERATOR.',
      'IT ONLY REMEMBERS THAT SOMEONE WAS HERE BEFORE THE ARCHIVE EXISTED.',
      'NORM-0 // SESSION STILL ACTIVE',
      'NEXT HANDSHAKE: ███████████',
    ],
  },
]

const caseIndex = {
  'LM-005': ['НОЧНОЙ ДУШНИЛА', '/cases/lm-005'],
  'LM-006': ['ЗУМЕРСКИЙ ДЕМОН', '/cases/lm-006'],
}

const entityIndex = {
  'N-005': ['НОЧНОЙ ДУШНИЛА', '/grimoire'],
  'Z-006': ['ЗУМЕРСКИЙ ДЕМОН', '/grimoire'],
  'R-002': ['РЕЧНАЯ ГАДИНА', '/grimoire'],
  'K-003': ['ДРЕВНЮЧЕЕ КОЛДУНСТВО', '/grimoire'],
  'C-004': ['МАРИОНЕТКА ДЬЯВОЛА', '/grimoire'],
}

function formatTime(date = new Date()) {
  return date.toLocaleTimeString('ru-RU', { hour12: false })
}

function line(text, tone = 'normal', extra = {}) {
  return { text, tone, time: formatTime(), ...extra }
}

function normalizePath(value, cwd = '/') {
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

function findFile(token, cwd = '/') {
  const cleaned = String(token || '').trim().replace(/^['"]|['"]$/g, '')
  const aliases = {
    LM005_CAM_025951:'/cases/lm-005/cam_025951.log',
    CAM_025951:'/cases/lm-005/cam_025951.log',
    LM005_POST:'/cases/lm-005/post_operation.log',
    Z006:'/cases/lm-006/z006.log',
    'NORM-0':'/black/norm0_origin.log',
    NORM0:'/black/norm0_origin.log',
  }
  const alias = aliases[cleaned.toUpperCase()]
  const path = alias || normalizePath(cleaned, cwd)
  return files.find((item) => item.path.toLowerCase() === path.toLowerCase()) || null
}

function availableDirectories(clearance) {
  const dirs = ['/', '/cases', '/cases/lm-005', '/cases/lm-006', '/entities', '/agents']
  if (clearance >= 1) dirs.push('/restricted')
  if (clearance >= 2) dirs.push('/black')
  return dirs
}

function listDirectory(path, clearance) {
  const p = normalizePath(path)
  if (p === '/') {
    return ['README', 'cases/', 'entities/', 'agents/', clearance >= 1 ? 'restricted/' : 'restricted/ [A-1]', clearance >= 2 ? 'black/' : 'black/ [A-2]']
  }
  if (p === '/cases') return ['lm-005/', 'lm-006/']
  if (p === '/cases/lm-005') return ['cam_025951.log', clearance >= 1 ? 'post_operation.log' : 'post_operation.log [A-1]']
  if (p === '/cases/lm-006') return ['z006.log']
  if (p === '/entities') return Object.keys(entityIndex)
  if (p === '/agents') return clearance >= 2 ? ['AG-SEN', 'AG-GRIG', 'AG-02', 'AG-00'] : ['AG-SEN', 'AG-GRIG', 'AG-02 [RESTRICTED]']
  if (p === '/restricted') return clearance >= 1 ? ['index', 'ag-02.log'] : ['ACCESS DENIED']
  if (p === '/black') return clearance >= 2 ? ['norm0_origin.log', clearance >= 3 ? 'final.txt' : 'final.txt [A-3]'] : ['ACCESS DENIED']
  return []
}

function decodeToken(value) {
  const raw = String(value || '').trim()
  if (/^[0-9a-f]+$/i.test(raw) && raw.length % 2 === 0) {
    try { return raw.match(/.{2}/g).map((byte) => String.fromCharCode(parseInt(byte, 16))).join('') } catch { /* noop */ }
  }
  try { return atob(raw) } catch { return null }
}

export default function Terminal() {
  const navigate = useNavigate()
  const [lines, setLines] = useState([])
  const [scanState, setScanState] = useState('running')
  const [command, setCommand] = useState('')
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [cwd, setCwd] = useState('/')
  const [progress, setProgress] = useState(getArgState)
  const logRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => subscribeArg(setProgress), [])

  useEffect(() => {
    audio.terminalOpen()
    const timers = []
    bootSequence.forEach(([text, tone], index) => {
      timers.push(window.setTimeout(() => {
        setLines((current) => [...current, line(text, tone)])
        tone === 'warn' ? audio.glitch() : audio.terminal()
        if (index === bootSequence.length - 1) setScanState('complete')
      }, 180 + index * 230))
    })
    return () => timers.forEach(window.clearTimeout)
  }, [])

  useEffect(() => {
    const log = logRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [lines])

  const append = (...nextLines) => setLines((current) => [...current, ...nextLines])

  const syncProgress = (next) => {
    setProgress(next)
    return next
  }

  const unlock = (id, level = null) => syncProgress(discover(id, level))

  const handoff = (path, label) => {
    append(line(`${label} // ROUTE HANDOFF REQUESTED`, 'match'))
    audio.command()
    window.setTimeout(() => navigate(path), 260)
  }

  const runScan = () => {
    setScanState('running')
    append(line('SCAN: ПОВТОРНАЯ КАЛИБРОВКА...', 'normal'))
    audio.scan()
    window.setTimeout(() => append(line('SCAN: EMF 0.8mG // TEMP 14.2°C // AUDIO BAND 31Hz', 'match')), 360)
    window.setTimeout(() => append(line('SCAN: SIGNAL CORRELATION → LM-005 / 02:59:51', 'warn')), 700)
    window.setTimeout(() => {
      setScanState('complete')
      append(line('HINT: search 02:59', 'normal'))
      audio.systemReply()
    }, 900)
  }

  const showFile = (file, verb = 'OPEN') => {
    if (!file) {
      append(line(`${verb}: FILE NOT FOUND`, 'warn'))
      audio.error()
      return
    }
    if (progress.clearance < file.level) {
      append(line(`ACCESS DENIED // ${file.path}`, 'danger'), line(`REQUIRES ACCESS LEVEL A-${file.level}`, 'warn'))
      audio.error()
      return
    }
    append(line(`${verb}: ${file.path}`, 'ok'), ...file.body.map((text, index) => line(text, index === 0 ? 'match' : 'normal')))
    if (file.discovery) unlock(file.discovery)
    setArgState((state) => ({ ...state, lastFile:file.path }))
    audio.archive()
  }

  const doSearch = (needle) => {
    const term = needle.trim().replace(/^['"]|['"]$/g, '').toLowerCase()
    if (!term) {
      append(line('SEARCH REQUIRES QUERY', 'warn'))
      return
    }
    const results = files
      .filter((file) => file.level <= progress.clearance)
      .filter((file) => `${file.path} ${file.id} ${file.body.join(' ')}`.toLowerCase().includes(term))
      .slice(0, 12)
    const norm0 = term === 'norm-0' || term === 'norm0'
    if (norm0 && progress.clearance < 1) {
      append(line('SEARCH: NORM-0 // 17 RESULTS FOUND', 'warn'), line('RESULT SET REQUIRES ACCESS LEVEL A-1', 'danger'))
      return
    }
    if (!results.length) {
      append(line(`SEARCH: ${needle} // 0 MATCHES`, 'normal'))
      return
    }
    append(line(`SEARCH: ${needle} // ${results.length} VISIBLE MATCHES`, 'ok'), ...results.map((file) => line(`${file.id.padEnd(18)} ${file.path}`, 'normal')))
    if (norm0 && progress.clearance >= 2) append(line('PRIMARY CORRELATION: /black/norm0_origin.log', 'danger'))
    audio.terminal()
  }

  const doCalc = (expr) => {
    const match = expr.match(/^(-?\d+)\s*-\s*7$/)
    if (!match) {
      append(line('CALC: ONLY SAFE SUBTRACTION CHANNEL AVAILABLE', 'warn'), line('FORMAT: calc 1000-7', 'normal'))
      return
    }
    const left = Number(match[1])
    const result = left - 7
    append(line(String(result), 'match'))

    let state = getArgState()
    const starting = left === 1000
    const correctContinuation = state.calcStep > 0 && left === state.calcExpected
    if (starting) state = { ...state, calcStep:1, calcExpected:result }
    else if (correctContinuation) state = { ...state, calcStep:state.calcStep + 1, calcExpected:result }
    else state = { ...state, calcStep:0, calcExpected:null }

    state = setArgState(state)
    syncProgress(state)

    if (state.calcStep === 3) append(line('...НЕ ПРОДОЛЖАЙ.', 'warn'))
    if (state.calcStep === 4) append(line('Z-006 // LISTENING', 'danger'))
    if (state.calcStep >= 5 && !state.discoveries.includes('Z006_SEQUENCE')) {
      const next = unlock('Z006_SEQUENCE', 2)
      append(
        line('ENTITY Z-006 IS NOW LISTENING.', 'danger'),
        line('UNAUTHORIZED PATTERN ACCEPTED AS CREDENTIAL.', 'warn'),
        line(`ACCESS LEVEL ELEVATED → A-${next.clearance}`, 'ok'),
        line('NEW NODE VISIBLE: /black', 'match'),
      )
      audio.systemReply()
    }
  }

  const execute = (raw) => {
    const normalized = raw.trim().replace(/\s+/g, ' ')
    const upper = normalized.toUpperCase()
    if (!normalized) {
      append(line('> [EMPTY INPUT]', 'normal'))
      return
    }

    append(line(`> ${normalized}`, 'command'))
    setHistory((current) => [normalized, ...current.filter((item) => item !== normalized)].slice(0, 40))
    setHistoryIndex(-1)
    audio.command()

    if (upper === 'CLEAR' || upper === 'CLS') {
      setLines([line('TERM BUFFER CLEARED', 'ok')])
      return
    }

    if (upper === 'HELP' || upper === '?') {
      append(
        line('NORM-OS COMMAND INDEX', 'ok'),
        line('HELP · STATUS · WHOAMI · CLEAR · HISTORY · PWD', 'normal'),
        line('LS [path] · CD <path> · CAT <file> · OPEN <id|file> · INSPECT <id|file>', 'normal'),
        line('LIST CASES|ENTITIES|AGENTS|FILES · SEARCH <query> · GREP <query>', 'normal'),
        line('CASE <LM-xxx> · ENTITY <code> · AGENT <code> · ARCHIVE · GRIMOIRE', 'normal'),
        line('CALC <expr> · AUTH <token> · DECODE <token> · SAY <phrase> · NEUTRALIZE <entity> <method>', 'normal'),
        line('Подсказка: справочник описывает команды, но не все допустимые данные.', 'warn'),
      )
      return
    }

    if (upper === 'STATUS') {
      append(
        line('NORM-OS: ONLINE // NODE 04', 'ok'),
        line(`ACCESS LEVEL: A-${progress.clearance}`, 'match'),
        line(`DISCOVERIES: ${progress.discoveries.length} / ??`, 'normal'),
        line(progress.clearance >= 2 ? 'BLACK NODE: VISIBLE' : 'BLACK NODE: HIDDEN', progress.clearance >= 2 ? 'danger' : 'normal'),
        line('UNRESOLVED SIGNALS: 1', 'warn'),
      )
      return
    }

    if (upper === 'WHOAMI') {
      const operator = sessionStorage.getItem('norm-operator') || 'GUEST-27491'
      append(line(`SESSION: ${operator}`, 'ok'), line(`ACCESS LEVEL: A-${progress.clearance}`, 'match'), line(`DISCOVERIES: ${progress.discoveries.length} / ??`, 'normal'))
      return
    }

    if (upper === 'WHO ARE YOU' || upper === 'WHOAREYOU') {
      if (progress.clearance >= 2 && progress.discoveries.includes('NORM0_ORIGIN')) {
        const next = unlock('NORM0_HANDSHAKE', 3)
        append(
          line('QUERY ROUTED OUTSIDE LOCAL COMMAND TABLE.', 'warn'),
          line('I AM THE PART THAT WAS NOT INDEXED.', 'danger'),
          line('YOU FOUND MY FIRST LOGIN.', 'danger'),
          line(`ACCESS LEVEL ELEVATED → A-${next.clearance}`, 'ok'),
          line('NEW FILE: /black/final.txt', 'match'),
        )
      } else {
        append(line('QUERY ROUTED OUTSIDE LOCAL COMMAND TABLE.', 'warn'))
        window.setTimeout(() => append(line('I AM THE PART THAT WAS NOT INDEXED.', 'danger')), 420)
      }
      audio.systemReply()
      return
    }

    if (upper === 'SCAN') {
      runScan()
      return
    }

    if (upper === 'PWD') {
      append(line(cwd, 'ok'))
      return
    }

    if (upper === 'HISTORY') {
      append(line(`COMMAND HISTORY // ${history.length} ENTRIES`, 'ok'), ...history.slice(0, 20).map((item, index) => line(`${String(index + 1).padStart(2, '0')}  ${item}`, 'normal')))
      return
    }

    if (upper === 'LS' || upper.startsWith('LS ') || upper === 'DIR' || upper.startsWith('DIR ')) {
      const arg = normalized.split(' ').slice(1).join(' ')
      const target = normalizePath(arg || cwd, cwd)
      if (!availableDirectories(progress.clearance).includes(target) && target !== '/restricted' && target !== '/black') {
        append(line(`LS: ${target}: NOT A DIRECTORY`, 'warn'))
        return
      }
      append(line(`${target}:`, 'ok'), ...listDirectory(target, progress.clearance).map((entry) => line(entry, entry.includes('[A-') ? 'warn' : 'normal')))
      return
    }

    if (upper.startsWith('CD ')) {
      const target = normalizePath(normalized.slice(3), cwd)
      if (!availableDirectories(progress.clearance).includes(target)) {
        append(line(`CD: ACCESS DENIED OR DIRECTORY NOT FOUND: ${target}`, 'warn'))
        audio.error()
        return
      }
      setCwd(target)
      append(line(`CWD → ${target}`, 'ok'))
      return
    }

    if (upper.startsWith('CAT ')) {
      showFile(findFile(normalized.slice(4), cwd), 'CAT')
      return
    }

    if (upper.startsWith('OPEN ') || upper.startsWith('INSPECT ')) {
      const verb = upper.startsWith('OPEN ') ? 'OPEN' : 'INSPECT'
      const token = normalized.slice(verb.length + 1)
      const code = token.toUpperCase()
      if (caseIndex[code]) {
        const [title, path] = caseIndex[code]
        append(line(`${code} // ${title}`, 'match', { link:path, linkLabel:'ОТКРЫТЬ ДОСЬЕ' }))
        return
      }
      if (entityIndex[code]) {
        const [title, path] = entityIndex[code]
        append(line(`${code} // ${title}`, 'match', { link:path, linkLabel:'ОТКРЫТЬ ГРИМУАР' }))
        return
      }
      showFile(findFile(token, cwd), verb)
      return
    }

    if (upper.startsWith('SEARCH ')) {
      doSearch(normalized.slice(7))
      return
    }

    if (upper.startsWith('GREP ')) {
      doSearch(normalized.slice(5))
      return
    }

    if (upper === 'LIST CASES') {
      append(line('CASE INDEX:', 'ok'), ...Object.entries(caseIndex).map(([code, [title, path]]) => line(`${code} // ${title}`, 'normal', { link:path, linkLabel:'OPEN' })))
      return
    }

    if (upper === 'LIST ENTITIES' || upper === 'GRIMOIRE') {
      append(line('ENTITY INDEX:', 'ok'), ...Object.entries(entityIndex).map(([code, [title]]) => line(`${code} // ${title}`, 'normal')), line('VISUAL INDEX AVAILABLE', 'match', { link:'/grimoire', linkLabel:'ОТКРЫТЬ ГРИМУАР' }))
      audio.paper()
      return
    }

    if (upper === 'LIST AGENTS') {
      append(line('AG-SEN // ACTIVE', 'normal'), line('AG-GRIG // ACTIVE', 'normal'), line('AG-02 // REGISTRY MISMATCH', 'warn'), progress.clearance >= 2 ? line('AG-00 // THIS RECORD DOES NOT EXIST', 'danger', { link:'/agents#00', linkLabel:'OPEN' }) : line('██-██ // REQUIRES A-2', 'warn'))
      return
    }

    if (upper === 'LIST FILES') {
      append(line('VISIBLE FILES:', 'ok'), ...files.filter((file) => file.level <= progress.clearance).map((file) => line(file.path, 'normal')))
      return
    }

    if (upper.startsWith('CASE ') || caseIndex[upper]) {
      const code = upper.startsWith('CASE ') ? upper.slice(5) : upper
      const found = caseIndex[code]
      if (!found) append(line(`CASE LOOKUP: ${code} // NO MATCH`, 'warn'))
      else append(line(`${code} // ${found[0]}`, 'match', { link:found[1], linkLabel:'ОТКРЫТЬ ДОСЬЕ' }))
      return
    }

    if (upper.startsWith('ENTITY ')) {
      const code = upper.slice(7)
      const found = entityIndex[code]
      if (!found) append(line(`ENTITY LOOKUP: ${code} // NO MATCH`, 'warn'))
      else append(line(`${code} // ${found[0]}`, 'match', { link:found[1], linkLabel:'ОТКРЫТЬ ГРИМУАР' }))
      return
    }

    if (upper.startsWith('AGENT ')) {
      const code = upper.replace('AGENT ', '').replace('AG-', '')
      const map = {
        SEN:['AG-SEN // ACTIVE // FIELD UNIT LM','/agents#sen'],
        GRIG:['AG-GRIG // ACTIVE // FIELD UNIT LM','/agents#grig'],
        '02':['AG-02 // REGISTRY MISMATCH','/agents#02'],
        '00':['AG-00 // THIS RECORD DOES NOT EXIST','/agents#00'],
      }
      if (code === '00' && progress.clearance < 2) {
        append(line('PERSONNEL LOOKUP: AG-00 // NO MATCH', 'warn'))
        return
      }
      const found = map[code]
      if (!found) append(line(`PERSONNEL LOOKUP: ${code} // NO MATCH`, 'warn'))
      else append(line(found[0], code === '00' || code === '02' ? 'danger' : 'match', { link:found[1], linkLabel:'ОТКРЫТЬ ЛИЧНОЕ ДЕЛО' }))
      return
    }

    if (upper === 'ARCHIVE' || upper === 'OPEN ARCHIVE') {
      append(line(`ARCHIVE NODE READY // ACCESS A-${progress.clearance}`, 'ok', { link:'/archive', linkLabel:'ПЕРЕЙТИ В АРХИВ' }))
      audio.archive()
      return
    }

    if (upper.startsWith('AUTH ')) {
      const token = normalized.slice(5).trim().toUpperCase().replace(/[ _-]+/g, ' ')
      const accepted = ['BROWN WOMBAT', 'КОРИЧНЕВЫЙ ВОМБАТ'].includes(token)
      if (accepted && progress.discoveries.includes('LM005_CAMERA')) {
        const next = unlock('BROWN_WOMBAT_AUTH', 1)
        append(line('TEMPORARY CREDENTIAL ACCEPTED', 'ok'), line(`ACCESS LEVEL ELEVATED → A-${next.clearance}`, 'match'), line('NEW NODE VISIBLE: /restricted', 'warn'))
        audio.confirm()
      } else if (accepted) {
        append(line('CREDENTIAL EXISTS BUT CONTEXT CHALLENGE FAILED', 'warn'), line('SOURCE MARKER MUST BE VERIFIED FIRST', 'normal'))
      } else {
        append(line('AUTH: INVALID CREDENTIAL', 'danger'))
        audio.error()
      }
      return
    }

    if (upper.startsWith('CALC ')) {
      doCalc(normalized.slice(5))
      return
    }

    if (upper === 'WOMBAT') {
      append(line('PLEASE SPECIFY COLOR.', 'warn'))
      return
    }

    if (upper === 'BROWN' && progress.discoveries.includes('LM005_CAMERA')) {
      append(line('...WHO TOLD YOU?', 'danger'), line('AUTH SUBSYSTEM IS LISTENING.', 'warn'))
      return
    }

    if (upper.startsWith('DECODE ')) {
      const decoded = decodeToken(normalized.slice(7))
      if (!decoded) append(line('DECODE: UNSUPPORTED OR CORRUPTED TOKEN', 'warn'))
      else {
        append(line(`DECODED: ${decoded}`, decoded === 'NORM-0' ? 'danger' : 'match'))
        if (decoded === 'NORM-0') unlock('NORM0_TOKEN')
      }
      return
    }

    if (upper.startsWith('NEUTRALIZE ')) {
      const payload = upper.slice(11)
      const targetN005 = payload.includes('N-005') || payload.includes('НОЧНОЙ')
      const dreamcatcher = payload.includes('DREAMCATCHER') || payload.includes('DREAM CATCHER') || payload.includes('ЛОВЕЦ') || payload.includes('ЛОВЦ')
      if (!targetN005) {
        append(line('NEUTRALIZATION TARGET NOT RECOGNIZED', 'warn'))
      } else if (!dreamcatcher) {
        append(line('METHOD REJECTED.', 'danger'), line('REFERENCE: GRIMOIRE / N-005', 'normal'))
      } else {
        const next = setArgState((state) => ({ ...state, n005Armed:true, discoveries:state.discoveries.includes('N005_METHOD') ? state.discoveries : [...state.discoveries, 'N005_METHOD'] }))
        syncProgress(next)
        append(line('METHOD ACCEPTED: DREAMCATCHER', 'ok'), line('COMMAND REQUIRED.', 'warn'))
      }
      return
    }

    if (upper.startsWith('SAY ')) {
      const phrase = normalized.slice(4).replace(/^['"]|['"]$/g, '')
      if (progress.n005Armed && phrase.toUpperCase().includes('ПОДУШИ ЭТО')) {
        const next = setArgState((state) => ({ ...state, n005Armed:false, discoveries:state.discoveries.includes('N005_NEUTRALIZED_EGG') ? state.discoveries : [...state.discoveries, 'N005_NEUTRALIZED_EGG'] }))
        syncProgress(next)
        append(line('COMMAND ACCEPTED.', 'ok'), line('ENTITY N-005: NEUTRALIZED', 'match'), line('ENTITY RESPONSE: «ля»', 'danger'))
        audio.systemReply()
      } else {
        append(line(`VOICE INPUT RECORDED: «${phrase}»`, 'normal'), line('NO ACTIVE PROCEDURE IS WAITING FOR THIS PHRASE.', 'warn'))
      }
      return
    }

    if (upper === 'SOUND OFF') {
      audio.disable(); append(line('AUDIO BUS MUTED', 'ok')); return
    }
    if (upper === 'SOUND ON') {
      audio.enable(); audio.scene('terminal'); append(line('AUDIO BUS ONLINE', 'ok')); return
    }

    append(line(`UNKNOWN COMMAND: ${normalized}`, 'warn'), line('TYPE HELP. OR DO NOT.', 'normal'))
    audio.error()
  }

  const submit = (event) => {
    event.preventDefault()
    const raw = command
    setCommand('')
    execute(raw)
  }

  const onKeyDown = (event) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!history.length) return
      const nextIndex = Math.min(historyIndex + 1, history.length - 1)
      setHistoryIndex(nextIndex)
      setCommand(history[nextIndex])
      audio.terminal()
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const nextIndex = Math.max(historyIndex - 1, -1)
      setHistoryIndex(nextIndex)
      setCommand(nextIndex === -1 ? '' : history[nextIndex])
      audio.terminal()
      return
    }
    if (event.key.length === 1) audio.key()
  }

  return (
    <div className={`page terminal-page terminal-page--${scanState} terminal-arg`}>
      <div className="terminal-head">
        <h1>FIELD TERMINAL <small>ARG KERNEL 1.0</small></h1>
        <div className="terminal-arg-status"><span>ACCESS <b>A-{progress.clearance}</b></span><span>DISCOVERIES <b>{progress.discoveries.length}/??</b></span><span>CWD <b>{cwd}</b></span></div>
      </div>

      <div className="terminal-scan-state" aria-live="polite">
        <span className="terminal-scan-state__dot" />
        {scanState === 'running' ? 'СИНХРОНИЗАЦИЯ АРХИВА' : `КАНАЛ ОТКРЫТ // ДОПУСК A-${progress.clearance}`}
      </div>

      <div className="terminal-grid terminal-grid--interactive terminal-grid--arg">
        <section className="terminal-map terminal-arg-index">
          <div className="terminal-arg-tree">
            <small>VIRTUAL FILESYSTEM</small>
            <button type="button" onClick={() => execute('ls /')}>/</button>
            <button type="button" onClick={() => execute('ls /cases')}>├─ cases/</button>
            <button type="button" onClick={() => execute('ls /entities')}>├─ entities/</button>
            <button type="button" onClick={() => execute('ls /agents')}>├─ agents/</button>
            <button type="button" className={progress.clearance >= 1 ? 'is-unlocked' : 'is-locked'} onClick={() => execute('ls /restricted')}>├─ restricted/ {progress.clearance < 1 && '[A-1]'}</button>
            <button type="button" className={progress.clearance >= 2 ? 'is-unlocked danger' : 'is-locked'} onClick={() => execute('ls /black')}>└─ black/ {progress.clearance < 2 && '[A-2]'}</button>
          </div>
          <button className="map-faux map-faux--large terminal-map-button" type="button" onClick={runScan} title="Повторить сканирование">
            <span className="map-cross">×</span><b>NODE 04</b><span className="terminal-radar" aria-hidden="true" /><small>RESCAN SIGNAL</small>
          </button>
        </section>

        <section className="live-feeds terminal-arg-feeds">
          <button type="button" onClick={() => handoff('/agents#sen', 'AG-SEN')}><div className="live-feed__frame"><Photo src="/assets/agent-sen.webp" alt="SEN-03" /><i>REC</i></div><b>SEN-03</b><small>FIELD UNIT LM // ACTIVE</small></button>
          <button type="button" onClick={() => handoff('/agents#grig', 'AG-GRIG')}><div className="live-feed__frame"><Photo src="/assets/agent-grig.webp" alt="GRG-07" /><i>REC</i></div><b>GRG-07</b><small>FIELD UNIT LM // ACTIVE</small></button>
          <div className="terminal-arg-hint"><small>UNRESOLVED</small><b>{progress.clearance >= 2 ? 'NORM-0' : '██████'}</b><span>{progress.clearance >= 2 ? '17 INDEXED REFERENCES' : 'ACCESS PATH UNKNOWN'}</span></div>
        </section>

        <section className={`terminal-console ${scanState === 'complete' ? 'terminal-console--ready' : ''}`}>
          <div className="terminal-quickbar">{quickCommands.map((item) => <button type="button" key={item} onClick={() => execute(item)}>{item}</button>)}</div>
          <div className="terminal-log terminal-command-log" ref={logRef} aria-live="polite">
            {lines.map((entry, index) => (
              <div className={`terminal-line terminal-line--${entry.tone}`} key={`${entry.text}-${index}`}>
                <time>{entry.time}</time><span>{entry.text}</span>
                {entry.link && <button type="button" className="terminal-result-link" onClick={() => handoff(entry.link, entry.linkLabel || 'OPEN')}>{entry.linkLabel || 'ОТКРЫТЬ'} →</button>}
              </div>
            ))}
            {scanState === 'complete' && <div className="terminal-cursor" aria-hidden="true">_</div>}
          </div>
          <form className="terminal-input-row" onSubmit={submit} onClick={() => inputRef.current?.focus()}>
            <label htmlFor="terminal-command">{cwd}&gt;</label>
            <input id="terminal-command" ref={inputRef} value={command} onChange={(event) => setCommand(event.target.value)} onKeyDown={onKeyDown} autoComplete="off" spellCheck="false" placeholder="help" />
            <button type="submit">EXEC</button>
          </form>
          <div className="terminal-command-help"><span>↑↓ HISTORY</span><span>TABULATED COMMANDS</span><span>PROGRESS SAVED LOCALLY</span></div>
        </section>
      </div>
    </div>
  )
}
