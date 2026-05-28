import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [deployments, setDeployments] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [totalPages, setTotalPages] = useState(1)

  const checkAuth = async () => {
    const res = await fetch('/api/admin/deployments?page=1&limit=1')
    if (res.status === 401) {
      setIsAuthenticated(false)
      setLoading(false)
    } else {
      setIsAuthenticated(true)
      fetchDeployments()
      fetchStats()
    }
  }

  const fetchDeployments = async () => {
    try {
      const res = await fetch(`/api/admin/deployments?page=${page}&limit=20&search=${search}`)
      const data = await res.json()
      if (res.ok) {
        setDeployments(data.items)
        setTotalPages(Math.ceil(data.total / data.limit))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      if (res.ok) setStats(data)
    } catch (err) {}
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })
    if (res.ok) {
      setIsAuthenticated(true)
      fetchDeployments()
      fetchStats()
    } else {
      alert('Invalid password')
    }
  }

  const deleteDeployment = async (id) => {
    if (confirm('Delete this deployment permanently?')) {
      await fetch(`/api/admin/deployments/${id}`, { method: 'DELETE' })
      fetchDeployments()
      fetchStats()
    }
  }

  const logout = async () => {
    await fetch('/api/admin/logout')
    setIsAuthenticated(false)
  }

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchDeployments()
    }
  }, [page, search])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Admin Login - CodeHost</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="glass-card p-8 w-full max-w-md">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">🔐</div>
              <h1 className="text-2xl font-bold">Admin Login</h1>
              <p className="text-gray-400 text-sm mt-1">Enter your password to access dashboard</p>
            </div>
            <form onSubmit={handleLogin}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-xl bg-gray-900/50 border border-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
                autoFocus
              />
              <button type="submit" className="btn-primary w-full">
                Login →
              </button>
            </form>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - CodeHost</title>
      </Head>

      <div className="min-h-screen p-6">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-400 text-sm mt-1">Manage deployments & view analytics</p>
            </div>
            <button onClick={logout} className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-5 py-2 rounded-xl transition">
              Logout
            </button>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              <div className="glass-card p-5">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">📦</div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Deployments</p>
                    <p className="text-3xl font-bold">{stats.totalDeployments}</p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-5">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🟢</div>
                  <div>
                    <p className="text-gray-400 text-sm">Active Deployments</p>
                    <p className="text-3xl font-bold">{stats.activeDeployments}</p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-5">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">👁️</div>
                  <div>
                    <p className="text-gray-400 text-sm">Last 30 Days Views</p>
                    <p className="text-3xl font-bold">{stats.daily.reduce((acc, d) => acc + d.count, 0)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Charts */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="glass-card p-5">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span>📊</span> Daily Visits (Last 30 Days)
                </h3>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {stats.daily.map((d) => (
                    <div key={d._id} className="flex justify-between text-sm py-1 border-b border-gray-800">
                      <span>{d._id}</span>
                      <span className="text-purple-400">{d.count} views</span>
                    </div>
                  ))}
                  {stats.daily.length === 0 && <p className="text-gray-500 text-sm">No data yet</p>}
                </div>
              </div>
              <div className="glass-card p-5">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span>📈</span> Monthly Visits (Last 6 Months)
                </h3>
                <div className="space-y-2">
                  {stats.monthly.map((m) => (
                    <div key={m._id} className="flex justify-between text-sm py-2 border-b border-gray-800">
                      <span>{m._id}</span>
                      <span className="text-purple-400">{m.count} views</span>
                    </div>
                  ))}
                  {stats.monthly.length === 0 && <p className="text-gray-500 text-sm">No data yet</p>}
                </div>
              </div>
            </div>
          )}

          {/* Deployments Table */}
          <div className="glass-card p-5">
            <div className="flex flex-wrap gap-4 justify-between items-center mb-5">
              <h3 className="font-semibold flex items-center gap-2">
                <span>🗂️</span> All Deployments
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search by ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                />
                <button onClick={() => setPage(1)} className="bg-purple-600/20 hover:bg-purple-600/30 px-4 py-2 rounded-xl text-sm transition">
                  🔄 Refresh
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-700">
                  <tr>
                    <th className="text-left py-3">ID</th>
                    <th className="text-left py-3">Created</th>
                    <th className="text-left py-3">Expires</th>
                    <th className="text-left py-3">Views</th>
                    <th className="text-left py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deployments.map((d) => (
                    <tr key={d._id} className="border-b border-gray-800 hover:bg-white/5 transition">
                      <td className="py-3 font-mono text-xs">
                        <a href={`/p/${d._id}`} target="_blank" className="text-purple-400 hover:underline">
                          {d._id}
                        </a>
                      </td>
                      <td className="py-3 text-gray-300">{new Date(d.createdAt).toLocaleString()}</td>
                      <td className="py-3 text-gray-300">
                        {d.expiresAt ? new Date(d.expiresAt).toLocaleString() : 'Lifetime'}
                      </td>
                      <td className="py-3">{d.views}</td>
                      <td className="py-3">
                        <button
                          onClick={() => deleteDeployment(d._id)}
                          className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-1.5 rounded-lg text-xs transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {deployments.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                No deployments found
              </div>
            )}

            {/* Pagination */}
            <div className="flex justify-between items-center mt-5 pt-3 border-t border-gray-800">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="bg-gray-800/50 hover:bg-gray-800 px-4 py-2 rounded-xl disabled:opacity-50 transition"
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-400">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="bg-gray-800/50 hover:bg-gray-800 px-4 py-2 rounded-xl disabled:opacity-50 transition"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
      }
