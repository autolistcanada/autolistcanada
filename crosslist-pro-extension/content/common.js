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
function handleALCAction(action) {
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
  console.log(`[ALC] Action:${action}`);
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
  
  // Inject toolbar if on a supported marketplace page
  if (window.initFloatingDock) {
    window.initFloatingDock();
  }
}

// Run initialization
initCommon();
