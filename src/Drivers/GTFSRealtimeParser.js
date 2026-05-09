const axios = require('axios');
const GtfsRealtimeBindings = require('gtfs-realtime-bindings');

class GTFSRealtimeParser {
  constructor() {
    this.baseUrl = 'https://api.data.gov.my/gtfs-realtime';
    this.operators = {
      'ktmb': { name: 'KTMB (Trains)', endpoint: 'vehicle-position/ktmb', category: null },
      'prasarana-kl-bus': { name: 'Prasarana KL Bus', endpoint: 'vehicle-position/prasarana', category: 'rapid-bus-kl' },
      'prasarana-kl-lrt': { name: 'Prasarana KL LRT', endpoint: 'vehicle-position/prasarana', category: 'rapid-kl' },
      'prasarana-kl-mrt': { name: 'Prasarana KL MRT', endpoint: 'vehicle-position/prasarana', category: 'rapid-rail-kl' },
      'prasarana-kl-monorail': { name: 'Prasarana KL Monorail', endpoint: 'vehicle-position/prasarana', category: 'rapid-kl' },
      'prasarana-kl-mrt-feeder': { name: 'Prasarana KL MRT Feeder', endpoint: 'vehicle-position/prasarana', category: 'rapid-bus-mrtfeeder' },
      'prasarana-penang': { name: 'Prasarana Penang', endpoint: 'vehicle-position/prasarana', category: 'rapid-bus-penang' },
      'prasarana-kuantan': { name: 'Prasarana Kuantan', endpoint: 'vehicle-position/prasarana', category: 'rapid-bus-kuantan' },
      'mybas-kangar': { name: 'BAS.MY Kangar', endpoint: 'vehicle-position/mybas-kangar', category: null },
      'mybas-alor-setar': { name: 'BAS.MY Alor Setar', endpoint: 'vehicle-position/mybas-alor-setar', category: null },
      'mybas-kota-bharu': { name: 'BAS.MY Kota Bharu', endpoint: 'vehicle-position/mybas-kota-bharu', category: null },
      'mybas-terengganu': { name: 'BAS.MY Terengganu', endpoint: 'vehicle-position/mybas-kuala-terengganu', category: null },
      'mybas-ipoh': { name: 'BAS.MY Ipoh', endpoint: 'vehicle-position/mybas-ipoh', category: null },
      'mybas-seremban-a': { name: 'BAS.MY Seremban (A)', endpoint: 'vehicle-position/mybas-seremban-a', category: null },
      'mybas-seremban-b': { name: 'BAS.MY Seremban (B)', endpoint: 'vehicle-position/mybas-seremban-b', category: null },
      'mybas-melaka': { name: 'BAS.MY Melaka', endpoint: 'vehicle-position/mybas-melaka', category: null },
      'mybas-johor': { name: 'BAS.MY Johor Bahru', endpoint: 'vehicle-position/mybas-johor', category: null },
      'mybas-kuching': { name: 'BAS.MY Kuching', endpoint: 'vehicle-position/mybas-kuching', category: null }
    };
  }

  /**
   * Get list of available realtime operators
   */
  getOperators() {
    return Object.entries(this.operators).map(([id, op]) => ({
      id,
      name: op.name
    }));
  }

  /**
   * Get GTFS static operator ID for realtime operator
   */
  getGTFSOperatorId(realtimeOperatorId) {
    // Map realtime operator IDs to GTFS static operator IDs
    const mapping = {
      'ktmb': 'ktmb',
      'prasarana-kl-bus': 'prasarana-kl',
      'prasarana-kl-lrt': 'prasarana-kl',
      'prasarana-kl-mrt': 'prasarana-kl',
      'prasarana-kl-monorail': 'prasarana-kl',
      'prasarana-kl-mrt-feeder': 'prasarana-kl',
      'prasarana-penang': 'prasarana-penang',
      'prasarana-kuantan': 'prasarana-kuantan'
    };
    return mapping[realtimeOperatorId] || realtimeOperatorId;
  }

  /**
   * Fetch vehicle positions (protobuf format)
   */
  async getVehiclePositions(operatorId) {
    const operator = this.operators[operatorId];
    if (!operator) {
      throw new Error(`Unknown operator: ${operatorId}`);
    }

    try {
      let url = `${this.baseUrl}/${operator.endpoint}`;
      // Add category parameter for Prasarana operators
      if (operator.category) {
        url += `?category=${operator.category}`;
      }
      console.log(`Fetching realtime data from: ${url}`);

      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 10000
      });

      // Return raw protobuf data
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch vehicle positions for ${operatorId}: ${error.message}`);
    }
  }

  /**
   * Parse protobuf (simplified - returns raw buffer for now)
   * Full parsing would require gtfs-realtime-bindings
   */
  parseProtobuf(buffer) {
    try {
      const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(Buffer.from(buffer)));
      return this.transformFeed(feed);
    } catch (err) {
      console.error('GTFS parse error:', err);
      return { error: 'Failed to parse GTFS realtime feed', raw: buffer.toString('base64') };
    }
  }

  transformFeed(feed) {
    const vehicles = [];
    for (const e of feed.entity) {
      if (!e.vehicle?.position) continue;
      vehicles.push({
        id: e.id,
        lat: e.vehicle.position.latitude,
        lng: e.vehicle.position.longitude,
        bearing: e.vehicle.position.bearing || 0,
        speed: e.vehicle.position.speed || 0,
        routeId: e.vehicle.trip?.routeId,
        tripId: e.vehicle.trip?.tripId
      });
    }
    return { vehicles };
  }
}

module.exports = GTFSRealtimeParser;
