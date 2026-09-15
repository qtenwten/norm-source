export const caseRegistry = [
  { id:'LM-001', title:'ПОЛТЕРГЕЙСТ', status:'ЗАКРЫТО', threat:'II', date:'АРХИВ', note:'Первое дело реестра Н.О.Р.М.; бытовая аномальная активность.', route:null, content:'legacy-summary' },
  { id:'LM-002', title:'РЕЧНАЯ ГАДИНА', status:'ЗАКРЫТО', threat:'III', date:'АРХИВ', note:'Расследование серии таинственных исчезновений людей у воды.', route:null, content:'legacy-summary' },
  { id:'LM-003', title:'ДРЕВНЮЧЕЕ КОЛДУНСТВО', status:'ЗАКРЫТО', threat:'II', date:'АРХИВ', note:'Проклятие гадалки и длительное ритуальное воздействие.', route:null, content:'legacy-summary' },
  { id:'LM-004', title:'МАРИОНЕТКА ДЬЯВОЛА', status:'ЗАКРЫТО', threat:'III', date:'АРХИВ', note:'Аномальный объект: сущность, связанная с куклой.', route:null, content:'legacy-summary' },
  {
    id:'LM-005', title:'НОЧНОЙ ДУШНИЛА', status:'ЗАКРЫТО', threat:'II', date:'АРХИВ', route:'/cases/lm-005', content:'full',
    note:'Клиент не спал более 57 часов. Сущность зафиксирована камерой и нейтрализована.', entity:'N-005',
    assets:['/assets/night-dusnila-cover.webp','/assets/night-dusnila-detector.webp','/assets/night-dusnila-client.webp','/assets/night-dusnila-monitor-before.webp','/assets/night-dusnila-monitor-entity.webp','/assets/night-dusnila-dreamcatchers.webp'],
    timeline:['первичный контакт','наблюдение','02:59:51 manifestation','нейтрализация','post-operation anomaly'],
  },
  {
    id:'LM-006', title:'ЗУМЕРСКИЙ ДЕМОН', status:'ЗАКРЫТО', threat:'II', date:'АРХИВ', route:'/cases/lm-006', content:'full',
    note:'Случай «Dead Inside»: 1000−7, голос SF и ритуал изгнания. Остаточная активность не исключена.', entity:'Z-006',
    assets:[], timeline:['первичный осмотр','1000−7','ритуал','остаточный голос','listener anomaly'],
  },
]

export function getCaseRecord(id) { return caseRegistry.find((item) => item.id === id) || null }
export function getCaseRoute(id) { return getCaseRecord(id)?.route || '#' }

// New episodes should be registered here as content records first. Page-specific cinematic
// templates may be added later without changing the archive list or cross-link contracts.
