require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// In-memory storage
let users = [];
let nextId = 1;

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    users: users.length 
  });
});

app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check existing
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: nextId++,
      email,
      password: hashedPassword,
      name: name || 'User',
      subscription: 'trial',
      createdAt: new Date()
    };
    
    users.push(user);
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'demo-jwt-secret-2024');
    
    console.log(`✅ New user: ${email}`);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscription: user.subscription
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email);
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'demo-jwt-secret-2024');
    
    console.log(`✅ Login: ${email}`);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscription: user.subscription
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/dashboard', (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });
    
    jwt.verify(token, process.env.JWT_SECRET || 'demo-jwt-secret-2024');
    
    res.json({
      success: true,
      user: { email: 'user@example.com', subscription: 'pro' },
      stats: {
        followers: 24567,
        engagement: '12.5%',
        actionsToday: 203,
        growthRate: '+18.2%'
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Catch all
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 InstaRocket SaaS Server`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🔗 Live: http://localhost:${PORT}`);
  console.log(`👥 Users: ${users.length}`);
  console.log(`✅ Ready for production!`);
});
