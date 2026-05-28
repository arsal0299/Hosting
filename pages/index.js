import { useState } from 'react'
import Head from 'next/head'

export default function Home() {
  const [code, setCode] = useState('')
  const [duration, setDuration] = useState('day')
  const [loading, setLoading] = useState(false)
  const [resultUrl, setResultUrl] = useState('')
  const [error, setError] = useState('')

  const handleDeploy = async (e) => {
    e.preventDefault()
    if (!code.trim()) {
      setError('Please enter HTML code')
      return
    }
    setLoading(true)
    setError('')
    setResultUrl('')

    try {
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, duration })
      })
      const data = await res.json()
      if (res.ok) {
        setResultUrl(data.url)
        setCode('')
      } else {
        setError(data.error || 'Deployment failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file && (file.name.endsWith('.html') || file.name.endsWith('.htm'))) {
      const reader = new FileReader()
      reader.onload = (ev) => setCode(ev.target.result)
      reader.readAsText(file)
    } else {
      setError('Please upload a valid HTML file')
    }
  }

  return (
    <>
      <Head>
        <title>CodeHost – Deploy HTML Instantly | Free HTML Hosting</title>
        <meta name="description" content="Deploy your HTML/CSS/JS code instantly and get a live link. Free hosting with expiration options. Perfect for sharing web projects." />
        <meta name="keywords" content="HTML hosting, code deploy, live link, free hosting, web hosting, instant deploy" />
        <meta property="og:title" content="CodeHost – Deploy HTML Instantly" />
        <meta property="og:description" content="Get a live link for your HTML code in seconds. No signup required." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block p-3 bg-purple-500/20 rounded-2xl mb-4">
              <span className="text-5xl">🚀</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              CodeHost
            </h1>
            <p className="text-gray-300 mt-3 text-lg max-w-2xl mx-auto">
              Deploy your HTML/CSS/JS code instantly. Get a live link to share with the world.
            </p>
          </div>

          {/* Main Card */}
          <div className="glass-card p-6 md:p-8">
            <form onSubmit={handleDeploy} className="space-y-6">
              {/* Code Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  📝 HTML / CSS / JavaScript Code
                </label>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  rows={12}
                  className="w-full p-4 rounded-xl bg-gray-900/50 border border-gray-700 text-gray-200 font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder='<!DOCTYPE html>
<html>
<head>
  <title>My Page</title>
  <style>
    body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
  </style>
</head>
<body>
  <h1>Hello World!</h1>
</body>
</html>'
                />
                <div className="flex justify-between items-center mt-2">
                  <label className="cursor-pointer text-sm text-purple-400 hover:text-purple-300 transition">
                    📂 Upload HTML file
                    <input type="file" accept=".html,.htm" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <span className="text-xs text-gray-500">{code.length} characters</span>
                </div>
              </div>

              {/* Duration Options */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  ⏳ Expiration Time
                </label>
                <div className="flex flex-wrap gap-4">
                  {[
                    { value: 'day', label: '1 Day', icon: '🌙', desc: 'Auto-deletes after 24 hours' },
                    { value: 'week', label: '1 Week', icon: '📅', desc: 'Auto-deletes after 7 days' },
                    { value: 'lifetime', label: 'Lifetime', icon: '∞', desc: 'Never expires' }
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex-1 cursor-pointer p-4 rounded-xl border-2 transition-all ${
                        duration === opt.value
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-700 bg-gray-900/30 hover:border-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="duration"
                        value={opt.value}
                        checked={duration === opt.value}
                        onChange={(e) => setDuration(e.target.value)}
                        className="hidden"
                      />
                      <div className="text-center">
                        <div className="text-2xl mb-1">{opt.icon}</div>
                        <div className="font-semibold">{opt.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Deploy Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deploying...
                  </>
                ) : (
                  <>
                    <span>🚀</span> Deploy Now
                    <span>⚡</span>
                  </>
                )}
              </button>
            </form>

            {/* Success Message */}
            {resultUrl && (
              <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <p className="text-green-400 font-medium flex items-center gap-2">
                  <span>✅</span> Deployment successful!
                </p>
                <a
                  href={resultUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 underline break-all mt-2 inline-block"
                >
                  {resultUrl}
                </a>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                {error}
              </div>
            )}
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="glass-card p-5 text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold text-lg">Instant Deploy</h3>
              <p className="text-gray-400 text-sm mt-1">Your code goes live in seconds</p>
            </div>
            <div className="glass-card p-5 text-center">
              <div className="text-3xl mb-3">🔗</div>
              <h3 className="font-semibold text-lg">Shareable Link</h3>
              <p className="text-gray-400 text-sm mt-1">Get a unique URL for each deployment</p>
            </div>
            <div className="glass-card p-5 text-center">
              <div className="text-3xl mb-3">🛡️</div>
              <h3 className="font-semibold text-lg">Auto Expiration</h3>
              <p className="text-gray-400 text-sm mt-1">Choose 1 day, 1 week, or lifetime</p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 text-gray-500 text-sm">
            <p>✨ Secure • Fast • Free • Analytics • Admin Panel</p>
            <p className="mt-1">
              Admin login: <a href="/admin" className="text-purple-400 hover:underline">/admin</a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
