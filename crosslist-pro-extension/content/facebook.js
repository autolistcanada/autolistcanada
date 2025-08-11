// facebook.js - AutoList Canada Crosslist Pro
// Facebook Marketplace specific content script

console.log('AutoList Canada Facebook Marketplace content script loaded');

// Function to extract listing data from Facebook Marketplace
function extractFacebookListingData(listingElement) {
  try {
    // Extract title
    const titleElement = listingElement.querySelector('span[dir="auto"], h2');
    const title = titleElement ? titleElement.innerText.trim() : '';
    
    // Extract price
    const priceElement = listingElement.querySelector('span[dir="auto"]:nth-child(2)');
    const price = priceElement ? priceElement.innerText.trim() : '';
    
    // Extract image
    const imageElement = listingElement.querySelector('img');
    const image = imageElement ? imageElement.src : '';
    
    // Extract URL
    const linkElement = listingElement.querySelector('a');
    const url = linkElement ? linkElement.href : window.location.href;
    
    return {
      platform: 'Facebook Marketplace',
      title: title,
      price: price,
      image: image,
      url: url
    };
  } catch (error) {
    console.error('Error extracting Facebook listing data:', error);
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
  console.log('Initializing Facebook Marketplace content script');
  // Add any Facebook Marketplace specific initialization code here
}
