/**
 * AutoList Canada - Universal Sidebar UI Script
 */

document.addEventListener('DOMContentLoaded', () => {
  const SIDEBAR_HOTKEY = 'KeyL';

  // --- Create Sidebar HTML ---
  function createSidebar() {
    const sidebarContainer = document.createElement('div');
    sidebarContainer.innerHTML = `
      <div class="autolist-sidebar-backdrop"></div>
      <aside class="autolist-sidebar" id="autolist-sidebar" aria-labelledby="sidebar-title">
        <header class="autolist-sidebar__header">
          <h2 id="sidebar-title" class="autolist-sidebar__title">AutoList Tools</h2>
          <button class="autolist-sidebar__close-btn" aria-label="Close sidebar">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </header>
        <div class="autolist-sidebar__content">
          <section class="autolist-sidebar__section" aria-labelledby="selection-title">
            <h3 id="selection-title" class="autolist-sidebar__section-title">Selection</h3>
            <p class="autolist-sidebar__selection-info" id="al-sidebar-selection-count">No items selected</p>
          </section>
          <section class="autolist-sidebar__section" aria-labelledby="actions-title">
            <h3 id="actions-title" class="autolist-sidebar__section-title">Bulk Actions</h3>
            <div class="autolist-sidebar__actions">
              <button class="btn btn-secondary" id="al-sidebar-apply-template">Apply Template</button>
              <button class="btn btn-secondary" id="al-sidebar-mark-listed">Mark as Listed</button>
              <button class="btn btn-secondary" id="al-sidebar-export-csv">Export CSV</button>
            </div>
          </section>
          <section class="autolist-sidebar__section" aria-labelledby="links-title">
            <h3 id="links-title" class="autolist-sidebar__section-title">Quick Links</h3>
            <nav>
              <ul class="autolist-sidebar__links">
                <li class="autolist-sidebar__link-item"><a href="/dashboard.html">Dashboard</a></li>
                <li class="autolist-sidebar__link-item"><a href="/listings.html">My Listings</a></li>
                <li class="autolist-sidebar__link-item"><a href="/import.html">Import Tool</a></li>
                <li class="autolist-sidebar__link-item"><a href="/ai-tools.html">AI Tools</a></li>
              </ul>
            </nav>
          </section>
        </div>
        <footer class="autolist-sidebar__footer">
          <p>AutoList Canada &copy; ${new Date().getFullYear()}</p>
        </footer>
      </aside>
    `;
    document.body.appendChild(sidebarContainer);
  }

  // --- Sidebar Logic ---
  function initSidebar() {
    createSidebar();

    const sidebar = document.getElementById('autolist-sidebar');
    const backdrop = document.querySelector('.autolist-sidebar-backdrop');
    const closeButton = document.querySelector('.autolist-sidebar__close-btn');

    const openSidebar = () => {
      sidebar.classList.add('is-open');
      backdrop.classList.add('is-visible');
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    };

    const closeSidebar = () => {
      sidebar.classList.remove('is-open');
      backdrop.classList.remove('is-visible');
      document.body.style.overflow = '';
    };

    // Open with Alt+L
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.code === SIDEBAR_HOTKEY) {
        e.preventDefault();
        sidebar.classList.contains('is-open') ? closeSidebar() : openSidebar();
      }
    });

    // Close with button or backdrop click
    closeButton.addEventListener('click', closeSidebar);
    backdrop.addEventListener('click', closeSidebar);

    // Close with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar.classList.contains('is-open')) {
        closeSidebar();
      }
    });

    // --- Placeholder for updating selection count ---
    window.updateSidebarSelection = (count) => {
      const countEl = document.getElementById('al-sidebar-selection-count');
      if (count > 0) {
        countEl.textContent = `${count} item${count > 1 ? 's' : ''} selected`;
      } else {
        countEl.textContent = 'No items selected';
      }
    };
  }

  // Initialize on page load
  initSidebar();
});
