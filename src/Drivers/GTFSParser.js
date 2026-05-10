const axios = require('axios');
const unzipper = require('unzipper');
const { Readable } = require('stream');
const fs = require('fs');
const path = require('path');

class GTFSParser {
  constructor() {
    this.baseUrl = 'https://api.data.gov.my/gtfs-static';
    this.operators = {
      'ktmb': { name: 'KTMB (Trains)', endpoint: 'ktmb' },
      'prasarana-kl': { name: 'Prasarana KL (LRT/MRT)', endpoint: 'prasarana?category=rapid-rail-kl' },
      'prasarana-bus-kl': { name: 'Prasarana Bus KL', endpoint: 'prasarana?category=rapid-bus-kl' },
      'mybas-kangar': { name: 'BAS.MY Kangar', endpoint: 'mybas-kangar' },
      'mybas-alor-setar': { name: 'BAS.MY Alor Setar', endpoint: 'mybas-alor-setar' },
      'mybas-kota-bharu': { name: 'BAS.MY Kota Bharu', endpoint: 'mybas-kota-bharu' },
      'mybas-terengganu': { name: 'BAS.MY Terengganu', endpoint: 'mybas-kuala-terengganu' },
      'mybas-ipoh': { name: 'BAS.MY Ipoh', endpoint: 'mybas-ipoh' },
      'mybas-seremban': { name: 'BAS.MY Seremban', endpoint: 'mybas-seremban-a' },
      'mybas-melaka': { name: 'BAS.MY Melaka', endpoint: 'mybas-melaka' },
      'mybas-johor': { name: 'BAS.MY Johor Bahru', endpoint: 'mybas-johor' },
      'mybas-kuching': { name: 'BAS.MY Kuching', endpoint: 'mybas-kuching' }
    };
  }

  /**
   * Get list of available operators
   */
  getOperators() {
    return Object.entries(this.operators).map(([id, op]) => ({
      id,
      name: op.name
    }));
  }

  /**
   * Download GTFS ZIP file
   */
  async downloadGTFS(operatorId) {
    const operator = this.operators[operatorId];
    if (!operator) {
      throw new Error(`Unknown operator: ${operatorId}`);
    }

    try {
      const url = `${this.baseUrl}/${operator.endpoint}`;
      console.log(`Downloading GTFS from: ${url}`);

      const response = await axios.get(url, {
        responseType: 'stream',
        timeout: 30000
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to download GTFS for ${operatorId}: ${error.message}`);
    }
  }

  /**
   * Parse GTFS ZIP stream
   */
  async parseGTFS(operatorId) {
    const gtfsStream = await this.downloadGTFS(operatorId);
    const data = {};

    return new Promise((resolve, reject) => {
      gtfsStream
        .pipe(unzipper.Parse())
        .on('entry', async (entry) => {
          const fileName = entry.path;
          let content = '';

          entry.on('data', (chunk) => {
            content += chunk.toString();
          });

          entry.on('end', () => {
            if (fileName.endsWith('.txt')) {
              const name = path.basename(fileName, '.txt');
              data[name] = this.parseCSV(content);
            }
          });

          entry.on('error', reject);
        })
        .on('error', reject)
        .on('close', () => {
          resolve(data);
        });
    });
  }

  /**
   * Parse CSV content
   */
  parseCSV(content) {
    const lines = content.trim().split('\n');
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      rows.push(row);
    }

    return rows;
  }

  /**
   * Get routes from GTFS data
   */
  getRoutes(gtfsData) {
    return (gtfsData.routes || []).map(route => ({
      id: route.route_id,
      name: route.route_long_name || route.route_short_name,
      code: route.route_short_name,
      type: route.route_type,
      color: route.route_color || '#1976d2'
    }));
  }

  /**
   * Get stops from GTFS data
   */
  getStops(gtfsData) {
    return (gtfsData.stops || []).map(stop => ({
      id: stop.stop_id,
      name: stop.stop_name,
      latitude: parseFloat(stop.stop_lat),
      longitude: parseFloat(stop.stop_lon),
      code: stop.stop_code || ''
    }));
  }

  /**
   * Get trips for a route
   */
  getTripsForRoute(gtfsData, routeId) {
    return (gtfsData.trips || []).filter(trip => trip.route_id === routeId);
  }

  /**
   * Get stop times for a trip
   */
  getStopTimesForTrip(gtfsData, tripId) {
    return (gtfsData.stop_times || [])
      .filter(st => st.trip_id === tripId)
      .sort((a, b) => parseInt(a.stop_sequence) - parseInt(b.stop_sequence));
  }

  /**
   * Get agencies from GTFS data
   */
  getAgencies(gtfsData) {
    return gtfsData.agency || [];
  }

  /**
   * Get shape points for a given shape_id from shapes.txt.
   * shapes.txt columns: shape_id, shape_pt_lat, shape_pt_lon, shape_pt_sequence, shape_dist_traveled
   * Returns points ordered by shape_pt_sequence as [lat, lng] arrays.
   */
  getShapePoints(gtfsData, shapeId) {
    return (gtfsData.shapes || [])
      .filter(s => s.shape_id === shapeId)
      .sort((a, b) => parseInt(a.shape_pt_sequence) - parseInt(b.shape_pt_sequence))
      .map(s => [parseFloat(s.shape_pt_lat), parseFloat(s.shape_pt_lon)]);
  }

  /**
   * Get the shape_id for a trip
   */
  getShapeIdForTrip(gtfsData, tripId) {
    const trip = (gtfsData.trips || []).find(t => t.trip_id === tripId);
    return trip ? trip.shape_id : null;
  }

  /**
   * Get shape points for a route by finding the first trip that has a shape_id
   */
  getRouteShape(gtfsData, routeId) {
    const trips = this.getTripsForRoute(gtfsData, routeId);
    for (const trip of trips) {
      if (trip.shape_id) {
        const points = this.getShapePoints(gtfsData, trip.shape_id);
        if (points.length > 1) return points;
      }
    }
    return [];
  }
}

module.exports = GTFSParser;
