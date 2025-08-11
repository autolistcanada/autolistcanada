// popup.js - AutoList Canada Extension
// Handles popup UI interactions and background communication

document.addEventListener('DOMContentLoaded', async function() {
  // Get DOM elements
  const ebayChip = document.getElementById('ebay-chip');
  const etsyChip = document.getElementById('etsy-chip');
  const poshmarkChip = document.getElementById('poshmark-chip');
  const facebookChip = document.getElementById('facebook-chip');
  const depopChip = document.getElementById('depop-chip');
  const grailedChip = document.getElementById('grailed-chip');
  const kijijiChip = document.getElementById('kijiji-chip');
  const mercariChip = document.getElementById('mercari-chip');
  const varagesaleChip = document.getElementById('varagesale-chip');
  const shopifyChip = document.getElementById('shopify-chip');
  const offerupChip = document.getElementById('offerup-chip');
  const amazonChip = document.getElementById('amazon-chip');
  const bonanzaChip = document.getElementById('bonanza-chip');
  const letgoChip = document.getElementById('letgo-chip');
  const syncStatus = document.getElementById('sync-status');
  const openSettingsBtn = document.getElementById('open-settings');
  
  // Get all action tiles
  const tiles = document.querySelectorAll('.tile');
  
  // Load connection status
  await loadConnections();
  
  // Add event listeners to tiles
  tiles.forEach(tile => {
    tile.addEventListener('click', handleTileClick);
  });
  
  // Add event listener to settings button
  openSettingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  // Add event listener to sync visualizer tile
  const syncVisualizerTile = document.querySelector('[data-action="sync-visualizer"]');
  if (syncVisualizerTile) {
    syncVisualizerTile.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('sync.html') });
    });
  }
});

// Load connection status from storage
async function loadConnections() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_CONNECTIONS' });
    
    if (response && response.connections) {
      updateChipStatus('ebay-chip', response.connections.ebay);
      updateChipStatus('etsy-chip', response.connections.etsy);
      updateChipStatus('poshmark-chip', response.connections.poshmark);
      updateChipStatus('facebook-chip', response.connections.facebook);
      updateChipStatus('depop-chip', response.connections.depop);
      updateChipStatus('grailed-chip', response.connections.grailed);
      updateChipStatus('kijiji-chip', response.connections.kijiji);
      updateChipStatus('mercari-chip', response.connections.mercari);
      updateChipStatus('varagesale-chip', response.connections.varagesale);
      updateChipStatus('shopify-chip', response.connections.shopify);
      updateChipStatus('offerup-chip', response.connections.offerup);
      updateChipStatus('amazon-chip', response.connections.amazon);
      updateChipStatus('bonanza-chip', response.connections.bonanza);
      updateChipStatus('letgo-chip', response.connections.letgo);
    }
  } catch (error) {
    console.error('Error loading connections:', error);
  }
}

// Update chip status (connected/disconnected)
function updateChipStatus(chipId, isConnected) {
  const chip = document.getElementById(chipId);
  if (chip) {
    chip.classList.remove('chip--connected', 'chip--disconnected');
    chip.classList.add(isConnected ? 'chip--connected' : 'chip--disconnected');
  }
}

// Handle tile clicks
async function handleTileClick(event) {
  const tile = event.currentTarget;
  const action = tile.dataset.action;
  
  if (!action) return;
  
  // Special handling for sync-visualizer and settings
  if (action === 'sync-visualizer') {
    chrome.tabs.create({ url: chrome.runtime.getURL('sync.html') });
    return;
  }
  
  if (action === 'settings') {
    chrome.runtime.openOptionsPage();
    return;
  }
  
  // Send ALC_ACTION to the active tab
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (activeTab && activeTab.id) {
      await chrome.tabs.sendMessage(activeTab.id, {
        type: 'ALC_ACTION',
        action: action
      });
      
      // Update UI to show action is processing
      const syncStatus = document.getElementById('sync-status');
      syncStatus.textContent = `${action} sent to active tab`;
      
      // Clear status after 3 seconds
      setTimeout(() => {
        syncStatus.textContent = 'Ready';
      }, 3000);
    }
  } catch (error) {
    console.error('Error sending action to active tab:', error);
    const syncStatus = document.getElementById('sync-status');
    syncStatus.textContent = `Error: ${error.message}`;
    
    // Clear status after 3 seconds
    setTimeout(() => {
      syncStatus.textContent = 'Ready';
    }, 3000);
  }
}
