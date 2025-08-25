/**
 * AutoList Canada - Data Normalizer
 * Converts captured data from various sources into the standard AutoList schema.
 */

const DEFAULT_SCHEMA = {
  id: null,
  title: '',
  price: 0.00,
  currency: 'CAD',
  images: [], // Array of URLs
  source: 'unknown',
  status: [], // e.g., [{ platform: 'poshmark', status: 'draft' }]
  targets: [], // e.g., ['ebay', 'etsy']
  notes: '',
  createdAt: null,
  updatedAt: null,
  // Extended fields for richer data
  description: '',
  condition: 'used',
  category: '',
  tags: [],
};

/**
 * Normalizes a raw data payload into the AutoList schema.
 * @param {Object} payload - The raw data captured from a source.
 * @param {string} source - The name of the source (e.g., 'ebay', 'poshmark').
 * @returns {Object} A normalized listing object.
 */
function normalize(payload, source = 'manual') {
  const normalized = { ...DEFAULT_SCHEMA };

  // Basic fields
  normalized.title = payload.title || payload.name || '';
  normalized.description = payload.description || '';
  normalized.source = source;

  // Price and Currency
  if (payload.offers && payload.offers.price) {
    normalized.price = parseFloat(payload.offers.price) || 0;
    normalized.currency = payload.offers.priceCurrency || 'CAD';
  } else if (payload.price) {
    normalized.price = parseFloat(payload.price) || 0;
    normalized.currency = payload.currency || 'CAD';
  }

  // Images
  if (Array.isArray(payload.image)) {
    normalized.images = payload.image.map(img => (typeof img === 'string' ? img : img.url)).filter(Boolean);
  } else if (typeof payload.image === 'string') {
    normalized.images = [payload.image];
  }

  // Set initial status
  normalized.status = [{ platform: 'autolist', status: 'draft' }];

  // Clean up and return
  // Ensure required fields have sensible defaults
  if (!normalized.title && normalized.description) {
      normalized.title = normalized.description.substring(0, 80);
  }

  return normalized;
}

/**
 * Applies a simple template to a listing object.
 * @param {Object} listing - The listing object to modify.
 * @param {Object} template - The template to apply (e.g., { shipping: '...', condition: '...' }).
 * @returns {Object} The listing with the template applied.
 */
function applyTemplate(listing, template) {
  // TODO: Implement more robust templating logic, potentially gated by a pro plan.
  const updatedListing = { ...listing };

  if (template.condition) {
    updatedListing.condition = template.condition;
  }
  if (template.shippingDetails) {
    // Example: append shipping info to notes
    const shippingNote = `\n\n--- Shipping Template ---\n${template.shippingDetails}`;
    updatedListing.notes = (updatedListing.notes || '') + shippingNote;
  }

  return updatedListing;
}

// Expose functions to the global scope
window.AutoListNormalizer = {
  normalize,
  applyTemplate,
};
