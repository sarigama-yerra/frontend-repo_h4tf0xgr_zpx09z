import { useState } from 'react'

export default function Login({ onLogin, backendUrl }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${backendUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Login failed')
      onLogin(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-xl shadow p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Welcome back</h2>
      {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button disabled={loading} className="w-full bg-blue-600 text-white rounded py-2 hover:bg-blue-700 transition">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className="text-sm text-gray-600 mt-4">No account? <a href="/register" className="text-blue-600 hover:underline">Create one</a></p>
    </div>
  )
}
