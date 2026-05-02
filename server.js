const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret123';

// Middleware - Works on Vercel + Local
app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// In-memory users (No DB needed)
let users = [];

// 🧪 TEST API
app.get('/api/test', (req, res) => {
  res.json({ 
    status: '✅ SERVER 100% WORKING!',
    environment: process.env.NODE_ENV || 'development',
    url: req.headers.host,
    users: users.length,
    timestamp: new Date().toISOString()
  });
});

// 📝 REGISTER
app.post('/api/register', async (req, res) => {
  console.log('📝 Register:', req.body.email);
  
  const { email, password, name = 'User' } = req.body;
  
  // Check duplicate
  if (users.find(u => u.email === email.toLowerCase())) {
    return res.json({ error: 'Email already exists' });
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Create user
  const user = {
    id: Date.now().toString(),
    email: email.toLowerCase(),
    password: hashedPassword,
    name,
    subscription: { status: 'trial', plan: 'starter' }
  };
  
  users.push(user);
  
  // Generate token
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '30d' });
  
  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      subscription: user.subscription
    }
  });
});

// 🔐 LOGIN
app.post('/api/login', async (req, res) => {
  console.log('🔐 Login:', req.body.email);
  
  const { email, password } = req.body;
  
  // Find user
  const user = users.find(u => u.email === email.toLowerCase());
  if (!user) {
    return res.json({ error: 'Invalid email or password' });
  }
  
  // Verify password
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.json({ error: 'Invalid email or password' });
  }
  
  // Generate token
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '30d' });
  
  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      subscription: user.subscription
    }
  });
});

// 📊 DASHBOARD
app.get('/api/dashboard', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  try {
    jwt.verify(token, JWT_SECRET);
    
    // Return first user or demo data
    const user = users[0] || { 
      email: 'demo@rocket.com', 
      name: 'Demo User',
      subscription: { plan: 'pro', status: 'active' }
    };
    
    res.json({
      success: true,
      user,
      stats: {
        followers: 24567,
        likes: 1234,
        actionsToday: 200,
        revenue: '$2,450'
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// Vercel export (Serverless)
module.exports = app;
