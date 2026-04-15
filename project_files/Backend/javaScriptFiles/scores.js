// scoring determined by demand / distance

import Airport from './airport.js';
import { routes } from './demand.js';

Airport.loadAirports();

// get distance between two airports
function getDistance(from, to) {
  const origin = Airport.airports[from];
  const destination = Airport.airports[to];
  
  return origin.distanceTo(destination);
}
// build the scoring for the routes
function buildBaseScoredRoutes(routeList) {
  return routeList
    .map((route) => {
      const distance = getDistance(route.from, route.to);
// calculate score (demand / distance)
      const score = route.demand / distance;
// return new route object with added values
      return {
        routeId: route.routeId,
        from: route.from,
        to: route.to,
        demand: route.demand,
        distance: Number(distance.toFixed(2)),
        score: Number(score.toFixed(6))
      };
    })
//sort the values high to low
    .sort((a, b) => b.score - a.score); 
}

// creates multiple days and duplicates it across days
function expandRoutesAcrossDays(baseRoutes, totalDays = 14) {
// creates expanded array
  const expanded = [];
// loop creating the days
  for (let day = 1; day <= totalDays; day++) {
    for (const route of baseRoutes) {
      expanded.push({
        day,
        ...route
      });
    }
  }

  return expanded;
}

// create base scoring routes
const baseScoredRoutes = buildBaseScoredRoutes(routes);
// expands across 14 days
export const scoredRoutes = expandRoutesAcrossDays(baseScoredRoutes, 14);


// for(let i = 0; i < scoredRoutes.length; i++){
//     if(scoredRoutes[i].from == "CDG"){
//       console.log(scoredRoutes[i]);
//     }
// }

