// letgo.js - AutoList Canada Crosslist Pro
// Letgo specific content script

console.log('AutoList Canada Letgo content script loaded');

// Function to extract listing data from Letgo
function extractLetgoListingData(listingElement) {
  try {
    // Extract title
    const titleElement = listingElement.querySelector('.listing-title');
    const title = titleElement ? titleElement.innerText.trim() : '';
    
    // Extract price
    const priceElement = listingElement.querySelector('.listing-price');
    const price = priceElement ? priceElement.innerText.trim() : '';
    
    // Extract image
    const imageElement = listingElement.querySelector('img');
    const image = imageElement ? imageElement.src : '';
    
    // Extract URL
    const linkElement = listingElement.querySelector('a');
    const url = linkElement ? linkElement.href : window.location.href;
    
    return {
      platform: 'Letgo',
      title: title,
      price: price,
      image: image,
      url: url
    };
  } catch (error) {
    console.error('Error extracting Letgo listing data:', error);
    return null;
  }
}

// Function to send listing data to background script
function sendListingData(listingData) {
  chrome.runtime.sendMessage({
    type: 'LISTING_DATA',
    data: listingData
  }).catch(err => console.error('Error sending listing data:', err));
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  console.log('Initializing Letgo content script');
  // Add any Letgo specific initialization code here
}
