import { useEffect, useState } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'

function App() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [tab, setTab] = useState('login')
  const [session, setSession] = useState(()=>{
    const s = localStorage.getItem('session')
    return s ? JSON.parse(s) : null
  })

  useEffect(()=>{ if(session) localStorage.setItem('session', JSON.stringify(session)) }, [session])

  const onLogin = (data)=>{ setSession(data) }
  const onLogout = ()=>{ setSession(null); localStorage.removeItem('session') }

  if(!session){
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          <div className="flex justify-center space-x-4 mb-6">
            <button onClick={()=>setTab('login')} className={`px-4 py-2 rounded ${tab==='login'?'bg-blue-600 text-white':'bg-white shadow'}`}>Login</button>
            <button onClick={()=>setTab('register')} className={`px-4 py-2 rounded ${tab==='register'?'bg-blue-600 text-white':'bg-white shadow'}`}>Register</button>
          </div>
          {tab==='login' ? (
            <Login onLogin={onLogin} backendUrl={backendUrl} />
          ) : (
            <Register backendUrl={backendUrl} />
          )}
          <div className="text-center mt-6">
            <a href="/test" className="text-sm text-gray-600 underline">Test backend & database</a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Dashboard session={session} backendUrl={backendUrl} onLogout={onLogout} />
    </div>
  )
}

export default App
