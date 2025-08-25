// AutoList Canada Background Service Worker (Manifest V3)
console.log("[AutoList] Background Script Initialized");

// Define target marketplaces for content script injection
const TARGET_MARKETPLACES = [
  { hostSuffix: 'ebay.ca' },
  { hostSuffix: 'etsy.com' },
  { hostSuffix: 'poshmark.ca' },
  { hostSuffix: 'poshmark.com' },
];

// Inject content script programmatically when a tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const url = new URL(tab.url);
    const shouldInject = TARGET_MARKETPLACES.some(site => url.hostname.endsWith(site.hostSuffix));

    if (shouldInject) {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      }).catch(err => console.error('[AutoList] Failed to inject content script:', err));
    }
  }
});

// Main message listener for events from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handles the CAPTURE_LISTING action from content.js
  if (request.type === 'CAPTURE_LISTING') {
    console.log('[AutoList] Listing captured:', request.payload);
    const listingData = request.payload;

    chrome.storage.local.get({ capturedListings: [] }, (result) => {
      const listings = result.capturedListings;
      const newListing = {
        ...listingData,
        id: `al-${Date.now()}`,
        capturedAt: new Date().toISOString(),
      };
      
      // Add new listing to the front and keep the list size manageable
      listings.unshift(newListing);
      chrome.storage.local.set({ capturedListings: listings.slice(0, 50) }, () => {
        updateBadge();
        sendResponse({ success: true, message: 'Listing saved.' });
      });
    });
    return true; // Indicates an async response
  }

  // Handles requests for data from the popup
  if (request.type === 'GET_CAPTURED_LISTINGS') {
    chrome.storage.local.get({ capturedListings: [] }, (result) => {
      sendResponse({ listings: result.capturedListings });
    });
    return true; // Indicates an async response
  }
  
  // Handles requests to delete a listing from the popup
  if (request.type === 'DELETE_LISTING') {
      chrome.storage.local.get({ capturedListings: [] }, (result) => {
          const filteredListings = result.capturedListings.filter(l => l.id !== request.payload.id);
          chrome.storage.local.set({ capturedListings: filteredListings }, () => {
              updateBadge();
              sendResponse({ success: true, listings: filteredListings });
          });
      });
      return true; // Indicates an async response
  }
});

// Function to update the extension's badge
const updateBadge = async () => {
  try {
    const { capturedListings } = await chrome.storage.local.get({ capturedListings: [] });
    const count = capturedListings.length;

    await chrome.action.setBadgeText({
      text: count > 0 ? count.toString() : ''
    });

    await chrome.action.setBadgeBackgroundColor({
      color: '#164734' // Theme: pineGreen
    });
  } catch (error) {
    console.error('[AutoList] Failed to update badge:', error);
  }
};

// Initialize badge on startup and install
chrome.runtime.onStartup.addListener(updateBadge);
chrome.runtime.onInstalled.addListener(updateBadge);
