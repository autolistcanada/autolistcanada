/**
 * @file services-loader.js
 * @description Service loader for AutoList Canada marketplace adapters
 */

window.AutoList = window.AutoList || {};

/**
 * Services manager for AutoList Canada
 */
class ServicesManager {
  constructor() {
    this.services = {};
    this.initialized = false;
  }

  /**
   * Initialize all marketplace services
   * @returns {Promise} Promise resolving when all services are loaded
   */
  async initialize() {
    try {
      if (this.initialized) {
        return { success: true, message: 'Services already initialized' };
      }

      // Initialize marketplace services
      const ebayService = new window.AutoList.EbayService();
      const amazonService = new window.AutoList.AmazonService();
      const etsyService = new window.AutoList.EtsyService();

      // Register services
      this.registerService('ebay-ca', ebayService);
      this.registerService('amazon-ca', amazonService);
      this.registerService('etsy', etsyService);

      this.initialized = true;
      
      return { success: true, message: 'All services initialized successfully' };
    } catch (error) {
      console.error('Error initializing services:', error);
      return { success: false, error };
    }
  }

  /**
   * Register a service
   * @param {string} serviceId - Service identifier
   * @param {object} service - Service instance
   */
  registerService(serviceId, service) {
    this.services[serviceId] = service;
  }

  /**
   * Get a specific service by ID
   * @param {string} serviceId - Service identifier
   * @returns {object} Service instance
   */
  getService(serviceId) {
    return this.services[serviceId] || null;
  }

  /**
   * Get all registered services
   * @returns {object} Map of services
   */
  getAllServices() {
    return this.services;
  }

  /**
   * Get all connected marketplace services
   * @returns {Array} Array of connected services
   */
  getConnectedMarketplaces() {
    const connectedServices = [];
    
    Object.values(this.services).forEach(service => {
      if (service.getConnectedMarketplaces && service.getConnectedMarketplaces().length > 0) {
        connectedServices.push(service);
      }
    });
    
    return connectedServices;
  }
}

// Create and expose the services manager
window.AutoList.servicesManager = new ServicesManager();

// Auto-initialize services when DOM content is loaded
document.addEventListener('DOMContentLoaded', async () => {
  await window.AutoList.servicesManager.initialize();
  console.log('AutoList marketplace services initialized');
});
