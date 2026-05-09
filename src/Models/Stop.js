class Stop {
  constructor(data) {
    this.id = data.id || data.stopId;
    this.name = data.name || data.stopName;
    this.code = data.code || data.stopCode;
    this.latitude = data.latitude || data.lat;
    this.longitude = data.longitude || data.lng;
    this.type = data.type; // e.g., 'LRT', 'BRT', 'MRT'
    this.lines = data.lines || [];
    this.accessibility = data.accessibility || {};
    this.address = data.address;
    this.rawData = data;
  }

  /**
   * Get distance from given coordinates
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {number} - Distance in kilometers
   */
  getDistance(lat, lng) {
    return this.calculateDistance(this.latitude, this.longitude, lat, lng);
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Check if stop is wheelchair accessible
   * @returns {boolean}
   */
  isAccessible() {
    return this.accessibility.wheelchair === true;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      latitude: this.latitude,
      longitude: this.longitude,
      type: this.type,
      lines: this.lines,
      accessibility: this.accessibility,
      address: this.address
    };
  }
}

module.exports = Stop;
