// background.js - AutoList Canada Extension
// Background service worker handling core extension functionality

// Default settings
const DEFAULT_SETTINGS = {
  consent: false,
  connections: {
    ebay: false,
    etsy: false,
    poshmark: false
  },
  ai: {
    tone: 'trust-first',
    priceRound: 'psych-99'
  },
  telemetry: false,
  remoteSync: {
    enabled: false,
    endpoint: '',
    apiKey: ''
  }
};

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
  console.log('AutoList Canada extension installed');
  
  // Initialize settings
  await initializeSettings();
  
  // Ensure alarms exist before use
  if (chrome.alarms && chrome.alarms.create) {
    chrome.alarms.get('periodicSync', (existing) => {
      if (!existing) {
        chrome.alarms.create('periodicSync', { periodInMinutes: 15 });
      }
    });
  } else {
    console.warn('Alarms API not available. Check "alarms" permission in manifest.');
  }
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle async responses
  handleBackgroundMessage(message, sender)
    .then(response => sendResponse(response))
    .catch(error => {
      console.error('Error handling message:', error);
      sendResponse({ success: false, error: error.message });
    });
  
  // Return true to indicate async response
  return true;
});

// Handle background messages
async function handleBackgroundMessage(message, sender) {
  switch (message.type) {
    case 'GET_CONNECTIONS':
      return await getConnections();
    
    case 'GET_SETTINGS':
      return await getSettings();
    
    case 'UPDATE_SETTINGS':
      return await updateSettings(message.updates);
    
    case 'CLEAR_DATA':
      return await clearData();
    
    case 'RESET_SETTINGS':
      return await resetSettings();
    
    case 'GET_SYNC_DATA':
      return await getSyncData();
    
    case 'RUN_ACTION':
      return await runAction(message.action);
    
    case 'OAUTH_RESPONSE':
      return await handleOAuthResponse(message);
    
    default:
      return { success: false, error: 'Unknown message type' };
  }
}

// Initialize settings
async function initializeSettings() {
  try {
    const result = await chrome.storage.local.get(['settings']);
    
    if (!result.settings) {
      await chrome.storage.local.set({ settings: DEFAULT_SETTINGS });
      console.log('Initialized default settings');
    }
  } catch (error) {
    console.error('Error initializing settings:', error);
  }
}

// Get connections
async function getConnections() {
  try {
    const result = await chrome.storage.local.get(['settings']);
    const settings = result.settings || DEFAULT_SETTINGS;
    
    return {
      success: true,
      connections: settings.connections
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get settings
async function getSettings() {
  try {
    const result = await chrome.storage.local.get(['settings']);
    const settings = result.settings || DEFAULT_SETTINGS;
    
    return {
      success: true,
      settings: settings
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Update settings
async function updateSettings(updates) {
  try {
    const result = await chrome.storage.local.get(['settings']);
    const settings = result.settings || DEFAULT_SETTINGS;
    
    // Merge updates with existing settings
    const updatedSettings = { ...settings, ...updates };
    
    // Handle nested objects
    if (updates.connections) {
      updatedSettings.connections = { ...settings.connections, ...updates.connections };
    }
    
    if (updates.ai) {
      updatedSettings.ai = { ...settings.ai, ...updates.ai };
    }
    
    if (updates.remoteSync) {
      updatedSettings.remoteSync = { ...settings.remoteSync, ...updates.remoteSync };
    }
    
    await chrome.storage.local.set({ settings: updatedSettings });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Clear data
async function clearData() {
  try {
    // Clear all stored data except settings
    await chrome.storage.local.clear();
    
    // Re-initialize settings
    await initializeSettings();
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Reset settings
async function resetSettings() {
  try {
    await chrome.storage.local.set({ settings: DEFAULT_SETTINGS });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get sync data
async function getSyncData() {
  try {
    // In a real implementation, this would fetch actual sync data
    // For now, we'll return mock data
    const mockData = {
      totalListings: 42,
      activeSyncs: 3,
      lastSync: new Date().toISOString(),
      platforms: {
        ebay: true,
        etsy: false,
        poshmark: true
      },
      history: [
        {
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          platform: 'eBay',
          listingCount: 15,
          status: 'success',
          message: 'Successfully synced 15 listings'
        },
        {
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          platform: 'Poshmark',
          listingCount: 8,
          status: 'success',
          message: 'Successfully synced 8 listings'
        },
        {
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          platform: 'Etsy',
          listingCount: 0,
          status: 'error',
          message: 'Authentication failed'
        }
      ]
    };
    
    return { success: true, data: mockData };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Run action
async function runAction(action) {
  try {
    console.log(`Running action: ${action}`);
    
    // Simulate action processing
    switch (action) {
      case 'bulk-crosslist':
        // Simulate bulk crosslisting
        await new Promise(resolve => setTimeout(resolve, 1000));
        break;
      
      case 'smart-delist':
        // Simulate smart delist/relist
        await new Promise(resolve => setTimeout(resolve, 1000));
        break;
      
      case 'ai-title':
        // Simulate AI title generation
        await new Promise(resolve => setTimeout(resolve, 1000));
        break;
      
      case 'ai-description':
        // Simulate AI description generation
        await new Promise(resolve => setTimeout(resolve, 1000));
        break;
      
      case 'ai-tags':
        // Simulate AI tags generation
        await new Promise(resolve => setTimeout(resolve, 1000));
        break;
      
      case 'price-suggest':
        // Simulate price suggestion
        await new Promise(resolve => setTimeout(resolve, 1000));
        break;
      
      case 'activity-logs':
        // Simulate activity logs retrieval
        await new Promise(resolve => setTimeout(resolve, 1000));
        break;
      
      case 'settings':
        // Open settings page
        chrome.runtime.openOptionsPage();
        break;
      
      default:
        return { success: false, error: `Unknown action: ${action}` };
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Handle OAuth response
async function handleOAuthResponse(message) {
  try {
    if (!message.success) {
      console.error('OAuth failed:', message.error);
      return { success: false, error: message.error };
    }
    
    // Store tokens securely
    const tokenData = {
      accessToken: message.token,
      refreshToken: message.refreshToken,
      platformId: message.platformId,
      timestamp: Date.now()
    };
    
    // Save tokens to storage
    await chrome.storage.local.set({
      [`${message.platformId}_tokens`]: tokenData
    });
    
    // Update connection status
    const result = await chrome.storage.local.get(['settings']);
    const settings = result.settings || DEFAULT_SETTINGS;
    
    settings.connections[message.platformId] = true;
    
    await chrome.storage.local.set({ settings: settings });
    
    console.log(`Successfully connected to ${message.platformId}`);
    return { success: true };
  } catch (error) {
    console.error('Error handling OAuth response:', error);
    return { success: false, error: error.message };
  }
}

// Safely attach the listener
if (chrome.alarms && chrome.alarms.onAlarm && chrome.alarms.onAlarm.addListener) {
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm && alarm.name === 'periodicSync') {
      console.log('Running periodic sync');
      // TODO: real sync work
    }
  });
}

// Handle tab updates for content script injection
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only inject content scripts when the page is fully loaded
  if (changeInfo.status === 'complete' && tab.url) {
    // Check if the URL matches supported marketplaces
    const supportedDomains = [
      'ebay.com', 'etsy.com', 'poshmark.com',
      'facebook.com/marketplace', 'kijiji.ca',
      'depop.com', 'mercari.com', 'shopify.com',
      'grailed.com', 'varagesale.com', 'offerup.com',
      'amazon.com', 'bonanza.com', 'letgo.com'
    ];
    
    const isSupported = supportedDomains.some(domain => 
      tab.url.includes(domain)
    );
    
    if (isSupported) {
      // Inject content scripts
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content/common.js']
      }).catch(err => console.error('Error injecting common script:', err));
      
      // Inject platform-specific script based on domain
      let platformScript = '';
      if (tab.url.includes('ebay.com')) {
        platformScript = 'content/ebay.js';
      } else if (tab.url.includes('etsy.com')) {
        platformScript = 'content/etsy.js';
      } else if (tab.url.includes('poshmark.com')) {
        platformScript = 'content/poshmark.js';
      } else if (tab.url.includes('facebook.com')) {
        platformScript = 'content/facebook.js';
      } else if (tab.url.includes('depop.com')) {
        platformScript = 'content/depop.js';
      } else if (tab.url.includes('grailed.com')) {
        platformScript = 'content/grailed.js';
      } else if (tab.url.includes('kijiji.ca')) {
        platformScript = 'content/kijiji.js';
      } else if (tab.url.includes('mercari.com')) {
        platformScript = 'content/mercari.js';
      } else if (tab.url.includes('varagesale.com')) {
        platformScript = 'content/varagesale.js';
      } else if (tab.url.includes('shopify.com')) {
        platformScript = 'content/shopify.js';
      } else if (tab.url.includes('offerup.com')) {
        platformScript = 'content/offerup.js';
      } else if (tab.url.includes('amazon.com') || tab.url.includes('amazon.ca')) {
        platformScript = 'content/amazon.js';
      } else if (tab.url.includes('bonanza.com')) {
        platformScript = 'content/bonanza.js';
      } else if (tab.url.includes('letgo.com')) {
        platformScript = 'content/letgo.js';
      }
      
      if (platformScript) {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: [platformScript]
        }).catch(err => console.error('Error injecting platform script:', err));
      }
    }
  }
});
