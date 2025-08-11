// shopify.js - AutoList Canada Crosslist Pro
// Shopify specific content script

console.log('AutoList Canada Shopify content script loaded');

// Function to extract listing data from Shopify
function extractShopifyListingData(listingElement) {
  try {
    // Extract title
    const titleElement = listingElement.querySelector('span, h3');
    const title = titleElement ? titleElement.innerText.trim() : '';
    
    // Extract price
    const priceElement = listingElement.querySelector('.Polaris-TextStyle--variationStrong');
    const price = priceElement ? priceElement.innerText.trim() : '';
    
    // Extract image
    const imageElement = listingElement.querySelector('img');
    const image = imageElement ? imageElement.src : '';
    
    // Extract URL
    const linkElement = listingElement.querySelector('a');
    const url = linkElement ? linkElement.href : window.location.href;
    
    return {
      platform: 'Shopify',
      title: title,
      price: price,
      image: image,
      url: url
    };
  } catch (error) {
    console.error('Error extracting Shopify listing data:', error);
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
  console.log('Initializing Shopify content script');
  // Add any Shopify specific initialization code here
}
