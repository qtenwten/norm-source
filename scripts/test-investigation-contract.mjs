import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const worldPath = path.join(root, 'src/worldData.js')
const componentPath = path.join(root, 'src/pages/InvestigationHub.jsx')
const cssPath = path.join(root, 'src/v24.css')
const mainPath = path.join(root, 'src/main.jsx')

const fail = (message) => {
  console.error(`INVESTIGATION CONTRACT: FAIL // ${message}`)
  process.exit(1)
}

const world = await import(`${pathToFileURL(worldPath).href}?contract=${Date.now()}`)
const component = await fs.readFile(componentPath, 'utf8')
const css = await fs.readFile(cssPath, 'utf8')
const main = await fs.readFile(mainPath, 'utf8')

const { correlationNodes, correlationEdges } = world
if (!Array.isArray(correlationNodes) || correlationNodes.length < 2) fail('correlationNodes missing')
if (!Array.isArray(correlationEdges) || correlationEdges.length < 1) fail('correlationEdges missing')

const ids = new Set()
for (const node of correlationNodes) {
  if (!node?.id) fail('node without id')
  if (ids.has(node.id)) fail(`duplicate node id: ${node.id}`)
  ids.add(node.id)
  if (!Number.isFinite(node.x) || node.x < 0 || node.x > 100) fail(`node ${node.id} x outside 0..100`)
  if (!Number.isFinite(node.y) || node.y < 0 || node.y > 100) fail(`node ${node.id} y outside 0..100`)
  if (!Number.isInteger(node.clearance) || node.clearance < 0 || node.clearance > 5) fail(`node ${node.id} invalid clearance`)
}

const edgeKeys = new Set()
for (const edge of correlationEdges) {
  if (!Array.isArray(edge) || edge.length < 3) fail('malformed edge')
  const [a, b, label] = edge
  if (!ids.has(a) || !ids.has(b)) fail(`edge references missing node: ${a} -> ${b}`)
  if (a === b) fail(`self edge: ${a}`)
  if (!String(label || '').trim()) fail(`edge without label: ${a} -> ${b}`)
  const key = [a, b].sort().join('::')
  if (edgeKeys.has(key)) fail(`duplicate undirected edge: ${a} <-> ${b}`)
  edgeKeys.add(key)
}

if (!component.includes('setSelectedNode(node.id)')) fail('canvas node selection handler missing')
if (!component.includes("selectedNode === node.id ? 'active'")) fail('active class binding missing')
if (!component.includes('correlation-node')) fail('correlation node UI missing')

if (!css.includes('.correlation-canvas svg{') || !css.includes('pointer-events:none!important')) fail('SVG click shield protection missing')
if (!css.includes('.correlation-node.locked.active')) fail('locked selected-node override missing')
if (!css.includes('.correlation-node.active::after')) fail('selected-state badge missing')
if (!main.includes("import './v24.css'")) fail('v24.css not loaded last')

console.log(`INVESTIGATION CONTRACT: OK // nodes=${correlationNodes.length} // edges=${correlationEdges.length}`)
