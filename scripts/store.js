/**
 * AutoList Canada - Data Store
 * A simple localStorage-based store for managing listings.
 */

const STORE_KEY = 'autolist_listings';

// --- Core Store Functions ---

/**
 * Retrieves all listings from the store.
 * @returns {Array<Object>} An array of listing objects.
 */
function getListings() {
  try {
    const storedData = localStorage.getItem(STORE_KEY);
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error('Error reading from store:', error);
    return [];
  }
}

/**
 * Saves all listings to the store.
 * @param {Array<Object>} listings - The array of listing objects to save.
 */
function saveListings(listings) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(listings));
  } catch (error) {
    console.error('Error saving to store:', error);
  }
}

/**
 * Adds a new listing to the store.
 * @param {Object} listingData - The normalized listing data.
 * @returns {Object} The newly created listing with an ID and timestamps.
 */
function addListing(listingData) {
  const listings = getListings();
  const now = new Date().toISOString();
  const newListing = {
    ...listingData,
    id: `al_${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  listings.unshift(newListing); // Add to the top
  saveListings(listings);
  return newListing;
}

/**
 * Updates an existing listing.
 * @param {string} id - The ID of the listing to update.
 * @param {Object} updates - An object with the fields to update.
 * @returns {Object|null} The updated listing or null if not found.
 */
function updateListing(id, updates) {
  const listings = getListings();
  const index = listings.findIndex(item => item.id === id);
  if (index === -1) return null;

  listings[index] = {
    ...listings[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveListings(listings);
  return listings[index];
}

/**
 * Deletes one or more listings by their IDs.
 * @param {Array<string>} ids - An array of listing IDs to delete.
 */
function deleteListings(ids) {
  let listings = getListings();
  listings = listings.filter(item => !ids.includes(item.id));
  saveListings(listings);
}

/**
 * Retrieves a single listing by its ID.
 * @param {string} id - The ID of the listing to retrieve.
 * @returns {Object|null} The listing object or null if not found.
 */
function getListingById(id) {
  return getListings().find(item => item.id === id) || null;
}

// --- Bulk Operations ---

/**
 * Updates multiple listings at once.
 * @param {Array<string>} ids - The IDs of the listings to update.
 * @param {Object} updates - An object with the fields to update on each listing.
 */
function bulkUpdateListings(ids, updates) {
  const listings = getListings();
  let updatedCount = 0;
  const now = new Date().toISOString();

  const updatedListings = listings.map(listing => {
    if (ids.includes(listing.id)) {
      updatedCount++;
      return { ...listing, ...updates, updatedAt: now };
    }
    return listing;
  });

  if (updatedCount > 0) {
    saveListings(updatedListings);
  }
}

// Expose functions to the global scope for easy access from other scripts
window.AutoListStore = {
  getListings,
  saveListings,
  addListing,
  updateListing,
  deleteListings,
  getListingById,
  bulkUpdateListings,
};
