require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/instarocket');

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: String,
  name: String,
  instagramAccounts: [{
    id: String,
    username: String,
    accessToken: String,
    followers: Number
  }],
  subscription: {
    status: { type: String, default: 'trial' },
    plan: { type: String, default: 'starter' },
    stripeId: String
  }
});

const User = mongoose.model('User', userSchema);

// Auth Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (e) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ 
      email, 
      password: hashed, 
      name,
      subscription: { status: 'trial', plan: 'starter' }
    });
    await user.save();
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user._id, email, name, subscription: user.subscription } });
  } catch (e) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user._id, email: user.email, subscription: user.subscription } });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/create-checkout', auth, async (req, res) => {
  const { plan } = req.body;
  const session = await Stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price: plan === 'pro' ? process.env.STRIPE_PRO_PRICE_ID : process.env.STRIPE_STARTER_PRICE_ID,
      quantity: 1
    }],
    mode: 'subscription',
    success_url: 'http://localhost:3000/dashboard.html?success=true',
    cancel_url: 'http://localhost:3000/pricing.html?cancel=true',
    metadata: { userId: req.user._id.toString() }
  });
  res.json({ url: session.url });
});

// Instagram Connect (Graph API)
app.post('/api/connect-instagram', auth, async (req, res) => {
  try {
    const { code } = req.body;
    
    // Exchange code for access token
    const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.INSTAGRAM_APP_ID,
        client_secret: process.env.INSTAGRAM_APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
        code
      })
    });
    
    const tokenData = await tokenRes.json();
    
    // Get user info
    const userRes = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${tokenData.access_token}`);
    const userData = await userRes.json();
    
    // Save account
    req.user.instagramAccounts.push({
      id: userData.id,
      username: userData.username,
      accessToken: tokenData.access_token
    });
    await req.user.save();
    
    res.json({ success: true, account: userData });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/api/dashboard', auth, async (req, res) => {
  res.json({
    user: req.user,
    stats: {
      followers: Math.floor(Math.random() * 50000) + 10000,
      engagement: Math.floor(Math.random() * 15) + 5,
      actionsToday: Math.floor(Math.random() * 1000) + 200
    }
  });
});

app.listen(3000, () => console.log('🚀 Server: http://localhost:3000'));