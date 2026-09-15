import river01 from './river-01.b64?raw'
import river02 from './river-02.b64?raw'
import river03 from './river-03.b64?raw'
import river04 from './river-04.b64?raw'
import river05 from './river-05.b64?raw'
import river06 from './river-06.b64?raw'

import sorcery01 from './sorcery-01.b64?raw'
import sorcery02 from './sorcery-02.b64?raw'
import sorcery03 from './sorcery-03.b64?raw'
import sorcery04 from './sorcery-04.b64?raw'
import sorcery05 from './sorcery-05.b64?raw'

const clean = (value) => value.trim()

export const riverGeneratedImage = `data:image/webp;base64,${[
  river01,
  river02,
  river03,
  river04,
  river05,
  river06,
].map(clean).join('')}`

export const sorceryGeneratedImage = `data:image/webp;base64,${[
  sorcery01,
  sorcery02,
  sorcery03,
  sorcery04,
  sorcery05,
].map(clean).join('')}`
