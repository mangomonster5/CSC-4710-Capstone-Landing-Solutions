// demand A-B = PopA * Travel Rate * Market Share * (PopB/Total Pop)

// all the airports and their populations
const airports = [
  { code: "ATL", population: 6411149 },
  { code: "DFW", population: 8344032 },
  { code: "DEN", population: 3052498 },
  { code: "ORD", population: 9408576 },
  { code: "LAX", population: 12927614 },
  { code: "JFK", population: 19940274 },
  { code: "CLT", population: 2883370 },
  { code: "LAS", population: 2398871 },
  { code: "MCO", population: 2940513 },
  { code: "MIA", population: 6457988 },
  { code: "PHX", population: 5186958 },
  { code: "SEA", population: 4145494 },
  { code: "SFO", population: 4648486 },
  { code: "EWR", population: 19940274 },
  { code: "IAH", population: 7796182 },
  { code: "BOS", population: 5025517 },
  { code: "MSP", population: 3757952 },
  { code: "FLL", population: 6457988 },
  { code: "LGA", population: 19940274 },
  { code: "DTW", population: 4400578 },
  { code: "PHL", population: 6330422 },
  { code: "SLC", population: 1300762 },
  { code: "BWI", population: 2859024 },
  { code: "IAD", population: 6436489 },
  { code: "SAN", population: 3298799 },
  { code: "DCA", population: 6436489 },
  { code: "TPA", population: 3424560 },
  { code: "BNA", population: 2150553 },
  { code: "AUS", population: 2550637 },
  { code: "HNL", population: 998747 },
  { code: "CDG", population: 13171056 }
];

// constants given
const TRAVEL_RATE = 0.005;   // 0.5%
const MARKET_SHARE = 0.02;   // 2%

function generatePassengerDemandRoutes(airports, travelRate, marketShare) {
  const routes = [];
// loop through all the airporrts and get all possible destinations (excluding itself)
  for (const origin of airports) {
    const reachableDestinations = airports.filter(
      airport => airport.code !== origin.code
    );
// calculates the denominator for the equation
    const totalReachablePopulation = reachableDestinations.reduce(
      (sum, airport) => sum + airport.population,
      0
    );
// calculates final demand
    const totalOutboundDemand =
      origin.population * travelRate * marketShare;

    for (const destination of reachableDestinations) {
    // Only allow JFK <-> CDG
      if (
        (origin.code === "CDG" && destination.code !== "JFK") ||
        (destination.code === "CDG" && origin.code !== "JFK")
      ) {
        continue;
      }
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
  return routes;
}
// runs the function
const routes = generatePassengerDemandRoutes(
  airports,
  TRAVEL_RATE,
  MARKET_SHARE
);