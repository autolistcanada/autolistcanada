// content.js - AutoList Canada Crosslist Pro
// No UI injection. Only responds to popup.js with extracted listings.

const SUPPORTED = [
  { host: /ebay\.(ca|com)$/i, path: /\/(sh\/lst|selling)/i, platform: 'eBay' },
  { host: /etsy\.com$/i, path: /\/(your\/shops|listings)/i, platform: 'Etsy' },
  { host: /poshmark\.com$/i, path: /\/your\/listings/i, platform: 'Poshmark' },
  { host: /mercari\.com$/i, path: /\/selling/i, platform: 'Mercari' },
  { host: /facebook\.com$/i, path: /\/marketplace\/.*\/your-listings\//i, platform: 'Facebook Marketplace' },
  { host: /grailed\.com$/i, path: /\/sell\/listings/i, platform: 'Grailed' },
  { host: /depop\.com$/i, path: /\/your\/listings/i, platform: 'Depop' },
  { host: /shopify\.com$/i, path: /\/admin\/products/i, platform: 'Shopify' },
  { host: /bonanza\.com$/i, path: /\/booth\/items/i, platform: 'Bonanza' },
  { host: /amazon\.(ca|com)$/i, path: /\/gp\/seller/i, platform: 'Amazon' },
  { host: /varagesale\.com$/i, path: /\/my\/listings/i, platform: 'VarageSale' },
  { host: /kijiji\.ca$/i, path: /\/my\/ads/i, platform: 'Kijiji' }
];

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
    }
  } catch (e) {
    // fail silently, return empty array
  }
  return items.filter(x => x.title);
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_LISTINGS') {
    const { hostname, pathname } = window.location;
    const matched = SUPPORTED.find(({host, path}) => host.test(hostname) && path.test(pathname));
    let listings = [];
    if (matched) listings = extractListings(matched.platform);
    sendResponse({ listings });
  }
});
