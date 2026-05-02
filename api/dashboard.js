export default async function handler(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) return res.status(401).json({ error: 'No token' });
  
  res.status(200).json({
    user: { email: 'demo@example.com', subscription: 'pro' },
    stats: {
      followers: 24567,
      engagement: 12.5,
      actions: 200
    }
  });
}
