/**
 * @file marketplace-service.js
 * @description Core marketplace service adapter class and utilities
 */

class MarketplaceService {
  constructor() {
    this.connectedMarketplaces = this._loadConnectedMarketplaces();
    this.authTokens = {};
  }

  /**
   * Load user's connected marketplaces from local storage
   * @private
   * @returns {Array} Array of connected marketplace objects
   */
  _loadConnectedMarketplaces() {
    try {
      const saved = localStorage.getItem('autolist_connected_marketplaces');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading connected marketplaces:', error);
      return [];
    }
  }

  /**
   * Save connected marketplaces to local storage
   * @private
   */
  _saveConnectedMarketplaces() {
    try {
      localStorage.setItem(
        'autolist_connected_marketplaces',
        JSON.stringify(this.connectedMarketplaces)
      );
    } catch (error) {
      console.error('Error saving connected marketplaces:', error);
    }
  }

  /**
   * Get all connected marketplaces
   * @returns {Array} Array of connected marketplace objects
   */
  getConnectedMarketplaces() {
    return this.connectedMarketplaces;
  }

  /**
   * Check if a specific marketplace is connected
   * @param {string} marketplaceId - The marketplace identifier
   * @returns {boolean} True if connected, false otherwise
   */
  isMarketplaceConnected(marketplaceId) {
    return this.connectedMarketplaces.some(m => m.id === marketplaceId);
  }

  /**
   * Connect a marketplace
   * @param {Object} marketplaceData - Data for the marketplace to connect
   * @returns {Promise} Promise resolving to success/failure
   */
  async connectMarketplace(marketplaceData) {
    try {
      // Check if already connected
      if (this.isMarketplaceConnected(marketplaceData.id)) {
        return { success: false, message: 'Marketplace already connected' };
      }

      // Add to connected marketplaces
      this.connectedMarketplaces.push({
        ...marketplaceData,
        connectedAt: new Date().toISOString()
      });

      // Save to storage
      this._saveConnectedMarketplaces();

      return { success: true };
    } catch (error) {
      console.error('Error connecting marketplace:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Disconnect a marketplace
   * @param {string} marketplaceId - ID of marketplace to disconnect
   * @returns {Object} Success/failure object
   */
  disconnectMarketplace(marketplaceId) {
    try {
      const initialCount = this.connectedMarketplaces.length;
      
      this.connectedMarketplaces = this.connectedMarketplaces.filter(
        m => m.id !== marketplaceId
      );
      
      if (initialCount === this.connectedMarketplaces.length) {
        return { success: false, message: 'Marketplace not found' };
      }

      // Remove any stored tokens
      if (this.authTokens[marketplaceId]) {
        delete this.authTokens[marketplaceId];
      }

      this._saveConnectedMarketplaces();
      return { success: true };
    } catch (error) {
      console.error('Error disconnecting marketplace:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Store authentication token for a marketplace
   * @param {string} marketplaceId - The marketplace ID
   * @param {Object} tokenData - Token data to store
   */
  setAuthToken(marketplaceId, tokenData) {
    this.authTokens[marketplaceId] = {
      ...tokenData,
      timestamp: Date.now()
    };
  }

  /**
   * Get auth token for a marketplace
   * @param {string} marketplaceId - The marketplace ID
   * @returns {Object|null} Token data or null if not found
   */
  getAuthToken(marketplaceId) {
    return this.authTokens[marketplaceId] || null;
  }

  /**
   * Check if token is expired
   * @param {string} marketplaceId - The marketplace ID
   * @returns {boolean} True if expired or not found, false otherwise
   */
  isTokenExpired(marketplaceId) {
    const token = this.getAuthToken(marketplaceId);
    if (!token || !token.expiresAt) return true;
    
    return new Date(token.expiresAt) <= new Date();
  }

  /**
   * Import listings from a marketplace
   * @param {string} marketplaceId - The marketplace ID
   * @param {Object} options - Import options
   * @returns {Promise} Promise resolving to imported listings
   */
  async importListings(marketplaceId, options = {}) {
    try {
      if (!this.isMarketplaceConnected(marketplaceId)) {
        throw new Error(`Marketplace ${marketplaceId} is not connected`);
      }

      if (this.isTokenExpired(marketplaceId)) {
        throw new Error(`Authentication token for ${marketplaceId} is expired`);
      }

      // This would be implemented by each specific marketplace adapter
      throw new Error('importListings must be implemented by specific marketplace adapters');
    } catch (error) {
      console.error(`Error importing listings from ${marketplaceId}:`, error);
      throw error;
    }
  }

  /**
   * Cross-list to a marketplace
   * @param {string} marketplaceId - The marketplace ID
   * @param {Object} listingData - Listing data to cross-post
   * @returns {Promise} Promise resolving to the created listing
   */
  async crossList(marketplaceId, listingData) {
    try {
      if (!this.isMarketplaceConnected(marketplaceId)) {
        throw new Error(`Marketplace ${marketplaceId} is not connected`);
      }

      if (this.isTokenExpired(marketplaceId)) {
        throw new Error(`Authentication token for ${marketplaceId} is expired`);
      }

      // This would be implemented by each specific marketplace adapter
      throw new Error('crossList must be implemented by specific marketplace adapters');
    } catch (error) {
      console.error(`Error cross-listing to ${marketplaceId}:`, error);
      throw error;
    }
  }

  /**
   * Update a listing on a marketplace
   * @param {string} marketplaceId - The marketplace ID
   * @param {string} externalId - External listing ID on the marketplace
   * @param {Object} updateData - Updated listing data
   * @returns {Promise} Promise resolving to the updated listing
   */
  async updateListing(marketplaceId, externalId, updateData) {
    try {
      if (!this.isMarketplaceConnected(marketplaceId)) {
        throw new Error(`Marketplace ${marketplaceId} is not connected`);
      }

      if (this.isTokenExpired(marketplaceId)) {
        throw new Error(`Authentication token for ${marketplaceId} is expired`);
      }

      // This would be implemented by each specific marketplace adapter
      throw new Error('updateListing must be implemented by specific marketplace adapters');
    } catch (error) {
      console.error(`Error updating listing on ${marketplaceId}:`, error);
      throw error;
    }
  }
}

// Export the MarketplaceService class
window.AutoList = window.AutoList || {};
window.AutoList.MarketplaceService = MarketplaceService;
