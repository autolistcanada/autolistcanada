document.addEventListener("DOMContentLoaded", function() {
  fetch("_sidebar.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("sidebar-container").innerHTML = data;
      // Set the active link
      const currentPage = window.location.pathname.split("/").pop();
      const navLinks = document.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
        if (link.getAttribute('href') === `./${currentPage}`) {
          link.classList.add('bg-gradient-to-r', 'from-green-600/40', 'to-green-500/20', 'text-white');
          link.classList.remove('text-white/90', 'hover:bg-white/10');
        }
      });
    });
});
