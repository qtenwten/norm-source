import { Suspense, lazy, useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import AccessGate from './components/AccessGate'
import Shell from './components/Shell'
import SystemEventDaemon from './components/SystemEventDaemon'
import RouteErrorBoundary from './components/RouteErrorBoundary'
import { loadRouteModule } from './routeRecovery'
import { resetReplaySession, SESSION_RESET_EVENT } from './sessionReset'

const routeModules = {
  Dashboard: () => import('./pages/Dashboard'),
  Cases: () => import('./pages/Cases'),
  CaseDetail: () => import('./pages/CaseDetail'),
  NightCaseDetail: () => import('./pages/NightCaseDetail'),
  Grimoire: () => import('./pages/Grimoire'),
  Agents: () => import('./pages/Agents'),
  Archive: () => import('./pages/Archive'),
  InvestigationHub: () => import('./pages/InvestigationHub'),
  TerminalDeep: () => import('./pages/TerminalDeep'),
  Report: () => import('./pages/Report'),
  ClearanceZone: () => import('./pages/ClearanceZone'),
  GhostRegistry: () => import('./pages/GhostRegistry'),
  MirrorNode: () => import('./pages/MirrorNode'),
  LegacyCases: () => import('./pages/LegacyCases'),
  InvestigatorDesk: () => import('./pages/InvestigatorDesk'),
  Forensics: () => import('./pages/Forensics'),
  Mailbox: () => import('./pages/Mailbox'),
  EquipmentRegistry: () => import('./pages/EquipmentRegistry'),
}

const lazyRoute = (name) => lazy(() => loadRouteModule(routeModules[name], name))

const Dashboard = lazyRoute('Dashboard')
const Cases = lazyRoute('Cases')
const CaseDetail = lazyRoute('CaseDetail')
const NightCaseDetail = lazyRoute('NightCaseDetail')
const Grimoire = lazyRoute('Grimoire')
const Agents = lazyRoute('Agents')
const Archive = lazyRoute('Archive')
const InvestigationHub = lazyRoute('InvestigationHub')
const TerminalDeep = lazyRoute('TerminalDeep')
const Report = lazyRoute('Report')
const ClearanceZone = lazyRoute('ClearanceZone')
const GhostRegistry = lazyRoute('GhostRegistry')
const MirrorNode = lazyRoute('MirrorNode')
const LegacyCases = lazyRoute('LegacyCases')
const InvestigatorDesk = lazyRoute('InvestigatorDesk')
const Forensics = lazyRoute('Forensics')
const Mailbox = lazyRoute('Mailbox')
const EquipmentRegistry = lazyRoute('EquipmentRegistry')

function RouteLoader(){
 return <div className="norm-route-loader"><small>NORM-OS // MODULE HANDOFF</small><b>ЗАГРУЗКА СЕКТОРА…</b><span>ПРОВЕРКА ВЕРСИИ МОДУЛЯ</span></div>
}

export default function App(){
 const location = useLocation()
 const navigate = useNavigate()
 const [entered,setEntered]=useState(()=>sessionStorage.getItem('norm-entered')==='1')
 useEffect(()=>{if(entered)sessionStorage.setItem('norm-entered','1')},[entered])

 // A reset may originate inside Field Terminal. Bring every reset path through the
 // same gate transition so logout and replay-reset cannot diverge over time.
 useEffect(()=>{
  const onSessionReset=()=>{
   navigate('/',{replace:true})
   setEntered(false)
  }
  window.addEventListener(SESSION_RESET_EVENT,onSessionReset)
  return()=>window.removeEventListener(SESSION_RESET_EVENT,onSessionReset)
 },[navigate])

 // Warm every route chunk after the shell becomes interactive. This prevents an
 // already-open session from requesting a stale chunk only after a later deploy.
 useEffect(() => {
  if(!entered) return undefined
  let timer = null
  let idle = null
  const preload = () => { Promise.allSettled(Object.values(routeModules).map((importer) => importer())) }
  if('requestIdleCallback' in window) idle = window.requestIdleCallback(preload,{timeout:2500})
  else timer = window.setTimeout(preload,1400)
  return () => {
   if(idle !== null && 'cancelIdleCallback' in window) window.cancelIdleCallback(idle)
   if(timer !== null) window.clearTimeout(timer)
  }
 },[entered])

 const logout=()=>resetReplaySession('logout')
 if(!entered)return <AccessGate onEnter={()=>setEntered(true)}/>
 return <Shell onLogout={logout}>
  <SystemEventDaemon/>
  <RouteErrorBoundary routeKey={`${location.pathname}${location.hash}`}>
   <Suspense fallback={<RouteLoader/>}>
    <Routes>
     <Route path="/" element={<Dashboard/>}/>
     <Route path="/cases" element={<Cases/>}/>
     <Route path="/cases/lm-005" element={<NightCaseDetail/>}/>
     <Route path="/cases/lm-006" element={<CaseDetail/>}/>
     <Route path="/grimoire" element={<Grimoire/>}/>
     <Route path="/agents" element={<Agents/>}/>
     <Route path="/agents/00" element={<Navigate to="/agents#00" replace/>}/>
     <Route path="/archive" element={<Archive/>}/>
     <Route path="/investigation" element={<InvestigationHub/>}/>
     <Route path="/connections" element={<Navigate to="/investigation#map" replace/>}/>
     <Route path="/messages" element={<Navigate to="/mail" replace/>}/>
     <Route path="/objects" element={<Navigate to="/equipment" replace/>}/>
     <Route path="/media-vault" element={<Navigate to="/forensics" replace/>}/>
     <Route path="/journal" element={<Navigate to="/investigation#journal" replace/>}/>
     <Route path="/desk" element={<InvestigatorDesk/>}/>
     <Route path="/forensics" element={<Forensics/>}/>
     <Route path="/mail" element={<Mailbox/>}/>
     <Route path="/equipment" element={<EquipmentRegistry/>}/>
     <Route path="/archive/restricted" element={<Navigate to="/restricted" replace/>}/>
     <Route path="/archive/black" element={<Navigate to="/black" replace/>}/>
     <Route path="/restricted" element={<ClearanceZone zone="restricted"/>}/>
     <Route path="/black" element={<ClearanceZone zone="black"/>}/>
     <Route path="/vault" element={<ClearanceZone zone="vault"/>}/>
     <Route path="/ghost-registry" element={<GhostRegistry/>}/>
     <Route path="/legacy-cases" element={<LegacyCases/>}/>
     <Route path="/mirror-node" element={<MirrorNode/>}/>
     <Route path="/terminal" element={<TerminalDeep/>}/>
     <Route path="/terminal/root" element={<Navigate to="/vault" replace/>}/>
     <Route path="/report" element={<Report/>}/>
     <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>
   </Suspense>
  </RouteErrorBoundary>
 </Shell>
}
