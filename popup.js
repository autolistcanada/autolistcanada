// popup.js - AutoList Canada Crosslist Pro
// Main entry point for the AutoList Canada Chrome Extension

// API Configuration
const API_BASE_URL = 'https://autolistcanada.ca/api';
const API_ENDPOINTS = {
  SYNC: `${API_BASE_URL}/sync-listing`,
  CONNECT_PLATFORM: `${API_BASE_URL}/connect`,
  GET_LISTINGS: `${API_BASE_URL}/listings`,
  AI_SUGGESTIONS: `${API_BASE_URL}/ai/suggestions`
};

// Platform configuration
const PLATFORMS = {
  EBAY: { id: 'ebay', name: 'eBay', icon: 'ebay.svg', color: '#0064D2' },
  POSHMARK: { id: 'poshmark', name: 'Poshmark', icon: 'poshmark.svg', color: '#E82B63' },
  ETSY: { id: 'etsy', name: 'Etsy', icon: 'etsy.svg', color: '#F16521' },
  FACEBOOK: { id: 'facebook', name: 'Facebook Marketplace', icon: 'facebook.svg', color: '#1877F2' },
  KIJIJI: { id: 'kijiji', name: 'Kijiji', icon: 'kijiji.png', color: '#FF5C00' },
  DEPOP: { id: 'depop', name: 'Depop', icon: 'depop.svg', color: '#000000' },
  MERCARI: { id: 'mercari', name: 'Mercari', icon: 'mercari.svg', color: '#FF5C5C' },
  SHOPIFY: { id: 'shopify', name: 'Shopify', icon: 'shopify.svg', color: '#7AB55C' },
  WALMART: { id: 'walmart', name: 'Walmart', icon: 'walmart.svg', color: '#0071CE' },
  AMAZON: { id: 'amazon', name: 'Amazon', icon: 'amazon.svg', color: '#FF9900' },
  LETGO: { id: 'letgo', name: 'Letgo', icon: 'letgo.svg', color: '#FFAA4A' },
  OFFERUP: { id: 'offerup', name: 'OfferUp', icon: 'offerup.svg', color: '#90D400' }
};

// DOM Elements
const elements = {
  // Main containers
  app: document.querySelector('.app-container'),
  mainContent: document.querySelector('.main-content'),
  onboarding: document.getElementById('onboarding-walkthrough'),
  platformsGrid: document.getElementById('platforms-grid'),
  listingsGrid: document.getElementById('listings-grid'),
  emptyState: document.getElementById('empty-state'),
  aiPanel: document.getElementById('ai-panel'),
  statusMessage: document.getElementById('status-message'),
  syncProgress: document.getElementById('sync-progress'),
  syncStatusText: document.getElementById('sync-status-text'),
  
  // Buttons
  minimizeBtn: document.getElementById('minimize-btn'),
  pinBtn: document.getElementById('pin-btn'),
  closeBtn: document.getElementById('close-btn'),
  syncNowBtn: document.getElementById('sync-now-btn'),
  demoListingBtn: document.getElementById('demo-listing-btn'),
  closeAiPanelBtn: document.querySelector('.close-ai-panel'),
  applyAllBtn: document.getElementById('apply-all-btn'),
  
  // AI Panel
  aiTitle: document.getElementById('ai-title'),
  aiDescription: document.getElementById('ai-description'),
  aiTags: document.getElementById('ai-tags'),
  aiPrice: document.getElementById('ai-price')
};

// Application State
const state = {
  // User data
  user: {
    id: null,
    email: null,
    plan: 'free',
    connectedPlatforms: new Set(),
    preferences: {
      autoSync: true,
      notifications: true,
      theme: 'light'
    }
  },
  
  // Listings
  listings: [],
  selectedListings: new Set(),
  filteredListings: [],
  currentListing: null,
  
  // UI State
  isPinned: false,
  isMinimized: false,
  isSyncing: false,
  showAiPanel: false,
  onboardingStep: 0,
  
  // Platform connections
  platformStatus: {}
};

// Utility Functions
const utils = {
  // DOM Helpers
  $(selector) {
    return document.querySelector(selector);
  },
  
  $$(selector) {
    return document.querySelectorAll(selector);
  },
  
  createElement(tag, className, text = '') {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  },
  
  // Format price
  formatPrice(price) {
    if (!price) return '$0.00';
    
    // Remove any existing currency symbols and parse
    const cleanPrice = price.toString().replace(/[^0-9.-]+/g, '');
    const num = parseFloat(cleanPrice);
    
    if (isNaN(num)) return price;
    
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(num);
  },
  
  // Show status message
  showStatus(message, type = 'info', duration = 3000) {
    if (!elements.statusMessage) return;
    
    elements.statusMessage.textContent = message;
    elements.statusMessage.className = `status-message ${type}`;
    
    if (duration > 0) {
      setTimeout(() => {
        if (elements.statusMessage.textContent === message) {
          elements.statusMessage.textContent = 'Ready';
          elements.statusMessage.className = 'status-message info';
        }
      }, duration);
    }
  },
  
  // Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// Initialize the application
async function init() {
  try {
    // Load user data and state
    await loadUserData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Render initial UI
    renderPlatforms();
    
    // Load listings
    await loadListings();
    
    // Show onboarding if first time
    checkOnboarding();
    
    // Start periodic sync if enabled
    if (state.user.preferences.autoSync) {
      startAutoSync();
    }
    
    // Update last sync time
    updateLastSyncTime();
    
  } catch (error) {
    console.error('Initialization error:', error);
    utils.showStatus('Failed to initialize the extension', 'error');
  }
}

// Load user data from Chrome storage
async function loadUserData() {
  try {
    const data = await chrome.storage.sync.get(['user', 'connectedPlatforms', 'preferences']);
    
    if (data.user) {
      state.user = { ...state.user, ...data.user };
    }
    
    if (data.connectedPlatforms) {
      state.user.connectedPlatforms = new Set(data.connectedPlatforms);
    }
    
    if (data.preferences) {
      state.user.preferences = { ...state.user.preferences, ...data.preferences };
    }
  } catch (error) {
    console.warn('Failed to load user data:', error);
  }
}

// Set up event listeners
function setupEventListeners() {
  // Window controls
  elements.minimizeBtn?.addEventListener('click', toggleMinimize);
  elements.pinBtn?.addEventListener('click', togglePin);
  elements.closeBtn?.addEventListener('click', closeWindow);
  
  // Sync button
  elements.syncNowBtn?.addEventListener('click', triggerSync);
  
  // Demo listing button
  elements.demoListingBtn?.addEventListener('click', showDemoListing);
  
  // AI panel
  elements.closeAiPanelBtn?.addEventListener('click', closeAIPanel);
  elements.applyAllBtn?.addEventListener('click', applyAllAISuggestions);
  
  // Onboarding
  const skipBtn = elements.onboarding?.querySelector('.skip-btn');
  const nextBtn = elements.onboarding?.querySelector('.next-btn');
  
  skipBtn?.addEventListener('click', skipOnboarding);
  nextBtn?.addEventListener('click', nextOnboardingStep);
  
  // Handle window resize
  window.addEventListener('resize', handleResize);
  
  // Crosslist modal
  const crosslistModal = document.getElementById('crosslist-modal');
  const crosslistCancel = document.getElementById('crosslist-cancel');
  const crosslistEdit = document.getElementById('crosslist-edit');
  const crosslistFinish = document.getElementById('crosslist-finish');
  
  crosslistCancel?.addEventListener('click', () => {
    if (crosslistModal) crosslistModal.style.display = 'none';
  });
  
  crosslistEdit?.addEventListener('click', () => {
    if (crosslistModal) crosslistModal.style.display = 'none';
    showAIPanel(state.currentListing);
  });
  
  crosslistFinish?.addEventListener('click', finishCrosslisting);
}

// Toggle window minimize
function toggleMinimize() {
  state.isMinimized = !state.isMinimized;
  elements.app?.classList.toggle('minimized', state.isMinimized);
  
  // Update icon
  const icon = elements.minimizeBtn?.querySelector('i');
  if (icon) {
    icon.className = state.isMinimized ? 'fas fa-window-maximize' : 'fas fa-window-minimize';
  }
  
  // Save state
  saveUIState();
}

// Toggle window pin
function togglePin() {
  state.isPinned = !state.isPinned;
  elements.pinBtn?.classList.toggle('active', state.isPinned);
  
  // Update icon
  const icon = elements.pinBtn?.querySelector('i');
  if (icon) {
    icon.style.transform = state.isPinned ? 'rotate(45deg)' : 'none';
  }
  
  // Save state
  saveUIState();
}

// Close window
function closeWindow() {
  window.close();
}

// Save UI state to storage
function saveUIState() {
  chrome.storage.sync.set({
    uiState: {
      isPinned: state.isPinned,
      isMinimized: state.isMinimized
    }
  }).catch(err => {
    console.warn('Failed to save UI state:', err);
  });
}

// Handle window resize
function handleResize() {
  // Adjust UI elements based on window size
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  // Adjust grid layouts for responsiveness
  if (elements.listingsGrid) {
    elements.listingsGrid.classList.toggle('compact', width < 400);
  }
}

// Render connected platforms
function renderPlatforms() {
  if (!elements.platformsGrid) return;
  
  // Clear existing content
  elements.platformsGrid.innerHTML = '';
  
  // Render each platform
  Object.values(PLATFORMS).forEach(platform => {
    const isConnected = state.user.connectedPlatforms.has(platform.id);
    const status = state.platformStatus[platform.id] || {};
    
    const platformCard = document.createElement('div');
    platformCard.className = `platform-card ${isConnected ? 'connected' : ''}`;
    platformCard.innerHTML = `
      <div class="platform-icon">
        <img src="assets/${platform.icon}" alt="${platform.name}" onerror="this.src='assets/placeholder.png'">
      </div>
      <div class="platform-info">
        <h4>${platform.name}</h4>
        <p>${isConnected ? 'Connected' : 'Not connected'}</p>
        ${status.lastSync ? `<span class="last-sync">Last sync: ${new Date(status.lastSync).toLocaleTimeString()}</span>` : ''}
      </div>
      <div class="platform-status">
        <i class="fas ${isConnected ? 'fa-check-circle' : 'fa-plug'}"></i>
      </div>
    `;
    
    platformCard.addEventListener('click', () => handlePlatformClick(platform));
    elements.platformsGrid.appendChild(platformCard);
  });
}

function renderListings() {
  if (!elements.listingsGrid) return;
  
  // Clear existing content
  elements.listingsGrid.innerHTML = '';
  
  if (state.listings.length === 0) {
    showEmptyState();
    return;
  }
  
  // Render each listing
  state.listings.forEach((listing, index) => {
    const listingCard = createListingCard(listing, index);
    elements.listingsGrid.appendChild(listingCard);
  });
  
  // Update selection status
  updateSelectionStatus();
}

// Create a single listing card element
function createListingCard(listing, index) {
  const card = document.createElement('div');
  card.className = `listing-card ${state.selectedListings.has(index) ? 'selected' : ''}`;
  card.dataset.index = index;
  
  card.innerHTML = `
    <div class="listing-image">
      <img src="${listing.image || 'assets/placeholder.png'}" alt="${listing.title}" onerror="this.src='assets/placeholder.png'">
      <div class="listing-overlay">
        <button class="icon-btn listing-action" data-action="crosslist" title="Crosslist">
          <i class="fas fa-share-alt"></i>
        </button>
        <button class="icon-btn listing-action" data-action="sync" title="Sync">
          <i class="fas fa-sync-alt"></i>
        </button>
        <button class="icon-btn listing-action" data-action="ai-enhance" title="Edit with AI">
          <i class="fas fa-robot"></i>
        </button>
        <button class="icon-btn listing-action" data-action="view" title="View">
          <i class="fas fa-eye"></i>
        </button>
      </div>
    </div>
    <div class="listing-info">
      <h3 class="listing-title">${listing.title}</h3>
      <p class="listing-price">${utils.formatPrice(listing.price)}</p>
      <div class="listing-platform">
        <span class="platform-tag ${listing.platform.toLowerCase().replace(' ', '-')}">${listing.platform}</span>
      </div>
    </div>
  `;
  
  // Add event listeners
  card.addEventListener('click', (e) => {
    // Don't toggle selection if clicking on action buttons
    if (e.target.closest('.listing-action')) return;
    
    toggleListingSelection(index);
  });
  
  // Add action button listeners
  const actionButtons = card.querySelectorAll('.listing-action');
  actionButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = button.dataset.action;
      handleListingAction(action, index);
    });
  });
  
  return card;
}

// Toggle selection of a listing
function toggleListingSelection(index) {
  if (state.selectedListings.has(index)) {
    state.selectedListings.delete(index);
  } else {
    state.selectedListings.add(index);
  }
  
  // Update UI
  const card = elements.listingsGrid.querySelector(`.listing-card[data-index="${index}"]`);
  if (card) {
    card.classList.toggle('selected', state.selectedListings.has(index));
  }
  
  // Update selection count in status bar
  updateSelectionStatus();
}

// Handle listing actions (AI enhance, crosslist, etc.)
function handleListingAction(action, index) {
  const listing = state.listings[index];
  if (!listing) return;
  
  switch (action) {
    case 'ai-enhance':
      showAIPanel(listing);
      break;
      
    case 'crosslist':
      showCrosslistDialog(listing);
      break;
      
    case 'sync':
      syncListing(listing);
      break;
      
    case 'view':
      viewListing(listing);
      break;
      
    default:
      console.warn('Unknown action:', action);
  }
}

// Sync a listing with connected platforms
function syncListing(listing) {
  // Show syncing status
  utils.showStatus(`Syncing ${listing.title}...`, 'info');
  
  // Simulate API call to sync listing
  setTimeout(() => {
    // Update listing with sync info
    listing.lastSynced = new Date().toISOString();
    
    // Update UI
    renderListings();
    
    // Show success message
    utils.showStatus(`${listing.title} synced successfully!`, 'success');
    
    // Update sync status in header
    const syncStatusText = document.getElementById('sync-status-text');
    if (syncStatusText) {
      syncStatusText.textContent = `Last synced: Just now`;
    }
  }, 1500);
}

// View a listing in a new tab
function viewListing(listing) {
  if (listing.url) {
    chrome.tabs.create({ url: listing.url });
  } else {
    utils.showStatus('No URL available for this listing', 'error');
  }
}

// Show crosslist dialog with platform selection
function showCrosslistDialog(listing) {
  state.currentListing = listing;
  
  // Get crosslist modal and platform selection container
  const crosslistModal = document.getElementById('crosslist-modal');
  const platformSelection = document.getElementById('crosslist-platforms');
  
  if (!crosslistModal || !platformSelection) {
    console.error('Crosslist modal elements not found');
    return;
  }
  
  // Generate platform selection checkboxes
  let platformHTML = '';
  Object.values(PLATFORMS).forEach(platform => {
    const isConnected = state.user.connectedPlatforms.has(platform.id);
    platformHTML += `
      <div class="platform-option ${isConnected ? 'connected' : 'disconnected'}">
        <input type="checkbox" id="platform-${platform.id}" value="${platform.id}" 
               ${isConnected ? '' : 'disabled'}>
        <label for="platform-${platform.id}">
          <img src="assets/${platform.icon}" alt="${platform.name}" class="platform-icon">
          <span class="platform-name">${platform.name}</span>
          ${!isConnected ? '<span class="status-badge disconnected">Not connected</span>' : ''}
        </label>
      </div>
    `;
  });
  
  platformSelection.innerHTML = platformHTML;
  
  // Show modal
  crosslistModal.classList.add('active');
}

// Show AI enhancement panel for a listing
function showAIPanel(listing) {
  state.currentListing = listing;
  state.showAiPanel = true;
  
  if (elements.aiPanel) {
    elements.aiPanel.classList.add('visible');
    
    // Load AI suggestions
    loadAISuggestions(listing);
  }
}

// Close AI panel
function closeAIPanel() {
  state.showAiPanel = false;
  state.currentListing = null;
  
  if (elements.aiPanel) {
    elements.aiPanel.classList.remove('visible');
  }
}

// Load AI suggestions for a listing
async function loadAISuggestions(listing) {
  try {
    // Show loading state
    if (elements.aiTitle) {
      elements.aiTitle.innerHTML = '<div class="suggestion-text">Generating suggestions...</div>';
    }
    if (elements.aiDescription) {
      elements.aiDescription.innerHTML = '<div class="suggestion-text">Generating suggestions...</div>';
    }
    if (elements.aiTags) {
      elements.aiTags.innerHTML = '<div class="suggestion-text">Generating suggestions...</div>';
    }
    if (elements.aiPrice) {
      elements.aiPrice.innerHTML = '<div class="suggestion-text">Analyzing optimal price...</div>';
    }
    
    // In a real implementation, this would make an API call
    // For now, simulate with dummy data
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const suggestions = {
      title: `Enhanced: ${listing.title}`,
      description: `This is an enhanced description for ${listing.title}. It highlights the key features and benefits of the item to attract more buyers.`,
      tags: ['vintage', 'trendy', 'popular', 'quality', 'unique'],
      price: (parseFloat(listing.price) * 1.1).toFixed(2)
    };
    
    // Update UI with suggestions
    updateAISuggestionsUI(suggestions);
    
  } catch (error) {
    console.error('Error loading AI suggestions:', error);
    utils.showStatus('Failed to load AI suggestions', 'error');
  }
}

// Update AI suggestions in the UI
function updateAISuggestionsUI(suggestions) {
  // Title
  elements.aiTitle.innerHTML = `
    <div class="suggestion-content">${suggestions.title}</div>
    <div class="suggestion-actions">
      <button class="icon-btn btn-accept" title="Accept">
        <i class="fas fa-check"></i>
      </button>
      <button class="icon-btn btn-regenerate" title="Regenerate">
        <i class="fas fa-sync-alt"></i>
      </button>
    </div>
  `;
  
  // Description
  elements.aiDescription.innerHTML = `
    <div class="suggestion-content">${suggestions.description.replace(/\n/g, '<br>')}</div>
    <div class="suggestion-actions">
      <button class="icon-btn btn-accept" title="Accept">
        <i class="fas fa-check"></i>
      </button>
      <button class="icon-btn btn-regenerate" title="Regenerate">
        <i class="fas fa-sync-alt"></i>
      </button>
    </div>
  `;
  
  // Tags
  elements.aiTags.innerHTML = `
    <div class="suggestion-content">
      ${suggestions.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
    </div>
    <div class="suggestion-actions">
      <button class="icon-btn btn-accept" title="Accept">
        <i class="fas fa-check"></i>
      </button>
      <button class="icon-btn btn-regenerate" title="Regenerate">
        <i class="fas fa-sync-alt"></i>
      </button>
    </div>
  `;
  
  // Price
  elements.aiPrice.innerHTML = `
    <div class="suggestion-content">${utils.formatPrice(suggestions.price)}</div>
    <div class="suggestion-actions">
      <button class="icon-btn btn-accept" title="Accept">
        <i class="fas fa-check"></i>
      </button>
      <button class="icon-btn btn-regenerate" title="Regenerate">
        <i class="fas fa-sync-alt"></i>
      </button>
    </div>
  `;
  
  // Add event listeners for action buttons
  addAIActionListeners();
}

// Add event listeners for AI panel action buttons
function addAIActionListeners() {
  // Accept buttons
  document.querySelectorAll('.btn-accept').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const section = e.target.closest('.ai-section');
      if (section) {
        section.classList.add('accepted');
        utils.showStatus('Change applied successfully');
      }
    });
  });
  
  // Regenerate buttons
  document.querySelectorAll('.btn-regenerate').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const section = e.target.closest('.ai-section');
      if (section) {
        section.classList.add('regenerating');
        // In a real app, this would regenerate just this section
        setTimeout(() => {
          section.classList.remove('regenerating');
        }, 1000);
      }
    });
  });
}

// Update selection status in the status bar
function updateSelectionStatus() {
  const count = state.selectedListings.size;
  if (count > 0) {
    utils.showStatus(`${count} item${count > 1 ? 's' : ''} selected`, 'info', 0);
  } else {
    utils.showStatus('Ready', 'info', 0);
  }
}

// Handle platform connection click
function handlePlatformClick(platform) {
  if (state.user.connectedPlatforms.has(platform.id)) {
    // Already connected - show options
    showPlatformOptions(platform);
  } else {
    // Not connected - initiate connection
    connectPlatform(platform);
  }
}

// Show platform connection options
function showPlatformOptions(platform) {
  // In a real implementation, this would show a menu with options like:
  // - View connected account
  // - Disconnect
  // - Sync now
  // - Settings
  
  utils.showStatus(`${platform.name} is connected`, 'success');
}

// Connect to a platform
async function connectPlatform(platform) {
  try {
    utils.showStatus(`Connecting to ${platform.name}...`, 'info');
    
    // In a real implementation, this would open an OAuth flow or API connection
    // For now, simulate a successful connection
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Add to connected platforms
    state.user.connectedPlatforms.add(platform.id);
    
    // Save to storage
    await chrome.storage.sync.set({
      connectedPlatforms: Array.from(state.user.connectedPlatforms)
    });
    
    // Update UI
    await renderPlatforms();
    utils.showStatus(`Successfully connected to ${platform.name}`, 'success');
    
    // Trigger initial sync for this platform
    triggerSync([platform.id]);
    
  } catch (error) {
    console.error(`Error connecting to ${platform.name}:`, error);
    utils.showStatus(`Failed to connect to ${platform.name}`, 'error');
  }
}

// Trigger sync for specified platforms (or all if none specified)
async function triggerSync(platformIds = null) {
  if (state.isSyncing) {
    utils.showStatus('Sync already in progress', 'warning');
    return;
  }
  
  try {
    state.isSyncing = true;
    elements.syncProgress.classList.remove('hidden');
    
    // Determine which platforms to sync
    const platformsToSync = platformIds || Array.from(state.user.connectedPlatforms);
    
    if (platformsToSync.length === 0) {
      utils.showStatus('No platforms selected for sync', 'warning');
      return;
    }
    
    utils.showStatus(`Syncing ${platformsToSync.length} platform${platformsToSync.length > 1 ? 's' : ''}...`, 'info');
    
    // In a real implementation, this would make API calls to sync each platform
    // For now, simulate progress
    let progress = 0;
    const totalSteps = 100;
    const progressInterval = setInterval(() => {
      progress += 5;
      if (progress >= 100) {
        clearInterval(progressInterval);
        finishSync();
      } else {
        updateSyncProgress(progress, totalSteps);
      }
    }, 100);
    
    // Simulate API calls for each platform
    await Promise.all(platformsToSync.map(platformId => 
      syncPlatform(platformId)
    ));
    
    clearInterval(progressInterval);
    finishSync();
    
  } catch (error) {
    console.error('Sync error:', error);
    utils.showStatus('Sync failed', 'error');
    finishSync();
  }
}

// Sync a single platform
async function syncPlatform(platformId) {
  // In a real implementation, this would make an API call to sync the platform
  // For now, just simulate with a delay
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
  
  // Update platform status
  state.platformStatus[platformId] = {
    lastSync: new Date().toISOString(),
    status: 'success',
    newItems: Math.floor(Math.random() * 5)
  };
  
  return state.platformStatus[platformId];
}

// Update sync progress UI
function updateSyncProgress(progress, total) {
  const progressFill = elements.syncProgress.querySelector('.progress-fill');
  const progressText = elements.syncProgress.querySelector('.progress-text');
  
  if (progressFill) {
    progressFill.style.width = `${(progress / total) * 100}%`;
  }
  
  if (progressText) {
    progressText.textContent = `Syncing... ${progress}%`;
  }
}

// Finish sync process
function finishSync() {
  state.isSyncing = false;
  elements.syncProgress.classList.add('hidden');
  updateLastSyncTime();
  
  // Reload listings after sync
  loadListings();
}

// Platform icon file mapping (must match your /assets)
function platformIcon(platform) {
  const map = {
    "eBay": "ebay.svg",
    "Etsy": "etsy.svg",
    "Poshmark": "poshmark.svg",
    "Mercari": "mercari.svg",
    "Facebook Marketplace": "facebook.svg",
    "Grailed": "grailed.png",
    "Depop": "depop.svg",
    "Shopify": "shopify.svg",
    "Bonanza": "bonanza.svg",
    "Amazon": "amazon.webp",
    "VarageSale": "varagesale.png",
    "Kijiji": "kijiji.png"
  };
  return map[platform] || "icon48.png";
}

// --- OpenAI Integration ---
async function generateAIContent(listing) {
  const prompt = `Rewrite this product title and description to be more appealing for resale marketplaces:\nTitle: ${listing.title}\nPrice: ${listing.price}\nPlatform: ${listing.platform}`;
  const body = {
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 256,
    temperature: 0.7
  };
  const resp = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  if (!resp.ok) throw new Error("OpenAI error: " + resp.status);
  const data = await resp.json();
  const aiText = data.choices?.[0]?.message?.content || "";
  let [aiTitle, ...aiDesc] = aiText.split("\n");
  aiTitle = aiTitle.replace(/^Title:\s*/i, "").trim();
  aiDesc = aiDesc.join("\n").replace(/^Description:\s*/i, "").trim();
  return { title: aiTitle || aiText, description: aiDesc || "" };
}

// --- Airtable Integration ---
async function syncToAirtable(listing) {
  const record = {
    fields: {
      Title: listing.title,
      Price: listing.price,
      Platform: listing.platform,
      Image: listing.image || "",
      URL: listing.url || ""
    }
  };
  const resp = await fetch(AIRTABLE_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${AIRTABLE_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(record)
  });
  if (!resp.ok) throw new Error("Airtable error: " + resp.status);
  return await resp.json();
}

// --- Crosslist Logic (stub: open dashboard or show message) ---
function crosslistSelected() {
  showFeedback("Launching dashboard for crosslisting...", "teal");
  chrome.tabs.create({ url: "dashboard.html" });
}

// --- Main Logic ---
document.addEventListener("DOMContentLoaded", () => {
  // Initialize the app
  init();
  
  // Load demo data if in development
  if (process.env.NODE_ENV === 'development') {
    loadDemoData();
  }
});

// Load demo data for development
function loadDemoData() {
  state.listings = [
    {
      id: 'demo-1',
      title: 'Vintage Denim Jacket',
      price: '45.99',
      currency: 'CAD',
      platform: 'poshmark',
      image: 'https://via.placeholder.com/150',
      description: 'Vintage denim jacket in excellent condition. Size M.',
      tags: ['vintage', 'denim', 'jacket', 'casual']
    },
    {
      id: 'demo-2',
      title: 'Wireless Earbuds',
      price: '89.99',
      currency: 'CAD',
      platform: 'facebook',
      image: 'https://via.placeholder.com/150',
      description: 'Like new wireless earbuds with charging case.',
      tags: ['electronics', 'audio', 'wireless']
    }
  ];
  
  // Render the demo listings
  renderListings();
}

// Handle window resize for responsive design
window.addEventListener('resize', utils.debounce(() => {
  // Update any responsive elements
  if (state.showAiPanel) {
    positionAIPanel();
  }
}, 250));

// Handle clicks outside AI panel to close it
document.addEventListener('click', (e) => {
  if (state.showAiPanel && !elements.aiPanel.contains(e.target) && 
      !e.target.closest('.ai-enhance-btn')) {
    closeAIPanel();
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Close AI panel with Escape key
  if (e.key === 'Escape' && state.showAiPanel) {
    closeAIPanel();
    e.preventDefault();
  }
  
  // Select all with Ctrl+A
  if (e.ctrlKey && e.key === 'a') {
    e.preventDefault();
    state.listings.forEach((_, index) => {
      state.selectedListings.add(index);
    });
    renderListings();
    updateSelectionStatus();
  }
  
  // Deselect all with Ctrl+Shift+A
  if (e.ctrlKey && e.shiftKey && e.key === 'A') {
    e.preventDefault();
    state.selectedListings.clear();
    renderListings();
    updateSelectionStatus();
  }
});

// Handle platform connection status changes
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PLATFORM_CONNECTION_CHANGED') {
    const { platformId, connected } = message;
    
    if (connected) {
      state.user.connectedPlatforms.add(platformId);
    } else {
      state.user.connectedPlatforms.delete(platformId);
    }
    
    // Re-render platforms
    renderPlatforms();
    
    // If we just connected a platform, trigger a sync
    if (connected) {
      triggerSync([platformId]);
    }
  }
  
  // Handle incoming listing data from content script
  if (message.type === 'LISTINGS_UPDATED') {
    state.listings = message.listings || [];
    renderListings();
  }
  
  // Handle sync status updates
  if (message.type === 'SYNC_STATUS_UPDATE') {
    updateSyncStatusUI(message);
  }
});

// Update sync status in the UI
function updateSyncStatusUI(status) {
  if (!status) return;
  
  const { platformId, progress, message, error } = status;
  
  if (error) {
    utils.showStatus(`Sync failed for ${PLATFORMS[platformId]?.name || 'platform'}: ${error}`, 'error');
    return;
  }
  
  if (progress === 100) {
    utils.showStatus(`Sync completed for ${PLATFORMS[platformId]?.name || 'platform'}`, 'success');
    return;
  }
  
  if (message) {
    utils.showStatus(`${PLATFORMS[platformId]?.name || 'Platform'}: ${message}`, 'info', 0);
  }
}

// Position AI panel relative to the viewport
function positionAIPanel() {
  if (!state.showAiPanel) return;
  
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const panel = elements.aiPanel;
  
  // Position the panel in the center of the viewport
  const left = Math.max(20, (viewportWidth - panel.offsetWidth) / 2);
  const top = Math.max(20, (viewportHeight - panel.offsetHeight) / 2);
  
  panel.style.left = `${left}px`;
  panel.style.top = `${top}px`;
}

// Save user preferences to storage
async function saveUserPreferences() {
  try {
    await chrome.storage.sync.set({
      userPreferences: {
        ...state.user.preferences,
        lastUpdated: new Date().toISOString()
      }
    });
    
    // If auto-sync is enabled and we're not already syncing, start it
    if (state.user.preferences.autoSync && !state.isSyncing) {
      startAutoSync();
    }
    
    return true;
  } catch (error) {
    console.error('Error saving user preferences:', error);
    return false;
  }
}

// Toggle theme between light and dark
function toggleTheme() {
  const newTheme = state.user.preferences.theme === 'light' ? 'dark' : 'light';
  state.user.preferences.theme = newTheme;
  
  // Update the UI
  document.documentElement.setAttribute('data-theme', newTheme);
  
  // Save the preference
  saveUserPreferences();
}

// Initialize theme from user preferences
function initTheme() {
  const savedTheme = state.user.preferences.theme || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

// Initialize drag and drop for the popup
function initDragAndDrop() {
  const header = document.querySelector('.app-header');
  if (!header) return;
  
  let isDragging = false;
  let offsetX, offsetY;
  
  header.addEventListener('mousedown', (e) => {
    if (e.target.closest('button')) return; // Don't drag when clicking buttons
    
    isDragging = true;
    offsetX = e.clientX - window.screenX;
    offsetY = e.clientY - window.screenY;
    
    // Add a class to indicate dragging
    document.body.classList.add('dragging');
    
    e.preventDefault();
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    window.moveTo(
      e.clientX - offsetX,
      e.clientY - offsetY
    );
  });
  
  document.addEventListener('mouseup', () => {
    isDragging = false;
    document.body.classList.remove('dragging');
  });
}

// Add debounce to the utils object
utils.debounce = (func, wait) => {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
};

// Add a deep clone utility
utils.deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Onboarding Wizard Functions
function initOnboarding() {
  const onboardingContainer = document.getElementById('onboarding-walkthrough');
  if (!onboardingContainer) return;
  
  // Check if user has completed onboarding
  const hasCompletedOnboarding = localStorage.getItem('autolist_onboarding_completed');
  if (hasCompletedOnboarding) {
    onboardingContainer.style.display = 'none';
    return;
  }
  
  // Show onboarding
  onboardingContainer.style.display = 'block';
  showOnboardingStep(1);
  
  // Add event listeners for onboarding buttons
  onboardingContainer.addEventListener('click', (e) => {
    const target = e.target;
    
    if (target.classList.contains('next-btn')) {
      const currentStep = parseInt(target.closest('.onboarding-step').dataset.step);
      showOnboardingStep(currentStep + 1);
    } else if (target.classList.contains('skip-btn') || target.classList.contains('finish-btn')) {
      finishOnboarding();
    }
  });
}

function showOnboardingStep(stepNumber) {
  const steps = document.querySelectorAll('.onboarding-step');
  steps.forEach(step => {
    step.style.display = 'none';
  });
  
  const currentStep = document.querySelector(`.onboarding-step[data-step="${stepNumber}"]`);
  if (currentStep) {
    currentStep.style.display = 'block';
  }
}

function finishOnboarding() {
  const onboardingContainer = document.getElementById('onboarding-walkthrough');
  if (onboardingContainer) {
    onboardingContainer.style.display = 'none';
  }
  
  // Mark onboarding as completed
  localStorage.setItem('autolist_onboarding_completed', 'true');
  
  // Show welcome message
  utils.showStatus('Welcome to AutoList Canada! Ready to crosslist your items.', 'success');
}

// Add a utility to format numbers with commas
utils.formatNumber = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Add a utility to generate a unique ID
utils.generateId = (prefix = '') => {
  return `${prefix}${Math.random().toString(36).substr(2, 9)}`;
};

// Add a utility to check if an object is empty
utils.isEmpty = (obj) => {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
};

// Add a utility to validate email addresses
utils.isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

// Initialize the app when the window loads
window.onload = () => {
  // Set the initial theme
  initTheme();
  
  // Initialize drag and drop for the popup
  initDragAndDrop();
  
  // Set up any other window-level event listeners
  window.addEventListener('beforeunload', () => {
    // Clean up any resources or save state
    saveUIState();
  });
};

// Load listings from content script
async function loadListings() {
  try {
    // Show loading state
    if (elements.listingsGrid) {
      elements.listingsGrid.innerHTML = '<div class="loading">Loading listings...</div>';
    }
    
    // Query active tab for listings
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.url) {
      throw new Error('No active tab found');
    }
    
    // Send message to content script to get listings
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_LISTINGS' });
    
    if (response && response.listings) {
      state.listings = response.listings;
      renderListings();
    } else {
      showEmptyState();
    }
  } catch (error) {
    console.error('Failed to load listings:', error);
    showEmptyState();
  }
}

// Load listings when the popup is opened
loadListings();

// Set up event listeners for buttons
if (elements.syncNowBtn) {
  elements.syncNowBtn.addEventListener('click', () => {
    // In a real implementation, this would sync with the backend
    utils.showStatus('Syncing listings...', 'info');
    setTimeout(() => {
      utils.showStatus('Listings synced successfully!', 'success');
    }, 2000);
  });
}

if (elements.demoListingBtn) {
  elements.demoListingBtn.addEventListener('click', () => {
    // Add a demo listing
    const demoListing = {
      platform: 'eBay',
      title: 'Vintage Designer Handbag - Excellent Condition',
      price: '89.99',
      image: 'assets/placeholder.png'
    };
    state.listings.push(demoListing);
    renderListings();
    utils.showStatus('Demo listing added!', 'success');
  });
}

if (elements.closeAiPanelBtn) {
  elements.closeAiPanelBtn.addEventListener('click', closeAIPanel);
}

if (elements.applyAllBtn) {
  elements.applyAllBtn.addEventListener('click', () => {
    utils.showStatus('AI suggestions applied!', 'success');
    closeAIPanel();
  });
}

// Add event listeners for crosslist modal
const crosslistModal = document.getElementById('crosslist-modal');
const crosslistCancel = document.getElementById('crosslist-cancel');
const crosslistEdit = document.getElementById('crosslist-edit');
const crosslistFinish = document.getElementById('crosslist-finish');

if (crosslistCancel) {
  crosslistCancel.addEventListener('click', () => {
    if (crosslistModal) {
      crosslistModal.classList.remove('active');
    }
  });
}

if (crosslistEdit) {
  crosslistEdit.addEventListener('click', () => {
    if (crosslistModal) {
      crosslistModal.classList.remove('active');
    }
    showAIPanel(state.currentListing || state.listings[0]);
  });
}

// Finish crosslisting process
function finishCrosslisting() {
  // Get selected platforms
  const selectedCheckboxes = document.querySelectorAll('#crosslist-platforms input[type="checkbox"]:checked');
  const selectedPlatforms = Array.from(selectedCheckboxes).map(cb => cb.value);
  
  if (selectedPlatforms.length === 0) {
    utils.showStatus('Please select at least one platform', 'error');
    return;
  }
  
  // Hide modal
  const crosslistModal = document.getElementById('crosslist-modal');
  if (crosslistModal) {
    crosslistModal.classList.remove('active');
  }
  
  // Show status message
  utils.showStatus(`Crosslisting to ${selectedPlatforms.length} platform(s)...`, 'info');
  
  // Simulate crosslisting process
  setTimeout(() => {
    utils.showStatus(`Successfully crosslisted to ${selectedPlatforms.length} platform(s)!`, 'success');
    
    // Update UI to show crosslisted status
    if (state.currentListing) {
      state.currentListing.crosslisted = true;
      state.currentListing.crosslistedPlatforms = selectedPlatforms;
      renderListings();
    }
  }, 2000);
}

if (crosslistFinish) {
  crosslistFinish.addEventListener('click', finishCrosslisting);
}
