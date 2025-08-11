// sync/adapters/local-adapter.js - AutoList Canada Extension
// Local storage adapter for sync operations

import { BaseAdapter } from './base-adapter.js';

export class LocalAdapter extends BaseAdapter {
  constructor() {
    super('local');
    this.storageKey = 'autolist_listings';
  }
  
  // Sync a single listing to local storage
  async syncListing(listing) {
    try {
      const listings = await this.getListings();
      
      // Check if listing already exists
      const existingIndex = listings.findIndex(l => l.id === listing.id);
      
      if (existingIndex >= 0) {
        // Update existing listing
        listings[existingIndex] = { ...listings[existingIndex], ...listing };
      } else {
        // Add new listing
        listings.push(listing);
      }
      
      // Save to storage
      await this.saveListings(listings);
      
      return listing;
    } catch (error) {
      throw new Error(`Failed to sync listing to local storage: ${error.message}`);
    }
  }
  
  // Get listings from local storage
  async getListings() {
    try {
      const result = await chrome.storage.local.get([this.storageKey]);
      return result[this.storageKey] || [];
    } catch (error) {
      throw new Error(`Failed to get listings from local storage: ${error.message}`);
    }
  }
  
  // Update a listing in local storage
  async updateListing(listing) {
    return await this.syncListing(listing);
  }
  
  // Delete a listing from local storage
  async deleteListing(listingId) {
    try {
      const listings = await this.getListings();
      const filteredListings = listings.filter(l => l.id !== listingId);
      await this.saveListings(filteredListings);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete listing from local storage: ${error.message}`);
    }
  }
  
  // Save listings to local storage
  async saveListings(listings) {
    try {
      await chrome.storage.local.set({ [this.storageKey]: listings });
    } catch (error) {
      throw new Error(`Failed to save listings to local storage: ${error.message}`);
    }
  }
  
  // Authenticate (always true for local storage)
  async authenticate() {
    return true;
  }
  
  // Check if adapter is authenticated
  isAuthenticated() {
    return true;
  }
  
  // Clear all listings
  async clearListings() {
    try {
      await chrome.storage.local.remove(this.storageKey);
      return true;
    } catch (error) {
      throw new Error(`Failed to clear listings from local storage: ${error.message}`);
    }
  }
}
