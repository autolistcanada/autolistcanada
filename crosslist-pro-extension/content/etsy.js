// content/etsy.js - AutoList Canada Extension
// Etsy-specific content script functionality

// Extract listing data from Etsy listing element
function extractListingData(listingElement) {
  // Try to get listing ID
  const id = listingElement.dataset.listingId || 
             listingElement.querySelector('[data-listing-id]')?.dataset.listingId ||
             null;
  
  // Try to get title
  const titleElement = listingElement.querySelector('.wt-text-body-01') ||
                      listingElement.querySelector('.listing-title') ||
                      listingElement.querySelector('h2') ||
                      listingElement.querySelector('[data-title]');
  const title = titleElement ? titleElement.textContent.trim() : '';
  
  // Try to get price
  const priceElement = listingElement.querySelector('.currency-value') ||
                      listingElement.querySelector('.price') ||
                      listingElement.querySelector('.money') ||
                      listingElement.querySelector('.amount');
  const priceText = priceElement ? priceElement.textContent.trim() : '';
  const price = priceText.replace(/[^0-9.-]+/g, '');
  
  // Try to get image URL
  const imageElement = listingElement.querySelector('img') ||
                      listingElement.querySelector('.image') ||
                      listingElement.querySelector('.photo');
  const imageUrl = imageElement ? imageElement.src : '';
  
  // Get current URL
  const url = window.location.href;
  
  return {
    id: id,
    title: title,
    price: price ? parseFloat(price) : null,
    imageUrl: imageUrl,
    url: url,
    platform: 'Etsy'
  };
}

// Find and process listings on the page
function processListings() {
  // Common Etsy listing selectors
  const listingSelectors = [
    '.listing-link',     // Search results
    '.listing-card',     // Listing cards
    '.item',             // Item listings
    '[data-listing-id]'  // Data attribute based
  ];
  
  // Process each selector
  listingSelectors.forEach(selector => {
    const listings = document.querySelectorAll(selector);
    
    listings.forEach(listing => {
      // Skip if already processed
      if (listing.querySelector('.autolist-btn')) return;
      
      // Extract listing data
      const listingData = extractListingData(listing);
      
      // Skip if no title
      if (!listingData.title) return;
      
      // Create and inject AutoList button
      const btn = createAutoListButton(listing, listingData);
      listing.style.position = 'relative';
      listing.appendChild(btn);
    });
  });
}

// Initialize Etsy functionality
function initEtsy() {
  // Process listings immediately
  processListings();
  
  // Set up mutation observer for dynamically loaded content
  const observer = new MutationObserver(mutations => {
    let shouldProcess = false;
    
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        shouldProcess = true;
      }
    });
    
    if (shouldProcess) {
      processListings();
    }
  });
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Process listings every 2 seconds as a fallback
  setInterval(processListings, 2000);
}

// Run initialization
initEtsy();
