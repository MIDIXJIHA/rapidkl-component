const axios = require('axios');

class WeatherAPI {
  constructor() {
    this.baseUrl = 'https://api.data.gov.my/weather';
  }

  /**
   * Get 7-day forecast
   */
  async getForecast(filters = {}) {
    try {
      const params = {
        limit: filters.limit || 100,
        ...filters
      };

      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params,
        timeout: 10000
      });

      return response.data.data || response.data;
    } catch (error) {
      throw new Error(`Failed to fetch forecast: ${error.message}`);
    }
  }

  /**
   * Get weather warnings
   */
  async getWarnings(filters = {}) {
    try {
      const params = {
        limit: filters.limit || 50,
        ...filters
      };

      const response = await axios.get(`${this.baseUrl}/warning`, {
        params,
        timeout: 10000
      });

      return response.data.data || response.data;
    } catch (error) {
      throw new Error(`Failed to fetch warnings: ${error.message}`);
    }
  }

  /**
   * Get earthquake warnings
   */
  async getEarthquakeWarnings(filters = {}) {
    try {
      const params = {
        limit: filters.limit || 50,
        ...filters
      };

      const response = await axios.get(`${this.baseUrl}/warning/earthquake`, {
        params,
        timeout: 10000
      });

      return response.data.data || response.data;
    } catch (error) {
      throw new Error(`Failed to fetch earthquake warnings: ${error.message}`);
    }
  }

  /**
   * Get forecast for a specific location
   */
  async getForecastByLocation(locationName, limit = 10) {
    try {
      return await this.getForecast({
        limit,
        contains: `${locationName}@location__location_name`
      });
    } catch (error) {
      throw new Error(`Failed to fetch forecast for ${locationName}: ${error.message}`);
    }
  }

  /**
   * Get forecast by location ID
   */
  async getForecastByLocationId(locationId) {
    try {
      return await this.getForecast({
        contains: `${locationId}@location__location_id`
      });
    } catch (error) {
      throw new Error(`Failed to fetch forecast for location ${locationId}: ${error.message}`);
    }
  }

  /**
   * Get forecast by location category
   */
  async getForecastByCategory(category) {
    // Categories: St (State), Rc (Recreation), Ds (District), Tn (Town), Dv (Division)
    try {
      return await this.getForecast({
        contains: `${category}@location__location_id`
      });
    } catch (error) {
      throw new Error(`Failed to fetch forecast for category ${category}: ${error.message}`);
    }
  }
}

module.exports = WeatherAPI;
