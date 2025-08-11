// sync/sync-manager.js - AutoList Canada Extension
// Sync manager handling coordination between adapters

export class SyncManager {
  constructor() {
    this.adapters = new Map();
    this.syncHistory = [];
    this.isSyncing = false;
  }
  
  // Register an adapter
  registerAdapter(name, adapter) {
    this.adapters.set(name, adapter);
  }
  
  // Get an adapter by name
  getAdapter(name) {
    return this.adapters.get(name);
  }
  
  // Sync listings between adapters
  async syncListings(sourceAdapter, targetAdapter, listings) {
    if (this.isSyncing) {
      throw new Error('Sync already in progress');
    }
    
    this.isSyncing = true;
    
    try {
      // Record sync start
      const syncStart = Date.now();
      const syncEntry = {
        id: this.generateSyncId(),
        timestamp: new Date().toISOString(),
        source: sourceAdapter,
        target: targetAdapter,
        status: 'pending',
        listingCount: listings.length,
        message: 'Sync started'
      };
      
      this.syncHistory.push(syncEntry);
      
      // Get adapters
      const source = this.getAdapter(sourceAdapter);
      const target = this.getAdapter(targetAdapter);
      
      if (!source || !target) {
        throw new Error(`Adapter not found: ${!source ? sourceAdapter : targetAdapter}`);
      }
      
      // Perform sync
      const results = await this.performSync(source, target, listings);
      
      // Update sync entry
      syncEntry.status = 'success';
      syncEntry.duration = Date.now() - syncStart;
      syncEntry.message = `Successfully synced ${results.successCount} of ${listings.length} listings`;
      syncEntry.results = results;
      
      return results;
    } catch (error) {
      // Update sync entry with error
      const syncEntry = this.syncHistory[this.syncHistory.length - 1];
      if (syncEntry) {
        syncEntry.status = 'error';
        syncEntry.message = error.message;
      }
      
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }
  
  // Perform the actual sync operation
  async performSync(source, target, listings) {
    const results = {
      successCount: 0,
      errorCount: 0,
      errors: []
    };
    
    // Process each listing
    for (const listing of listings) {
      try {
        // Transform listing for target platform
        const transformedListing = await this.transformListing(listing, target.platform);
        
        // Sync to target
        await target.syncListing(transformedListing);
        
        results.successCount++;
      } catch (error) {
        results.errorCount++;
        results.errors.push({
          listingId: listing.id,
          error: error.message
        });
      }
    }
    
    return results;
  }
  
  // Transform listing for target platform
  async transformListing(listing, targetPlatform) {
    // In a real implementation, this would transform the listing
    // to match the target platform's requirements
    return {
      ...listing,
      targetPlatform: targetPlatform
    };
  }
  
  // Generate a unique sync ID
  generateSyncId() {
    return 'sync_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  // Get sync history
  getSyncHistory() {
    return [...this.syncHistory].reverse(); // Return most recent first
  }
  
  // Clear sync history
  clearSyncHistory() {
    this.syncHistory = [];
  }
}
