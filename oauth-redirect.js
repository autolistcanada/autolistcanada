// oauth-redirect.js - Handle OAuth redirect and communicate with background script

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const state = urlParams.get('state');
const error = urlParams.get('error');

// Determine platform from URL or session storage
let platformId = urlParams.get('platform') || sessionStorage.getItem('oauth_platform');

// If we don't have a platform yet, try to determine from referrer
if (!platformId && document.referrer) {
  const referrer = new URL(document.referrer);
  if (referrer.hostname.includes('ebay')) {
    platformId = 'ebay';
  } else if (referrer.hostname.includes('etsy')) {
    platformId = 'etsy';
  } else if (referrer.hostname.includes('poshmark')) {
    platformId = 'poshmark';
  } else if (referrer.hostname.includes('facebook')) {
    platformId = 'facebook';
  }
}

// Store platform in session storage for later use
if (platformId) {
  sessionStorage.setItem('oauth_platform', platformId);
}

// DOM elements
const processingElement = document.getElementById('processing');
const successElement = document.getElementById('success');
const errorElement = document.getElementById('error');
const errorMessageElement = document.getElementById('error-message');
const retryButton = document.getElementById('retry-btn');

// Handle OAuth response
async function handleOAuthResponse() {
  // Check for errors
  if (error) {
    showError(`Authentication error: ${error}`);
    return;
  }
  
  // Verify state parameter
  const expectedState = sessionStorage.getItem('oauth_state');
  if (state !== expectedState) {
    showError('Invalid state parameter. Possible security issue.');
    return;
  }
  
  // Verify we have a code and platform
  if (!code || !platformId) {
    showError('Missing authentication data.');
    return;
  }
  
  try {
    // Exchange code for token
    const tokenResponse = await exchangeCodeForToken(platformId, code);
    
    // Send success response to background script
    await chrome.runtime.sendMessage({
      type: 'OAUTH_RESPONSE',
      success: true,
      token: tokenResponse.accessToken,
      refreshToken: tokenResponse.refreshToken,
      state: state,
      platformId: platformId
    });
    
    // Show success message
    processingElement.classList.add('hidden');
    successElement.classList.remove('hidden');
  } catch (err) {
    console.error('Error during OAuth flow:', err);
    showError(`Authentication failed: ${err.message}`);
  }
}

// Exchange authorization code for access token
async function exchangeCodeForToken(platformId, code) {
  // Make real API call to exchange the code for a token
  switch (platformId) {
    case 'ebay':
      return await exchangeEbayCodeForToken(code);
    case 'etsy':
      return await exchangeEtsyCodeForToken(code);
    case 'poshmark':
      return await exchangePoshmarkCodeForToken(code);
    case 'facebook':
      return await exchangeFacebookCodeForToken(code);
    default:
      throw new Error(`Unsupported platform: ${platformId}`);
  }
}

// Exchange eBay authorization code for access token
async function exchangeEbayCodeForToken(code) {
  const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${EBAY_CLIENT_ID}:${EBAY_CLIENT_SECRET}`)
    },
    body: `grant_type=authorization_code&code=${code}&redirect_uri=${EBAY_REDIRECT_URI}`
  });
  
  if (!response.ok) {
    throw new Error(`eBay token exchange failed: ${response.statusText}`);
  }
  
  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token
  };
}

// Exchange Etsy authorization code for access token
async function exchangeEtsyCodeForToken(code) {
  const response = await fetch('https://api.etsy.com/v3/public/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-api-key': ETSY_CLIENT_ID
    },
    body: `grant_type=authorization_code&code=${code}&redirect_uri=${ETSY_REDIRECT_URI}&client_id=${ETSY_CLIENT_ID}&client_secret=${ETSY_CLIENT_SECRET}`
  });
  
  if (!response.ok) {
    throw new Error(`Etsy token exchange failed: ${response.statusText}`);
  }
  
  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token
  };
}

// Exchange Poshmark authorization code for access token
async function exchangePoshmarkCodeForToken(code) {
  // Poshmark doesn't have a standard OAuth flow, so we'll need to handle this differently
  // This would typically involve a custom authentication flow through our backend
  const response = await fetch('https://autolistcanada.ca/api/poshmark/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      code: code,
      platform: 'poshmark'
    })
  });
  
  if (!response.ok) {
    throw new Error(`Poshmark token exchange failed: ${response.statusText}`);
  }
  
  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token
  };
}

// Exchange Facebook authorization code for access token
async function exchangeFacebookCodeForToken(code) {
  const response = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${FACEBOOK_CLIENT_ID}&redirect_uri=${FACEBOOK_REDIRECT_URI}&client_secret=${FACEBOOK_CLIENT_SECRET}&code=${code}`);
  
  if (!response.ok) {
    throw new Error(`Facebook token exchange failed: ${response.statusText}`);
  }
  
  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token
  };
}

// Show error message
function showError(message) {
  processingElement.classList.add('hidden');
  errorElement.classList.remove('hidden');
  errorMessageElement.textContent = message;
}

// Retry button handler
retryButton.addEventListener('click', () => {
  // Redirect back to the OAuth flow
  const state = sessionStorage.getItem('oauth_state');
  const platformId = sessionStorage.getItem('oauth_platform');
  
  if (state && platformId) {
    // Reconstruct the OAuth URL
    let authUrl;
    switch (platformId) {
      case 'ebay':
        authUrl = `https://auth.ebay.com/oauth2/authorize?client_id=EBAY_CLIENT_ID_HERE&response_type=code&redirect_uri=${EBAY_REDIRECT_URI}&scope=https://api.ebay.com/oauth/api_scope&state=${state}`;
        break;
      case 'etsy':
        authUrl = `https://www.etsy.com/oauth/connect?client_id=ETSY_CLIENT_ID_HERE&response_type=code&redirect_uri=${ETSY_REDIRECT_URI}&scope=email&state=${state}`;
        break;
      case 'poshmark':
        authUrl = `https://autolistcanada.ca/auth/poshmark?platform_id=${platformId}&state=${state}`;
        break;
      case 'facebook':
        authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=FACEBOOK_CLIENT_ID_HERE&redirect_uri=${FACEBOOK_REDIRECT_URI}&scope=pages_manage_posts,pages_read_engagement&state=${state}`;
        break;
      default:
        authUrl = `https://autolistcanada.ca/auth/${platformId}?platform_id=${platformId}&state=${state}`;
    }
    
    window.location.href = authUrl;
  } else {
    showError('Unable to retry authentication. Please close this window and try again from the extension.');
  }
});

// Start the OAuth response handling when the page loads
window.addEventListener('load', handleOAuthResponse);
