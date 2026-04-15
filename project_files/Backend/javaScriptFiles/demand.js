// demand A-B = PopA * Travel Rate * Market Share * (PopB / Total Pop)

// import airport information
import Airport from './airport.js';

Airport.loadAirports();

// convert airport object into an array
const airports = Object.values(Airport.airports);

// constants given
const TRAVEL_RATE = 0.005;   // 0.5%
const MARKET_SHARE = 0.02;   // 2%

// distance between two airports
function distanceBetween(from, to) {
  const fromAirport = Airport.airports[from];
  const toAirport = Airport.airports[to];

  return fromAirport.distanceTo(toAirport);
}

// checks if route is allowed based on constraints
function isValidRoute(originCode, destinationCode) {
  if (originCode === destinationCode) {
    return false;
  }

  // only allow JFK <-> CDG
  if (
    (originCode === "CDG" && destinationCode !== "JFK") ||
    (destinationCode === "CDG" && originCode !== "JFK")
  ) {
    return false;
  }

  // remove flights less than 150 miles
  if (distanceBetween(originCode, destinationCode) < 150) {
    return false;
  }

  return true;
}

// demand calculator: demand A-B = PopA * Travel Rate * Market Share * (PopB / Total Pop)
function generatePassengerDemandRoutes(airports, travelRate, marketShare) {
  // creates routes array
  const routes = [];

// loop of each airport
  for (const origin of airports) {
    const validDestinations = airports.filter(destination =>
      isValidRoute(origin.code, destination.code)
    );
// finds total population
    const totalReachablePopulation = validDestinations.reduce(
      (sum, airport) => sum + airport.population,
      0
    );
// our market share of people flying out of A
    const totalOutboundDemand =
      origin.population * travelRate * marketShare;

      // loop through every possible airport destination
    for (const destination of validDestinations) {
      const destinationShare =
        destination.population / totalReachablePopulation;
      // final demand for route
      const routeDemand = totalOutboundDemand * destinationShare;
// pushes the routes into the array
      routes.push({
        routeId: `${origin.code}-${destination.code}`,
        from: origin.code,
        to: destination.code,
        demand: Number(routeDemand.toFixed(2))
      });
    }
  }
// sorts by best demand
  routes.sort((a, b) => b.demand - a.demand);
  return routes;
}

// generates routes and exports it to be pulled
export const routes = generatePassengerDemandRoutes(
  airports,
  TRAVEL_RATE,
  MARKET_SHARE
);