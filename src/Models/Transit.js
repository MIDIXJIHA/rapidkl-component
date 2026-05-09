class Transit {
  constructor(data) {
    this.id = data.id || data.transitId;
    this.routeId = data.routeId || data.route_id;
    this.routeName = data.routeName || data.route_name;
    this.vehicleId = data.vehicleId || data.vehicle_id;
    this.latitude = data.latitude || data.lat;
    this.longitude = data.longitude || data.lng;
    this.heading = data.heading || 0;
    this.speed = data.speed || 0;
    this.nextStop = data.nextStop || data.next_stop;
    this.lastStop = data.lastStop || data.last_stop;
    this.capacity = data.capacity || {};
    this.status = data.status || 'in-service'; // in-service, idle, maintenance
    this.timestamp = data.timestamp || new Date().toISOString();
    this.delay = data.delay || 0; // in minutes
    this.rawData = data;
  }

  /**
   * Get passenger occupancy percentage
   * @returns {number} - Percentage (0-100)
   */
  getOccupancy() {
    if (!this.capacity.current || !this.capacity.total) {
      return 0;
    }
    return Math.round((this.capacity.current / this.capacity.total) * 100);
  }

  /**
   * Get occupancy status
   * @returns {string}
   */
  getOccupancyStatus() {
    const occupancy = this.getOccupancy();
    if (occupancy < 33) return 'Not Crowded';
    if (occupancy < 66) return 'Moderately Crowded';
    return 'Very Crowded';
  }

  /**
   * Get location object
   * @returns {object}
   */
  getLocation() {
    return {
      latitude: this.latitude,
      longitude: this.longitude,
      heading: this.heading
    };
  }

  /**
   * Check if transit is on time
   * @returns {boolean}
   */
  isOnTime() {
    return this.delay <= 2; // Consider on-time if delay <= 2 minutes
  }

  /**
   * Get delay status
   * @returns {string}
   */
  getDelayStatus() {
    if (this.delay <= 2) return 'On Time';
    if (this.delay <= 10) return `${this.delay} min delay`;
    return `${this.delay} min delay (Late)`;
  }

  toJSON() {
    return {
      id: this.id,
      routeId: this.routeId,
      routeName: this.routeName,
      vehicleId: this.vehicleId,
      location: this.getLocation(),
      nextStop: this.nextStop,
      lastStop: this.lastStop,
      occupancy: this.getOccupancy(),
      occupancyStatus: this.getOccupancyStatus(),
      status: this.status,
      delay: this.delay,
      delayStatus: this.getDelayStatus(),
      timestamp: this.timestamp
    };
  }
}

module.exports = Transit;
