// content/ebay.js - AutoList Canada Extension
// eBay-specific content script functionality

// Extract listing data from eBay listing element
function extractListingData(listingElement) {
  // Try to get listing ID
  const id = listingElement.dataset.itemId || 
             listingElement.querySelector('[data-itemid]')?.dataset.itemid ||
             window.location.href.match(/itm\/(\d+)/) ? window.location.href.match(/itm\/(\d+)/)[1] : null;
  
  // Try to get title
  const titleElement = listingElement.querySelector('.s-item__title') ||
                      listingElement.querySelector('h3') ||
                      listingElement.querySelector('[role="heading"]') ||
                      document.querySelector('h1.x-item-title__mainTitle');
  const title = titleElement ? titleElement.textContent.trim() : '';
  
  // Try to get price
  const priceElement = listingElement.querySelector('.s-item__price') ||
                      listingElement.querySelector('.price') ||
                      document.querySelector('.x-price-primary');
  const priceText = priceElement ? priceElement.textContent.trim() : '';
  const price = priceText.replace(/[^0-9.-]+/g, '');
  
  // Try to get description
  const descriptionElement = document.querySelector('.x-item-description') ||
                          document.querySelector('#desc_ifr');
  let description = '';
  if (descriptionElement) {
    if (descriptionElement.tagName === 'IFRAME') {
      try {
        const iframeDoc = descriptionElement.contentDocument || descriptionElement.contentWindow.document;
        description = iframeDoc.body.textContent.trim();
      } catch (e) {
        console.log('AutoList: Could not access iframe content');
      }
    } else {
      description = descriptionElement.textContent.trim();
    }
  }
  
  // Try to get images
  const images = [];
  const imageElements = document.querySelectorAll('.ux-image-carousel-item img, .ux-image-filmstrip-carousel-item img');
  imageElements.forEach(img => {
    if (img.src && !images.includes(img.src)) {
      images.push(img.src);
    }
  });
  
  // Fallback for single image
  const imageElement = listingElement.querySelector('.s-item__image img') ||
                      listingElement.querySelector('img');
  const imageUrl = imageElement ? imageElement.src : '';
  if (imageUrl && images.length === 0) {
    images.push(imageUrl);
  }
  
  // Get current URL
  const url = window.location.href;
  
  return {
    id: id,
    title: title,
    price: price ? parseFloat(price) : null,
    description: description,
    images: images,
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
