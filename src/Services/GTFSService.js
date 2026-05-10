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
  // async getRouteStops(operatorId, routeId) {
  //   const gtfsData = await this.loadGTFSData(operatorId);
  //   const trips = this.parser.getTripsForRoute(gtfsData, routeId);
  //   if (trips.length === 0) { return []; }
  //   const firstTrip = trips[0];
  //   const stopTimes = this.parser.getStopTimesForTrip(gtfsData, firstTrip.trip_id);
  //   const stops = this.parser.getStops(gtfsData);
  //   return stopTimes.map(st => { const stop = stops.find(s => s.stop_id === st.stop_id);
  //   if (!stop) return null;
  //   return {...stop, stop_sequence: Number(st.stop_sequence)};}).filter(Boolean);
  // }
  async getRouteStops(operatorId, routeId) {
    const gtfsData = await this.loadGTFSData(operatorId); console.log('\n========== ROUTE DEBUG =========='); console.log('operatorId:', operatorId); console.log('routeId:', routeId);
    const trips = this.parser.getTripsForRoute(gtfsData, routeId); console.log('Trips found:', trips.length); console.log('First 3 trips:', trips.slice(0,3));
    if (!trips.length) { console.log('NO TRIPS FOUND'); return []; }
    const firstTrip = trips[0]; console.log('First trip:', firstTrip);
    const stopTimes = this.parser.getStopTimesForTrip(gtfsData, firstTrip.trip_id); console.log('StopTimes count:', stopTimes.length); console.log('First 5 stopTimes:', stopTimes.slice(0,5));
    const stops = this.parser.getStops(gtfsData); console.log('Stops count:', stops.length); console.log('First 5 stops:', stops.slice(0,5));
    const merged = stopTimes.map(st => {
      const stop = stops.find(s => s.stop_id === st.stop_id);
      if (!stop) { console.log('STOP NOT FOUND:', st.stop_id); return null; }
      return { ...stop, stop_sequence: Number(st.stop_sequence || st.stop_sequence || 0) };
    }).filter(Boolean);
    console.log('Merged stops:', merged.length); console.log('First 5 merged:', merged.slice(0,5)); console.log('========== END DEBUG ==========\n');
    return merged;
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
