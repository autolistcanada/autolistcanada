document.addEventListener('DOMContentLoaded', () => {
    // Ensure this script only runs on the listings page
    if (document.body.id === 'listings-page') {
        const listingsPage = new ListingsPage();
        listingsPage.init();
    }
});

class ListingsPage {
    constructor() {
        this.allListings = [];
        this.filteredListings = [];
        this.platforms = [];
        this.currentPage = 1;
        this.itemsPerPage = 8; // Adjust as needed

        this.gridContainer = document.querySelector("div[x-show='view === \"grid\"']");
        this.listContainer = document.querySelector('#listings-list-container');
        this.paginationContainer = document.getElementById('pagination-controls');
        
        this.searchInput = document.getElementById('listing-search');
        this.statusFilter = document.getElementById('filter-status');
        this.platformFilter = document.getElementById('filter-platform');
    }

    async init() {
        await this.fetchData();
        this.populatePlatformFilter();
        this.setupEventListeners();
        this.render();
    }

    async fetchData() {
        try {
            const [listingsRes, platformsRes] = await Promise.all([
                fetch('./data/listings.json'),
                fetch('./data/platforms.json')
            ]);
            if (!listingsRes.ok || !platformsRes.ok) {
                throw new Error('Failed to fetch data.');
            }
            this.allListings = await listingsRes.json();
            this.platforms = await platformsRes.json();
            this.filteredListings = this.allListings;
        } catch (error) {
            console.error('Error fetching data:', error);
            this.gridContainer.innerHTML = `<p class="text-red-400">Error loading listings.</p>`;
        }
    }

    populatePlatformFilter() {
        this.platforms.forEach(platform => {
            const option = document.createElement('option');
            option.value = platform.id;
            option.textContent = platform.name;
            this.platformFilter.appendChild(option);
        });
    }

    setupEventListeners() {
        this.searchInput.addEventListener('input', () => this.render());
        this.statusFilter.addEventListener('change', () => this.render());
        this.platformFilter.addEventListener('change', () => this.render());
    }

    applyFilters() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const status = this.statusFilter.value;
        const platform = this.platformFilter.value;

        this.filteredListings = this.allListings.filter(listing => {
            const matchesSearch = listing.title.toLowerCase().includes(searchTerm) || listing.sku.toLowerCase().includes(searchTerm);
            const matchesStatus = status === 'all' || listing.status === status;
            const matchesPlatform = platform === 'all' || (listing.platforms && listing.platforms[platform]);
            return matchesSearch && matchesStatus && matchesPlatform;
        });
        this.currentPage = 1; // Reset to first page after filtering
    }

    render() {
        this.applyFilters();
        this.renderGridView();
        this.renderListView();
        this.renderPagination();
    }

    renderGridView() {
        this.gridContainer.innerHTML = '';
        const paginatedListings = this.filteredListings.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);

        if (paginatedListings.length === 0) {
            this.gridContainer.innerHTML = `<p class="text-gray-400 col-span-full text-center">No listings found.</p>`;
            return;
        }

        paginatedListings.forEach(listing => {
            const card = document.createElement('div');
            card.className = 'glass-card p-4 flex flex-col group'; // Added group for hover effects
            card.innerHTML = `
                <div class="relative mb-4">
                    <img src="${listing.imageUrl}" alt="${listing.title}" class="w-full h-40 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105">
                    <div class="absolute top-2 right-2">
                        <span class="status-badge ${listing.status}">${listing.status}</span>
                    </div>
                </div>
                <h3 class="font-semibold text-base text-text-primary truncate">${listing.title}</h3>
                <p class="text-xs text-text-secondary mb-2">${listing.sku}</p>
                <div class="flex-grow"></div>
                <div class="flex justify-between items-center mt-2 mb-3">
                    <p class="text-lg font-bold text-accent-teal">$${listing.price.toFixed(2)}</p>
                    <div class="flex space-x-1">
                        ${this.getPlatformIcons(listing.platforms)}
                    </div>
                </div>
                <div class="flex justify-start items-center text-xs text-text-secondary gap-4 mb-3">
                    <span class="flex items-center gap-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>${listing.stats.views}</span>
                    <span class="flex items-center gap-1"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/></svg>${listing.stats.likes}</span>
                </div>
                <div class="mt-auto pt-3 border-t border-white/10 flex gap-2">
                    <button class="btn-secondary-glow w-full text-xs ai-tool-trigger" data-tool-id="tool-01">Enhance</button>
                    <button class="btn-secondary-glow w-full text-xs ai-tool-trigger" data-tool-id="tool-02">Sync</button>
                </div>
            `;
            this.gridContainer.appendChild(card);
        });
    }

    renderListView() {
        this.listContainer.innerHTML = '';
        const paginatedListings = this.filteredListings.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);

        if (paginatedListings.length === 0) {
            // No message needed here as grid view will show it
            return;
        }

        paginatedListings.forEach(listing => {
            const row = document.createElement('div');
            row.className = 'grid grid-cols-12 items-center p-3 gap-4 hover:bg-gray-800/50 transition-colors duration-200';
            row.innerHTML = `
                <div class="col-span-1">
                    <img src="${listing.imageUrl}" alt="${listing.title}" class="w-12 h-12 object-cover rounded-md">
                </div>
                <div class="col-span-4">
                    <p class="font-semibold text-text-primary">${listing.title}</p>
                    <p class="text-xs text-text-secondary">${listing.sku}</p>
                </div>
                <div class="col-span-1 text-center">
                    <span class="status-badge ${listing.status}">${listing.status}</span>
                </div>
                <div class="col-span-2 flex space-x-1 justify-center">
                    ${this.getPlatformIcons(listing.platforms)}
                </div>
                <div class="col-span-1 text-right font-semibold text-accent-teal">$${listing.price.toFixed(2)}</div>
                <div class="col-span-3 text-right flex items-center justify-end gap-2">
                    <button class="btn-secondary-glow text-xs ai-tool-trigger" data-tool-id="tool-01">Enhance</button>
                    <button class="btn-secondary-glow text-xs ai-tool-trigger" data-tool-id="tool-02">Sync</button>
                    <button class="btn-ghost text-xs">Details</button>
                </div>
            `;
            this.listContainer.appendChild(row);
        });
    }

    renderPagination() {
        this.paginationContainer.innerHTML = '';
        const pageCount = Math.ceil(this.filteredListings.length / this.itemsPerPage);
        if (pageCount <= 1) return;

        // Previous Button
        const prevButton = this.createPaginationButton('Prev', this.currentPage > 1, () => {
            this.currentPage--;
            this.render();
        });
        this.paginationContainer.appendChild(prevButton);

        // Page Numbers
        for (let i = 1; i <= pageCount; i++) {
            const isCurrent = i === this.currentPage;
            const pageButton = this.createPaginationButton(i, true, () => {
                this.currentPage = i;
                this.render();
            }, isCurrent);
            this.paginationContainer.appendChild(pageButton);
        }

        // Next Button
        const nextButton = this.createPaginationButton('Next', this.currentPage < pageCount, () => {
            this.currentPage++;
            this.render();
        });
        this.paginationContainer.appendChild(nextButton);
    }

    createPaginationButton(text, enabled, onClick, isCurrent = false) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = isCurrent 
            ? 'btn-primary-glow text-sm px-4 py-2'
            : 'btn-ghost text-sm px-4 py-2';
        button.disabled = !enabled;
        if (enabled) {
            button.addEventListener('click', onClick);
        }
        return button;
    }

    getPlatformIcons(platforms) {
        if (!platforms) return '';
        return Object.keys(platforms).map(platformId => {
            const platformInfo = this.platforms.find(p => p.id === platformId);
            if (!platformInfo) return '';
            const status = platforms[platformId]; // 'synced', 'error', 'syncing'
            let statusColorClass = '';
            if(status === 'synced') statusColorClass = 'text-green-400';
            else if(status === 'error') statusColorClass = 'text-red-400';
            else if(status === 'syncing') statusColorClass = 'text-yellow-400 animate-pulse';

            return `<div class="relative">
                        <img src="${platformInfo.logo_icon}" alt="${platformInfo.name}" class="w-6 h-6 rounded-full bg-white/10 p-0.5">
                        <span class="absolute -top-1 -right-1 w-3 h-3 border-2 border-[#060720] rounded-full ${statusColorClass} bg-current"></span>
                    </div>`;
        }).join('');
    }
}