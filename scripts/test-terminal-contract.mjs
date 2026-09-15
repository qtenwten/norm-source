import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  availableDirectories,
  fileAliases,
  findVirtualFile,
  listVirtualDirectory,
  normalizePath,
  renderFileContent,
  virtualFiles,
} from '../src/argKernel.js'
import { getDirectoryMeta, getFileMeta } from '../src/terminalFileMeta.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const failures = []
const notes = []
const assert = (condition, message) => { if (!condition) failures.push(message) }

const maxProgress = { clearance:5, mountedGhost:true, discoveries:[] }
const directories = new Set(availableDirectories(maxProgress))
const filePaths = new Set()
const fileIds = new Set()

function parentPath(value) {
  const normalized = normalizePath(value)
  if (normalized === '/') return '/'
  const parts = normalized.split('/').filter(Boolean)
  parts.pop()
  return parts.length ? `/${parts.join('/')}` : '/'
}

for (const file of virtualFiles) {
  assert(typeof file.path === 'string' && file.path.startsWith('/'), `invalid file path: ${file?.path}`)
  assert(!file.path.endsWith('/'), `file path must not end with /: ${file.path}`)
  assert(typeof file.id === 'string' && file.id.length > 0, `missing id: ${file.path}`)
  assert(Number.isInteger(file.level) && file.level >= 0 && file.level <= 5, `invalid level for ${file.path}`)
  assert(Array.isArray(renderFileContent(file)) && renderFileContent(file).length > 0, `empty body: ${file.path}`)
  assert(renderFileContent(file).every((row) => typeof row === 'string'), `non-string body row: ${file.path}`)
  assert(!filePaths.has(file.path.toLowerCase()), `duplicate path: ${file.path}`)
  assert(!fileIds.has(file.id), `duplicate id: ${file.id}`)
  filePaths.add(file.path.toLowerCase())
  fileIds.add(file.id)

  const parent = parentPath(file.path)
  assert(directories.has(parent), `parent directory is not registered: ${file.path} -> ${parent}`)

  const meta = getFileMeta(file)
  assert(meta && typeof meta.title === 'string' && meta.title.length > 0, `missing title metadata: ${file.id}`)
  assert(meta && typeof meta.summary === 'string' && meta.summary.length > 0, `missing summary metadata: ${file.id}`)
  assert(meta && typeof meta.why === 'string' && meta.why.length > 0, `missing why metadata: ${file.id}`)
  assert(meta && Array.isArray(meta.suggest) && meta.suggest.length > 0, `missing suggestions: ${file.id}`)
}

for (const [alias, expected] of Object.entries(fileAliases)) {
  const resolved = findVirtualFile(alias, '/')
  assert(resolved, `alias does not resolve: ${alias}`)
  assert(resolved?.path === expected, `alias points to wrong file: ${alias} -> ${resolved?.path}, expected ${expected}`)
}

for (const dir of directories) {
  const meta = getDirectoryMeta(dir)
  assert(meta && typeof meta.title === 'string' && meta.title.length > 0, `directory metadata missing title: ${dir}`)
  assert(meta && typeof meta.summary === 'string' && meta.summary.length > 0, `directory metadata missing summary: ${dir}`)

  const entries = listVirtualDirectory(dir, maxProgress, true)
  assert(Array.isArray(entries), `directory listing is not an array: ${dir}`)
  for (const raw of entries) {
    if (['.','..','ACCESS DENIED'].includes(raw)) continue
    if (dir === '/entities' || dir === '/agents') continue
    if (raw === '.sys/') continue
    const clean = raw.replace(/\s+\[[^\]]+\]$/,'')
    const isDir = clean.endsWith('/')
    const child = normalizePath(clean.replace(/\/$/,''), dir)
    if (isDir) assert(directories.has(child), `listing points to unregistered directory: ${dir} -> ${raw}`)
    else assert(filePaths.has(child.toLowerCase()), `listing points to missing file: ${dir} -> ${raw}`)
  }
}

const essentials = [
  '/README',
  '/cases/lm-005/cam_025951.log',
  '/cases/lm-005/post_operation.log',
  '/black/norm0_origin.log',
  '/etc/norm.conf',
  '/dev/n0',
  '/mnt/ghost/personnel/ag-04.dos',
  '/mnt/ghost/personnel/ag-09.dos',
  '/mnt/ghost/personnel/ag-13.dos',
  '/mirror/.orphaned',
]
for (const item of essentials) assert(findVirtualFile(item, '/'), `essential ARG file missing: ${item}`)

assert(normalizePath('../black', '/cases') === '/black', 'normalizePath parent traversal regression')
assert(normalizePath('./lm-005', '/cases') === '/cases/lm-005', 'normalizePath relative regression')
assert(normalizePath('/cases//lm-005/../lm-006', '/') === '/cases/lm-006', 'normalizePath cleanup regression')

const terminalSource = fs.readFileSync(path.join(root, 'src/pages/TerminalDeep.jsx'), 'utf8')
const cssSource = fs.readFileSync(path.join(root, 'src/v23.css'), 'utf8')
const mainSource = fs.readFileSync(path.join(root, 'src/main.jsx'), 'utf8')

const commandContracts = [
  "LS(?:\\s|$)",
  "upper.startsWith('CD ')",
  "upper.startsWith('CAT ')",
  "upper.startsWith('INSPECT ')",
  "upper.startsWith('EVIDENCE')",
  "upper.startsWith('PACK')",
  "upper.startsWith('DOWNLOAD ')",
  "upper.startsWith('SEARCH ')",
  "upper.startsWith('GREP ')",
  "upper.startsWith('FIND ')",
  "upper.startsWith('MOUNT ')",
  "upper.startsWith('SUDO UNLOCK ')",
  "REINDEX --ORPHANED",
]
for (const token of commandContracts) assert(terminalSource.includes(token), `terminal command contract missing: ${token}`)

const uiContracts = [
  'terminal-line-actions',
  'terminal-result-link',
  'terminal-resource-inspector',
  'terminal-input-row',
  'terminal-command-log',
]
for (const token of uiContracts) {
  assert(terminalSource.includes(token), `terminal UI hook missing: ${token}`)
  assert(cssSource.includes(token), `terminal hardening CSS hook missing: ${token}`)
}
assert(mainSource.includes("import './v23.css'"), 'v23 terminal hardening stylesheet is not loaded last')

notes.push(`files=${virtualFiles.length}`)
notes.push(`directories=${directories.size}`)
notes.push(`aliases=${Object.keys(fileAliases).length}`)
notes.push(`commands=${commandContracts.length}`)

if (failures.length) {
  console.error('TERMINAL CONTRACT: FAILED')
  failures.forEach((failure) => console.error(` - ${failure}`))
  process.exit(1)
}

console.log(`TERMINAL CONTRACT: OK // ${notes.join(' // ')}`)
