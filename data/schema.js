/**
 * AutoList Canada - Data Schema Definitions
 * 
 * This file defines the data models and schema structures for:
 * - Listings
 * - Templates
 * - User Profiles
 * - Marketplace Connections
 * - Analytics
 * - Images
 * 
 * All data structures follow Canadian-specific formats for currency (CAD),
 * taxes (GST/HST), shipping services, and other locale-specific requirements.
 */

const MARKETPLACE_TYPES = {
  EBAY_CA: 'ebay_ca',
  AMAZON_CA: 'amazon_ca',
  ETSY: 'etsy',
  KIJIJI: 'kijiji',
  FACEBOOK: 'facebook_marketplace',
  SHOPIFY: 'shopify',
  POSHMARK_CA: 'poshmark_ca',
  CRAIGSLIST_CA: 'craigslist_ca'
};

const LISTING_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  ENDED: 'ended',
  SOLD: 'sold',
  ERROR: 'error',
  PENDING: 'pending'
};

const CANADIAN_PROVINCES = {
  AB: 'Alberta',
  BC: 'British Columbia',
  MB: 'Manitoba',
  NB: 'New Brunswick',
  NL: 'Newfoundland and Labrador',
  NS: 'Nova Scotia',
  NT: 'Northwest Territories',
  NU: 'Nunavut',
  ON: 'Ontario',
  PE: 'Prince Edward Island',
  QC: 'Quebec',
  SK: 'Saskatchewan',
  YT: 'Yukon'
};

const CANADIAN_TAX_RATES = {
  GST: 0.05, // 5% Goods and Services Tax
  HST: {
    // Harmonized Sales Tax rates by province
    ON: 0.13, // 13% in Ontario
    NB: 0.15, // 15% in New Brunswick
    NS: 0.15, // 15% in Nova Scotia
    NL: 0.15, // 15% in Newfoundland and Labrador
    PE: 0.15  // 15% in Prince Edward Island
  },
  PST: {
    // Provincial Sales Tax where applicable
    BC: 0.07, // 7% in British Columbia
    SK: 0.06, // 6% in Saskatchewan
    MB: 0.07, // 7% in Manitoba
    QC: 0.09975 // 9.975% Quebec Sales Tax (QST)
  }
};

const CANADIAN_SHIPPING_SERVICES = {
  CANADA_POST_REGULAR: 'canada_post_regular',
  CANADA_POST_EXPEDITED: 'canada_post_expedited',
  CANADA_POST_XPRESSPOST: 'canada_post_xpresspost',
  CANADA_POST_PRIORITY: 'canada_post_priority',
  PUROLATOR: 'purolator',
  UPS: 'ups',
  FEDEX: 'fedex',
  DHL: 'dhl'
};

/**
 * Listing Schema - Core data structure for product listings
 * Supports up to 30 images per listing as per requirements
 */
const ListingSchema = {
  id: String, // UUID v4
  user_id: String,
  title: {
    en: String, // English title
    fr: String  // French title (for bilingual support)
  },
  description: {
    en: String, // English description
    fr: String  // French description (for bilingual support)
  },
  price: {
    amount: Number, // Always in CAD
    currency: String, // Default 'CAD'
    original_amount: Number, // For sale/discount tracking
  },
  quantity: Number,
  condition: String, // 'new', 'used', 'refurbished', etc.
  sku: String, // Stock Keeping Unit
  brand: String,
  weight: {
    value: Number,
    unit: String // 'kg', 'g'
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: String // 'cm'
  },
  category: {
    primary: String,
    secondary: String,
    tertiary: String
  },
  images: Array, // Array of image objects (up to 30)
  variations: Array, // Product variations (color, size, etc)
  shipping: {
    free_shipping: Boolean,
    calculated: Boolean,
    flat_rate: Number,
    services: Array, // Available shipping services
    handling_time: Number, // Days
    domestic_only: Boolean
  },
  tax: {
    apply_tax: Boolean,
    gst: Boolean,
    pst: Boolean,
    hst: Boolean,
    province: String // For provincial tax determination
  },
  marketplaces: Array, // Array of marketplace listings
  template_id: String, // Associated template ID
  status: String, // See LISTING_STATUS
  created_at: Date,
  updated_at: Date,
  published_at: Date,
  ended_at: Date,
  sold_at: Date,
  metadata: Object // For marketplace-specific data
};

/**
 * Image Schema - For product images (up to 30 per listing)
 */
const ImageSchema = {
  id: String, // UUID v4
  listing_id: String,
  url: String,
  thumbnail_url: String,
  alt_text: {
    en: String,
    fr: String
  },
  position: Number, // Order in the gallery
  is_main: Boolean, // Main/featured image
  marketplace_urls: Object, // URLs per marketplace after upload
  dimensions: {
    width: Number,
    height: Number
  },
  size: Number, // File size in bytes
  file_name: String,
  file_type: String, // MIME type
  created_at: Date
};

/**
 * Template Schema - For reusable listing templates
 */
const TemplateSchema = {
  id: String, // UUID v4
  user_id: String,
  name: String,
  description: String,
  category: String,
  structure: {
    title_template: String,
    description_template: String,
    price_strategy: Object, // Pricing rules
    shipping_settings: Object,
    tax_settings: Object,
    marketplace_settings: Object
  },
  is_default: Boolean,
  created_at: Date,
  updated_at: Date,
  usage_count: Number
};

/**
 * User Profile Schema
 */
const UserProfileSchema = {
  id: String, // UUID v4
  email: String,
  name: String,
  company: String,
  address: {
    street: String,
    city: String,
    province: String,
    postal_code: String,
    country: String // Default 'CA'
  },
  phone: String,
  language_preference: String, // 'en' or 'fr'
  notifications: {
    email: Boolean,
    browser: Boolean
  },
  settings: {
    default_template_id: String,
    default_tax_settings: Object,
    default_shipping_settings: Object
  },
  subscription: {
    plan: String,
    status: String,
    expires_at: Date
  },
  created_at: Date,
  last_login: Date
};

/**
 * Marketplace Connection Schema
 */
const MarketplaceConnectionSchema = {
  id: String, // UUID v4
  user_id: String,
  marketplace: String, // See MARKETPLACE_TYPES
  connected_at: Date,
  status: String,
  credentials: {
    // OAuth tokens or API keys (encrypted/secure)
    access_token: String,
    refresh_token: String,
    expires_at: Date
  },
  settings: {
    default_return_policy: Object,
    default_payment_policy: Object,
    default_shipping_policy: Object,
    store_name: String,
    store_url: String
  },
  sync_status: {
    last_sync: Date,
    success: Boolean,
    message: String
  }
};

/**
 * Analytics Data Schema
 */
const AnalyticsSchema = {
  id: String, // UUID v4
  user_id: String,
  date: Date,
  views: {
    total: Number,
    by_marketplace: Object, // Breakdown by marketplace
    by_listing: Object // Breakdown by listing
  },
  sales: {
    total: Number, // Amount in CAD
    count: Number,
    by_marketplace: Object,
    by_listing: Object
  },
  conversion_rate: Number,
  traffic_sources: Object,
  popular_listings: Array, // Top performing listings
  trends: {
    daily: Array,
    weekly: Array,
    monthly: Array
  },
  metadata: Object // For additional analytics data
};

/**
 * Audit Log Schema
 */
const AuditLogSchema = {
  id: String, // UUID v4
  user_id: String,
  action: String,
  entity_type: String, // 'listing', 'template', etc.
  entity_id: String,
  changes: Object, // Before/after values
  timestamp: Date,
  ip_address: String,
  user_agent: String
};

/**
 * AI Tools Configuration Schema
 */
const AIToolsSchema = {
  id: String, // UUID v4
  user_id: String,
  tool_type: String, // 'description_generator', 'category_suggester', 'pricing_optimizer'
  configuration: {
    language_style: String,
    tone: String,
    length: String,
    focus_keywords: Array,
    marketplace_optimization: Array
  },
  usage_history: Array,
  created_at: Date,
  updated_at: Date
};

// Export all schemas
export {
  MARKETPLACE_TYPES,
  LISTING_STATUS,
  CANADIAN_PROVINCES,
  CANADIAN_TAX_RATES,
  CANADIAN_SHIPPING_SERVICES,
  ListingSchema,
  ImageSchema,
  TemplateSchema,
  UserProfileSchema,
  MarketplaceConnectionSchema,
  AnalyticsSchema,
  AuditLogSchema,
  AIToolsSchema
};
