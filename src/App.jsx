import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AccessGate from './components/AccessGate'
import Shell from './components/Shell'
import Dashboard from './pages/Dashboard'
import Cases from './pages/Cases'
import CaseDetail from './pages/CaseDetail'
import Grimoire from './pages/Grimoire'
import Agents from './pages/Agents'
import Archive from './pages/Archive'
import Terminal from './pages/Terminal'
import Report from './pages/Report'

export default function App(){
 const [entered,setEntered]=useState(()=>sessionStorage.getItem('norm-entered')==='1')
 useEffect(()=>{if(entered)sessionStorage.setItem('norm-entered','1')},[entered])
 if(!entered)return <AccessGate onEnter={()=>setEntered(true)}/>
 return <Shell><Routes><Route path="/" element={<Dashboard/>}/><Route path="/cases" element={<Cases/>}/><Route path="/cases/lm-006" element={<CaseDetail/>}/><Route path="/grimoire" element={<Grimoire/>}/><Route path="/agents" element={<Agents/>}/><Route path="/archive" element={<Archive/>}/><Route path="/terminal" element={<Terminal/>}/><Route path="/report" element={<Report/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes></Shell>
}
