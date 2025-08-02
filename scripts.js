document.querySelectorAll('.faq-item button').forEach(btn => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', !expanded);
    const content = document.getElementById(btn.getAttribute('aria-controls'));
    if (content) content.style.display = expanded ? 'none' : 'block';
  });
});
