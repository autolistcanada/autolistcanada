

let authToken = null;
let crosslistSettings = {
  defaultPlatforms: ["ebay", "poshmark", "etsy"]
};

// Auto Sales Detection (New: List Perfectly replication)
let salesCheckInterval = setInterval(checkForSales, 60000); // Check every minute

function checkForSales() {
  chrome.storage.local.get(["listings"], (result) => {
    const listings = result.listings || [];
    listings.forEach(listing => {
      // Mock API call to check sales (replace with real API)
      fetch(`https://api.example.com/check-sale/${listing.id}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.sold) {
          // Delist from all platforms and notify
          delistFromPlatforms(listing.id);
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'assets/icon128.png',
            title: 'Sale Detected!',
            message: `${listing.title} sold on ${data.platform}. Delisted from others.`
          });
        }
      })
      .catch(err => console.error('Sales check error:', err));
    });
  });
}

function delistFromPlatforms(listingId) {
  // Implement delist logic for each platform
  console.log(`Delisting ${listingId} from all platforms.`);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case "MOCK_AUTH":
      authToken = "mock_token_" + Math.random().toString(36).substring(2);
      sendResponse({ token: authToken });
      break;

    case "GET_SETTINGS":
      sendResponse({ authToken, crosslist_settings: crosslistSettings });
      break;

    case "SET_SETTINGS":
      crosslistSettings = request.data || {};
      sendResponse({ status: "OK" });
      break;

    case "SAVE_LISTING":
      chrome.storage.local.get(["listingHistory"], (result) => {
        const history = result.listingHistory || [];
        history.unshift(request.data);
        chrome.storage.local.set({ listingHistory: history });
        sendResponse({ status: "Saved" });
      });
      return true;

    default:
      console.warn("Unknown request type:", request.type);
  }
});
