import { promises as fs } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve('dist')
const BASE = '/norm-source'
const TEXT_EXTENSIONS = new Set(['.html','.css','.js','.mjs','.json','.svg','.xml','.txt'])

async function walk(dir){
  const entries = await fs.readdir(dir,{withFileTypes:true})
  for(const entry of entries){
    const full = path.join(dir,entry.name)
    if(entry.isDirectory()) await walk(full)
    else if(TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())){
      const before = await fs.readFile(full,'utf8')
      const after = before.replace(/(?<!\/norm-source)\/assets\//g,`${BASE}/assets/`)
      if(after !== before) await fs.writeFile(full,after,'utf8')
    }
  }
}

await walk(ROOT)
console.log('PAGES ASSET REWRITE: OK // /assets/ -> /norm-source/assets/')
