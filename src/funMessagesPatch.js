import { internalMessages } from './worldData'

const senGrigMessages = [
  {
    id:'MSG-LM-BANTER-01',
    date:'15.09.2026 09:14',
    from:'AG-GRIG',
    to:'AG-SEN',
    subject:'важный вопрос по снабжению',
    clearance:0,
    tags:['FIELD-LM','личное','кофе'],
    body:[
      'Ты кружку клиента случайно с собой не забрал?',
      'Ту, с тортиками.',
      'Потому что если да — это уже не улика, а мародёрство.'
    ],
  },
  {
    id:'MSG-LM-BANTER-02',
    date:'15.09.2026 09:16',
    from:'AG-SEN',
    to:'AG-GRIG',
    subject:'RE: важный вопрос по снабжению',
    clearance:0,
    tags:['FIELD-LM','личное','кофе'],
    body:[
      'Не забрал.',
      'Но если он снова будет хлебать кофе так громко, кружку придётся классифицировать как акустическую аномалию.',
      'Категория угрозы: III. Для нервной системы — IV.'
    ],
  },
  {
    id:'MSG-LM-BANTER-03',
    date:'15.09.2026 09:27',
    from:'AG-GRIG',
    to:'AG-SEN',
    subject:'тибетские благовония',
    clearance:0,
    tags:['LM-005','личное','снабжение'],
    body:[
      'Я проверил чек.',
      'Наши «тибетские благовония» официально называются «Манго-ваниль, 12 палочек».',
      'Тибет находится в павильоне №14 у метро.'
    ],
  },
  {
    id:'MSG-LM-BANTER-04',
    date:'15.09.2026 09:31',
    from:'AG-SEN',
    to:'AG-GRIG',
    subject:'RE: тибетские благовония',
    clearance:0,
    tags:['LM-005','личное','ритуал'],
    body:[
      'Главное, что клиент поверил.',
      'И сущность, судя по всему, тоже.',
      'В следующий раз берём клубнику. Проверим предпочтения загробного мира.'
    ],
  },
  {
    id:'MSG-LM-BANTER-05',
    date:'15.09.2026 10:02',
    from:'AG-GRIG',
    to:'AG-SEN',
    subject:'про заклинание',
    clearance:0,
    tags:['LM-005','личное','ритуал'],
    body:[
      'Я всё-таки прогнал твою латынь через переводчик.',
      'У меня два вопроса.',
      'Первый: зачем ты отправил злой дух «к члену». Второй: почему это сработало лучше официального протокола.'
    ],
  },
  {
    id:'MSG-LM-BANTER-06',
    date:'15.09.2026 10:05',
    from:'AG-SEN',
    to:'AG-GRIG',
    subject:'RE: про заклинание',
    clearance:0,
    tags:['LM-005','личное','ритуал'],
    body:[
      'Я не отправлял.',
      'Я проветривал комнату.',
      'Если демон ушёл от сквозняка — это уже вопрос к демону, не ко мне.'
    ],
  },
  {
    id:'MSG-LM-BANTER-07',
    date:'15.09.2026 11:18',
    from:'AG-GRIG',
    to:'AG-SEN',
    subject:'LM-006 // научный вопрос',
    clearance:0,
    tags:['LM-006','личное','Dota'],
    body:[
      'Если человек одержим демоном, но при этом всё равно мажет хуками на Pudge —',
      'это демон плохо играет или Вадик настолько сильный носитель?',
      'Нужно для раздела «дифференциальная диагностика».'
    ],
  },
  {
    id:'MSG-LM-BANTER-08',
    date:'15.09.2026 11:21',
    from:'AG-SEN',
    to:'AG-GRIG',
    subject:'RE: LM-006 // научный вопрос',
    clearance:0,
    tags:['LM-006','личное','Dota'],
    body:[
      'Если после вселения процент попаданий не вырос — демон не даёт механического преимущества.',
      'Записывай.',
      'Это, между прочим, первый реально полезный вывод из всего дела.'
    ],
  },
  {
    id:'MSG-LM-BANTER-09',
    date:'15.09.2026 11:43',
    from:'AG-GRIG',
    to:'AG-SEN',
    subject:'сигил',
    clearance:0,
    tags:['LM-006','личное','ритуал'],
    body:[
      'Я открыл фото первой версии сигила.',
      'Сен.',
      'Он всё ещё выглядит как слово из трёх букв.'
    ],
  },
  {
    id:'MSG-LM-BANTER-10',
    date:'15.09.2026 11:44',
    from:'AG-SEN',
    to:'AG-GRIG',
    subject:'RE: сигил',
    clearance:0,
    tags:['LM-006','личное','ритуал'],
    body:[
      'Это древняя защитная геометрия.',
      'Просто древние тоже были людьми.'
    ],
  },
  {
    id:'MSG-LM-BANTER-11',
    date:'15.09.2026 12:07',
    from:'AG-SEN',
    to:'AG-GRIG',
    subject:'1000−7',
    clearance:0,
    tags:['LM-006','личное','1000−7'],
    body:[
      '993.'
    ],
  },
  {
    id:'MSG-LM-BANTER-12',
    date:'15.09.2026 12:08',
    from:'AG-GRIG',
    to:'AG-SEN',
    subject:'RE: 1000−7',
    clearance:0,
    tags:['LM-006','личное','1000−7'],
    body:[
      '986.'
    ],
  },
  {
    id:'MSG-LM-BANTER-13',
    date:'15.09.2026 12:09',
    from:'AG-SEN',
    to:'AG-GRIG',
    subject:'RE: RE: 1000−7',
    clearance:0,
    tags:['LM-006','личное','1000−7'],
    body:[
      'Не начинай.'
    ],
  },
  {
    id:'MSG-LM-BANTER-14',
    date:'15.09.2026 12:10',
    from:'AG-GRIG',
    to:'AG-SEN',
    subject:'RE: RE: RE: 1000−7',
    clearance:0,
    tags:['LM-006','личное','1000−7'],
    body:[
      '979.'
    ],
  },
  {
    id:'MSG-LM-BANTER-15',
    date:'15.09.2026 12:11',
    from:'AG-SEN',
    to:'AG-GRIG',
    subject:'последнее предупреждение',
    clearance:0,
    tags:['LM-006','личное'],
    body:[
      'Если терминал опять откроет BLACK ARCHIVE, объяснять будешь ты.'
    ],
  },
]

const existing = new Set(internalMessages.map((message) => message.id))
const fresh = senGrigMessages.filter((message) => !existing.has(message.id))

// Keep the casual FIELD-LM thread near the top of the mailbox without
// touching the canonical/system messages that drive the ARG.
internalMessages.splice(3, 0, ...fresh)
