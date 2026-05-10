const GTFSParser = require('../Drivers/GTFSParser');

class GTFSService {
  constructor() {
    this.parser = new GTFSParser();
    this.gtfsCache = new Map();
    this.cacheTTL = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Get available operators
   */
  getOperators() {
    return this.parser.getOperators();
  }

  /**
   * Load GTFS data for operator
   */
  async loadGTFSData(operatorId) {
    // Check cache
    if (this.gtfsCache.has(operatorId)) {
      const cached = this.gtfsCache.get(operatorId);
      if (Date.now() - cached.timestamp < this.cacheTTL) {
        console.log(`Using cached GTFS for ${operatorId}`);
        return cached.data;
      }
      this.gtfsCache.delete(operatorId);
    }

    try {
      console.log(`Loading GTFS data for ${operatorId}...`);
      const gtfsData = await this.parser.parseGTFS(operatorId);

      // Cache the data
      this.gtfsCache.set(operatorId, {
        data: gtfsData,
        timestamp: Date.now()
      });

      console.log(`GTFS data loaded: ${Object.keys(gtfsData).join(', ')}`);
      return gtfsData;
    } catch (error) {
      console.error(`Failed to load GTFS for ${operatorId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get routes for operator
   */
  async getRoutes(operatorId) {
    const gtfsData = await this.loadGTFSData(operatorId);
    return this.parser.getRoutes(gtfsData);
  }

  /**
   * Get stops for operator
   */
  async getStops(operatorId) {
    const gtfsData = await this.loadGTFSData(operatorId);
    return this.parser.getStops(gtfsData);
  }

  /**
   * Get route details
   */
  async getRouteDetails(operatorId, routeId) {
    const gtfsData = await this.loadGTFSData(operatorId);
    const routes = this.parser.getRoutes(gtfsData);
    return routes.find(r => r.id === routeId);
  }

  /**
   * Get stops for a route
   */
  async getRouteStops(operatorId, routeId) {
    const gtfsData = await this.loadGTFSData(operatorId);
    const trips = this.parser.getTripsForRoute(gtfsData, routeId);
    if (!trips.length) return [];
    const firstTrip = trips[0];
    const stopTimes = this.parser.getStopTimesForTrip(gtfsData, firstTrip.trip_id);
    const rawStops = gtfsData.stops || [];
    return stopTimes.map(st => {
      const stop = rawStops.find(s => s.stop_id === st.stop_id);
      if (!stop) return null;
      return {
        ...stop,
        stop_sequence: Number(st.stop_sequence || 0),
        stop_lat: parseFloat(stop.stop_lat),
        stop_lon: parseFloat(stop.stop_lon),
      };
    }).filter(Boolean);
  }

  /**
   * Get shape polyline points for a route (from shapes.txt)
   */
  async getRouteShape(operatorId, routeId) {
    const gtfsData = await this.loadGTFSData(operatorId);
    return this.parser.getRouteShape(gtfsData, routeId);
  }

  /**
   * Get schedule for a stop on a route
   */
  async getSchedule(operatorId, routeId, stopId) {
    const gtfsData = await this.loadGTFSData(operatorId);
    const trips = this.parser.getTripsForRoute(gtfsData, routeId);

    const schedule = [];

    for (const trip of trips) {
      const stopTimes = this.parser.getStopTimesForTrip(gtfsData, trip.trip_id);
      const stopTime = stopTimes.find(st => st.stop_id === stopId);

      if (stopTime) {
        schedule.push({
          tripId: trip.trip_id,
          arrivalTime: stopTime.arrival_time,
          departureTime: stopTime.departure_time,
          stopSequence: stopTime.stop_sequence
        });
      }
    }

    return schedule.sort((a, b) => a.arrivalTime.localeCompare(b.arrivalTime));
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.gtfsCache.clear();
    console.log('GTFS cache cleared');
  }
}

module.exports = GTFSService;
