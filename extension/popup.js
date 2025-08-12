document.addEventListener('DOMContentLoaded', function() {
  // Initialize language toggle functionality
  const languageToggle = document.getElementById('languageToggle');
  const languageDisplay = document.getElementById('languageDisplay');
  let currentLanguage = 'en';
  
  // Check if we have a saved language preference
  chrome.storage.sync.get(['language'], function(result) {
    if (result.language) {
      currentLanguage = result.language;
      languageDisplay.textContent = currentLanguage.toUpperCase();
      translateUI(currentLanguage);
    }
  });
  
  // Toggle language when button is clicked
  languageToggle.addEventListener('click', function() {
    currentLanguage = currentLanguage === 'en' ? 'fr' : 'en';
    languageDisplay.textContent = currentLanguage.toUpperCase();
    
    // Save language preference
    chrome.storage.sync.set({ language: currentLanguage });
    
    // Update UI text
    translateUI(currentLanguage);
  });
  
  // Initialize action buttons
  const captureBtn = document.getElementById('captureBtn');
  const viewListingsBtn = document.getElementById('viewListingsBtn');
  
  captureBtn.addEventListener('click', function() {
    // Get the active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      // Send a message to the content script
      chrome.tabs.sendMessage(tabs[0].id, {action: "captureListing"}, function(response) {
        if (response && response.success) {
          addActivityItem(translations[currentLanguage].listing_captured);
        } else {
          addActivityItem(translations[currentLanguage].capture_failed);
        }
      });
    });
  });
  
  viewListingsBtn.addEventListener('click', function() {
    // Open dashboard in new tab
    chrome.tabs.create({url: "https://autolistcanada.com/listings.html"});
  });
  
  // Check connection status
  checkConnectionStatus();
  
  // Load and display recent activity
  loadRecentActivity();
});

// Function to check connection status with backend
function checkConnectionStatus() {
  const statusIndicator = document.getElementById('connectionStatus');
  const statusText = document.querySelector('.status-text');
  
  // Simulate a check - in real implementation, this would contact the backend
  const isConnected = true; // Replace with actual check
  
  if (isConnected) {
    statusIndicator.classList.add('connected');
    statusIndicator.classList.remove('disconnected');
  } else {
    statusIndicator.classList.add('disconnected');
    statusIndicator.classList.remove('connected');
    statusText.textContent = translations[currentLanguage].disconnected || 'Disconnected';
  }
}

// Function to load recent activity
function loadRecentActivity() {
  const activityList = document.getElementById('activityList');
  
  // Get stored activity from Chrome storage
  chrome.storage.local.get(['recentActivity'], function(result) {
    if (result.recentActivity && result.recentActivity.length > 0) {
      // Clear the empty state message
      activityList.innerHTML = '';
      
      // Add each activity to the list
      result.recentActivity.forEach(activity => {
        const li = document.createElement('li');
        li.className = 'activity-item';
        li.textContent = activity;
        activityList.appendChild(li);
      });
    }
  });
}

// Function to add a new activity item
function addActivityItem(text) {
  const activityList = document.getElementById('activityList');
  
  // Remove empty state message if present
  const emptyState = activityList.querySelector('.empty-state');
  if (emptyState) {
    activityList.removeChild(emptyState);
  }
  
  // Create new activity item
  const li = document.createElement('li');
  li.className = 'activity-item';
  li.textContent = text;
  
  // Add to the top of the list
  activityList.insertBefore(li, activityList.firstChild);
  
  // Store in Chrome storage (limited to last 10 items)
  chrome.storage.local.get(['recentActivity'], function(result) {
    let activities = result.recentActivity || [];
    activities.unshift(text);
    activities = activities.slice(0, 10); // Keep only last 10
    
    chrome.storage.local.set({ recentActivity: activities });
  });
}

// Translations for UI elements
const translations = {
  en: {
    connection_status: 'Connected',
    disconnected: 'Disconnected',
    capture_listing: 'Capture Listing',
    view_listings: 'View Listings',
    cross_list_to: 'Cross-list to',
    recent_activity: 'Recent Activity',
    no_recent_activity: 'No recent activity',
    go_to_dashboard: 'Go to Dashboard',
    settings: 'Settings',
    toggle_language: 'Toggle Language',
    autolist_canada: 'AutoList Canada',
    listing_captured: 'Listing captured successfully',
    capture_failed: 'Failed to capture listing'
  },
  fr: {
    connection_status: 'Connecté',
    disconnected: 'Déconnecté',
    capture_listing: 'Capturer l\'annonce',
    view_listings: 'Voir les annonces',
    cross_list_to: 'Publier sur',
    recent_activity: 'Activité récente',
    no_recent_activity: 'Aucune activité récente',
    go_to_dashboard: 'Accéder au tableau de bord',
    settings: 'Paramètres',
    toggle_language: 'Changer de langue',
    autolist_canada: 'AutoList Canada',
    listing_captured: 'Annonce capturée avec succès',
    capture_failed: 'Échec de la capture de l\'annonce'
  }
};

// Function to translate UI elements based on current language
function translateUI(language) {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[language] && translations[language][key]) {
      el.textContent = translations[language][key];
    }
  });
  
  // Also handle attributes with translations
  const attrElements = document.querySelectorAll('[data-i18n-alt], [data-i18n-title]');
  attrElements.forEach(el => {
    if (el.hasAttribute('data-i18n-alt')) {
      const key = el.getAttribute('data-i18n-alt');
      if (translations[language] && translations[language][key]) {
        el.setAttribute('alt', translations[language][key]);
      }
    }
    
    if (el.hasAttribute('data-i18n-title')) {
      const key = el.getAttribute('data-i18n-title');
      if (translations[language] && translations[language][key]) {
        el.setAttribute('title', translations[language][key]);
      }
    }
  });
}
