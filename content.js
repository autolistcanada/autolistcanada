
console.log("AutoList Content Script Loaded");


  const SUPPORTED = [
    { host: /ebay\.(ca|com)$/i, path: /\/sh\/lst\//i, platform: 'eBay' },
    { host: /ebay\.(ca|com)$/i, path: /\/selling/i, platform: 'eBay' },
    { host: /etsy\.com$/i, path: /\/your\/shops\//i, platform: 'Etsy' },
    { host: /etsy\.com$/i, path: /\/listings/i, platform: 'Etsy' },
    { host: /poshmark\.com$/i, path: /\/your\/listings/i, platform: 'Poshmark' },
    { host: /mercari\.com$/i, path: /\/selling/i, platform: 'Mercari' },
    { host: /facebook\.com$/i, path: /\/marketplace\/.*\/your-listings\//i, platform: 'Facebook Marketplace' }
  ];
  const { hostname, pathname } = window.location;
  const matched = SUPPORTED.find(({host, path}) => host.test(hostname) && path.test(pathname));
  if (!matched) return;
  if (document.getElementById('autolist-crosslist-btn')) return;

  // --- Floating Button ---
  const btn = document.createElement('button');
  btn.id = 'autolist-crosslist-btn';
  btn.innerText = '➤ Crosslist This';
  btn.style.cssText = `
    position: fixed;
    bottom: 32px;
    right: 32px;
    z-index: 99999;
    background: #ff7300;
    color: #fff;
    border: none;
    border-radius: 28px;
    padding: 14px 28px;
    font-size: 1.15rem;
    font-family: inherit;
    box-shadow: 0 4px 16px rgba(0,0,0,0.09);
    cursor: pointer;
    transition: background 0.2s;
    outline: none;
    font-weight: 600;
    letter-spacing: 0.01em;
  `;
  btn.addEventListener('mouseenter',()=>btn.style.background='#ff8c1a');
  btn.addEventListener('mouseleave',()=>btn.style.background='#ff7300');

  // --- Modal ---
  function showModal(listings) {
    if (document.getElementById('autolist-crosslist-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'autolist-crosslist-modal';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.22); z-index: 100000; display: flex; align-items: center; justify-content: center;`;
    modal.innerHTML = `
      <div style="background:#fff; border-radius:18px; box-shadow:0 8px 32px rgba(0,0,0,0.13); width: min(96vw, 480px); max-width: 98vw; max-height: 86vh; overflow:hidden; display:flex; flex-direction:column;">
        <div style="display:flex; align-items:center; justify-content:space-between; padding:20px 24px 10px 24px; border-bottom:1px solid #f3f3f3;">
          <div style="font-size:1.18rem; font-weight:700; color:#ff7300; letter-spacing:0.01em;">AutoList Crosslist Preview</div>
          <button id="autolist-modal-close" style="background:none; border:none; font-size:1.5rem; color:#888; cursor:pointer;">&times;</button>
        </div>
        <div style="padding:18px 24px 24px 24px; overflow-y:auto; flex:1;">
          ${listings.length
            ? listings.map(item => `
              <div style="display:flex;align-items:center;margin-bottom:18px;gap:16px;">
                <img src="${item.image}" alt="img" style="width:48px;height:48px;object-fit:cover;border-radius:9px;background:#f8f8f8;">
                <div style="flex:1;">
                  <div style="font-weight:600;color:#222;font-size:1.05rem;">${item.title}</div>
                  <div style="color:#ff7300;font-weight:700;margin-top:2px;">${item.price}</div>
                  <a href="${item.url}" target="_blank" style="font-size:0.95em;color:#3b82f6;text-decoration:underline;">View</a>
                </div>
              </div>`).join('')
            : '<div style="color:#888;">No listings found.</div>'}
        </div>
      </div>
    `;
    modal.querySelector('#autolist-modal-close').onclick = () => modal.remove();
    modal.onclick = e => { if (e.target === modal) modal.remove(); };
    document.body.appendChild(modal);
  }

  // --- Extraction Logic ---
  function extractListings(platform) {
    let items = [];
    if (platform === 'eBay') {
      // Try both possible selectors for eBay inventory
      items = Array.from(document.querySelectorAll('[data-testid="item-card"]')).map(card => ({
        platform: 'eBay',
        title: card.querySelector('[data-testid="item-title"]')?.innerText || '',
        price: card.querySelector('[data-testid="item-price"]')?.innerText || '',
        image: card.querySelector('img')?.src || '',
        url: card.querySelector('a')?.href || location.href
      }));
      if (!items.length) {
        items = Array.from(document.querySelectorAll('.listing-card')).map(card => ({
          platform: 'eBay',
          title: card.querySelector('.listing-title')?.innerText || '',
          price: card.querySelector('.listing-price')?.innerText || '',
          image: card.querySelector('img')?.src || '',
          url: card.querySelector('a')?.href || location.href
        }));
      }
    } else if (platform === 'Etsy') {
      items = Array.from(document.querySelectorAll('.listing-card, .wt-card')).map(card => ({
        platform: 'Etsy',
        title: card.querySelector('.text-gray.text-truncate, .wt-text-caption')?.innerText || '',
        price: card.querySelector('.currency-value, .wt-text-title-01')?.innerText || '',
        image: card.querySelector('img')?.src || '',
        url: card.querySelector('a')?.href || location.href
      }));
    } else if (platform === 'Poshmark') {
      items = Array.from(document.querySelectorAll('.card--with-hover'))
        .map(card => ({
          platform: 'Poshmark',
          title: card.querySelector('.title')?.innerText || '',
          price: card.querySelector('.price')?.innerText || '',
          image: card.querySelector('img')?.src || '',
          url: card.querySelector('a')?.href || location.href
        }));
    } else if (platform === 'Mercari') {
      items = Array.from(document.querySelectorAll('.mypage-item-card, .mypage-list-item'))
        .map(card => ({
          platform: 'Mercari',
          title: card.querySelector('.mypage-item-card__title, .mypage-list-item__title')?.innerText || '',
          price: card.querySelector('.mypage-item-card__price, .mypage-list-item__price')?.innerText || '',
          image: card.querySelector('img')?.src || '',
          url: card.querySelector('a')?.href || location.href
        }));
    } else if (platform === 'Facebook Marketplace') {
      items = Array.from(document.querySelectorAll('[data-testid="marketplace_feed_item"]'))
        .map(card => ({
          platform: 'Facebook Marketplace',
          title: card.querySelector('span, h2')?.innerText || '',
          price: card.querySelector('span[dir="auto"]')?.innerText || '',
          image: card.querySelector('img')?.src || '',
          url: card.querySelector('a')?.href || location.href
        }));
    }
    // Fallback: if nothing found, return empty array
    return items.filter(x => x.title);
  }

  btn.onclick = function handleCrosslistClick() {
    const listings = extractListings(matched.platform);
    if (!listings.length) {
      // fallback: show mock data
      const mock = [{
        platform: matched.platform,
        title: "Sample title",
        price: "$25.00",
        image: "https://placehold.co/48x48",
        url: location.href
      }];
      console.log('AutoList Crosslist:', mock);
      showModal(mock);
    } else {
      listings.forEach(item => console.log('AutoList Crosslist:', item));
      showModal(listings);
    }
  };

  document.body.appendChild(btn);
})();
// crosslist-pro-extension/content.js

function createFloatPanel() {
  if (document.getElementById('crosslist-float-panel')) return;

  const panel = document.createElement('div');
  panel.id = 'crosslist-float-panel';
  panel.innerHTML = `
    <div id="crosslist-float-header">
      Crosslist Pro
      <button id="crosslist-float-min">−</button>
    </div>
    <div id="crosslist-float-body">
      <div class="crosslist-section">
        <label class="crosslist-label">Title</label>
        <input class="crosslist-input" id="title" placeholder="Enter title" />
        <label class="crosslist-label">Description</label>
        <textarea class="crosslist-textarea" id="description"></textarea>
      </div>
      <div class="crosslist-section">
        <label class="crosslist-label">Select Platforms</label>
        <div class="crosslist-platforms" id="platforms"></div>
      </div>
      <button class="crosslist-btn" id="save-listing">Save Listing</button>
    </div>
  `;
  document.body.appendChild(panel);

  document.getElementById('crosslist-float-min').onclick = () => {
    panel.style.display = 'none';
  };

  renderPlatforms();
  document.getElementById('save-listing').onclick = () => {
    const data = {
      title: document.getElementById('title').value,
      description: document.getElementById('description').value,
      platforms: Array.from(document.querySelectorAll('.crosslist-platform.selected')).map(el => el.dataset.platform)
    };
    chrome.runtime.sendMessage({ type: "SAVE_LISTING", data });
    alert("Saved!");
  };
}

function renderPlatforms() {
  const platforms = ["ebay", "poshmark", "etsy", "depop", "facebook", "mercari"];
  const container = document.getElementById('platforms');
  platforms.forEach(p => {
    const el = document.createElement('div');
    el.className = 'crosslist-platform';
    el.dataset.platform = p;
    el.innerHTML = `<img src="assets/${p}.svg" alt="${p}">${p}`;
    el.onclick = () => el.classList.toggle('selected');
    container.appendChild(el);
  });
}

chrome.runtime.onMessage.addListener((req) => {
  if (req.type === "SHOW_FLOAT_PANEL") createFloatPanel();
});
