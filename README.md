# RapidKL Component

A Node.js module for fetching, parsing, and managing Malaysian RapidKL public transit data from the official API.

## Features

- Fetch real-time transit data from RapidKL API
- Parse and normalize transit information
- Manage routes, stops, and transit schedules
- Cache and store transit data
- Easy-to-use service interface

## Installation

```bash
npm install
```

## Usage

```javascript
const RapidKLService = require('./src/Services/RapidKLService');

const service = new RapidKLService();
const routes = await service.getRoutes();
const transits = await service.getTransitsByRoute('LRT1');
```

## API Reference

### RapidKLService

Main service class for RapidKL operations.

- `getRoutes()` - Get all available routes
- `getTransitsByRoute(routeId)` - Get transits for a specific route
- `getStopDetails(stopId)` - Get details for a specific stop
- `searchRoutes(query)` - Search routes by name or code

## Configuration

Create a `.env` file:

```env
RAPIDKL_API_BASE_URL=https://developer.data.gov.my
RAPIDKL_API_KEY=your_api_key_here
CACHE_ENABLED=true
CACHE_TTL=300
```

## Examples

See [examples/usage.js](examples/usage.js) for detailed usage examples.
