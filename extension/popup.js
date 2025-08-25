document.addEventListener('DOMContentLoaded', () => {
    const listingsContainer = document.getElementById('listings-container');
    const emptyState = document.getElementById('empty-state');
    const listingCardTemplate = document.getElementById('listing-card-template');

    const renderListings = (listings) => {
        listingsContainer.innerHTML = ''; // Clear current listings

        if (!listings || listings.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        listings.forEach(listing => {
            const card = listingCardTemplate.content.cloneNode(true);
            card.querySelector('.listing-title').textContent = listing.title;
            card.querySelector('.listing-price').textContent = listing.price;
            card.querySelector('.listing-marketplace').textContent = listing.marketplace;
            card.querySelector('.listing-image').src = listing.image || 'icons/icon128.png';
            
            const deleteBtn = card.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => {
                chrome.runtime.sendMessage({ type: 'DELETE_LISTING', payload: { id: listing.id } }, (response) => {
                    if (response.success) {
                        renderListings(response.listings);
                    }
                });
            });

            listingsContainer.appendChild(card);
        });
    };

    const loadListings = () => {
        chrome.runtime.sendMessage({ type: 'GET_CAPTURED_LISTINGS' }, (response) => {
            if (response && response.listings) {
                renderListings(response.listings);
            }
        });
    };

    // Listen for changes in storage to auto-update the popup
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes.capturedListings) {
            renderListings(changes.capturedListings.newValue);
        }
    });

    // Initial load
    loadListings();
});
