// crosslist-pro-extension/background.js

let authToken = null;
let crosslistSettings = {
  defaultPlatforms: ["ebay", "poshmark", "etsy"]
};

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
