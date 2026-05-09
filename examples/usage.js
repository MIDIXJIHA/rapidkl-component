const { RapidKLService } = require('../src/index');

/**
 * Example usage of RapidKL Component
 */
async function main() {
  try {
    // Create service instance
    const rapidkl = new RapidKLService();

    // Initialize the service
    await rapidkl.initialize();

    // Get all routes
    console.log('\n=== Available Routes ===');
    const routes = rapidkl.getRoutes();
    routes.slice(0, 5).forEach(route => {
      console.log(`${route.code}: ${route.getSummary()}`);
    });

    // Search for a specific route
    console.log('\n=== Search Route ===');
    const searchResults = rapidkl.searchRoutes('LRT');
    console.log(`Found ${searchResults.length} routes containing 'LRT'`);

    // Get transits for a route (requires valid route ID)
    if (routes.length > 0) {
      const firstRoute = routes[0];
      console.log(`\n=== Transits on Route ${firstRoute.code} ===`);
      try {
        const transits = await rapidkl.getTransitsByRoute(firstRoute.id);
        transits.slice(0, 3).forEach(transit => {
          console.log(`Vehicle ${transit.vehicleId}: ${transit.getOccupancyStatus()} (${transit.getDelayStatus()})`);
        });
      } catch (error) {
        console.log('Note: Transits API may not be available or require authentication');
      }
    }

    // Get service status
    console.log('\n=== Service Status ===');
    const status = rapidkl.getServiceStatus();
    console.log(`Total Routes: ${status.totalRoutes}`);
    console.log(`Operational Routes: ${status.operationalRoutes}`);

    // Cache statistics
    console.log('\n=== Cache Statistics ===');
    const cacheStats = rapidkl.getCacheStats();
    console.log(`Cache Entries: ${cacheStats.size}`);

  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nNote: Make sure you have:');
    console.log('1. Created a .env file with RAPIDKL_API_KEY');
    console.log('2. Valid API key from https://developer.data.gov.my');
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = main;
