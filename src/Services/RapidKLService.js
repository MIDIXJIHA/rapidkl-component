const RapidKLDriver = require('../Drivers/RapidKLDriver');
const Route = require('../Models/Route');
const Stop = require('../Models/Stop');
const Transit = require('../Models/Transit');

class RapidKLService {
  constructor() {
    this.driver = new RapidKLDriver();
    this.routes = [];
    this.stops = [];
    this.transits = [];
  }

  /**
   * Initialize service and load data
   */
  async initialize() {
    try {
      console.log('Initializing RapidKL Service...');
      await this.loadRoutes();
      console.log('RapidKL Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize RapidKL Service:', error.message);
      throw error;
    }
  }

  /**
   * Load all routes
   */
  async loadRoutes() {
    try {
      const data = await this.driver.getRoutes();
      this.routes = (data.data || data).map(routeData => new Route(routeData));
      return this.routes;
    } catch (error) {
      console.error('Error loading routes:', error.message);
      throw error;
    }
  }

  /**
   * Get all routes
   * @returns {array<Route>}
   */
  getRoutes() {
    return this.routes;
  }

  /**
   * Get route by ID
   * @param {string} routeId - Route ID
   * @returns {Route|null}
   */
  getRouteById(routeId) {
    return this.routes.find(route => route.id === routeId || route.code === routeId);
  }

  /**
   * Search routes by name or code
   * @param {string} query - Search query
   * @returns {array<Route>}
   */
  searchRoutes(query) {
    const lowerQuery = query.toLowerCase();
    return this.routes.filter(route =>
      route.name.toLowerCase().includes(lowerQuery) ||
      route.code.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get transits for a specific route
   * @param {string} routeId - Route ID
   * @returns {array<Transit>}
   */
  async getTransitsByRoute(routeId) {
    try {
      const data = await this.driver.getTransitsByRoute(routeId);
      const transits = (data.data || data).map(transitData => new Transit(transitData));
      this.transits = transits;
      return transits;
    } catch (error) {
      console.error(`Error loading transits for route ${routeId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get stop details
   * @param {string} stopId - Stop ID
   * @returns {Stop}
   */
  async getStopDetails(stopId) {
    try {
      const data = await this.driver.getStopDetails(stopId);
      return new Stop(data.data || data);
    } catch (error) {
      console.error(`Error loading stop ${stopId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get arrivals at a stop
   * @param {string} stopId - Stop ID
   * @returns {array<Transit>}
   */
  async getArrivals(stopId) {
    try {
      const data = await this.driver.getArrivals(stopId);
      return (data.data || data).map(transitData => new Transit(transitData));
    } catch (error) {
      console.error(`Error loading arrivals for stop ${stopId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get nearby stops
   * @param {number} latitude - User latitude
   * @param {number} longitude - User longitude
   * @param {number} radiusKm - Search radius in km
   * @returns {array<Stop>}
   */
  async getNearbyStops(latitude, longitude, radiusKm = 1) {
    try {
      // This would require loading all stops first or using a different API endpoint
      // For now, we'll just return an empty array
      return [];
    } catch (error) {
      console.error('Error finding nearby stops:', error.message);
      throw error;
    }
  }

  /**
   * Get service status
   * @returns {object}
   */
  getServiceStatus() {
    return {
      totalRoutes: this.routes.length,
      operationalRoutes: this.routes.filter(r => r.isOperational()).length,
      totalTransits: this.transits.length,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.driver.clearCache();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.driver.getCacheStats();
  }
}

module.exports = RapidKLService;
