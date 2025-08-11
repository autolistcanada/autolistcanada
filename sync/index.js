// sync/index.js - AutoList Canada Extension
// Main sync engine entry point

import { SyncManager } from './sync-manager.js';
import { LocalAdapter } from './adapters/local-adapter.js';
import { RemoteAdapter } from './adapters/remote-adapter.js';

// Initialize sync manager
const syncManager = new SyncManager();

// Register adapters
syncManager.registerAdapter('local', new LocalAdapter());

// Export for use in other modules
export { syncManager };
