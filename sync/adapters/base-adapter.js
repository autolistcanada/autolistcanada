// sync/adapters/base-adapter.js - AutoList Canada Extension
// Base adapter class for sync operations

export class BaseAdapter {
  constructor(platform) {
    this.platform = platform;
  }
  
  // Sync a single listing (to be implemented by subclasses)
  async syncListing(listing) {
    throw new Error('syncListing method must be implemented by subclass');
  }
  
  // Get listings from the platform (to be implemented by subclasses)
  async getListings() {
    throw new Error('getListings method must be implemented by subclass');
  }
  
  // Update a listing on the platform (to be implemented by subclasses)
  async updateListing(listing) {
    throw new Error('updateListing method must be implemented by subclass');
  }
  
  // Delete a listing from the platform (to be implemented by subclasses)
  async deleteListing(listingId) {
    throw new Error('deleteListing method must be implemented by subclass');
  }
  
  // Authenticate with the platform (to be implemented by subclasses)
  async authenticate() {
    throw new Error('authenticate method must be implemented by subclass');
  }
  
  // Check if adapter is authenticated
  isAuthenticated() {
    throw new Error('isAuthenticated method must be implemented by subclass');
  }
}
