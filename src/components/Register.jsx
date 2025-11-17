import { useState } from 'react'

export default function Register({ backendUrl }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [department, setDepartment] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const res = await fetch(`${backendUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, department })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Registration failed')
      setMessage('Account created. You can now sign in.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-xl shadow p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Create account</h2>
      {message && <div className="mb-4 text-sm text-green-700">{message}</div>}
      {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full name</label>
          <input value={name} onChange={(e)=>setName(e.target.value)} required className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select value={role} onChange={(e)=>setRole(e.target.value)} className="mt-1 w-full border rounded px-3 py-2">
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Department / Class</label>
          <input value={department} onChange={(e)=>setDepartment(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
        </div>
        <button disabled={loading} className="w-full bg-blue-600 text-white rounded py-2 hover:bg-blue-700 transition">
          {loading ? 'Creating...' : 'Register'}
        </button>
      </form>
      <p className="text-sm text-gray-600 mt-4">Already have an account? <a href="/" className="text-blue-600 hover:underline">Sign in</a></p>
    </div>
  )
}
