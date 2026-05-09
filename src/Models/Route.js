class Route {
  constructor(data) {
    this.id = data.id || data.routeId;
    this.name = data.name || data.routeName;
    this.code = data.code || data.routeCode;
    this.type = data.type; // e.g., 'LRT1', 'BRT1', 'MRT'
    this.operator = data.operator;
    this.origin = data.origin;
    this.destination = data.destination;
    this.stops = data.stops || [];
    this.status = data.status || 'operational'; // operational, maintenance, suspended
    this.color = data.color;
    this.schedule = data.schedule || {};
    this.rawData = data;
  }

  /**
   * Get number of stops on route
   * @returns {number}
   */
  getStopCount() {
    return this.stops.length;
  }

  /**
   * Get route summary
   * @returns {string}
   */
  getSummary() {
    return `${this.code}: ${this.origin} → ${this.destination} (${this.stops.length} stops)`;
  }

  /**
   * Check if route is operational
   * @returns {boolean}
   */
  isOperational() {
    return this.status === 'operational';
  }

  /**
   * Get operating hours
   * @returns {object}
   */
  getOperatingHours() {
    return {
      firstTrain: this.schedule.firstTrain || '05:30',
      lastTrain: this.schedule.lastTrain || '23:30',
      frequency: this.schedule.frequency || 'Every 3-5 minutes'
    };
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      type: this.type,
      operator: this.operator,
      origin: this.origin,
      destination: this.destination,
      stopCount: this.getStopCount(),
      status: this.status,
      color: this.color,
      schedule: this.schedule
    };
  }
}

module.exports = Route;
