// FishAnneChips — small enhancements

// Auto-update footer year
document.querySelectorAll('#year').forEach(function (el) {
  el.textContent = new Date().getFullYear();
});

// Gently flag links that are still placeholders so a click doesn't jump nowhere
document.querySelectorAll('[data-placeholder]').forEach(function (el) {
  el.addEventListener('click', function (e) {
    if (el.getAttribute('href') === '#' || !el.getAttribute('href')) {
      e.preventDefault();
      // Icon links (e.g. social icons): just pulse — don't clobber the SVG with text
      if (el.querySelector('svg')) {
        el.classList.add('is-pending');
        setTimeout(function () { el.classList.remove('is-pending'); }, 1000);
        return;
      }
      el.classList.add('is-pending');
      const original = el.textContent;
      el.textContent = 'Link coming soon';
      setTimeout(function () { el.textContent = original; }, 1400);
    }
  });
});
