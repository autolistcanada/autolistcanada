/**
 * AutoList Canada - Listings Page Logic
 * Handles rendering listings, selection, filtering, and bulk actions.
 */

document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.getElementById('listings-table-body');
  const emptyState = document.getElementById('empty-state');
  const selectAllCheckbox = document.getElementById('select-all-checkbox');
  const bulkActionsToolbar = document.getElementById('bulk-actions-toolbar');
  const selectionCountSpan = document.getElementById('selection-count');
  const searchInput = document.getElementById('search-input');
  const statusFilter = document.getElementById('status-filter');

  let allListings = [];
  let selectedIds = new Set();

  // --- Rendering Functions ---

  function renderListings(listingsToRender) {
    if (!tableBody) return;

    if (listingsToRender.length === 0) {
      emptyState.classList.remove('hidden');
      tableBody.innerHTML = '';
    } else {
      emptyState.classList.add('hidden');
      tableBody.innerHTML = listingsToRender.map(createListingRow).join('');
    }
    addEventListenersToRows();
  }

  function createListingRow(listing) {
    const firstImage = listing.images[0] || 'assets/img/placeholder.png';
    const price = new Intl.NumberFormat('en-CA', { style: 'currency', currency: listing.currency || 'CAD' }).format(listing.price);
    const lastUpdated = new Date(listing.updatedAt).toLocaleDateString('en-CA');
    // Simple status logic, can be expanded
    const status = listing.status.find(s => s.platform === 'autolist')?.status || 'draft';

    return `
      <tr data-id="${listing.id}" class="${selectedIds.has(listing.id) ? 'selected' : ''}">
        <td class="cell-checkbox"><input type="checkbox" class="row-checkbox" ${selectedIds.has(listing.id) ? 'checked' : ''}></td>
        <td class="cell-image"><img src="${firstImage}" alt="${listing.title}" class="listing-thumbnail"></td>
        <td class="cell-title">${listing.title}</td>
        <td class="cell-price">${price}</td>
        <td><span class="status-badge ${status}">${status}</span></td>
        <td>${lastUpdated}</td>
        <td class="cell-actions">
          <button class="button-icon" title="Edit"><span class="material-icons-outlined">edit</span></button>
          <button class="button-icon danger" title="Delete"><span class="material-icons-outlined">delete</span></button>
        </td>
      </tr>
    `;
  }

  // --- State & Selection Management ---

  function updateSelection() {
    const checkboxes = tableBody.querySelectorAll('.row-checkbox');
    selectedIds.clear();
    checkboxes.forEach(cb => {
      if (cb.checked) {
        selectedIds.add(cb.closest('tr').dataset.id);
      }
    });

    selectionCountSpan.textContent = `${selectedIds.size} items selected`;
    bulkActionsToolbar.classList.toggle('visible', selectedIds.size > 0);
    selectAllCheckbox.checked = selectedIds.size > 0 && selectedIds.size === checkboxes.length;
    
    // Update sidebar selection
    if (window.updateSidebarSelection) {
        window.updateSidebarSelection(selectedIds.size);
    }
  }

  // --- Event Listeners ---

  function addEventListenersToRows() {
    tableBody.querySelectorAll('.row-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const row = checkbox.closest('tr');
        row.classList.toggle('selected', checkbox.checked);
        updateSelection();
      });
    });
  }

  selectAllCheckbox.addEventListener('change', () => {
    const isChecked = selectAllCheckbox.checked;
    tableBody.querySelectorAll('.row-checkbox').forEach(cb => {
      cb.checked = isChecked;
      cb.closest('tr').classList.toggle('selected', isChecked);
    });
    updateSelection();
  });

  searchInput.addEventListener('input', applyFilters);
  statusFilter.addEventListener('change', applyFilters);

  // --- Data & Filtering ---

  function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const status = statusFilter.value;

    const filteredListings = allListings.filter(listing => {
      const titleMatch = listing.title.toLowerCase().includes(searchTerm);
      const statusMatch = status === 'all' || (listing.status.find(s => s.platform === 'autolist')?.status || 'draft') === status;
      return titleMatch && statusMatch;
    });

    renderListings(filteredListings);
    updateSelection();
  }

  function loadListings() {
    allListings = window.AutoListStore.getListings();
    // Add some dummy data if the store is empty for demo purposes
    if (allListings.length === 0) {
        addDummyData();
        allListings = window.AutoListStore.getListings();
    }
    applyFilters();
  }

  function addDummyData() {
      const now = new Date().toISOString();
      const dummyListings = [
          { id: 'd1', title: 'Vintage Maple Leaf Jacket', price: 85.00, currency: 'CAD', images: ['/assets/img/stock/jacket.jpg'], status: [{platform: 'autolist', status: 'draft'}], updatedAt: now },
          { id: 'd2', title: 'Handcrafted Wooden Canoe Paddle', price: 120.00, currency: 'CAD', images: ['/assets/img/stock/paddle.jpg'], status: [{platform: 'autolist', status: 'listed'}], updatedAt: now },
          { id: 'd3', title: 'Antique Brass Compass', price: 45.50, currency: 'CAD', images: ['/assets/img/stock/compass.jpg'], status: [{platform: 'autolist', status: 'draft'}], updatedAt: now },
      ];
      dummyListings.forEach(l => window.AutoListStore.addListing(l));
  }

  // --- Initial Load ---
  loadListings();
});
