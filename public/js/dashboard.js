// Check auth on load
window.addEventListener('load', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'auth.html';
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!res.ok) {
      localStorage.removeItem('token');
      window.location.href = 'auth.html';
      return;
    }
    
    const data = await res.json();
    console.log('✅ Dashboard loaded:', data);
    updateDashboard(data);
  } catch (e) {
    localStorage.removeItem('token');
    window.location.href = 'auth.html';
  }
});

function updateDashboard(data) {
  document.querySelector('.plan').textContent = data.user.subscription.plan + ' Plan';
  // Update stats, etc.
}
