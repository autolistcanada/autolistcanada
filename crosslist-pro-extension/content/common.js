// content/common.js - AutoList Canada Extension
// Common content script functionality shared across all marketplaces

// Inject CSS for the AutoList button
function injectAutoListCSS() {
  // Check if CSS is already injected
  if (document.getElementById('autolist-css')) return;
  
  const style = document.createElement('style');
  style.id = 'autolist-css';
  style.textContent = `
    .autolist-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      background: linear-gradient(135deg, var(--orange-amber-1), var(--orange-amber-2));
      color: white;
      border: none;
      border-radius: var(--border-radius-md);
      padding: 8px 16px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      z-index: 10000;
      box-shadow: 
        0 4px 8px rgba(0, 0, 0, 0.3),
        0 0 0 1px rgba(255, 255, 255, 0.1);
      transition: all var(--transition-normal);
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
      animation: pulse 3s infinite;
    }
    
    .autolist-btn:hover {
      transform: translateY(-3px);
      box-shadow: 
        0 6px 12px rgba(0, 0, 0, 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.2);
      animation: none;
    }
    
    .autolist-btn:active {
      transform: translateY(0);
    }
    
    .autolist-btn.importing {
      background: linear-gradient(135deg, var(--teal-1), var(--teal-2));
      animation: pulse 1s infinite;
    }
    
    .autolist-btn.imported {
      background: linear-gradient(135deg, var(--lime-1), var(--lime-2));
    }
    
    .autolist-btn.error {
      background: linear-gradient(135deg, var(--maple-red-1), var(--maple-red-2));
    }
    
    /* Keyframe animations */
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.03); }
      100% { transform: scale(1); }
    }
  `;
  
  document.head.appendChild(style);
}

// Create AutoList button
function createAutoListButton(listingElement, listingData) {
  // Remove existing button if present
  const existingBtn = listingElement.querySelector('.autolist-btn');
  if (existingBtn) existingBtn.remove();
  
  // Create new button
  const btn = document.createElement('button');
  btn.className = 'autolist-btn';
  btn.textContent = 'Import to AutoList';
  
  // Add click event
  btn.addEventListener('click', async (e) => {
    e.stopPropagation();
    
    // Prevent multiple clicks
    if (btn.classList.contains('importing')) return;
    
    // Update button state
    btn.classList.add('importing');
    btn.textContent = 'Importing...';
    
    try {
      // Send listing data to background script
      await chrome.runtime.sendMessage({
        type: 'IMPORT_LISTING',
        listing: listingData
      });
      
      // Update button state
      btn.classList.remove('importing');
      btn.classList.add('imported');
      btn.textContent = '✓ Imported';
      btn.disabled = true;
      
      // Revert button after 2 seconds
      setTimeout(() => {
        btn.classList.remove('imported');
        btn.textContent = 'Import to AutoList';
        btn.disabled = false;
      }, 2000);
    } catch (error) {
      console.error('Error importing listing:', error);
      
      // Show error state
      btn.classList.remove('importing');
      btn.classList.add('error');
      btn.textContent = 'Error';
      
      // Revert button after 2 seconds
      setTimeout(() => {
        btn.classList.remove('error');
        btn.textContent = 'Import to AutoList';
      }, 2000);
    }
  });
  
  return btn;
}

// Extract listing data (to be implemented by platform-specific scripts)
function extractListingData(listingElement) {
  // This function should be overridden by platform-specific scripts
  return {
    id: null,
    title: null,
    price: null,
    imageUrl: null,
    url: window.location.href,
    platform: 'unknown'
  };
}

// Handle ALC_ACTION messages from both chrome.runtime.onMessage and window.postMessage
async function handleALCAction(action, data = {}) {
  // Show toast notification
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.top = '20px';
  toast.style.right = '20px';
  toast.style.padding = '10px 20px';
  toast.style.background = '#00C2A8';
  toast.style.color = 'white';
  toast.style.borderRadius = '4px';
  toast.style.zIndex = '999999';
  toast.style.fontFamily = 'Arial, sans-serif';
  toast.textContent = `AutoList Action: ${action}`;
  document.body.appendChild(toast);
  
  // Remove toast after 3 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 3000);
  
  // Log to console
  console.log(`[ALC] Action:${action}`, data);
  
  // Handle autofill actions
  if (action === 'autofill-to-etsy' || action === 'autofill-to-poshmark') {
    const targetPlatform = action === 'autofill-to-etsy' ? 'etsy' : 'poshmark';
    
    try {
      // Get current URL to check if we're on eBay
      if (window.location.hostname.includes('ebay.com')) {
        // We're on eBay, extract the data
        const listing = window.extractListingData ? window.extractListingData(document.body) : null;
        
        if (listing) {
          // Save the data to chrome.storage for the target platform to access
          await chrome.storage.local.set({
            'alc_autofill_data': {
              source: 'ebay',
              target: targetPlatform,
              data: listing,
              timestamp: Date.now()
            }
          });
          
          // Log the data for debugging
          console.log(`[ALC] Extracted eBay data for ${targetPlatform}:`, listing);
          
          // Open the target platform's create listing page in a new tab
          let targetUrl = '';
          if (targetPlatform === 'etsy') {
            targetUrl = 'https://www.etsy.com/your/shops/me/tools/listings/create';
          } else if (targetPlatform === 'poshmark') {
            targetUrl = 'https://poshmark.com/create-listing';
          }
          
          if (targetUrl) {
            chrome.runtime.sendMessage({
              type: 'OPEN_URL',
              url: targetUrl
            });
          }
          
          // Update toast message
          toast.textContent = `Sending to ${targetPlatform}... Open a new tab.`;
          toast.style.background = '#A5FF00'; // Lime color for success
        } else {
          toast.textContent = 'Could not extract listing data';
          toast.style.background = '#FF3C38'; // Error color
          console.error('[ALC] Failed to extract listing data for autofill');
        }
      } else if (window.location.hostname.includes('etsy.com') || window.location.hostname.includes('poshmark.com')) {
        // We're on the target platform, check for data to autofill
        const result = await chrome.storage.local.get(['alc_autofill_data']);
        const autofillData = result.alc_autofill_data;
        
        if (autofillData && autofillData.target === (window.location.hostname.includes('etsy.com') ? 'etsy' : 'poshmark')) {
          // Check if autofill data is recent (less than 5 minutes old)
          const isFresh = Date.now() - autofillData.timestamp < 5 * 60 * 1000;
          
          if (isFresh) {
            // Load autofill.js if it's not already loaded
            if (!window.autofillListingData) {
              await new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = chrome.runtime.getURL('content/autofill.js');
                script.onload = resolve;
                document.head.appendChild(script);
              });
            }
            
            // Perform the autofill
            if (window.autofillListingData) {
              const platform = window.location.hostname.includes('etsy.com') ? 'etsy' : 'poshmark';
              await window.autofillListingData(autofillData.data, platform);
              
              // Update toast message
              toast.textContent = `Autofilled from eBay to ${platform}`;
              toast.style.background = '#A5FF00'; // Success color
              
              // Clear the autofill data to prevent accidental re-use
              await chrome.storage.local.remove(['alc_autofill_data']);
              
              // Log success
              console.log(`[ALC] Successfully autofilled from eBay to ${platform}`);
            }
          } else {
            // Stale data, remove it
            await chrome.storage.local.remove(['alc_autofill_data']);
            toast.textContent = 'Autofill data expired';
            toast.style.background = '#FF9F00'; // Warning color
          }
        }
      } else {
        toast.textContent = 'Autofill only works on eBay, Etsy, or Poshmark';
        toast.style.background = '#FF9F00'; // Warning color
      }
    } catch (error) {
      console.error('[ALC] Autofill error:', error);
      toast.textContent = `Autofill error: ${error.message}`;
      toast.style.background = '#FF3C38'; // Error color
    }
  }
  
  // Handle bulk actions
  if (action === 'bulk-crosslist') {
    // Log bulk operation start
    await logBulkOperation('start', 'crosslist');
    toast.textContent = 'Starting bulk crosslist operation';
  }
}

// Log bulk operations to local storage
async function logBulkOperation(status, operationType, details = {}) {
  try {
    // Get existing logs
    const result = await chrome.storage.local.get(['alc_bulk_logs']);
    const logs = result.alc_bulk_logs || [];
    
    // Create new log entry
    const logEntry = {
      id: `bulk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
      status: status, // 'start', 'progress', 'complete', 'error'
      operation: operationType, // 'crosslist', 'delist', 'relist', etc.
      source: window.location.hostname,
      details: details
    };
    
    // Add to logs (keep most recent 100)
    logs.unshift(logEntry);
    if (logs.length > 100) logs.length = 100;
    
    // Save back to storage
    await chrome.storage.local.set({ 'alc_bulk_logs': logs });
    
    // Log to console
    console.log(`[ALC] Bulk operation logged: ${status} - ${operationType}`, logEntry);
    
    return logEntry.id;
  } catch (error) {
    console.error('[ALC] Error logging bulk operation:', error);
    return null;
  }
}

// Listen for chrome.runtime.onMessage
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ALC_ACTION') {
    handleALCAction(message.action);
    sendResponse({ success: true });
  }
  return true; // Keep message channel open for async response
});

// Listen for window.postMessage
window.addEventListener('message', (event) => {
  // Verify the message is from the same window
  if (event.source !== window) return;
  
  // Check if it's an ALC_ACTION message
  if (event.data && event.data.type === 'ALC_ACTION') {
    handleALCAction(event.data.action);
  }
});

// Initialize common functionality
function initCommon() {
  injectAutoListCSS();
  
  // Determine if we're on an item page to inject the toolbar
  const domain = window.location.hostname;
  const path = window.location.pathname;
  
  // Check if this is an item page based on URL patterns
  let isItemPage = false;
  
  if (domain.includes('ebay.com') && path.includes('/itm/')) {
    isItemPage = true;
  } else if (domain.includes('etsy.com') && path.includes('/listing/')) {
    isItemPage = true;
  } else if (domain.includes('poshmark.com') && path.includes('/listing/')) {
    isItemPage = true;
  } else if (domain.includes('facebook.com') && path.includes('/marketplace/item/')) {
    isItemPage = true;
  } else if (domain.includes('depop.com') && path.includes('/products/')) {
    isItemPage = true;
  } else if (domain.includes('grailed.com') && path.includes('/listings/')) {
    isItemPage = true;
  } else if (domain.includes('kijiji.ca') && path.includes('/v-')) {
    isItemPage = true;
  } else if (domain.includes('mercari.com') && path.includes('/item/')) {
    isItemPage = true;
  } else if (domain.includes('varagesale.com') && path.includes('/items/')) {
    isItemPage = true;
  } else if (domain.includes('offerup.com') && path.includes('/item/')) {
    isItemPage = true;
  } else if (domain.includes('bonanza.com') && path.includes('/items/')) {
    isItemPage = true;
  } else if (domain.includes('amazon.com') && path.includes('/dp/')) {
    isItemPage = true;
  } else if (domain.includes('shopify.com') && path.includes('/products/')) {
    isItemPage = true;
  } else if (domain.includes('letgo.com') && path.includes('/item/')) {
    isItemPage = true;
  }
  
  // Inject toolbar if on an item page and initFloatingDock is available
  if (isItemPage && window.initFloatingDock) {
    window.initFloatingDock();
  }
}

// Run initialization
initCommon();
