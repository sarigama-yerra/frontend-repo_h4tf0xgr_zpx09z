import { useEffect, useMemo, useState } from 'react'

function Stat({ label, value, color="bg-blue-100 text-blue-800" }){
  return (
    <div className={`p-4 rounded-lg ${color}`}>
      <div className="text-sm opacity-80">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}

function LeaveRow({ item, onDecide }){
  return (
    <div className="grid grid-cols-7 gap-3 items-center p-3 border-b text-sm">
      <div className="font-medium">{item.applicant_name} <span className="text-gray-500">({item.applicant_role})</span></div>
      <div>{item.type}</div>
      <div className="truncate">{item.reason}</div>
      <div>{item.start_date}</div>
      <div>{item.end_date}</div>
      <div><span className={`px-2 py-1 rounded text-xs ${item.status==='pending'?'bg-yellow-100 text-yellow-800': item.status==='approved'?'bg-green-100 text-green-800':'bg-red-100 text-red-800'}`}>{item.status}</span></div>
      <div className="space-x-2">
        {item.status==='pending' && onDecide && (
          <>
            <button onClick={()=>onDecide(item, 'approved')} className="px-3 py-1 bg-green-600 text-white rounded">Approve</button>
            <button onClick={()=>onDecide(item, 'rejected')} className="px-3 py-1 bg-red-600 text-white rounded">Reject</button>
          </>
        )}
      </div>
    </div>
  )
}

export default function Dashboard({ session, backendUrl, onLogout }){
  const [stats, setStats] = useState(null)
  const [myLeaves, setMyLeaves] = useState([])
  const [pending, setPending] = useState([])
  const [form, setForm] = useState({ type:'sick', reason:'', start_date:'', end_date:'', attachment_url:'' })
  const [loadingApply, setLoadingApply] = useState(false)

  const token = session?.token
  const role = session?.user?.role

  const headers = useMemo(()=>({ 'Content-Type':'application/json', 'X-Token': token }),[token])

  const loadData = async() => {
    try{
      const [sRes, myRes] = await Promise.all([
        fetch(`${backendUrl}/stats/overview`, { headers }),
        fetch(`${backendUrl}/leaves/my`, { headers })
      ])
      const s = await sRes.json(); const m = await myRes.json()
      setStats(s)
      setMyLeaves(m)
      if(role!== 'student'){
        const pRes = await fetch(`${backendUrl}/leaves/pending`, { headers })
        setPending(await pRes.json())
      }
    }catch(e){
      console.error(e)
    }
  }

  useEffect(()=>{ loadData(); const t = setInterval(loadData, 4000); return ()=>clearInterval(t)},[])

  const submitLeave = async (e)=>{
    e.preventDefault()
    setLoadingApply(true)
    try{
      const res = await fetch(`${backendUrl}/leaves/apply`, { method:'POST', headers, body: JSON.stringify(form) })
      const data = await res.json()
      if(!res.ok) throw new Error(data.detail || 'Failed')
      setForm({ type:'sick', reason:'', start_date:'', end_date:'', attachment_url:'' })
      await loadData()
    }catch(e){
      alert(e.message)
    }finally{
      setLoadingApply(false)
    }
  }

  const decide = async (item, status)=>{
    const comment = prompt(`Add a comment for ${status}? (optional)`)
    try{
      const res = await fetch(`${backendUrl}/leaves/${item.id}/decide`, { method:'POST', headers, body: JSON.stringify({ status, comment }) })
      if(!res.ok){ const d = await res.json(); throw new Error(d.detail || 'Failed') }
      await loadData()
    }catch(e){ alert(e.message) }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-gray-600">Signed in as {session.user.name} · <span className="font-mono">{session.user.role}</span></p>
        </div>
        <button onClick={onLogout} className="px-4 py-2 bg-gray-800 text-white rounded">Logout</button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Stat label="Total" value={stats.total} />
          <Stat label="Pending" value={stats.pending} color="bg-yellow-100 text-yellow-800" />
          <Stat label="Approved" value={stats.approved} color="bg-green-100 text-green-800" />
          <Stat label="Rejected" value={stats.rejected} color="bg-red-100 text-red-800" />
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white rounded-xl shadow p-5">
          <h3 className="font-semibold mb-3">Apply for leave</h3>
          <form onSubmit={submitLeave} className="space-y-3">
            <div>
              <label className="block text-sm">Type</label>
              <select value={form.type} onChange={e=>setForm(f=>({...f, type:e.target.value}))} className="w-full border rounded px-3 py-2">
                <option value="sick">Sick</option>
                <option value="casual">Casual</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm">Reason</label>
              <textarea value={form.reason} onChange={e=>setForm(f=>({...f, reason:e.target.value}))} className="w-full border rounded px-3 py-2" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm">Start</label>
                <input type="date" value={form.start_date} onChange={e=>setForm(f=>({...f, start_date:e.target.value}))} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm">End</label>
                <input type="date" value={form.end_date} onChange={e=>setForm(f=>({...f, end_date:e.target.value}))} className="w-full border rounded px-3 py-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm">Attachment URL (optional)</label>
              <input value={form.attachment_url} onChange={e=>setForm(f=>({...f, attachment_url:e.target.value}))} className="w-full border rounded px-3 py-2" />
            </div>
            <button disabled={loadingApply} className="w-full bg-blue-600 text-white rounded py-2">{loadingApply? 'Submitting...':'Submit'}</button>
          </form>
        </div>
        <div className="md:col-span-2 bg-white rounded-xl shadow">
          <div className="p-4 border-b font-semibold">My Applications</div>
          <div className="divide-y">
            <div className="grid grid-cols-7 gap-3 p-3 text-xs uppercase tracking-wide text-gray-500">
              <div>Applicant</div><div>Type</div><div>Reason</div><div>Start</div><div>End</div><div>Status</div><div>Actions</div>
            </div>
            {myLeaves.map(it=> <LeaveRow key={it.id} item={it} />)}
            {myLeaves.length===0 && <div className="p-4 text-sm text-gray-500">No applications yet.</div>}
          </div>
        </div>
      </div>

      {role!== 'student' && (
        <div className="bg-white rounded-xl shadow mt-8">
          <div className="p-4 border-b font-semibold">Pending Approvals</div>
          <div className="divide-y">
            <div className="grid grid-cols-7 gap-3 p-3 text-xs uppercase tracking-wide text-gray-500">
              <div>Applicant</div><div>Type</div><div>Reason</div><div>Start</div><div>End</div><div>Status</div><div>Actions</div>
            </div>
            {pending.map(it=> <LeaveRow key={it.id} item={it} onDecide={decide} />)}
            {pending.length===0 && <div className="p-4 text-sm text-gray-500">No pending items.</div>}
          </div>
        </div>
      )}
    </div>
  )
}
