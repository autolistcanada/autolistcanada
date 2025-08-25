// Ensure the openModal function is globally available for the onclick attribute
function openModal(listingId) {
    console.log(`AI Suggestion modal triggered for listing ID: ${listingId}`);
    // In a real app, this would open a modal with AI suggestions.
    alert(`AI suggestions for listing ID: ${listingId}`);
}

document.addEventListener('DOMContentLoaded', () => {
  const listingsContainer = document.getElementById('listings-container');
  const searchInput = document.getElementById('search-input');
  const platformFilter = document.getElementById('platform-filter');
  const statusFilter = document.getElementById('status-filter');
  let allListings = [];

  async function fetchListings() {
    try {
      const response = await fetch('/public/data/listings.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      allListings = await response.json();
      renderListings(allListings);
    } catch (error) {
      console.error("Could not fetch listings:", error);
      if (listingsContainer) {
        console.warn('Fetch failed, using inline fallback data.');
        const fallbackListings = [
          { "id": "fallback-1", "title": "Vintage Maple Leaf Denim Jacket", "price": "$85.00", "status": "active", "platforms": ["Poshmark", "Depop"], "image": "/assets/img/listings/listing-1.webp", "synced": true },
          { "id": "fallback-2", "title": "Hand-Knit Wool Cowichan Sweater", "price": "$120.00", "status": "draft", "platforms": ["Etsy"], "image": "/assets/img/listings/listing-2.webp", "synced": false },
          { "id": "fallback-3", "title": "Retro '90s Blue Jays Snapback Cap'", "price": "$45.00", "status": "active", "platforms": ["Poshmark", "Grailed"], "image": "/assets/img/listings/listing-3.webp", "synced": true }
        ];
        renderListings(fallbackListings);
      }
    }
  }

  function renderListings(listings) {
    if (!listingsContainer) return;
    listingsContainer.innerHTML = '';
    if (listings.length === 0) {
      listingsContainer.innerHTML = '<p class="text-center text-slate-500 col-span-full">No listings found.</p>';
      return;
    }

    listings.forEach(listing => {
      const card = document.createElement('div');
      card.className = 'bg-slate-800/50 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-cyan-500/20 hover:scale-[1.02] border border-slate-700 flex flex-col';

      const statusClasses = {
        active: 'bg-green-500/20 text-green-400 border-green-500/30',
        draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        archived: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
      };
      const statusClass = statusClasses[listing.status] || statusClasses.draft;

      const platformBadges = listing.platforms.map(p => `<span class="bg-slate-700 text-slate-300 text-xs font-medium px-2.5 py-0.5 rounded-full">${p}</span>`).join('');

      card.innerHTML = `
        <div class="p-6 flex-grow">
            <div class="flex items-start gap-4">
                <img class="w-24 h-24 rounded-lg object-cover border-2 border-slate-700" src="${listing.image}" alt="${listing.title}">
                <div class="flex-1">
                    <h3 class="text-lg font-bold text-white">${listing.title}</h3>
                    <p class="text-2xl font-light text-cyan-400 mt-1">${listing.price}</p>
                    <div class="flex items-center gap-2 mt-2">
                        <span class="text-sm font-semibold ${statusClass} px-2 py-1 rounded-full">${listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}</span>
                    </div>
                </div>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">${platformBadges}</div>
        </div>
        <div class="p-6 border-t border-slate-700 flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
                <button id="edit-btn-${listing.id}" class="p-2 rounded-full bg-slate-700/50 hover:bg-slate-600 transition-colors" title="Edit">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                </button>
                <button class="p-2 rounded-full bg-slate-700/50 hover:bg-slate-600 transition-colors" title="AI Suggest" onclick="openModal('${listing.id}')">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                </button>
            </div>
            <div class="flex items-center">
                <span class="text-sm mr-2 text-slate-400">Sync</span>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="sync-toggle-${listing.id}" value="" class="sr-only peer" ${listing.synced ? 'checked' : ''}>
                    <div class="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pineGreen"></div>
                </label>
            </div>
        </div>
      `;
      listingsContainer.appendChild(card);

      // Add event listeners for actions
      const editButton = card.querySelector(`#edit-btn-${listing.id}`);
      if (editButton) {
        editButton.addEventListener('click', () => {
          console.log(`Edit clicked for listing ID: ${listing.id}`);
          alert(`Editing listing: ${listing.title}`);
        });
      }

      const syncToggle = card.querySelector(`#sync-toggle-${listing.id}`);
      if (syncToggle) {
        syncToggle.addEventListener('change', (e) => {
          console.log(`Sync toggled for listing ID: ${listing.id}, New status: ${e.target.checked}`);
        });
      }
    });
  }

  function applyFilters() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const selectedPlatform = platformFilter ? platformFilter.value : 'all';
    const selectedStatus = statusFilter ? statusFilter.value : 'all';

    const filtered = allListings.filter(listing => {
      const titleMatch = listing.title.toLowerCase().includes(searchTerm);
      const platformMatch = selectedPlatform === 'all' || listing.platforms.includes(selectedPlatform);
      const statusMatch = selectedStatus === 'all' || listing.status === selectedStatus;
      return titleMatch && platformMatch && statusMatch;
    });

    renderListings(filtered);
  }

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (platformFilter) platformFilter.addEventListener('change', applyFilters);
  if (statusFilter) statusFilter.addEventListener('change', applyFilters);

  fetchListings();
});
