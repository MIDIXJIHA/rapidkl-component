require('dotenv').config();

class RapidKLConfig {
  constructor() {
    this.baseUrl = process.env.RAPIDKL_API_BASE_URL || 'https://developer.data.gov.my';
    this.apiKey = process.env.RAPIDKL_API_KEY;
    this.timeout = process.env.API_TIMEOUT || 10000;
    this.cacheEnabled = process.env.CACHE_ENABLED === 'true';
    this.cacheTTL = parseInt(process.env.CACHE_TTL) || 300; // 5 minutes default
  }

  getApiUrl(endpoint) {
    return `${this.baseUrl}${endpoint}`;
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  isConfigValid() {
    return this.baseUrl && this.apiKey;
  }
}

module.exports = RapidKLConfig;
