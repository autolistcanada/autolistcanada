// AutoList Canada Content Script
// This script runs on matched web pages and injects the AutoList button

// First check if we should inject on this page
chrome.runtime.sendMessage({action: 'checkForInjection'}, function(response) {
  if (response && response.inject) {
    // Inject AutoList button
    injectAutoListButton(response.marketplace);
    
    // Set up listeners for capture functionality
    setupMessageListeners();
  }
});

// Listen for messages from the extension popup
function setupMessageListeners() {
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === "captureListing") {
      // Capture the listing data
      const listingData = captureListing();
      
      // Send data back to background script
      if (listingData) {
        chrome.runtime.sendMessage({
          action: 'listingCaptured',
          data: listingData
        }, function(response) {
          sendResponse({success: true});
        });
      } else {
        sendResponse({success: false});
      }
      
      return true; // Keep the message channel open for async response
    }
  });
}

// Function to inject the AutoList button
function injectAutoListButton(marketplace) {
  // Get current language preference
  chrome.storage.sync.get(['language'], function(result) {
    const lang = result.language || 'en';
    
    // Create button element
    const autoListBtn = document.createElement('button');
    autoListBtn.id = 'autolist-capture-btn';
    autoListBtn.className = 'autolist-btn';
    
    // Set button text based on language
    autoListBtn.textContent = lang === 'en' ? 'Cross-list with AutoList' : 'Publier avec AutoList';
    
    // Find the appropriate injection point based on marketplace
    const injectionPoint = findInjectionPoint(marketplace);
    
    if (injectionPoint) {
      // Insert button at injection point
      injectionPoint.insertAdjacentElement('afterend', autoListBtn);
      
      // Add click event listener
      autoListBtn.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const listingData = captureListing();
        
        // Send data to background script
        if (listingData) {
          chrome.runtime.sendMessage({
            action: 'listingCaptured',
            data: listingData
          });
          
          // Visual confirmation
          autoListBtn.textContent = lang === 'en' ? 'Captured!' : 'Capturé!';
          autoListBtn.classList.add('success');
          
          setTimeout(function() {
            autoListBtn.textContent = lang === 'en' ? 'Cross-list with AutoList' : 'Publier avec AutoList';
            autoListBtn.classList.remove('success');
          }, 2000);
        } else {
          // Error state
          autoListBtn.textContent = lang === 'en' ? 'Error!' : 'Erreur!';
          autoListBtn.classList.add('error');
          
          setTimeout(function() {
            autoListBtn.textContent = lang === 'en' ? 'Cross-list with AutoList' : 'Publier avec AutoList';
            autoListBtn.classList.remove('error');
          }, 2000);
        }
      });
    }
  });
}

// Find the appropriate injection point based on marketplace
function findInjectionPoint(marketplace) {
  switch(marketplace) {
    case 'ebay':
      // Look for eBay's price or action section
      return document.querySelector('#prcIsum') || 
             document.querySelector('.vi-price-pd') ||
             document.querySelector('.x-price-primary') ||
             document.querySelector('.ux-call-to-action');
      
    case 'amazon':
      // Look for Amazon's buy box
      return document.querySelector('#buybox') ||
             document.querySelector('#addToCart_feature_div') ||
             document.querySelector('#buyNow_feature_div');
      
    case 'etsy':
      // Look for Etsy's purchase section
      return document.querySelector('.buy-button-container') ||
             document.querySelector('.add-to-cart-form');
      
    case 'kijiji':
      // Look for Kijiji's contact section
      return document.querySelector('.contact-methods') ||
             document.querySelector('.phone-number-link');
      
    case 'facebook':
      // Look for Facebook Marketplace's action buttons
      return document.querySelector('.x6s0dn4') ||
             document.querySelector('[aria-label="Message"]').parentNode;
      
    default:
      // Try some generic containers
      return document.querySelector('.product-info') ||
             document.querySelector('.price') ||
             document.querySelector('.actions');
  }
}

// Function to capture listing data
function captureListing() {
  try {
    // Get current URL
    const url = window.location.href;
    
    // Determine which marketplace we're on
    let marketplace = '';
    if (url.includes('ebay.ca')) {
      marketplace = 'ebay_ca';
      return captureEbayListing();
    } else if (url.includes('amazon.ca')) {
      marketplace = 'amazon_ca';
      return captureAmazonListing();
    } else if (url.includes('etsy.com')) {
      marketplace = 'etsy';
      return captureEtsyListing();
    } else if (url.includes('kijiji.ca')) {
      marketplace = 'kijiji';
      return captureKijijiListing();
    } else if (url.includes('facebook.com/marketplace')) {
      marketplace = 'facebook_marketplace';
      return captureFacebookListing();
    } else {
      return null; // Unsupported marketplace
    }
  } catch (error) {
    console.error('Error capturing listing:', error);
    return null;
  }
}

// eBay specific capture logic
function captureEbayListing() {
  // Extract listing ID from URL
  const url = window.location.href;
  const idMatch = url.match(/itm\/(\d+)/);
  const externalId = idMatch ? idMatch[1] : '';
  
  // Extract title
  const titleElement = document.querySelector('#itemTitle') || 
                      document.querySelector('.x-item-title') ||
                      document.querySelector('h1.it-ttl');
  let title = titleElement ? titleElement.textContent.replace('Details about', '').trim() : '';
  
  // Extract price
  const priceElement = document.querySelector('#prcIsum') || 
                      document.querySelector('.vi-price-pd .notranslate') ||
                      document.querySelector('.x-price-primary');
  let price = '';
  let currency = '';
  
  if (priceElement) {
    const priceText = priceElement.textContent.trim();
    const currencyMatch = priceText.match(/([A-Z]{3}|\$|€|£)/);
    currency = currencyMatch ? currencyMatch[1] : 'CAD';
    
    // Extract numeric price
    const priceNumeric = priceText.replace(/[^0-9.,]/g, '').replace(',', '.');
    price = parseFloat(priceNumeric);
  }
  
  // Extract description
  const descriptionIframe = document.querySelector('#desc_ifr');
  let description = '';
  
  if (descriptionIframe) {
    try {
      description = descriptionIframe.contentDocument.body.textContent.trim();
    } catch (e) {
      // Cross-origin restriction, can't access iframe content
      description = 'Description unavailable due to cross-origin restrictions.';
    }
  } else {
    // Try alternative description elements
    const descElement = document.querySelector('#viTabs_0_is') || 
                        document.querySelector('.section-details');
    description = descElement ? descElement.textContent.trim() : '';
  }
  
  // Extract images
  const images = [];
  const imageElements = document.querySelectorAll('#vi_main_img_fs img, .vi-image-gallery img, .ux-image-carousel-item img');
  
  imageElements.forEach((img, index) => {
    // Get the larger version of the image when possible
    let imageUrl = img.src;
    if (imageUrl.includes('thumbs') || imageUrl.includes('s-l64') || imageUrl.includes('s-l140')) {
      // Try to construct the URL for the full-size image
      imageUrl = imageUrl.replace(/\/s-l\d+\./, '/s-l1600.').replace('/thumbs/', '/');
    }
    
    images.push({
      url: imageUrl,
      position: index + 1,
      is_main: index === 0
    });
  });
  
  // Extract condition
  const conditionElement = document.querySelector('.vi-itm-condx, .x-item-condition-text');
  let condition = conditionElement ? conditionElement.textContent.trim().toLowerCase() : '';
  
  // Normalize condition values
  if (condition.includes('new')) {
    condition = 'new';
  } else if (condition.includes('used')) {
    condition = 'used';
  } else if (condition.includes('refurbished')) {
    condition = 'refurbished';
  } else {
    condition = 'used'; // Default
  }
  
  // Extract shipping info
  const shippingElement = document.querySelector('#fshippingCost') || 
                         document.querySelector('.ux-labels-text--shipping');
  let freeShipping = false;
  
  if (shippingElement) {
    freeShipping = shippingElement.textContent.toLowerCase().includes('free');
  }
  
  // Return structured listing data
  return {
    external_id: externalId,
    title: {
      en: title,
      fr: '' // Would need translation service
    },
    description: {
      en: description,
      fr: '' // Would need translation service
    },
    price: {
      amount: price,
      currency: currency,
      original_amount: price
    },
    condition: condition,
    images: images,
    shipping: {
      free_shipping: freeShipping
    },
    marketplace: 'ebay_ca',
    url: url
  };
}

// Amazon specific capture logic (simplified for brevity)
function captureAmazonListing() {
  // Similar implementation to eBay but for Amazon
  const url = window.location.href;
  
  const titleElement = document.querySelector('#productTitle');
  const title = titleElement ? titleElement.textContent.trim() : '';
  
  const priceElement = document.querySelector('#priceblock_ourprice') || 
                      document.querySelector('.a-price .a-offscreen') ||
                      document.querySelector('#price_inside_buybox');
  let price = 0;
  let currency = 'CAD';
  
  if (priceElement) {
    const priceText = priceElement.textContent.trim();
    price = parseFloat(priceText.replace(/[^0-9.,]/g, '').replace(',', '.'));
  }
  
  // Simplified for brevity
  return {
    title: { en: title },
    price: { amount: price, currency: currency },
    marketplace: 'amazon_ca',
    url: url
  };
}

// Etsy specific capture logic (simplified placeholder)
function captureEtsyListing() {
  // Simplified placeholder
  const url = window.location.href;
  const title = document.querySelector('.listing-page-title-component h1')?.textContent.trim() || '';
  
  return {
    title: { en: title },
    marketplace: 'etsy',
    url: url
  };
}

// Kijiji specific capture logic (simplified placeholder)
function captureKijijiListing() {
  // Simplified placeholder
  const url = window.location.href;
  const title = document.querySelector('[class*="title-"]')?.textContent.trim() || '';
  
  return {
    title: { en: title },
    marketplace: 'kijiji',
    url: url
  };
}

// Facebook Marketplace specific capture logic (simplified placeholder)
function captureFacebookListing() {
  // Simplified placeholder
  const url = window.location.href;
  const title = document.querySelector('h1')?.textContent.trim() || '';
  
  return {
    title: { en: title },
    marketplace: 'facebook_marketplace',
    url: url
  };
}
