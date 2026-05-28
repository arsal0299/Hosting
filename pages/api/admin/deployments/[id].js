import clientPromise from '../../../../lib/mongodb'

export default async function handler(req, res) {
  if (req.cookies.admin_token !== 'authenticated') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { id } = req.query

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const client = await clientPromise
  const db = client.db('codehost')
  const deployments = db.collection('deployments')

  await deployments.deleteOne({ _id: id })

  res.status(200).json({ success: true })
}
