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
  
  // Update UI to show action is processing
  const syncStatus = document.getElementById('sync-status');
  syncStatus.textContent = `Processing ${action}...`;
  
  try {
    // Send action to background script
    const response = await chrome.runtime.sendMessage({
      type: 'RUN_ACTION',
      action: action
    });
    
    // Update status based on response
    if (response && response.success) {
      syncStatus.textContent = `${action} completed successfully`;
    } else {
      syncStatus.textContent = `Error: ${response ? response.error : 'Unknown error'}`;
    }
  } catch (error) {
    syncStatus.textContent = `Error: ${error.message}`;
    console.error('Error running action:', error);
  }
  
  // Clear status after 3 seconds
  setTimeout(() => {
    syncStatus.textContent = 'Ready';
  }, 3000);
}
