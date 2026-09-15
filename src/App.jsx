import { Suspense, lazy, useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AccessGate from './components/AccessGate'
import Shell from './components/Shell'
import SystemEventDaemon from './components/SystemEventDaemon'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Cases = lazy(() => import('./pages/Cases'))
const CaseDetail = lazy(() => import('./pages/CaseDetail'))
const NightCaseDetail = lazy(() => import('./pages/NightCaseDetail'))
const Grimoire = lazy(() => import('./pages/Grimoire'))
const Agents = lazy(() => import('./pages/Agents'))
const Archive = lazy(() => import('./pages/Archive'))
const InvestigationHub = lazy(() => import('./pages/InvestigationHub'))
const TerminalDeep = lazy(() => import('./pages/TerminalDeep'))
const Report = lazy(() => import('./pages/Report'))
const ClearanceZone = lazy(() => import('./pages/ClearanceZone'))
const GhostRegistry = lazy(() => import('./pages/GhostRegistry'))
const MirrorNode = lazy(() => import('./pages/MirrorNode'))
const LegacyCases = lazy(() => import('./pages/LegacyCases'))
const InvestigatorDesk = lazy(() => import('./pages/InvestigatorDesk'))
const Forensics = lazy(() => import('./pages/Forensics'))
const Mailbox = lazy(() => import('./pages/Mailbox'))
const EquipmentRegistry = lazy(() => import('./pages/EquipmentRegistry'))

function RouteLoader(){
 return <div className="norm-route-loader"><small>NORM-OS // MODULE HANDOFF</small><b>ЗАГРУЗКА СЕКТОРА…</b></div>
}

export default function App(){
 const [entered,setEntered]=useState(()=>sessionStorage.getItem('norm-entered')==='1')
 useEffect(()=>{if(entered)sessionStorage.setItem('norm-entered','1')},[entered])
 const logout=()=>{
  sessionStorage.removeItem('norm-entered')
  sessionStorage.removeItem('norm-operator')
  window.history.replaceState(null,'','/')
  setEntered(false)
 }
 if(!entered)return <AccessGate onEnter={()=>setEntered(true)}/>
 return <Shell onLogout={logout}>
  <SystemEventDaemon/>
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
 </Shell>
}
