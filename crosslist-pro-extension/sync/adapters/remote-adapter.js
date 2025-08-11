// sync/adapters/remote-adapter.js - AutoList Canada Extension
// Remote API adapter for sync operations

import { BaseAdapter } from './base-adapter.js';

export class RemoteAdapter extends BaseAdapter {
  constructor(endpoint, apiKey) {
    super('remote');
    this.endpoint = endpoint;
    this.apiKey = apiKey;
    this.authenticated = false;
  }
  
  // Sync a single listing to remote API
  async syncListing(listing) {
    if (!this.authenticated) {
      throw new Error('Not authenticated with remote API');
    }
    
    try {
      const response = await fetch(`${this.endpoint}/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(listing)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to sync listing to remote API: ${error.message}`);
    }
  }
  
  // Get listings from remote API
  async getListings() {
    if (!this.authenticated) {
      throw new Error('Not authenticated with remote API');
    }
    
    try {
      const response = await fetch(`${this.endpoint}/listings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get listings from remote API: ${error.message}`);
    }
  }
  
  // Update a listing on remote API
  async updateListing(listing) {
    if (!this.authenticated) {
      throw new Error('Not authenticated with remote API');
    }
    
    try {
      const response = await fetch(`${this.endpoint}/listings/${listing.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(listing)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to update listing on remote API: ${error.message}`);
    }
  }
  
  // Delete a listing from remote API
  async deleteListing(listingId) {
    if (!this.authenticated) {
      throw new Error('Not authenticated with remote API');
    }
    
    try {
      const response = await fetch(`${this.endpoint}/listings/${listingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      throw new Error(`Failed to delete listing from remote API: ${error.message}`);
    }
  }
  
  // Authenticate with remote API
  async authenticate() {
    try {
      const response = await fetch(`${this.endpoint}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      this.authenticated = true;
      return true;
    } catch (error) {
      this.authenticated = false;
      throw new Error(`Failed to authenticate with remote API: ${error.message}`);
    }
  }
  
  // Check if adapter is authenticated
  isAuthenticated() {
    return this.authenticated;
  }
  
  // Update API credentials
  updateCredentials(endpoint, apiKey) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
    this.authenticated = false;
  }
}
