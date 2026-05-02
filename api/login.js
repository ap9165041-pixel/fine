export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body;
  
  // Demo login - always success
  const token = 'demo-token-' + Date.now();
  
  res.status(200).json({ 
    token, 
    user: { 
      id: 'demo-id', 
      email, 
      subscription: 'pro' 
    } 
  });
}
