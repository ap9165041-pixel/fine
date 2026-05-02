const API_BASE = window.location.origin + '/api';

async function loadDashboard() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('⚠️ Please login first');
    window.location.href = '/auth.html';
    return;
  }

  try {
    console.log('🔄 Loading dashboard from:', API_BASE + '/dashboard');
    
    const res = await fetch(`${API_BASE}/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (res.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth.html';
      return;
    }
    
    const data = await res.json();
    console.log('✅ Dashboard data:', data);
    
    document.getElementById('followers').textContent = data.stats.followers.toLocaleString();
    document.getElementById('likes').textContent = data.stats.engagement + '%';
    
  } catch (err) {
    console.error('Dashboard Error:', err);
    alert('⚠️ Dashboard load failed');
  }
}

// Auto load on page ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadDashboard);
} else {
  loadDashboard();
}
