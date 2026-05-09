const axios = require('axios');
const RapidKLConfig = require('../Config/RapidKLConfig');

class RapidKLDriver {
  constructor() {
    this.config = new RapidKLConfig();
    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: this.config.getHeaders()
    });
    this.cache = new Map();
  }

  /**
   * Fetch data from RapidKL API
   * @param {string} endpoint - API endpoint
   * @param {object} params - Query parameters
   * @returns {Promise<object>} - API response data
   */
  async fetch(endpoint, params = {}) {
    const cacheKey = `${endpoint}:${JSON.stringify(params)}`;

    // Check cache
    if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.config.cacheTTL * 1000) {
        console.log(`Cache hit: ${cacheKey}`);
        return cached.data;
      }
      this.cache.delete(cacheKey);
    }

    try {
      const response = await this.client.get(endpoint, { params });
      const data = response.data;

      // Store in cache
      if (this.config.cacheEnabled) {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
      }

      return data;
    } catch (error) {
      console.error(`RapidKL API Error: ${error.message}`);
      throw new Error(`Failed to fetch ${endpoint}: ${error.message}`);
    }
  }

  /**
   * Get all transit routes
   * @returns {Promise<array>} - List of routes
   */
  async getRoutes() {
    return this.fetch('/api/public-transport/routes');
  }

  /**
   * Get transits for a specific route
   * @param {string} routeId - Route identifier
   * @returns {Promise<array>} - List of transits
   */
  async getTransitsByRoute(routeId) {
    return this.fetch(`/api/public-transport/route/${routeId}/transits`);
  }

  /**
   * Get stop details
   * @param {string} stopId - Stop identifier
   * @returns {Promise<object>} - Stop information
   */
  async getStopDetails(stopId) {
    return this.fetch(`/api/public-transport/stop/${stopId}`);
  }

  /**
   * Get arrivals at a stop
   * @param {string} stopId - Stop identifier
   * @returns {Promise<array>} - Arrival information
   */
  async getArrivals(stopId) {
    return this.fetch(`/api/public-transport/stop/${stopId}/arrivals`);
  }

  /**
   * Clear all cache
   */
  clearCache() {
    this.cache.clear();
    console.log('Cache cleared');
  }

  /**
   * Get cache statistics
   * @returns {object} - Cache info
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

module.exports = RapidKLDriver;
