// options.js - AutoList Canada Extension
// Handles options page functionality and settings management

document.addEventListener('DOMContentLoaded', async function() {
  // Get DOM elements
  const consentBanner = document.getElementById('consent-banner');
  const acceptConsentBtn = document.getElementById('accept-consent');
  const reviewPoliciesBtn = document.getElementById('review-policies');
  
  const ebayToggle = document.getElementById('ebay-toggle');
  const etsyToggle = document.getElementById('etsy-toggle');
  const poshmarkToggle = document.getElementById('poshmark-toggle');
  
  const aiToneSelect = document.getElementById('ai-tone');
  const priceRoundingSelect = document.getElementById('price-rounding');
  
  const telemetryToggle = document.getElementById('telemetry-toggle');
  const remoteSyncToggle = document.getElementById('remote-sync-toggle');
  const remoteSyncConfig = document.getElementById('remote-sync-config');
  const syncEndpointInput = document.getElementById('sync-endpoint');
  const apiKeyInput = document.getElementById('api-key');
  
  const exportLogsBtn = document.getElementById('export-logs');
  const exportSettingsBtn = document.getElementById('export-settings');
  const clearDataBtn = document.getElementById('clear-data');
  const resetSettingsBtn = document.getElementById('reset-settings');
  
  const privacyPolicyLink = document.getElementById('privacy-policy-link');
  const termsOfUseLink = document.getElementById('terms-of-use-link');
  const dataSafetyLink = document.getElementById('data-safety-link');
  
  const saveSettingsBtn = document.getElementById('save-settings');
  const resetChangesBtn = document.getElementById('reset-changes');
  
  // Load current settings
  await loadSettings();
  
  // Set up event listeners
  setupEventListeners();
  
  // Update UI based on consent status
  updateConsentUI();
});

// Load current settings from storage
async function loadSettings() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
    
    if (response && response.settings) {
      const settings = response.settings;
      
      // Update connection toggles
      if (settings.connections) {
        document.getElementById('ebay-toggle').checked = settings.connections.ebay || false;
        document.getElementById('etsy-toggle').checked = settings.connections.etsy || false;
        document.getElementById('poshmark-toggle').checked = settings.connections.poshmark || false;
      }
      
      // Update AI preferences
      if (settings.ai) {
        document.getElementById('ai-tone').value = settings.ai.tone || 'trust-first';
        document.getElementById('price-rounding').value = settings.ai.priceRound || 'psych-99';
      }
      
      // Update privacy settings
      document.getElementById('telemetry-toggle').checked = settings.telemetry || false;
      
      if (settings.remoteSync) {
        document.getElementById('remote-sync-toggle').checked = settings.remoteSync.enabled || false;
        document.getElementById('sync-endpoint').value = settings.remoteSync.endpoint || '';
        document.getElementById('api-key').value = settings.remoteSync.apiKey || '';
      }
      
      // Update consent status
      updateConsentBanner(settings.consent);
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Set up event listeners
function setupEventListeners() {
  // Consent buttons
  document.getElementById('accept-consent').addEventListener('click', acceptConsent);
  document.getElementById('review-policies').addEventListener('click', reviewPolicies);
  
  // Connection toggles
  document.getElementById('ebay-toggle').addEventListener('change', () => toggleConnection('ebay'));
  document.getElementById('etsy-toggle').addEventListener('change', () => toggleConnection('etsy'));
  document.getElementById('poshmark-toggle').addEventListener('change', () => toggleConnection('poshmark'));
  
  // Remote sync toggle
  document.getElementById('remote-sync-toggle').addEventListener('change', toggleRemoteSyncConfig);
  
  // Data control buttons
  document.getElementById('export-logs').addEventListener('click', exportLogs);
  document.getElementById('export-settings').addEventListener('click', exportSettings);
  document.getElementById('clear-data').addEventListener('click', clearData);
  document.getElementById('reset-settings').addEventListener('click', resetSettings);
  
  // Legal links
  document.getElementById('privacy-policy-link').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: chrome.runtime.getURL('LEGAL/PRIVACY_POLICY.md') });
  });
  
  document.getElementById('terms-of-use-link').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: chrome.runtime.getURL('LEGAL/TERMS_OF_USE.md') });
  });
  
  document.getElementById('data-safety-link').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: chrome.runtime.getURL('LEGAL/DATA_SAFETY.md') });
  });
  
  // Save and reset buttons
  document.getElementById('save-settings').addEventListener('click', saveSettings);
  document.getElementById('reset-changes').addEventListener('click', loadSettings);
}

// Update consent banner visibility
function updateConsentBanner(consentGiven) {
  const consentBanner = document.getElementById('consent-banner');
  if (consentBanner) {
    consentBanner.style.display = consentGiven ? 'none' : 'block';
  }
}

// Update UI based on consent status
function updateConsentUI() {
  chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (response) => {
    if (response && response.settings) {
      const hasConsent = response.settings.consent;
      
      // Disable telemetry and remote sync if no consent
      if (!hasConsent) {
        document.getElementById('telemetry-toggle').disabled = true;
        document.getElementById('remote-sync-toggle').disabled = true;
        
        // Disable remote sync config
        const inputs = document.querySelectorAll('#remote-sync-config input');
        inputs.forEach(input => input.disabled = true);
      }
    }
  });
}

// Accept consent
async function acceptConsent() {
  try {
    await chrome.runtime.sendMessage({
      type: 'UPDATE_SETTINGS',
      updates: { consent: true }
    });
    
    updateConsentBanner(true);
    updateConsentUI();
  } catch (error) {
    console.error('Error accepting consent:', error);
  }
}

// Review policies
function reviewPolicies() {
  chrome.tabs.create({ url: chrome.runtime.getURL('LEGAL/PRIVACY_POLICY.md') });
}

// Toggle connection and initiate OAuth flow if needed
async function toggleConnection(platform) {
  const toggle = document.getElementById(`${platform}-toggle`);
  const isChecked = toggle.checked;
  
  if (isChecked) {
    // Initiate OAuth flow
    try {
      // Generate state parameter for security
      const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Store state in session storage
      sessionStorage.setItem('oauth_state', state);
      
      // Build OAuth URL based on platform
      let oauthUrl;
      switch (platform) {
        case 'ebay':
          // eBay OAuth URL
          oauthUrl = `https://auth.ebay.com/oauth2/authorize?client_id=YOUR_EBAY_CLIENT_ID&response_type=code&redirect_uri=YOUR_EBAY_REDIRECT_URI&scope=https://api.ebay.com/oauth/api_scope&state=${state}`;
          break;
        case 'etsy':
          // Etsy OAuth URL
          oauthUrl = `https://www.etsy.com/oauth/connect?client_id=YOUR_ETSY_CLIENT_ID&response_type=code&redirect_uri=YOUR_ETSY_REDIRECT_URI&scope=email%20listings_r%20listings_w%20transactions_r&state=${state}`;
          break;
        case 'poshmark':
          // Poshmark OAuth URL (using our redirect page)
          oauthUrl = `https://poshmark.com/login?redirect_to=https%3A%2F%2Fwww.poshmark.com%2Foauth%2Fauthorize%3Fclient_id%3DYOUR_POSHMARK_CLIENT_ID%26response_type%3Dcode%26redirect_uri%3DYOUR_POSHMARK_REDIRECT_URI%26state%3D${state}`;
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
      
      // Open OAuth URL in new tab
      chrome.tabs.create({ url: oauthUrl });
      
      // Show notification to user
      alert(`Please complete the ${platform.charAt(0).toUpperCase() + platform.slice(1)} authentication in the new tab that opened.`);
    } catch (error) {
      console.error(`Error initiating ${platform} OAuth:`, error);
      alert(`Failed to initiate ${platform} authentication. Please try again.`);
      // Reset toggle if OAuth failed
      toggle.checked = false;
    }
  } else {
    // Disconnect - remove stored tokens
    try {
      // In a real implementation, this would revoke tokens with the platform
      console.log(`Disconnected from ${platform}`);
    } catch (error) {
      console.error(`Error disconnecting from ${platform}:`, error);
    }
  }
}

// Toggle remote sync config visibility
function toggleRemoteSyncConfig() {
  const isEnabled = document.getElementById('remote-sync-toggle').checked;
  document.getElementById('remote-sync-config').style.display = isEnabled ? 'block' : 'none';
}

// Export logs
async function exportLogs() {
  try {
    // In a real implementation, this would export actual logs
    const logs = {
      timestamp: new Date().toISOString(),
      message: 'Log export functionality would be implemented here'
    };
    
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `autolist-logs-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting logs:', error);
  }
}

// Export settings
async function exportSettings() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
    
    if (response && response.settings) {
      const blob = new Blob([JSON.stringify(response.settings, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `autolist-settings-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Error exporting settings:', error);
  }
}

// Clear data
async function clearData() {
  if (confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
    try {
      await chrome.runtime.sendMessage({ type: 'CLEAR_DATA' });
      alert('Local data cleared successfully');
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('Error clearing data: ' + error.message);
    }
  }
}

// Reset settings
async function resetSettings() {
  if (confirm('Are you sure you want to reset all settings to default? This cannot be undone.')) {
    try {
      await chrome.runtime.sendMessage({ type: 'RESET_SETTINGS' });
      await loadSettings();
      alert('Settings reset to default');
    } catch (error) {
      console.error('Error resetting settings:', error);
      alert('Error resetting settings: ' + error.message);
    }
  }
}

// Save settings
async function saveSettings() {
  try {
    const settings = {
      connections: {
        ebay: document.getElementById('ebay-toggle').checked,
        etsy: document.getElementById('etsy-toggle').checked,
        poshmark: document.getElementById('poshmark-toggle').checked
      },
      ai: {
        tone: document.getElementById('ai-tone').value,
        priceRound: document.getElementById('price-rounding').value
      },
      telemetry: document.getElementById('telemetry-toggle').checked,
      remoteSync: {
        enabled: document.getElementById('remote-sync-toggle').checked,
        endpoint: document.getElementById('sync-endpoint').value,
        apiKey: document.getElementById('api-key').value
      }
    };
    
    // Apply consent gate
    const response = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
    if (response && response.settings) {
      settings.consent = response.settings.consent;
      
      // Enforce consent gate
      if (!settings.consent) {
        settings.telemetry = false;
        settings.remoteSync.enabled = false;
      }
    }
    
    await chrome.runtime.sendMessage({
      type: 'UPDATE_SETTINGS',
      updates: settings
    });
    
    alert('Settings saved successfully');
  } catch (error) {
    console.error('Error saving settings:', error);
    alert('Error saving settings: ' + error.message);
  }
}
