import { internalMessages } from './worldData'
import { getDynamicMessages, getSystemEventState } from './systemEvents'

export const MAIL_READ_KEY = 'norm-mail-read-v2'
export const MAIL_READ_EVENT = 'norm:mail-read'
export const NEW_MAIL_EVENT = 'norm:new-mail'

export function getMailRead() {
  if (typeof window === 'undefined') return []
  try {
    const raw = JSON.parse(window.localStorage.getItem(MAIL_READ_KEY) || '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

export function setMailRead(ids) {
  const next = [...new Set(Array.isArray(ids) ? ids : [])]
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(MAIL_READ_KEY, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent(MAIL_READ_EVENT, { detail: next }))
  }
  return next
}

export function markMailRead(id) {
  if (!id) return getMailRead()
  const current = getMailRead()
  return current.includes(id) ? current : setMailRead([...current, id])
}

export function getAvailableMail(argState, systemState = getSystemEventState()) {
  const clearance = Math.max(0, Number(argState?.clearance) || 0)
  return [...getDynamicMessages(systemState), ...internalMessages].filter((item) => (item.clearance || 0) <= clearance)
}

export function getUnreadMail(argState, systemState = getSystemEventState(), read = getMailRead()) {
  const readSet = new Set(read)
  return getAvailableMail(argState, systemState).filter((item) => !readSet.has(item.id))
}

export function announceNewMail(detail) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(NEW_MAIL_EVENT, { detail }))
}

export function subscribeMailRead(callback) {
  if (typeof window === 'undefined') return () => {}
  const onMail = (event) => callback(event.detail || getMailRead())
  const onStorage = (event) => {
    if (event.key === MAIL_READ_KEY) callback(getMailRead())
  }
  window.addEventListener(MAIL_READ_EVENT, onMail)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(MAIL_READ_EVENT, onMail)
    window.removeEventListener('storage', onStorage)
  }
}
