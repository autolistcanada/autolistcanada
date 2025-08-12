// Background service worker for AutoList Canada Chrome Extension
// Handles communication between content scripts and popup

// Listen for installation
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    // First-time installation - set default settings
    chrome.storage.sync.set({
      language: 'en',
      marketplaces: {
        ebay: true,
        amazon: true,
        etsy: true,
        kijiji: true
      },
      notifications: true
    });
    
    // Open welcome page
    chrome.tabs.create({
      url: 'https://autolistcanada.com/welcome.html'
    });
  }
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  // Handle listing data received from content scripts
  if (message.action === 'listingCaptured') {
    // Store the listing data
    chrome.storage.local.get(['capturedListings'], function(result) {
      let listings = result.capturedListings || [];
      
      // Add timestamp and source info
      message.data.capturedAt = new Date().toISOString();
      message.data.sourceUrl = sender.tab.url;
      
      listings.unshift(message.data); // Add to beginning
      listings = listings.slice(0, 50); // Keep last 50 listings
      
      chrome.storage.local.set({ capturedListings: listings });
      
      // Show notification
      chrome.storage.sync.get(['notifications'], function(settings) {
        if (settings.notifications) {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'AutoList Canada',
            message: 'Listing captured successfully!',
            priority: 1
          });
        }
      });
      
      sendResponse({ success: true });
    });
    
    return true; // Indicates we will send a response asynchronously
  }
  
  // Handle marketplace button injection
  if (message.action === 'checkForInjection') {
    // Check if we should inject the AutoList button on this page
    const url = sender.tab.url;
    
    // Marketplace detection logic
    const marketplacePatterns = {
      ebay: /ebay\.ca\/itm/i,
      amazon: /amazon\.ca\/.+\/dp/i,
      etsy: /etsy\.com\/ca\/listing/i,
      kijiji: /kijiji\.ca\/v-/i,
      facebook: /facebook\.com\/marketplace\/item/i
    };
    
    let shouldInject = false;
    let marketplace = '';
    
    // Check which marketplace this is
    for (const [name, pattern] of Object.entries(marketplacePatterns)) {
      if (pattern.test(url)) {
        shouldInject = true;
        marketplace = name;
        break;
      }
    }
    
    sendResponse({
      inject: shouldInject,
      marketplace: marketplace
    });
    
    return true;
  }
});

// Handle browser action click (toolbar icon)
chrome.action.onClicked.addListener(function(tab) {
  // This won't trigger if we have a popup, but keeping for potential future use
  chrome.action.openPopup();
});
