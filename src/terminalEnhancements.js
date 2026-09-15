import { virtualFiles } from './argKernel'

const COMMANDS = [
  'help','status','whoami','leads','hint','hint next','clear','history','pwd','ls','ls -la','cd','cat','open','inspect','info','tree','evidence','pack','download','scp','head','tail','file','stat','wc','search','grep','grep -R','find','strings','xxd','ps','ps aux','netstat','uname -a','id','env','df','dmesg','whois','mount','sudo unlock','reindex --orphaned','calc','auth','decode','say','neutralize','sound on','sound off','kill 0',
]

const PATHS = [...new Set(virtualFiles.map((file) => file.path))].sort()
let lastTabAt = 0

function setReactInput(input, value) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
  setter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles:true }))
}

function helper(input, text) {
  const root = input.closest('.terminal-console')
  const bar = root?.querySelector('.terminal-command-help')
  if (!bar) return
  bar.dataset.norm20 = text
  bar.classList.add('norm20-hinting')
  window.setTimeout(() => { bar.classList.remove('norm20-hinting'); delete bar.dataset.norm20 }, 1800)
}

function currentCwd(input) {
  return input.closest('form')?.querySelector('label')?.textContent?.replace(/>\s*$/,'').trim() || '/'
}

function complete(input) {
  const raw = input.value
  const parts = raw.split(/\s+/)
  const token = parts[parts.length - 1] || ''
  const isPath = token.startsWith('/') || token.startsWith('.') || parts.length > 1
  const pool = isPath ? PATHS : COMMANDS
  const needle = token.toLowerCase()
  const matches = pool.filter((item) => item.toLowerCase().startsWith(needle))
  if (!matches.length) { helper(input, 'TAB // NO MATCH'); return }
  if (matches.length === 1) {
    const next = [...parts.slice(0,-1), matches[0]].join(' ')
    setReactInput(input, next)
    helper(input, `TAB → ${matches[0]}`)
    return
  }
  const now = performance.now()
  helper(input, `${now-lastTabAt < 700 ? 'TAB×2' : 'TAB'} // ${matches.slice(0,6).join('   ')}${matches.length>6?' …':''}`)
  lastTabAt = now
}

function submit(input, value) {
  setReactInput(input, value)
  queueMicrotask(() => input.closest('form')?.requestSubmit())
}

function globToRegex(pattern) {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g,'\\$&').replace(/\*/g,'.*').replace(/\?/g,'.')
  return new RegExp(`^${escaped}$`, 'i')
}

function appendSynthetic(input, text, tone='normal') {
  const log = input.closest('.terminal-console')?.querySelector('.terminal-log')
  if (!log) return
  const row = document.createElement('div')
  row.className = `terminal-line terminal-line--${tone} norm20-synthetic-line`
  const time = document.createElement('time')
  time.textContent = new Date().toLocaleTimeString('ru-RU',{hour12:false})
  const span = document.createElement('span')
  span.textContent = text
  row.append(time, span)
  log.append(row)
  log.scrollTop = log.scrollHeight
}

function interceptCommand(event, input) {
  if (event.key !== 'Enter' || event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) return false
  const raw = input.value.trim()

  const pipe = raw.match(/^cat\s+(.+?)\s*\|\s*grep\s+(.+)$/i)
  if (pipe) {
    event.preventDefault()
    const [,path,term] = pipe
    helper(input, 'PIPE TRANSLATED → GREP')
    submit(input, `grep ${term} ${path}`)
    return true
  }

  const glob = raw.match(/^cat\s+([^\s]*[*?][^\s]*)$/i)
  if (glob) {
    event.preventDefault()
    const cwd = currentCwd(input)
    const pattern = glob[1].startsWith('/') ? glob[1] : `${cwd.replace(/\/$/,'')}/${glob[1]}`
    const rx = globToRegex(pattern.replace(/\/+/g,'/'))
    const matches = PATHS.filter((path) => rx.test(path)).slice(0,12)
    if (!matches.length) { appendSynthetic(input, `glob: ${glob[1]}: NO MATCH`, 'warn'); setReactInput(input,''); return true }
    appendSynthetic(input, `GLOB ${glob[1]} // ${matches.length} MATCHES`, 'ok')
    setReactInput(input,'')
    matches.forEach((path,index) => window.setTimeout(() => submit(input, `cat ${path}`), index*90))
    return true
  }

  if (/^ps\s+aux$/i.test(raw)) {
    event.preventDefault(); submit(input,'ps'); helper(input,'PS AUX → PROCESS TABLE'); return true
  }

  if (/^kill\s+0$/i.test(raw)) {
    event.preventDefault()
    setReactInput(input,'')
    appendSynthetic(input, '> kill 0', 'command')
    appendSynthetic(input, 'kill: operation permitted', 'ok')
    appendSynthetic(input, 'process 0 terminated', 'match')
    window.setTimeout(() => appendSynthetic(input, 'process 0 attached', 'danger'), 2100)
    window.setTimeout(() => appendSynthetic(input, 'owner: none // watcher: CURRENT SESSION', 'warn'), 2450)
    return true
  }
  return false
}

function onKeyDown(event) {
  const input = event.target
  if (!(input instanceof HTMLInputElement) || input.id !== 'terminal-command') return

  if (event.key === 'Tab') { event.preventDefault(); complete(input); return }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'l') {
    event.preventDefault(); submit(input,'clear'); helper(input,'CTRL+L // BUFFER CLEARED'); return
  }
  if (event.ctrlKey && event.key.toLowerCase() === 'c') {
    event.preventDefault(); setReactInput(input,''); appendSynthetic(input,'^C // INPUT INTERRUPTED','warn'); return
  }
  interceptCommand(event,input)
}

function decorateTerminal() {
  const input = document.getElementById('terminal-command')
  if (!input || input.dataset.norm25 === '1') return
  input.dataset.norm25 = '1'
  const help = input.closest('.terminal-console')?.querySelector('.terminal-command-help')
  if (help && !help.querySelector('[data-norm25-help]')) {
    const span = document.createElement('span')
    span.dataset.norm25Help = '1'
    span.textContent = 'TAB COMPLETE · CTRL+L CLEAR · CTRL+C INTERRUPT · PIPE / GLOB'
    help.append(span)
  }
}

if (typeof window !== 'undefined') {
  document.addEventListener('keydown', onKeyDown, true)
  const observer = new MutationObserver(decorateTerminal)
  const start = () => { decorateTerminal(); observer.observe(document.body,{childList:true,subtree:true}) }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded',start,{once:true}) : start()
}
