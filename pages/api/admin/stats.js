import clientPromise from '../../../lib/mongodb'

export default async function handler(req, res) {
  if (req.cookies.admin_token !== 'authenticated') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const client = await clientPromise
  const db = client.db('codehost')
  const deployments = db.collection('deployments')
  const visits = db.collection('visits')

  const totalDeployments = await deployments.countDocuments()
  const activeDeployments = await deployments.countDocuments({ active: true })

  const today = new Date().toISOString().split('T')[0]
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]

  const dailyVisits = await visits.aggregate([
    { $match: { date: { $gte: thirtyDaysAgoStr, $lte: today } } },
    { $group: { _id: '$date', count: { $sum: '$count' } } },
    { $sort: { _id: 1 } }
  ]).toArray()

  const monthlyVisits = await visits.aggregate([
    { $group: { _id: '$month', count: { $sum: '$count' } } },
    { $sort: { _id: -1 } },
    { $limit: 6 }
  ]).toArray()

  res.status(200).json({
    totalDeployments,
    activeDeployments,
    daily: dailyVisits,
    monthly: monthlyVisits
  })
}
