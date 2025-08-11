// content/ebay.js - AutoList Canada Extension
// eBay-specific content script functionality

// Extract listing data from eBay listing element
function extractListingData(listingElement) {
  // Try to get listing ID
  const id = listingElement.dataset.itemId || 
             listingElement.querySelector('[data-itemid]')?.dataset.itemid ||
             null;
  
  // Try to get title
  const titleElement = listingElement.querySelector('.s-item__title') ||
                      listingElement.querySelector('h3') ||
                      listingElement.querySelector('[role="heading"]');
  const title = titleElement ? titleElement.textContent.trim() : '';
  
  // Try to get price
  const priceElement = listingElement.querySelector('.s-item__price') ||
                      listingElement.querySelector('.price');
  const priceText = priceElement ? priceElement.textContent.trim() : '';
  const price = priceText.replace(/[^0-9.-]+/g, '');
  
  // Try to get image URL
  const imageElement = listingElement.querySelector('.s-item__image img') ||
                      listingElement.querySelector('img');
  const imageUrl = imageElement ? imageElement.src : '';
  
  // Get current URL
  const url = window.location.href;
  
  return {
    id: id,
    title: title,
    price: price ? parseFloat(price) : null,
    imageUrl: imageUrl,
    url: url,
    platform: 'eBay'
  };
}

// Find and process listings on the page
function processListings() {
  // Common eBay listing selectors
  const listingSelectors = [
    '.s-item',           // Search results
    '.vip',              // View item page
    '.sresult',          // Another search result format
    '[data-itemid]'      // Data attribute based
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

// Initialize eBay functionality
function initEbay() {
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
initEbay();
