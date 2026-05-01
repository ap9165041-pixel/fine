// Global token storage
let currentUser = null;
let token = localStorage.getItem('token');

// Auto-login if token exists
if (token) {
  verifyToken();
}

async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    console.log('🔐 Logging in...', email);
    
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || ''}`
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    console.log('Login response:', data);
    
    if (data.success || data.token) {
      // Save token
      token = data.token;
      localStorage.setItem('token', token);
      currentUser = data.user;
      
      alert('✅ Login Successful! Redirecting...');
      window.location.href = 'dashboard.html';
    } else {
      alert('❌ ' + (data.error || 'Login failed'));
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('❌ Network error. Server running hai?');
  }
}

async function register() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const name = document.getElementById('name')?.value || email.split('@')[0];
  
  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });

    const data = await response.json();
    
    if (data.success || data.token) {
      localStorage.setItem('token', data.token);
      alert('✅ Account created! Welcome!');
      window.location.href = 'dashboard.html';
    } else {
      alert('❌ ' + (data.error || 'Registration failed'));
    }
  } catch (error) {
    alert('❌ Server error. Try again.');
  }
}

async function verifyToken() {
  try {
    const res = await fetch('http://localhost:3000/api/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      currentUser = await res.json();
      window.location.href = 'dashboard.html';
    }
  } catch (e) {
    localStorage.removeItem('token');
  }
}

// Form submit
document.getElementById('authForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Check if register or login mode
  const registerBtn = document.querySelector('button[type="submit"]');
  if (registerBtn.textContent.includes('Register')) {
    await register();
  } else {
    await login();
  }
});

// Instagram Connect
document.getElementById('connectInsta')?.addEventListener('click', () => {
  const url = `https://api.instagram.com/oauth/authorize?client_id=YOUR_APP_ID&redirect_uri=http://localhost:3000&scope=user_profile,user_media&response_type=code`;
  window.open(url, '_blank');
});
