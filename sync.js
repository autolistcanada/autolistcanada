// sync.js - AutoList Canada Extension
// Handles sync visualizer functionality

document.addEventListener('DOMContentLoaded', async function() {
  // Get DOM elements
  const totalListingsEl = document.getElementById('total-listings');
  const activeSyncsEl = document.getElementById('active-syncs');
  const lastSyncEl = document.getElementById('last-sync');
  const platformStatusEl = document.getElementById('platform-status');
  const syncHistoryEl = document.getElementById('sync-history');
  const emptyHistoryEl = document.getElementById('empty-history');
  const refreshHistoryBtn = document.getElementById('refresh-history');
  const loadingSpinner = document.getElementById('loading-spinner');
  
  // Load initial data
  await loadSyncData();
  
  // Set up event listeners
  refreshHistoryBtn.addEventListener('click', loadSyncData);
});

// Load sync data
async function loadSyncData() {
  try {
    // Show loading spinner
    showLoading(true);
    
    // Get sync data from background script
    const response = await chrome.runtime.sendMessage({ type: 'GET_SYNC_DATA' });
    
    if (response && response.data) {
      const data = response.data;
      
      // Update summary cards
      document.getElementById('total-listings').textContent = data.totalListings || 0;
      document.getElementById('active-syncs').textContent = data.activeSyncs || 0;
      document.getElementById('last-sync').textContent = data.lastSync ? 
        new Date(data.lastSync).toLocaleString() : 'Never';
      
      // Update platform status
      updatePlatformStatus(data.platforms);
      
      // Update sync history
      updateSyncHistory(data.history);
    }
  } catch (error) {
    console.error('Error loading sync data:', error);
    
    // Show error in UI
    const errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    errorEl.textContent = 'Error loading sync data: ' + error.message;
    syncHistoryEl.innerHTML = '';
    syncHistoryEl.appendChild(errorEl);
    emptyHistoryEl.style.display = 'none';
  } finally {
    // Hide loading spinner
    showLoading(false);
  }
}

// Update platform status
function updatePlatformStatus(platforms) {
  if (!platforms) return;
  
  // Update each platform status
  Object.keys(platforms).forEach(platform => {
    const statusEl = document.getElementById(`${platform}-status`);
    if (statusEl) {
      const isConnected = platforms[platform];
      statusEl.textContent = isConnected ? 'Connected' : 'Disconnected';
      statusEl.className = `platform-badge badge--${isConnected ? 'connected' : 'disconnected'}`;
    }
  });
}

// Update sync history
function updateSyncHistory(history) {
  if (!history || history.length === 0) {
    emptyHistoryEl.style.display = 'block';
    return;
  }
  
  emptyHistoryEl.style.display = 'none';
  syncHistoryEl.innerHTML = '';
  
  // Create history items
  history.forEach(item => {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    
    // Format timestamp
    const timestamp = new Date(item.timestamp).toLocaleString();
    
    // Determine status class
    let statusClass = '';
    switch (item.status) {
      case 'success':
        statusClass = 'status-success';
        break;
      case 'error':
        statusClass = 'status-error';
        break;
      case 'pending':
        statusClass = 'status-pending';
        break;
      default:
        statusClass = 'status-neutral';
    }
    
    historyItem.innerHTML = `
      <div class="history-header">
        <div class="history-timestamp">${timestamp}</div>
        <div class="history-status ${statusClass}">${item.status}</div>
      </div>
      <div class="history-details">
        <div class="history-platform">${item.platform}</div>
        <div class="history-listings">${item.listingCount} listings</div>
      </div>
      ${item.message ? `<div class="history-message">${item.message}</div>` : ''}
    `;
    
    syncHistoryEl.appendChild(historyItem);
  });
}

// Show/hide loading spinner
function showLoading(show) {
  loadingSpinner.style.display = show ? 'block' : 'none';
}
