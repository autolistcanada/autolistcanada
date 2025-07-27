// background.js - AutoList Canada Crosslist Pro (Advanced Template)

// On install/update: log event, optionally open onboarding
chrome.runtime.onInstalled.addListener((details) => {
  console.log("AutoList Canada Crosslist Pro installed or updated.", details);
  // Uncomment to show onboarding page on first install:
  // if (details.reason === "install") chrome.tabs.create({ url: "onboarding.html" });
});

// Centralized message routing for popup, content, dashboard, etc.
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "PING") {
    sendResponse({ status: "ok", time: Date.now() });
  }
  // OAuth2 token relay (stub for future marketplace integrations)
  if (msg.type === "GET_OAUTH_TOKEN") {
    // TODO: Implement OAuth2 logic for marketplace APIs
    sendResponse({ token: null, error: "Not implemented" });
  }
  // Scheduled sync trigger (stub)
  if (msg.type === "TRIGGER_SYNC") {
    // TODO: Implement background sync logic here
    console.log("Background sync triggered by", sender);
    sendResponse({ status: "sync started" });
  }
  // Add more message handlers as needed for your extension
  return true; // Indicates async response possible
});

// Alarm/scheduler for background sync (stub)
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "autolist-sync") {
    console.log("Scheduled sync alarm triggered");
    // TODO: Call sync logic or notify popup/dashboard
  }
});

// Set up a periodic alarm (every 60 min) on browser startup
chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create("autolist-sync", { periodInMinutes: 60 });
});

// Storage event monitoring (for debugging, multi-tab sync, or future features)
chrome.storage.onChanged.addListener((changes, area) => {
  console.log("Storage changed:", changes, "in", area);
});

// Global error logging for the background context
self.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection in background:", event.reason);
});
self.addEventListener("error", (event) => {
  console.error("Background script error:", event.message, event.filename, event.lineno);
});
