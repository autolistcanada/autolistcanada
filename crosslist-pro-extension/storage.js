// storage.js - AutoList Canada Extension
// Handles storage functionality using both storage.sync and storage.local

// Save settings to storage.sync
async function saveSettingsToSync(settings) {
  try {
    // Only save settings to sync storage
    await chrome.storage.sync.set({ settings: settings });
    console.log('AutoList: Settings saved to sync storage');
    return { success: true };
  } catch (error) {
    console.error('AutoList: Error saving settings to sync storage:', error);
    return { success: false, error: error.message };
  }
}

// Load settings from storage.sync
async function loadSettingsFromSync() {
  try {
    // Try to load settings from sync storage first
    const result = await chrome.storage.sync.get(['settings']);
    if (result.settings) {
      console.log('AutoList: Settings loaded from sync storage');
      return { success: true, settings: result.settings };
    }
    
    // If no settings in sync storage, return null
    return { success: true, settings: null };
  } catch (error) {
    console.error('AutoList: Error loading settings from sync storage:', error);
    return { success: false, error: error.message };
  }
}

// Save sync data to storage.local
async function saveSyncDataToLocal(syncData) {
  try {
    // Save sync data to local storage
    await chrome.storage.local.set({ syncData: syncData });
    console.log('AutoList: Sync data saved to local storage');
    return { success: true };
  } catch (error) {
    console.error('AutoList: Error saving sync data to local storage:', error);
    return { success: false, error: error.message };
  }
}

// Load sync data from storage.local
async function loadSyncDataFromLocal() {
  try {
    // Load sync data from local storage
    const result = await chrome.storage.local.get(['syncData']);
    if (result.syncData) {
      console.log('AutoList: Sync data loaded from local storage');
      return { success: true, data: result.syncData };
    }
    
    // If no sync data in local storage, return null
    return { success: true, data: null };
  } catch (error) {
    console.error('AutoList: Error loading sync data from local storage:', error);
    return { success: false, error: error.message };
  }
}

// Save toolbar data to storage.local
async function saveToolbarDataToLocal(toolbarData) {
  try {
    // Save toolbar data to local storage
    await chrome.storage.local.set({ toolbarData: toolbarData });
    console.log('AutoList: Toolbar data saved to local storage');
    return { success: true };
  } catch (error) {
    console.error('AutoList: Error saving toolbar data to local storage:', error);
    return { success: false, error: error.message };
  }
}

// Load toolbar data from storage.local
async function loadToolbarDataFromLocal() {
  try {
    // Load toolbar data from local storage
    const result = await chrome.storage.local.get(['toolbarData']);
    if (result.toolbarData) {
      console.log('AutoList: Toolbar data loaded from local storage');
      return { success: true, data: result.toolbarData };
    }
    
    // If no toolbar data in local storage, return null
    return { success: true, data: null };
  } catch (error) {
    console.error('AutoList: Error loading toolbar data from local storage:', error);
    return { success: false, error: error.message };
  }
}

// Export functions
window.storage = {
  saveSettingsToSync,
  loadSettingsFromSync,
  saveSyncDataToLocal,
  loadSyncDataFromLocal,
  saveToolbarDataToLocal,
  loadToolbarDataFromLocal
};
