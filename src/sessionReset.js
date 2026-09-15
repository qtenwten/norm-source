export const SESSION_RESET_EVENT = 'norm:session-reset'

const REPLAY_LOCAL_KEYS = [
  'norm-arg-progress-v1',
  'norm-system-events-v2',
  'norm-mail-read-v2',
]

const REPLAY_SESSION_KEYS = [
  'norm-entered',
  'norm-operator',
  'norm-terminal-prefill',
]

export function resetReplaySession(reason = 'manual') {
  if (typeof window === 'undefined') return false

  for (const key of REPLAY_LOCAL_KEYS) window.localStorage.removeItem(key)
  for (const key of REPLAY_SESSION_KEYS) window.sessionStorage.removeItem(key)

  // Notify the live React shell so a terminal-issued reset can return to the access
  // gate without a hard reload. Audio preference is deliberately preserved.
  window.dispatchEvent(new CustomEvent(SESSION_RESET_EVENT, {
    detail: { reason, at: Date.now() },
  }))
  return true
}

export const REPLAY_RESET_KEYS = Object.freeze({
  local: [...REPLAY_LOCAL_KEYS],
  session: [...REPLAY_SESSION_KEYS],
})
