// demand A-B = PopA * Travel Rate * Market Share * (PopB/Total Pop)

//import airport information
import Airport from './airport.js';

Airport.loadAirports(); // make sure Airport.airports is populated

// all the airports and their populations
const airports = [
  { code: "ATL", lat: 33.6324, lon: -84.4333, population: 6411149 },
  { code: "DFW", lat: 32.8922, lon: -97.0391, population: 8344032 },
  { code: "DEN", lat: 39.8563, lon: -104.6764, population: 3052498 },
  { code: "ORD", lat: 41.9803, lon: -87.9090, population: 9408576 },
  { code: "LAX", lat: 33.9422, lon: -118.4036, population: 12927614 },
  { code: "JFK", lat: 40.6446, lon: -73.7797, population: 19940274 },
  { code: "CLT", lat: 35.2163, lon: -80.9539, population: 2883370 },
  { code: "LAS", lat: 36.0831, lon: -115.1482, population: 2398871 },
  { code: "MCO", lat: 28.4244, lon: -81.3105, population: 2940513 },
  { code: "MIA", lat: 25.7923, lon: -80.2823, population: 6457988 },
  { code: "PHX", lat: 33.4352, lon: -112.0101, population: 5186958 },
  { code: "SEA", lat: 47.4484, lon: -122.3086, population: 4145494 },
  { code: "SFO", lat: 37.6191, lon: -122.3816, population: 4648486 },
  { code: "EWR", lat: 40.6885, lon: -74.1769, population: 19940274 },
  { code: "IAH", lat: 29.9931, lon: -95.3416, population: 7796182 },
  { code: "BOS", lat: 42.3656, lon: -71.0096, population: 5025517 },
  { code: "MSP", lat: 44.8851, lon: -93.2144, population: 3757952 },
  { code: "FLL", lat: 26.0732, lon: -80.1512, population: 6457988 },
  { code: "LGA", lat: 40.7766, lon: -73.8742, population: 19940274 },
  { code: "DTW", lat: 42.2132, lon: -83.3525, population: 4400578 },
  { code: "PHL", lat: 39.8730, lon: -75.2437, population: 6330422 },
  { code: "SLC", lat: 40.7903, lon: -111.9771, population: 1300762 },
  { code: "BWI", lat: 39.1774, lon: -76.6684, population: 2859024 },
  { code: "IAD", lat: 38.9522, lon: -77.4579, population: 6436489 },
  { code: "SAN", lat: 32.7379, lon: -117.1897, population: 3298799 },
  { code: "DCA", lat: 38.8501, lon: -77.0392, population: 6436489 },
  { code: "TPA", lat: 27.9769, lon: -82.5303, population: 3424560 },
  { code: "BNA", lat: 36.1249, lon: -86.6762, population: 2150553 },
  { code: "AUS", lat: 30.1941, lon: -97.6711, population: 2550637 },
  { code: "HNL", lat: 21.3187, lon: -157.9254, population: 998747 },
  { code: "CDG", lat: 49.0079, lon: 2.5508, population: 13171056 }
];

function distanceBetween(from, to){
  const fromAirport = Airport.airports[from];
  const toAirport = Airport.airports[to];

  return fromAirport.distanceTo(toAirport);
}

// constants given
const TRAVEL_RATE = 0.005;   // 0.5%
const MARKET_SHARE = 0.02;   // 2%

function generatePassengerDemandRoutes(airports, travelRate, marketShare) {
  const routes = [];

  // loop through all the airporrts and get all possible destinations
  for (const origin of airports) {
    const reachableDestinations = airports.filter(airport =>
      airport.code !== origin.code &&                                // exclude itself
      !((origin.code === "CDG" && airport.code !== "JFK") ||         // only allow CDG -> JFK
        (airport.code === "CDG" && origin.code !== "JFK")) &&        // only allow JFK -> CDG
      distanceBetween(origin.code, airport.code) >= 150              // only allow flights 150+ miles
    );

    // calculates the denominator for the equation
    const totalReachablePopulation = reachableDestinations.reduce(
      (sum, airport) => sum + airport.population,
      0
    );

    // calculates final outbound demand from the origin
    const totalOutboundDemand =
      origin.population * travelRate * marketShare;

    for (const destination of reachableDestinations) {
      const destinationShare =
        destination.population / totalReachablePopulation;

      const routeDemand = totalOutboundDemand * destinationShare;

      // pushes route objects into the array
      routes.push({
        routeId: `${origin.code}-${destination.code}`,
        from: origin.code,
        to: destination.code,
        demand: Number(routeDemand.toFixed(2))
      });
    }
  }

  // sorts routes
  routes.sort((a, b) => b.demand - a.demand);
  console.log(routes);
  return routes;
}

// export
export const routes = generatePassengerDemandRoutes(airports, TRAVEL_RATE, MARKET_SHARE);