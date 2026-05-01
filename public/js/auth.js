const form = document.getElementById('authForm');
const connectBtn = document.getElementById('connectInsta');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const name = document.getElementById('name').value;

  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    const data = await res.json();
    
    if (data.token) {
      localStorage.setItem('token', data.token);
      window.location.href = 'dashboard.html';
    }
  } catch (e) {
    alert('Error: ' + (data?.error || 'Try again'));
  }
});

connectBtn.addEventListener('click', () => {
  const instagramUrl = `https://api.instagram.com/oauth/authorize?client_id=${process.env.INSTAGRAM_APP_ID}&redirect_uri=${process.env.INSTAGRAM_REDIRECT_URI}&scope=user_profile,user_media&response_type=code`;
  window.location.href = instagramUrl;
});