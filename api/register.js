// Vercel Serverless Function
let { MongoClient } = await import('mongodb');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password, name } = req.body;
  
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    // Simple user creation (no bcrypt for demo)
    const db = client.db('instarocket');
    const users = db.collection('users');
    
    const user = {
      email,
      name,
      subscription: 'trial',
      createdAt: new Date()
    };
    
    await users.insertOne(user);
    await client.close();
    
    // Dummy token
    const token = 'demo-token-' + Date.now();
    
    res.status(200).json({ 
      token, 
      user: { id: 'demo-id', email, name, subscription: 'trial' } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}
