// popup.js for AutoList Canada Crosslist Pro

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const titleSpan = document.getElementById('title');
  const priceSpan = document.getElementById('price');
  const descriptionSpan = document.getElementById('description');
  const importBtn = document.getElementById('import-button');
  const crosslistBtn = document.getElementById('crosslist-button');
  const checkboxes = {
    ebay: document.getElementById('ebay-checkbox'),
    poshmark: document.getElementById('poshmark-checkbox'),
    etsy: document.getElementById('etsy-checkbox'),
    depop: document.getElementById('depop-checkbox'),
    facebook: document.getElementById('facebook-checkbox')
  };

  // Request listing data from content script
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: 'GET_LISTING_DATA' },
      (response) => {
        if (response && response.data) {
          titleSpan.textContent = response.data.title || 'N/A';
          priceSpan.textContent = response.data.price || 'N/A';
          descriptionSpan.textContent = response.data.description || 'N/A';
        } else {
          titleSpan.textContent = 'Not found';
          priceSpan.textContent = 'Not found';
          descriptionSpan.textContent = 'Not found';
        }
      }
    );
  });

  // Import button logic
  importBtn.addEventListener('click', () => {
    const data = {
      title: titleSpan.textContent,
      price: priceSpan.textContent,
      description: descriptionSpan.textContent
    };
    console.log('Import to AutoList:', data);
  });

  // Crosslist button logic
  crosslistBtn.addEventListener('click', () => {
    const urls = {
      ebay: 'https://www.ebay.ca/sl/sell',
      etsy: 'https://www.etsy.com/your/shops/me/listings/create',
      poshmark: 'https://poshmark.ca/sell',
      depop: 'https://www.depop.com/new',
      facebook: 'https://www.facebook.com/marketplace/create/item'
    };
    Object.keys(checkboxes).forEach((key) => {
      if (checkboxes[key].checked) {
        chrome.tabs.create({ url: urls[key] });
      }
    });
  });
});
