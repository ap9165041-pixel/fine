require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory users (Demo - Production mein MongoDB)
let users = [];
let userId = 1;

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    console.log(`📝 Register: ${email}`);
    
    // Check if exists
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    const hashed = await bcrypt.hash(password, 10);
    const newUser = {
      id: userId++,
      email,
      password: hashed,
      name,
      subscription: 'trial'
    };
    
    users.push(newUser);
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET || 'demo-secret');
    
    res.json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        subscription: newUser.subscription
      }
    });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`🔐 Login: ${email}`);
    
    const user = users.find(u => u.email === email);
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'demo-secret');
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscription: user.subscription
      }
    });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/dashboard', (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  try {
    jwt.verify(token, process.env.JWT_SECRET || 'demo-secret');
    res.json({
      user: { email: 'demo@example.com', subscription: 'pro' },
      stats: {
        followers: 24567,
        engagement: '12.5%',
        actionsToday: 200
      }
    });
  } catch (e) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', users: users.length }));

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server ready on port ${port}`);
  console.log(`📊 Total users: ${users.length}`);
});
