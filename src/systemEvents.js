const STORAGE_KEY = 'norm-system-events-v2'
const EVENT_NAME = 'norm:system-events'

const templates = [
  {
    id:'EVT-GHOST-MOUNT', requires:'GHOSTFS_MOUNTED', delay:0, tone:'ok',
    text:'/dev/n0 смонтирован в /mnt/ghost',
  },
  {
    id:'EVT-GHOST-ATTACH', requires:'GHOSTFS_MOUNTED', delay:18000, tone:'warn',
    text:'UNKNOWN PROCESS attached to ghostfs',
  },
  {
    id:'EVT-GHOST-MAIL', requires:'GHOSTFS_MOUNTED', delay:38000, tone:'danger',
    text:'1 NEW MESSAGE // SECURITY',
    mail:{
      id:'LIVE-MSG-GHOST-01', from:'SECURITY', to:'CURRENT SESSION', subject:'кто смонтировал legacy volume?',
      tags:['live','GHOSTFS','security'],
      body:['Зафиксировано ручное подключение /dev/n0.','В заявке на обслуживание такого действия нет.','Если это вы — ничего не делайте. Если это не вы — тем более ничего не делайте.'],
    },
  },
  {
    id:'EVT-GRIG-GHOST', requires:'GHOSTFS_MOUNTED', delay:61000, tone:'normal',
    text:'1 NEW MESSAGE // AG-GRIG',
    mail:{
      id:'LIVE-MSG-GRIG-01', from:'AG-GRIG', to:'AG-SEN', subject:'Сен, только скажи, что это не ты',
      tags:['live','FIELD-LM'],
      body:['У меня только что мигнул GHOSTFS.','Сен, только скажи, что это не ты.','Хотя нет. Если это ты — лучше тоже не говори.'],
    },
  },
  {
    id:'EVT-NORM0-WATCH', requires:'NORM0_ORIGIN', delay:11000, tone:'warn',
    text:'correlation-daemon: time offset +00:11:00',
  },
  {
    id:'EVT-MIRROR-HANDSHAKE', requires:'MIRROR_UNLOCK', delay:0, tone:'danger',
    text:'MIRROR NODE accepted CURRENT SESSION',
  },
  {
    id:'EVT-MIRROR-MAIL', requires:'MIRROR_UNLOCK', delay:26000, tone:'danger',
    text:'1 NEW MESSAGE // sender CURRENT SESSION',
    mail:{
      id:'LIVE-MSG-MIRROR-01', from:'CURRENT SESSION', to:'CURRENT SESSION', subject:'+11 MIN',
      tags:['live','MIRROR','impossible'],
      body:['Это сообщение зарегистрировано на одиннадцать минут позже времени его отправки.','Автор совпадает с текущей сессией.','Текущая сессия не создавала это сообщение.'],
    },
  },
]

function safeParse(value, fallback) {
  try { return JSON.parse(value) } catch { return fallback }
}

function load() {
  if (typeof window === 'undefined') return { armed:{}, emitted:[], read:[] }
  const raw = safeParse(localStorage.getItem(STORAGE_KEY) || '{}', {})
  return {
    armed: raw.armed && typeof raw.armed === 'object' ? raw.armed : {},
    emitted: Array.isArray(raw.emitted) ? raw.emitted : [],
    read: Array.isArray(raw.read) ? raw.read : [],
  }
}

function save(state) {
  if (typeof window === 'undefined') return state
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail:state }))
  return state
}

export function getSystemEventState() { return load() }

export function syncSystemEvents(argState, now = Date.now()) {
  const state = load()
  const discoveries = new Set(argState?.discoveries || [])
  let changed = false
  for (const item of templates) {
    if (!discoveries.has(item.requires)) continue
    if (!state.armed[item.id]) { state.armed[item.id] = now; changed = true }
    const due = state.armed[item.id] + item.delay
    if (now >= due && !state.emitted.includes(item.id)) {
      state.emitted.push(item.id)
      changed = true
    }
  }
  return changed ? save(state) : state
}

export function getEmittedEvents(state = load()) {
  const emitted = new Set(state.emitted)
  return templates.filter((item) => emitted.has(item.id)).map((item) => ({...item, at:state.armed[item.id] + item.delay}))
}

export function getDynamicMessages(state = load()) {
  return getEmittedEvents(state).filter((item) => item.mail).map((item) => ({
    ...item.mail,
    clearance:0,
    date:new Date(item.at).toLocaleString('ru-RU', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }),
  }))
}

export function markSystemEventRead(id) {
  const state = load()
  if (!state.read.includes(id)) state.read.push(id)
  return save(state)
}

export function getUnreadSystemEvents(state = load()) {
  const read = new Set(state.read)
  return getEmittedEvents(state).filter((item) => !read.has(item.id))
}

export function subscribeSystemEvents(callback) {
  if (typeof window === 'undefined') return () => {}
  const listener = (event) => callback(event.detail || load())
  window.addEventListener(EVENT_NAME, listener)
  window.addEventListener('storage', listener)
  return () => {
    window.removeEventListener(EVENT_NAME, listener)
    window.removeEventListener('storage', listener)
  }
}

export const SYSTEM_EVENTS = templates
