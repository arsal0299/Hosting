import clientPromise from '../../lib/mongodb'

function generateId() {
  return Math.random().toString(36).substring(2, 8) + Date.now().toString(36)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { code, duration } = req.body

  if (!code || !duration) {
    return res.status(400).json({ error: 'Code and duration are required' })
  }

  let expiresAt = null
  if (duration === 'day') {
    expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
  } else if (duration === 'week') {
    expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  } else if (duration === 'lifetime') {
    expiresAt = null
  } else {
    return res.status(400).json({ error: 'Invalid duration' })
  }

  const id = generateId()
  const createdAt = new Date()

  const client = await clientPromise
  const db = client.db('codehost')
  const deployments = db.collection('deployments')

  await deployments.insertOne({
    _id: id,
    code,
    createdAt,
    expiresAt,
    views: 0,
    active: true
  })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${req.headers.host}`
  const liveUrl = `${baseUrl}/p/${id}`

  res.status(200).json({ success: true, url: liveUrl, id })
}
