import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AccessGate from './components/AccessGate'
import Shell from './components/Shell'
import Dashboard from './pages/Dashboard'
import Cases from './pages/Cases'
import CaseDetail from './pages/CaseDetail'
import NightCaseDetail from './pages/NightCaseDetail'
import Grimoire from './pages/Grimoire'
import Agents from './pages/Agents'
import Archive from './pages/Archive'
import TerminalDeep from './pages/TerminalDeep'
import Report from './pages/Report'
import ClearanceZone from './pages/ClearanceZone'
import GhostRegistry from './pages/GhostRegistry'
import MirrorNode from './pages/MirrorNode'
import LegacyCases from './pages/LegacyCases'

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
 return <Shell onLogout={logout}><Routes>
  <Route path="/" element={<Dashboard/>}/>
  <Route path="/cases" element={<Cases/>}/>
  <Route path="/cases/lm-005" element={<NightCaseDetail/>}/>
  <Route path="/cases/lm-006" element={<CaseDetail/>}/>
  <Route path="/grimoire" element={<Grimoire/>}/>
  <Route path="/agents" element={<Agents/>}/>
  <Route path="/agents/00" element={<Navigate to="/agents#00" replace/>}/>
  <Route path="/archive" element={<Archive/>}/>
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
 </Routes></Shell>
}
