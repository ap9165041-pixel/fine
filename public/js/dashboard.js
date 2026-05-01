// Load dashboard data
async function loadDashboard() {
  const token = localStorage.getItem('token');
  if (!token) return window.location.href = 'auth.html';

  try {
    const res = await fetch('/api/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    document.getElementById('followers').textContent = data.stats.followers.toLocaleString();
    document.getElementById('likes').textContent = data.stats.engagement + '%';
  } catch (e) {
    localStorage.removeItem('token');
    window.location.href = 'auth.html';
  }
}

function startAutomation() {
  alert('✅ Automation Started! 200 actions/day');
}

function upgradePlan() {
  window.location.href = 'pricing.html';
}

loadDashboard();
document.getElementById('actions').addEventListener('input', (e) => {
  document.getElementById('actionCount').textContent = e.target.value;
});