// Vercel Full URL Fix
const API_BASE = window.location.origin + '/api'; // https://your-project.vercel.app/api

document.getElementById('authForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const name = document.getElementById('name').value;

  try {
    console.log('🔄 Registering to:', API_BASE + '/register');
    
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    
    const data = await res.json();
    console.log('✅ Response:', data);
    
    if (data.token) {
      localStorage.setItem('token', data.token);
      alert('🎉 Account Created! Welcome to Dashboard');
      window.location.href = '/dashboard.html';
    } else {
      alert('❌ ' + (data.error || 'Registration failed'));
    }
  } catch (err) {
    console.error('🌐 Network Error:', err);
    alert('❌ Connection Error - Check Vercel Deployment');
  }
});
