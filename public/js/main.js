// Animate stats
function animateStats() {
  const stats = document.querySelectorAll('.stats strong');
  stats.forEach(stat => {
    const target = parseInt(stat.textContent.replace(/,/g, ''));
    let count = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
      count += increment;
      if (count >= target) {
        stat.textContent = target.toLocaleString();
        clearInterval(timer);
      } else {
        stat.textContent = Math.floor(count).toLocaleString();
      }
    }, 20);
  });
}

if (document.querySelector('.stats')) animateStats();