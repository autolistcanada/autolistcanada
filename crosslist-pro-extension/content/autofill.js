// content/autofill.js - AutoList Canada Extension
// Handles autofill functionality for cross-platform listing transfers

// Autofill listing data to target platform
async function autofillListingData(sourceData, targetPlatform) {
  console.log(`AutoList: Autofilling data to ${targetPlatform}`);
  
  try {
    // Wait for page to load
    await waitForPageLoad();
    
    switch (targetPlatform) {
      case 'etsy':
        return await autofillToEtsy(sourceData);
      case 'poshmark':
        return await autofillToPoshmark(sourceData);
      default:
        throw new Error(`Autofill not supported for platform: ${targetPlatform}`);
    }
  } catch (error) {
    console.error(`AutoList: Error autofilling to ${targetPlatform}:`, error);
    throw error;
  }
}

// Wait for page to load
function waitForPageLoad() {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      window.addEventListener('load', resolve);
    }
  });
}

// Autofill to Etsy
async function autofillToEtsy(sourceData) {
  console.log('AutoList: Autofilling to Etsy');
  
  // Wait for Etsy create listing page to load
  await waitForElement('#title-input');
  
  // Fill title
  const titleInput = document.getElementById('title-input') || 
                    document.querySelector('input[name="title"]') ||
                    document.querySelector('input[aria-label="Title"]');
  if (titleInput && sourceData.title) {
    titleInput.value = sourceData.title;
    titleInput.dispatchEvent(new Event('input', { bubbles: true }));
    titleInput.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  // Fill description
  const descriptionInput = document.getElementById('description-text-area') ||
                          document.querySelector('textarea[name="description"]') ||
                          document.querySelector('textarea[aria-label="Description"]');
  if (descriptionInput && sourceData.description) {
    descriptionInput.value = sourceData.description;
    descriptionInput.dispatchEvent(new Event('input', { bubbles: true }));
    descriptionInput.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  // Fill price
  const priceInput = document.getElementById('price-input') ||
                    document.querySelector('input[name="price"]') ||
                    document.querySelector('input[aria-label="Price"]');
  if (priceInput && sourceData.price) {
    priceInput.value = sourceData.price;
    priceInput.dispatchEvent(new Event('input', { bubbles: true }));
    priceInput.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  // Upload images (if possible)
  if (sourceData.images && sourceData.images.length > 0) {
    await uploadImagesToEtsy(sourceData.images);
  }
  
  return { success: true, message: 'Successfully autofilled to Etsy' };
}

// Autofill to Poshmark
async function autofillToPoshmark(sourceData) {
  console.log('AutoList: Autofilling to Poshmark');
  
  // Wait for Poshmark create listing page to load
  await waitForElement('#listing-title');
  
  // Fill title
  const titleInput = document.getElementById('listing-title') ||
                    document.querySelector('input[name="title"]') ||
                    document.querySelector('input[aria-label="Title"]');
  if (titleInput && sourceData.title) {
    titleInput.value = sourceData.title;
    titleInput.dispatchEvent(new Event('input', { bubbles: true }));
    titleInput.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  // Fill description
  const descriptionInput = document.getElementById('listing-description') ||
                          document.querySelector('textarea[name="description"]') ||
                          document.querySelector('textarea[aria-label="Description"]');
  if (descriptionInput && sourceData.description) {
    descriptionInput.value = sourceData.description;
    descriptionInput.dispatchEvent(new Event('input', { bubbles: true }));
    descriptionInput.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  // Fill price
  const priceInput = document.getElementById('listing-price') ||
                    document.querySelector('input[name="price"]') ||
                    document.querySelector('input[aria-label="Price"]');
  if (priceInput && sourceData.price) {
    priceInput.value = sourceData.price;
    priceInput.dispatchEvent(new Event('input', { bubbles: true }));
    priceInput.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  // Upload images (if possible)
  if (sourceData.images && sourceData.images.length > 0) {
    await uploadImagesToPoshmark(sourceData.images);
  }
  
  return { success: true, message: 'Successfully autofilled to Poshmark' };
}

// Upload images to Etsy
async function uploadImagesToEtsy(imageUrls) {
  console.log('AutoList: Uploading images to Etsy');
  
  // Try to find image upload element
  const uploadInput = document.querySelector('input[type="file"]') ||
                      document.getElementById('image-upload') ||
                      document.querySelector('[data-testid="image-upload"]');
  
  if (!uploadInput) {
    console.warn('AutoList: Could not find image upload element on Etsy');
    return;
  }
  
  // For security reasons, we can't directly upload images from URLs
  // In a real implementation, this would need to download the images first
  // and then upload them to the target platform
  console.log('AutoList: Image upload requires user interaction for security');
}

// Upload images to Poshmark
async function uploadImagesToPoshmark(imageUrls) {
  console.log('AutoList: Uploading images to Poshmark');
  
  // Try to find image upload element
  const uploadInput = document.querySelector('input[type="file"]') ||
                      document.getElementById('image-uploader') ||
                      document.querySelector('[data-testid="image-uploader"]');
  
  if (!uploadInput) {
    console.warn('AutoList: Could not find image upload element on Poshmark');
    return;
  }
  
  // For security reasons, we can't directly upload images from URLs
  // In a real implementation, this would need to download the images first
  // and then upload them to the target platform
  console.log('AutoList: Image upload requires user interaction for security');
}

// Wait for element to appear in DOM
function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }
    
    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}

// Export functions
window.autofillListingData = autofillListingData;
