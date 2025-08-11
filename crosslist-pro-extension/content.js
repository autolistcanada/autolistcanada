// content.js - AutoList Canada Crosslist Pro
// Injects floating 'Import to AutoList' buttons on marketplace listings and responds to popup.js with extracted listings.

const SUPPORTED = [
  { host: /ebay\.(ca|com)$/i, path: /\/sh\/lst|selling/i, platform: 'eBay' },
  { host: /etsy\.com$/i, path: /\/your\/shops|listings/i, platform: 'Etsy' },
  { host: /poshmark\.com$/i, path: /\/your\/listings/i, platform: 'Poshmark' },
  { host: /mercari\.com$/i, path: /\/selling/i, platform: 'Mercari' },
  { host: /facebook\.com$/i, path: /\/marketplace\/.*\/your-listings\//i, platform: 'Facebook Marketplace' },
  { host: /grailed\.com$/i, path: /\/sell\/listings/i, platform: 'Grailed' },
  { host: /depop\.com$/i, path: /\/your\/listings/i, platform: 'Depop' },
  { host: /shopify\.com$/i, path: /\/admin\/products/i, platform: 'Shopify' },
  { host: /bonanza\.com$/i, path: /\/booth\/items/i, platform: 'Bonanza' },
  { host: /amazon\.(ca|com)$/i, path: /\/gp\/seller/i, platform: 'Amazon' },
  { host: /varagesale\.com$/i, path: /\/my\/listings/i, platform: 'VarageSale' },
  { host: /kijiji\.ca$/i, path: /\/my\/ads/i, platform: 'Kijiji' },
  { host: /offerup\.com$/i, path: /\/profile\/listings/i, platform: 'OfferUp' },
  { host: /letgo\.com$/i, path: /\/listings/i, platform: 'Letgo' }
];

// Store injected buttons to prevent duplicates
const injectedButtons = new Set();

// Error logging function
function logContentError(type, details) {
  // Send error to background script for centralized logging
  chrome.runtime.sendMessage({
    type: 'CONTENT_ERROR',
    errorType: type,
    details: details
  }).catch(err => {
    // If we can't send to background, log to console
    console.error('Failed to log error to background:', err);
  });
}

// Inject floating 'Import to AutoList' buttons
function injectImportButtons(platform) {
  // Clear previously injected buttons
  clearInjectedButtons();
  
  try {
    if (platform === 'eBay') {
      injectButtonsForSelector('[data-testid="item-card"], .listing-card', platform);
    } else if (platform === 'Etsy') {
      injectButtonsForSelector('.listing-card, .wt-card', platform);
    } else if (platform === 'Poshmark') {
      injectButtonsForSelector('.card--with-hover', platform);
    } else if (platform === 'Mercari') {
      injectButtonsForSelector('.mypage-item-card, .mypage-list-item', platform);
    } else if (platform === 'Facebook Marketplace') {
      injectButtonsForSelector('[data-testid="marketplace_feed_item"]', platform);
    } else if (platform === 'Grailed') {
      injectButtonsForSelector('.listing-card', platform);
    } else if (platform === 'Depop') {
      injectButtonsForSelector('.css-1g5y7zy, .listing-card', platform);
    } else if (platform === 'Shopify') {
      injectButtonsForSelector('[data-testid="ResourceList-Item"]', platform);
    } else if (platform === 'Bonanza') {
      injectButtonsForSelector('.booth-item', platform);
    } else if (platform === 'Amazon') {
      injectButtonsForSelector('.myi-row', platform);
    } else if (platform === 'VarageSale') {
      injectButtonsForSelector('.listing-card', platform);
    } else if (platform === 'Kijiji') {
      injectButtonsForSelector('.listing-card', platform);
    } else if (platform === 'OfferUp') {
      injectButtonsForSelector('.listing-item', platform);
    } else if (platform === 'Letgo') {
      injectButtonsForSelector('.listing-card', platform);
    }
  } catch (e) {
    console.error('Error injecting buttons:', e);
    logContentError('button_injection', {
      platform: platform,
      error: e.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Generic function to inject buttons for a given selector
function injectButtonsForSelector(selector, platform) {
  const items = document.querySelectorAll(selector);
  
  items.forEach((item, index) => {
    // Create a unique identifier for this item
    const itemKey = `${platform}-${index}-${item.innerHTML.substring(0, 50)}`;
    
    // Skip if button already injected for this item
    if (injectedButtons.has(itemKey)) return;
    
    // Create the import button
    const button = document.createElement('button');
    button.className = 'autolist-import-button';
    button.innerHTML = 'Import to AutoList';
    button.dataset.platform = platform;
    button.dataset.index = index;
    
    // Style the button
    button.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 10000;
      background: linear-gradient(135deg, #FF7300 0%, #FFE600 100%);
      color: white;
      border: none;
      border-radius: 20px;
      padding: 8px 16px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: all 0.2s ease;
      opacity: 0.9;
    `;
    
    // Add hover effect
    button.addEventListener('mouseenter', () => {
      button.style.opacity = '1';
      button.style.transform = 'scale(1.05)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.opacity = '0.9';
      button.style.transform = 'scale(1)';
    });
    
    // Add click event to capture listing data
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      captureListingData(item, platform, index);
    });
    
    // Position the button relative to the item
    item.style.position = 'relative';
    item.appendChild(button);
    
    // Mark this button as injected
    injectedButtons.add(itemKey);
  });
}

// Clear previously injected buttons
function clearInjectedButtons() {
  const buttons = document.querySelectorAll('.autolist-import-button');
  buttons.forEach(button => button.remove());
  injectedButtons.clear();
}

// Capture listing data when button is clicked
function captureListingData(itemElement, platform, index) {
  let listingData = {};
  
  try {
    if (platform === 'eBay') {
      listingData = {
        platform: 'eBay',
        title: itemElement.querySelector('[data-testid="item-title"], .listing-title')?.innerText || '',
        price: itemElement.querySelector('[data-testid="item-price"], .listing-price')?.innerText || '',
        image: itemElement.querySelector('img')?.src || '',
        url: itemElement.querySelector('a')?.href || location.href
      };
    } else if (platform === 'Etsy') {
      listingData = {
        platform: 'Etsy',
        title: itemElement.querySelector('.text-gray.text-truncate, .wt-text-caption')?.innerText || '',
        price: itemElement.querySelector('.currency-value, .wt-text-title-01')?.innerText || '',
        image: itemElement.querySelector('img')?.src || '',
        url: itemElement.querySelector('a')?.href || location.href
      };
    } else if (platform === 'Poshmark') {
      listingData = {
        platform: 'Poshmark',
        title: itemElement.querySelector('.title')?.innerText || '',
        price: itemElement.querySelector('.price')?.innerText || '',
        image: itemElement.querySelector('img')?.src || '',
        url: itemElement.querySelector('a')?.href || location.href
      };
    } else if (platform === 'Mercari') {
      listingData = {
        platform: 'Mercari',
        title: itemElement.querySelector('.mypage-item-card__title, .mypage-list-item__title')?.innerText || '',
        price: itemElement.querySelector('.mypage-item-card__price, .mypage-list-item__price')?.innerText || '',
        image: itemElement.querySelector('img')?.src || '',
        url: itemElement.querySelector('a')?.href || location.href
      };
    } else if (platform === 'Facebook Marketplace') {
      listingData = {
        platform: 'Facebook Marketplace',
        title: itemElement.querySelector('span, h2')?.innerText || '',
        price: itemElement.querySelector('span[dir="auto"]')?.innerText || '',
        image: itemElement.querySelector('img')?.src || '',
        url: itemElement.querySelector('a')?.href || location.href
      };
    } else if (platform === 'Grailed') {
      listingData = {
        platform: 'Grailed',
        title: itemElement.querySelector('.listing-title')?.innerText || '',
        price: itemElement.querySelector('.listing-price')?.innerText || '',
        image: itemElement.querySelector('img')?.src || '',
        url: itemElement.querySelector('a')?.href || location.href
      };
    } else if (platform === 'Depop') {
      listingData = {
        platform: 'Depop',
        title: itemElement.querySelector('.css-1g5y7zy-title, .listing-title')?.innerText || '',
        price: itemElement.querySelector('.css-1g5y7zy-price, .listing-price')?.innerText || '',
        image: itemElement.querySelector('img')?.src || '',
        url: itemElement.querySelector('a')?.href || location.href
      };
    } else if (platform === 'Shopify') {
      listingData = {
        platform: 'Shopify',
        title: itemElement.querySelector('span, h3')?.innerText || '',
        price: itemElement.querySelector('.Polaris-TextStyle--variationStrong')?.innerText || '',
        image: itemElement.querySelector('img')?.src || '',
        url: location.origin + location.pathname
      };
    } else if (platform === 'Bonanza') {
      listingData = {
        platform: 'Bonanza',
        title: itemElement.querySelector('.booth-item-title')?.innerText || '',
        price: itemElement.querySelector('.booth-item-price')?.innerText || '',
        image: itemElement.querySelector('img')?.src || '',
        url: itemElement.querySelector('a')?.href || location.href
      };
    } else if (platform === 'Amazon') {
      listingData = {
        platform: 'Amazon',
        title: itemElement.querySelector('.myi-title')?.innerText || '',
        price: itemElement.querySelector('.myi-price')?.innerText || '',
        image: itemElement.querySelector('img')?.src || '',
        url: itemElement.querySelector('a')?.href || location.href
      };
    } else if (platform === 'VarageSale') {
      listingData = {
        platform: 'VarageSale',
        title: itemElement.querySelector('.listing-title')?.innerText || '',
        price: itemElement.querySelector('.listing-price')?.innerText || '',
        image: itemElement.querySelector('img')?.src || '',
        url: itemElement.querySelector('a')?.href || location.href
      };
    } else if (platform === 'Kijiji') {
      listingData = {
        platform: 'Kijiji',
        title: itemElement.querySelector('.listing-title')?.innerText || '',
        price: itemElement.querySelector('.listing-price')?.innerText || '',
        image: itemElement.querySelector('img')?.src || '',
        url: itemElement.querySelector('a')?.href || location.href
      };
    }
    
    // Store the listing data in chrome storage
    chrome.storage.local.set({[`autolist_listing_${Date.now()}`]: listingData}, () => {
      // Visual feedback
      const button = itemElement.querySelector('.autolist-import-button');
      if (button) {
        button.innerHTML = '✓ Imported';
        button.style.background = 'linear-gradient(135deg, #10B981 0%, #047857 100%)';
        setTimeout(() => {
          if (button) {
            button.innerHTML = 'Import to AutoList';
            button.style.background = 'linear-gradient(135deg, #FF7300 0%, #FFE600 100%)';
          }
        }, 2000);
      }
      
      // Send message to popup
      chrome.runtime.sendMessage({
        action: 'listingCaptured',
        listing: listingData
      });
    });
  } catch (e) {
    console.error('Error capturing listing data:', e);
  }
}

function extractListings(platform) {
  let items = [];
  try {
    if (platform === 'eBay') {
      items = Array.from(document.querySelectorAll('[data-testid="item-card"], .listing-card')).map(card => ({
        platform: 'eBay',
        title: card.querySelector('[data-testid="item-title"], .listing-title')?.innerText || '',
        price: card.querySelector('[data-testid="item-price"], .listing-price')?.innerText || '',
        image: card.querySelector('img')?.src || '',
        url: card.querySelector('a')?.href || location.href
      }));
    } else if (platform === 'Etsy') {
      items = Array.from(document.querySelectorAll('.listing-card, .wt-card')).map(card => ({
        platform: 'Etsy',
        title: card.querySelector('.text-gray.text-truncate, .wt-text-caption')?.innerText || '',
        price: card.querySelector('.currency-value, .wt-text-title-01')?.innerText || '',
        image: card.querySelector('img')?.src || '',
        url: card.querySelector('a')?.href || location.href
      }));
    } else if (platform === 'Poshmark') {
      items = Array.from(document.querySelectorAll('.card--with-hover')).map(card => ({
        platform: 'Poshmark',
        title: card.querySelector('.title')?.innerText || '',
        price: card.querySelector('.price')?.innerText || '',
        image: card.querySelector('img')?.src || '',
        url: card.querySelector('a')?.href || location.href
      }));
    } else if (platform === 'Mercari') {
      items = Array.from(document.querySelectorAll('.mypage-item-card, .mypage-list-item')).map(card => ({
        platform: 'Mercari',
        title: card.querySelector('.mypage-item-card__title, .mypage-list-item__title')?.innerText || '',
        price: card.querySelector('.mypage-item-card__price, .mypage-list-item__price')?.innerText || '',
        image: card.querySelector('img')?.src || '',
        url: card.querySelector('a')?.href || location.href
      }));
    } else if (platform === 'Facebook Marketplace') {
      items = Array.from(document.querySelectorAll('[data-testid="marketplace_feed_item"]')).map(card => ({
        platform: 'Facebook Marketplace',
        title: card.querySelector('span, h2')?.innerText || '',
        price: card.querySelector('span[dir="auto"]')?.innerText || '',
        image: card.querySelector('img')?.src || '',
        url: card.querySelector('a')?.href || location.href
      }));
    } else if (platform === 'Grailed') {
      items = Array.from(document.querySelectorAll('.listing-card')).map(card => ({
        platform: 'Grailed',
        title: card.querySelector('.listing-title')?.innerText || '',
        price: card.querySelector('.listing-price')?.innerText || '',
        image: card.querySelector('img')?.src || '',
        url: card.querySelector('a')?.href || location.href
      }));
    } else if (platform === 'Depop') {
      items = Array.from(document.querySelectorAll('.css-1g5y7zy, .listing-card')).map(card => ({
        platform: 'Depop',
        title: card.querySelector('.css-1g5y7zy-title, .listing-title')?.innerText || '',
        price: card.querySelector('.css-1g5y7zy-price, .listing-price')?.innerText || '',
        image: card.querySelector('img')?.src || '',
        url: card.querySelector('a')?.href || location.href
      }));
    } else if (platform === 'Shopify') {
      items = Array.from(document.querySelectorAll('[data-testid="ResourceList-Item"]')).map(card => ({
        platform: 'Shopify',
        title: card.querySelector('span, h3')?.innerText || '',
        price: card.querySelector('.Polaris-TextStyle--variationStrong')?.innerText || '',
        image: card.querySelector('img')?.src || '',
        url: location.origin + location.pathname
      }));
    } else if (platform === 'Bonanza') {
      items = Array.from(document.querySelectorAll('.booth-item')).map(card => ({
        platform: 'Bonanza',
        title: card.querySelector('.booth-item-title')?.innerText || '',
        price: card.querySelector('.booth-item-price')?.innerText || '',
        image: card.querySelector('img')?.src || '',
        url: card.querySelector('a')?.href || location.href
      }));
    } else if (platform === 'Amazon') {
      items = Array.from(document.querySelectorAll('.myi-row')).map(card => ({
        platform: 'Amazon',
        title: card.querySelector('.myi-title')?.innerText || '',
        price: card.querySelector('.myi-price')?.innerText || '',
        image: card.querySelector('img')?.src || '',
        url: card.querySelector('a')?.href || location.href
      }));
    } else if (platform === 'VarageSale') {
      items = Array.from(document.querySelectorAll('.listing-card')).map(card => ({
        platform: 'VarageSale',
        title: card.querySelector('.listing-title')?.innerText || '',
        price: card.querySelector('.listing-price')?.innerText || '',
        image: card.querySelector('img')?.src || '',
        url: card.querySelector('a')?.href || location.href
      }));
    } else if (platform === 'Kijiji') {
      items = Array.from(document.querySelectorAll('.listing-card')).map(card => ({
        platform: 'Kijiji',
        title: card.querySelector('.listing-title')?.innerText || '',
        price: card.querySelector('.listing-price')?.innerText || '',
        image: card.querySelector('img')?.src || '',
        url: card.querySelector('a')?.href || location.href
      }));
    } else if (platform === 'OfferUp') {
      items = Array.from(document.querySelectorAll('.listing-item')).map(card => ({
        platform: 'OfferUp',
        title: card.querySelector('.listing-title')?.innerText || '',
        price: card.querySelector('.listing-price')?.innerText || '',
        image: card.querySelector('img')?.src || '',
        url: card.querySelector('a')?.href || location.href
      }));
    } else if (platform === 'Letgo') {
      items = Array.from(document.querySelectorAll('.listing-card')).map(card => ({
        platform: 'Letgo',
        title: card.querySelector('.listing-title')?.innerText || '',
        price: card.querySelector('.listing-price')?.innerText || '',
        image: card.querySelector('img')?.src || '',
        url: card.querySelector('a')?.href || location.href
      }));
    }
  } catch (e) {
    console.error('Error extracting listings:', e);
    logContentError('listing_extraction', {
      platform: platform,
      error: e.message,
      timestamp: new Date().toISOString()
    });
    // Return empty array on error
    return [];
  }
  return items.filter(x => x.title);
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_LISTINGS') {
    const { hostname, pathname } = window.location;
    const matched = SUPPORTED.find(({host, path}) => host.test(hostname) && path.test(pathname));
    let listings = [];
    if (matched) {
      listings = extractListings(matched.platform);
      // Inject import buttons after extracting listings
      injectImportButtons(matched.platform);
    }
    sendResponse({ listings });
  }
});
