import clientPromise from '../../../lib/mongodb'

export default async function handler(req, res) {
  if (req.cookies.admin_token !== 'authenticated') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { page = 1, limit = 20, search = '' } = req.query
  const skip = (parseInt(page) - 1) * parseInt(limit)

  const client = await clientPromise
  const db = client.db('codehost')
  const deployments = db.collection('deployments')

  let query = {}
  if (search) {
    query = { _id: { $regex: search, $options: 'i' } }
  }

  const total = await deployments.countDocuments(query)
  const items = await deployments.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).toArray()

  res.status(200).json({ items, total, page: parseInt(page), limit: parseInt(limit) })
}
