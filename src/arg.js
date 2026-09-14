const STORAGE_KEY = 'norm-arg-progress-v1'
const EVENT_NAME = 'norm:arg-progress'

const initialState = {
  clearance: 0,
  discoveries: [],
  calcStep: 0,
  calcExpected: null,
  n005Armed: false,
  lastFile: null,
}

function sanitize(raw = {}) {
  return {
    ...initialState,
    ...raw,
    clearance: Math.max(0, Math.min(3, Number(raw.clearance) || 0)),
    discoveries: Array.isArray(raw.discoveries) ? [...new Set(raw.discoveries)] : [],
    calcStep: Math.max(0, Number(raw.calcStep) || 0),
  }
}

export function getArgState() {
  if (typeof window === 'undefined') return { ...initialState }
  try {
    return sanitize(JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}'))
  } catch {
    return { ...initialState }
  }
}

export function setArgState(patch) {
  const current = getArgState()
  const next = sanitize(typeof patch === 'function' ? patch(current) : { ...current, ...patch })
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }))
  }
  return next
}

export function discover(id, minimumClearance = null) {
  return setArgState((current) => ({
    ...current,
    clearance: minimumClearance == null ? current.clearance : Math.max(current.clearance, minimumClearance),
    discoveries: current.discoveries.includes(id) ? current.discoveries : [...current.discoveries, id],
  }))
}

export function hasDiscovery(id) {
  return getArgState().discoveries.includes(id)
}

export function subscribeArg(callback) {
  if (typeof window === 'undefined') return () => {}
  const listener = (event) => callback(event.detail || getArgState())
  window.addEventListener(EVENT_NAME, listener)
  window.addEventListener('storage', listener)
  return () => {
    window.removeEventListener(EVENT_NAME, listener)
    window.removeEventListener('storage', listener)
  }
}

export function resetArgProgress() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { ...initialState } }))
  }
  return { ...initialState }
}

export const ARG_EVENT = EVENT_NAME
