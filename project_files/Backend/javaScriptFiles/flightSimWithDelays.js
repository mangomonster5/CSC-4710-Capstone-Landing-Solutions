// flightSim3.js
// Run with: node flightSim3.js

import Airline from './airline.js';
import Flight from './flight.js';
import Costs from './costs.js';
import Airport from './airport.js';
import readline from 'readline';
import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('../landing_solutions.db', (err) => {  if (err) {
    console.error("DB connection error:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

// connect to the server
const sendFlight = async (from, to) => {
    try {
        const res = await fetch('http://localhost:5001/api/test', {
            method: 'GET',
            })

        const data = await res.json();
        console.log("Flight sent:", data);

    } catch (err) {
        console.error("Error:", err);
    }
}

    // arrival time offset based on timezones
    const TZ_OFFSET = {
    ATL: 0,
    AUS: -1,
    BNA: -1,
    BOS: 0,
    BWI: 0,
    CDG: 6,
    CLT: 0,
    DCA: 0,
    DEN: -2,
    DFW: -1,
    DTW: 0,
    EWR: 0,
    FLL: 0,
    IAD: 0,
    IAH: -1,
    JFK: 0,
    LAS: -3,
    LAX: -3,
    LGA: 0,
    MCO: 0,
    MIA: 0,
    MSP: -1,
    ORD: -1,
    PHL: 0,
    PHX: -2,
    SAN: -3,
    SEA: -3,
    SFO: -3,
    SLC: -2,
    TPA: 0
    };

    function toEasternMinutes(airportCode, localMinutes) {
    return localMinutes - (TZ_OFFSET[airportCode] * 60);
    }

    function fromEasternMinutes(airportCode, easternMinutes) {
    return easternMinutes + (TZ_OFFSET[airportCode] * 60);
    }

    function normalizeMinutes(mins) {
    const day = 24 * 60;
    let result = mins % day;
    if (result < 0) result += day;
    return result;
    }

    function isAirportOpen(localMinutes) {
    const t = normalizeMinutes(localMinutes);
    return t >= 5 * 60 || t <= 1 * 60;
    }

    function minutesToLocalDateTime(day, totalMinutes) {
    const baseDay = new Date(`2026-01-${pad(day)}T00:00:00`);
    baseDay.setMinutes(totalMinutes);

    const year = baseDay.getFullYear();
    const month = pad(baseDay.getMonth() + 1);
    const date = pad(baseDay.getDate());
    const hour = pad(baseDay.getHours());
    const minute = pad(baseDay.getMinutes());

    return `${year}-${month}-${date} ${hour}:${minute}:00`;
    }

const airportIdMap = {
  ATL: 1, DFW: 2, DEN: 3, ORD: 4, LAX: 5, JFK: 6, CLT: 7,
  LAS: 8, MCO: 9, MIA: 10, PHX: 11, SEA: 12, SFO: 13,
  EWR: 14, IAH: 15, BOS: 16, MSP: 17, FLL: 18, LGA: 19,
  DTW: 20, PHL: 21, SLC: 22, BWI: 23, IAD: 24, SAN: 25,
  DCA: 26, TPA: 27, BNA: 28, AUS: 29, HNL: 30, CDG: 31
};

function insertFlight(record) {
  const sql = `
    INSERT INTO all_flights (
      flight_num,
      sim_day,
      origin_airport_id,
      destination_airport_id,
      aircraft_id,
      scheduled_depart,
      scheduled_arrival,
      actual_depart,
      actual_arrival,
      passenger_count,
      flight_status,
      delay_minutes,
      gate,
      flight_distance,
      departure_fee,
      arrival_fee,
      fuel_burned,
      fuel_cost,
      operating_cost,
      ticket_price
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    record.flight_num,
    record.sim_day,
    record.origin_airport_id,
    record.destination_airport_id,
    record.aircraft_id,
    record.scheduled_depart,
    record.scheduled_arrival,
    record.actual_depart,
    record.actual_arrival,
    record.passenger_count,
    record.flight_status,
    record.delay_minutes,
    record.gate,
    record.flight_distance,
    record.departure_fee,
    record.arrival_fee,
    record.fuel_burned,
    record.fuel_cost,
    record.operating_cost,
    record.ticket_price
  ];

  db.run(sql, values, function (err) {
    if (err) {
      console.error("Insert error:", err.message);
    }
  });
}

// import the precomputed routes from scores.js
import { scoredRoutes } from './scores.js';


// -------------------------
// Intializations for simulation
// -------------------------
Airport.loadAirports();
const fleet = Airline.preloadFleet();
const flight = new Flight();
const costs = new Costs();
let currentDay = 1;

// -------------------------
// aircraft map id
// -------------------------
let aircraftIdMap = {};

function buildAircraftMap() {
    aircraftIdMap = {};
    fleet.forEach((plane, index) => {
        aircraftIdMap[plane.getTail()] = index + 1;
    });
}

// -------------------------
// READLINE SETUP
// -------------------------
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// -------------------------
// MENU
// -------------------------
function menu() {
    console.log("\n=== Airline Menu ===");
    console.log("1. Simulate Current Day: ", currentDay);
    console.log("2. Increase day");
    //console.log("3. Decrease Day");
    console.log("4. Check plane locations");
    console.log("0. Exit");

    rl.question("Choice: ", (choice) => {
        if (choice === "1") simluateCurrentDay();
        else if (choice === "2") increaseDay();
        //else if (choice === "3") decreaseDay();
        else if(choice == "4") fleetLocations();
        else {
            console.log("Exiting system.");
            rl.close();
        }
    });
}

// -------------------------
// TIME / GATE SCHEDULING HELPERS
// -------------------------

const DAY_START_MINUTES = 5 * 60;             // 5:00 AM
const DOOR_CLOSE_BUFFER = 15;                 // door closes 15 min before departure
const BOARDING_TIME = 15;                     // simple boarding window
const TURNAROUND_MINUTES = 40;                // minimum turnaround
const REFUEL_EXTRA_MINUTES = 10;              // extra turnaround if refueling needed
const TIME_STEP = 5;                          // scheduling search step

function pad(n) {
  return String(n).padStart(2, "0");
}

function minutesToDateTime(day, totalMinutes) {
  const baseDay = new Date(`2026-01-${pad(day)}T00:00:00`);
  baseDay.setMinutes(totalMinutes);

  const year = baseDay.getFullYear();
  const month = pad(baseDay.getMonth() + 1);
  const date = pad(baseDay.getDate());
  const hour = pad(baseDay.getHours());
  const minute = pad(baseDay.getMinutes());

  return `${year}-${month}-${date} ${hour}:${minute}:00`;
}

function overlaps(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

function buildGatePool(maxGates) {
  const all = [];
  for (const letter of ["A", "B", "C", "D"]) {
    for (let n = 1; n <= 30; n++) {
      all.push(`${letter}${n}`);
    }
  }
  return all.slice(0, maxGates);
}

function ensureAirportGateSchedule(schedule, airportCode) {
  if (!schedule[airportCode]) {
    schedule[airportCode] = [];
  }
}

function findAvailableGate(airportCode, start, end, gateSchedule) {
  ensureAirportGateSchedule(gateSchedule, airportCode);

  const maxGates = Airport.getNumGates(airportCode);
  const gatePool = buildGatePool(maxGates);

  for (const gateLabel of gatePool) {
    const busy = gateSchedule[airportCode].some(entry =>
      entry.gate === gateLabel &&
      overlaps(start, end, entry.start, entry.end)
    );

    if (!busy) return gateLabel;
  }

  return null;
}

function reserveGateInterval(schedule, airportCode, gateLabel, start, end) {
  ensureAirportGateSchedule(schedule, airportCode);
  schedule[airportCode].push({
    gate: gateLabel,
    start,
    end
  });
}

function findFeasibleSlot({
  origin,
  destination,
  targetDepartLocal,
  flightMinutes,
  delayMinutes,
  gateSchedule,
  needsRefuel
}) {
  const turnaround = TURNAROUND_MINUTES + (needsRefuel ? REFUEL_EXTRA_MINUTES : 0);

  // search in ORIGIN local time
  for (let localDepart = targetDepartLocal; localDepart <= 25 * 60; localDepart += TIME_STEP) {
    const scheduledDepartLocal = localDepart;
    const actualDepartLocal = scheduledDepartLocal + delayMinutes;

    // convert departure into shared Eastern/internal reference
    const scheduledDepartEastern = toEasternMinutes(origin, scheduledDepartLocal);
    const actualDepartEastern = toEasternMinutes(origin, actualDepartLocal);

    // add flight time in shared internal reference
    const scheduledArrivalEastern = scheduledDepartEastern + flightMinutes;
    const actualArrivalEastern = actualDepartEastern + flightMinutes;

    // convert arrival into DESTINATION local time
    const scheduledArrivalLocal = fromEasternMinutes(destination, scheduledArrivalEastern);
    const actualArrivalLocal = fromEasternMinutes(destination, actualArrivalEastern);

    // airport hours are checked in LOCAL airport time
    if (!isAirportOpen(scheduledDepartLocal)) continue;
    if (!isAirportOpen(actualArrivalLocal)) continue;

    // departure gate usage in ORIGIN local time
    const departureGateStart = scheduledDepartLocal - BOARDING_TIME - DOOR_CLOSE_BUFFER;
    const departureGateEnd = actualDepartLocal;

    // arrival gate usage in DESTINATION local time
    const arrivalGateStart = actualArrivalLocal;
    const arrivalGateEnd = actualArrivalLocal + turnaround;

    const departureGate = findAvailableGate(origin, departureGateStart, departureGateEnd, gateSchedule);
    const arrivalGate = findAvailableGate(destination, arrivalGateStart, arrivalGateEnd, gateSchedule);

    if (departureGate && arrivalGate) {
      reserveGateInterval(gateSchedule, origin, departureGate, departureGateStart, departureGateEnd);
      reserveGateInterval(gateSchedule, destination, arrivalGate, arrivalGateStart, arrivalGateEnd);

      return {
        scheduledDepartLocal,
        scheduledArrivalLocal,
        actualDepartLocal,
        actualArrivalLocal,
        departureGate,
        arrivalGate
      };
    }
  }

  return null;
}

// put into aircraft table

function insertAircraftSnapshots(simDay) {
  const sql = `
    INSERT OR REPLACE INTO aircraft (
      aircraft_id,
      sim_day,
      tail_num,
      model,
      capacity,
      max_speed,
      current_airport_id,
      flight_hours,
      hours_since_maint,
      hours_until_maint,
      status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  fleet.forEach((plane) => {
    const aircraftId = aircraftIdMap[plane.getTail()];
    const currentAirportId = airportIdMap[plane.getLocation()] ?? null;

    const flightHours = plane.getHours();

    const hoursSinceMaint = plane.getHours();
    const hoursUntilMaint = Math.max(0, 200 - hoursSinceMaint);

    const status = plane.available() ? "Available" : "Maintenance";

    const values = [
      aircraftId,
      simDay,
      plane.getTail(),
      plane.getModel(),
      plane.getSeats(),
      plane.getMaxSpeed(),
      currentAirportId,
      flightHours,
      hoursSinceMaint,
      hoursUntilMaint,
      status
    ];

    db.run(sql, values, (err) => {
      if (err) {
        console.error(`Aircraft snapshot insert error for ${plane.getTail()}:`, err.message);
      }
    });
  });
}

// -------------------------
// FLY PLANE
// -------------------------
function simluateCurrentDay() {

    // Max number of flights per day
    const MAX_FLIGHTS_PER_DAY = 300;

    const allAirports = [
        "ATL", "DFW", "DEN", "ORD", "LAX", "JFK", "CLT", "LAS", "MCO", "MIA",
        "PHX", "SEA", "SFO", "EWR", "IAH", "BOS", "MSP", "FLL", "LGA", "DTW",
        "PHL", "SLC", "BWI", "IAD", "SAN", "DCA", "TPA", "BNA", "AUS", "HNL", "CDG"
    ];

    const dayRoutes = scoredRoutes.filter(r => r.day === currentDay);

    const getScore = (r) => r.score;

    // ensures each airport is attempted at least once
    const requiredCoverageRoutes = [];
    const usedIndices = new Set();

    for (const airport of allAirports) {
        let bestIndex = -1;
        let bestScore = -Infinity;
        //finds the best route
        dayRoutes.forEach((r, idx) => {
            if (!usedIndices.has(idx) && r.to === airport) {
                const routeScore = getScore(r);
                if (routeScore > bestScore) {
                    bestScore = routeScore;
                    bestIndex = idx;
                }
            }
        });
        // adds the best route for this airport if one exists
        if (bestIndex !== -1) {
            requiredCoverageRoutes.push(dayRoutes[bestIndex]);
            usedIndices.add(bestIndex);
        }
    }
    // adds highest scoring remaining route up to 250
    const extraRoutes = dayRoutes
        .map((r, idx) => ({ route: r, idx }))
        .filter(item => !usedIndices.has(item.idx))
        .sort((a, b) => getScore(b.route) - getScore(a.route))
        .slice(0, Math.max(0, MAX_FLIGHTS_PER_DAY - requiredCoverageRoutes.length))
        .map(item => item.route);

    let currentDayRoutes = [...requiredCoverageRoutes, ...extraRoutes];
    //ensures daily JFK<->CDG flights
    const parisOutbound = dayRoutes.find(r => r.from === "JFK" && r.to === "CDG");
    const parisInbound = dayRoutes.find(r => r.from === "CDG" && r.to === "JFK");

    currentDayRoutes = currentDayRoutes.filter(r =>
    !(r.from === "JFK" && r.to === "CDG") &&
    !(r.from === "CDG" && r.to === "JFK")
    );

    const parisRoutes = [];
    if (parisOutbound) parisRoutes.push(parisOutbound);
    if (parisInbound) parisRoutes.push(parisInbound);

    currentDayRoutes = [...parisRoutes, ...currentDayRoutes];

    const gateSchedule = {};

    //console.log(currentDayRoutes);
    let i = 0;

    // track when each aircraft can be used again during the day
    const nextAvailableTime = {};
    fleet.forEach(p => {
        nextAvailableTime[p.getTail()] = DAY_START_MINUTES;
    });

    let failedPlaneTail = null;

// DAY 11 AIRCRAFT FAILURE
    if (currentDay === 11) {
        const hubs = ["ORD", "DFW", "LAX", "JFK"];

        const availablePlanesAtHubs = fleet.filter(p =>
            p.available() && hubs.includes(p.getLocation())
    );

    if (availablePlanesAtHubs.length > 0) {
        const randomIndex = Math.floor(Math.random() * availablePlanesAtHubs.length);
        const failedPlane = availablePlanesAtHubs[randomIndex];

        failedPlaneTail = failedPlane.getTail();

        console.log(`*** AIRCRAFT FAILURE: ${failedPlane.getTail()} at ${failedPlane.getLocation()} ***`);
        console.log("*** Aircraft removed from service for the day ***");

        failedPlane.setUnavailable();
        failedPlane.startMaintenance(currentDay);
        nextAvailableTime[failedPlane.getTail()] = Infinity;
    }
}

    //TESTING CHANGES
    while(i < currentDayRoutes.length){ //currentDayRoutes.length
        //start day by taking planes OUT of maintenance if the correct day:
        fleet.forEach(p => {
            if (!p.available() ) {
                if (currentDay >= p.getEndMaintenanceDay()) {
                    console.log(`*** ${p.getTail()} is out of maintenance ***`);
                    
                    p.resetMaintenance();
                }
            }
        });


        //makes it so it only picks a flight to "fly" if a plane exists there
        const locations = [...new Set(fleet.map(p => p.getLocation()))];
        if (!locations.includes(currentDayRoutes[i].from)) {
            i++;
            continue;
        }





        //set the next plane to the current planned flight
        let flyingPlane = currentDayRoutes[i];        
        let from = flyingPlane.from;
        let dest = flyingPlane.to;

        const fromAirport = Airport.airports[from];
        const destAirport = Airport.airports[dest];

        //sets if its an international flight
        const intl = (from === "CDG" || dest === "CDG");

        ///PLANE SELECTION
        let candidatePlanes;

        // Paris flights must use the A350-1000
        if (
            (from === "JFK" && dest === "CDG") ||
            (from === "CDG" && dest === "JFK")
        ) {
            candidatePlanes = fleet
                .filter(p =>
                    p.getModel() === "Airbus A350-1000" &&
                    p.getLocation() === from &&
                    p.available()
                )
                .sort((a, b) =>
                    (nextAvailableTime[a.getTail()] ?? DAY_START_MINUTES) -
                    (nextAvailableTime[b.getTail()] ?? DAY_START_MINUTES)
                );

            if (candidatePlanes.length === 0) {
                console.log(`*** SKIPPING: No available A350 for ${from} -> ${dest} ***`);
                i++;
                continue;
            }
        } else {
            candidatePlanes = fleet
                .filter(p =>
                    p.getLocation() === from &&
                    p.available()
                )
                .sort((a, b) =>
                    (nextAvailableTime[a.getTail()] ?? DAY_START_MINUTES) -
                    (nextAvailableTime[b.getTail()] ?? DAY_START_MINUTES)
                );

            if (candidatePlanes.length === 0) {
                i++;
                continue;
            }
        }

        // pick the earliest-ready aircraft at this airport
        let selected = candidatePlanes[0];

        // depart as soon as that plane is actually ready
        const targetDepartLocal = Math.max(
            DAY_START_MINUTES,
            nextAvailableTime[selected.getTail()] ?? DAY_START_MINUTES
        );

        // Fly plane
        const miles = Airport.flyAircraft(from, dest);
        const fuelNeed = flight.fuelNeeded(miles, selected.getModel());
        
        // Generate random 3 or 4 digit flight number
        const flightNumber = Math.floor(Math.random() * (9999 - 100 + 1)) + 100;

        let needFuel = false;
        let refueled;


        //FUELING PART
        if (selected.getFuel() < fuelNeed) {
            needFuel = true;
            // add fuel to reach full capacity, not just overwrite
            refueled = flight.refuel(selected.getModel());
            selected.updateFuel(refueled);
        }

        selected.updateFuel(selected.getFuel() - fuelNeed);


        //FLYING INFORMAITON

        const heading = flight.hdg(
            fromAirport.getLatitude(),
            fromAirport.getLongitude(),
            destAirport.getLatitude(),
            destAirport.getLongitude()
        );

        const cruiseAlt = flight.cruiseAltitude(intl, miles);

        const fromHub = ["ORD","DFW","LAX","JFK"].includes(from);
        const destHub = ["ORD","DFW","LAX","JFK"].includes(dest);


        const flightTime = flight.flightTime(
            miles,
            selected.getMaxSpeed(),
            heading,
            intl,
            fromAirport.getPopulation(),
            fromHub,
            destAirport.getPopulation(),
            destHub,
            needFuel
        );
            let finalFlightTime = flightTime;
            let delayMinutes = 0;
            let cancelled = false;
            let scenarioNote = "None";

            // NO IMPACT DAYS
            if (currentDay % 2 === 0) {
                // do nothing
                }

            // DAY 3: BAD WEATHER
            else if (currentDay === 3) {
                if (Math.random() < 0.25) {
                    const maxExtra = Math.max(1, Math.floor(flightTime * 0.15));
                    const extra = Math.floor(Math.random() * maxExtra) + 1;
                    finalFlightTime += extra;
                    scenarioNote = `Bad weather +${extra} min`;
                    }
            }

            // DAY 5: ICING DELAY
            else if (currentDay === 5) {
                if (fromAirport.getLatitude() > 40 && Math.random() < 0.20) {
                const extra = Math.floor(Math.random() * (45 - 10 + 1)) + 10;
                delayMinutes += extra;
                scenarioNote = `Icing delay +${extra} min`;
                }       
            }

            // DAY 7: JET STREAM
            else if (currentDay === 7) {
                const radians = heading * Math.PI / 180;
                const eastWestEffect = Math.sin(radians);
                const multiplier = 1 + (0.12 * eastWestEffect);
                finalFlightTime = Math.round(flightTime * multiplier);
                scenarioNote = `Jet stream x${multiplier.toFixed(2)}`;
            }

            // DAY 9: GATE DELAY
            else if (currentDay === 9) {
                if (Math.random() < 0.05) {
                    const extra = Math.floor(Math.random() * (90 - 5 + 1)) + 5;
                    delayMinutes += extra;
                    scenarioNote = `Gate delay +${extra} min`;
                }
            }

            // DAY 11: AIRCRAFT FAILURE
            else if (currentDay === 11) {
                scenarioNote = failedPlaneTail ? `Aircraft failure: ${failedPlaneTail}` : "Aircraft failure day";
            }

            // DAY 13: CANCELLATIONS
            else if (currentDay === 13) {
                if (fromAirport.getLongitude() < -103 && Math.random() < 0.08) {
                    cancelled = true;
                    scenarioNote = "Cancelled (Western disruption)";
                }
            }

        if (cancelled) {
            console.log(`*** FLIGHT CANCELLED: ${from} to ${dest} ***`);
            console.log(`Scenario: ${scenarioNote}`);
            i++;
            continue;
        }



        //COST SECTION
        const flightCost = costs.flightCost(
            fuelNeed,
            intl,
            from === "CDG",
            dest === "CDG"
        );

        const ticketPrice = costs.ticketPrice(
            flightCost,
            selected.getSeats()
        );

        const fuelCost = from === "CDG"
        ? costs.fuel_eu(fuelNeed * 3.78541)
        : costs.fuel_us(fuelNeed);

        const departureFee = from === "CDG"
        ? costs.airport_eu(1)
        : costs.airport_us(1);

        const arrivalFee = dest === "CDG"
        ? costs.airport_eu(1)
        : costs.airport_us(1);
       

        //PRINT OF ALL INFO

        console.log("\n=== Flight #", i, "Information ==="); 
        console.log("Flight Number:", flightNumber);       
        console.log(`Aircraft ${selected.getTail()} flew from ${from} to ${dest}`);
        console.log(`Distance: ${miles.toFixed(2)} miles`);
        console.log(`Cruise altitude: ${cruiseAlt} ft`);
        console.log(`Departure delay: ${delayMinutes} minutes`);
        console.log(`Scenario: ${scenarioNote}`);
        console.log(`Flight time: ${Math.floor(finalFlightTime / 60)}h ${Math.floor(finalFlightTime % 60)}m`);
        console.log(`Fuel used: ${fuelNeed.toFixed(2)} gallons`);
        //console.log(`Refueling ${selected.getTail()} with ${refueled - selected.getFuel()} gallons`);
        console.log(`Cost: $${flightCost.toFixed(2)}`);
        console.log(`Ticket Price: $${ticketPrice.toFixed(2)} per seat`);
        
        // INSERT INTO DATABASE
        const selectedTail = selected.getTail();
        const aircraftId = aircraftIdMap[selectedTail];

        if (!aircraftId) {
        console.error(`No aircraft_id found for tail ${selectedTail}`);
        i++;
        continue;
        }

        const slot = findFeasibleSlot({
        origin: from,
        destination: dest,
        targetDepartLocal,
        flightMinutes: Math.round(finalFlightTime),
        delayMinutes,
        gateSchedule,
        needsRefuel: needFuel
        });

        if (!slot) {
        console.log(`*** SKIPPING: no gate/time slot available for ${from} -> ${dest} ***`);
        i++;
        continue;
        }
        const scheduledDepart = minutesToLocalDateTime(currentDay, slot.scheduledDepartLocal);
        const scheduledArrival = minutesToLocalDateTime(currentDay, slot.scheduledArrivalLocal);
        const actualDepart = minutesToLocalDateTime(currentDay, slot.actualDepartLocal);
        const actualArrival = minutesToLocalDateTime(currentDay, slot.actualArrivalLocal);

        // store departure gate for frontend use
        const assignedGate = slot.departureGate;

        const flightRecord = {
        flight_num: String(flightNumber),
        sim_day: currentDay,
        origin_airport_id: airportIdMap[from],
        destination_airport_id: airportIdMap[dest],
        aircraft_id: aircraftId,
        scheduled_depart: scheduledDepart,
        scheduled_arrival: scheduledArrival,
        actual_depart: actualDepart,
        actual_arrival: actualArrival,
        passenger_count: selected.getSeats(),
        flight_status: delayMinutes > 0 ? "Delayed" : "On Time",
        delay_minutes: delayMinutes,
        gate: assignedGate,
        flight_distance: miles,
        departure_fee: departureFee,
        arrival_fee: arrivalFee,
        fuel_burned: fuelNeed,
        fuel_cost: fuelCost,
        operating_cost: flightCost,
        ticket_price: ticketPrice
        };

        insertFlight(flightRecord);

        //sets plane to have updated values
        selected.setLocation(dest);
        selected.updateHours(finalFlightTime);

        // aircraft can be reused after arrival + turnaround
        const turnaroundMinutes = TURNAROUND_MINUTES + (needFuel ? REFUEL_EXTRA_MINUTES : 0);
        nextAvailableTime[selected.getTail()] = slot.actualArrivalLocal + turnaroundMinutes;
                
        // MAINTENANCE SECTION
        if (selected.needsMaintenance()) {
            console.log(`*** Aircraft ${selected.getTail()} needs to be sent for maintence***`);

            if (selected.getLocation() === selected.getHub()) {
                console.log("Placing aircraft in maintence area.");
                selected.setUnavailable();
                selected.startMaintenance(currentDay);
                nextAvailableTime[selected.getTail()] = Infinity;

            } else {
                console.log("Flying plane back to hub");

                from = selected.getLocation();
                dest = selected.getHub();

                const miles = Airport.flyAircraft(from, dest);
                const fuelNeed = flight.fuelNeeded(miles, selected.getModel());

                if (selected.getFuel() < fuelNeed) {
                    const refueled = flight.refuel(selected.getModel());
                    console.log(`Refueling ${selected.getTail()} with ${refueled - selected.getFuel()} gallons`);
                    selected.updateFuel(refueled);
                }

                selected.updateFuel(selected.getFuel() - fuelNeed);

                console.log("\n=== Flight Information ===");
                console.log(`Aircraft ${selected.getTail()} flew from ${from} to ${dest}`);

                selected.setLocation(dest);

                console.log("Placing aircraft in maintence area.");

                selected.setUnavailable();
                selected.startMaintenance(currentDay);
                nextAvailableTime[selected.getTail()] = Infinity;
            }
        }
        i++; //increase i in order to go to the next flight
    } //end maintenance stuff

    insertAircraftSnapshots(currentDay);
    menu();

} //end of flying the plane

// -------------------------
// CHECK STATUS
// -------------------------
function checkStatus() {
    fleet.forEach(p => console.log(`${p.getTail()} - ${p.getLocation()}`));

    rl.question("Enter tail number: ", (tail) => {
        const plane = fleet.find(p => p.getTail() === tail);

        if (!plane) {
            console.log("Tail not found.");
        } else {
            console.log("\n--- Plane Status ---");
            console.log("Tail Number:", plane.getTail());
            console.log("Model:", plane.getModel());
            console.log("Location:", plane.getLocation());
            console.log("Flight Hours:", plane.getHours().toFixed(2));
            console.log("Fuel Left:", plane.getFuel().toFixed(2));
            console.log("Available:", plane.available() ? "Yes" : "No");
        }

        menu();
    });
} //end of status

// -------------------------
// FLEET LOCATIONS
// -------------------------
function fleetLocations() {
    const locations = [];
    const unavailable = [];

    //finds and groups plane based on location OR availability

    fleet.forEach(p => {
        if (p.available()) {
            // group available planes by location
            if (!locations[p.getLocation()]) {
                locations[p.getLocation()] = [];
            }
            locations[p.getLocation()].push(p);
        } else {
            // collect unavailable planes
            unavailable.push(p);
        }
    });

    //prints those groups
    console.log("\nFleet at:");

    for (let loc in locations) {
        console.log(loc + ":");
        locations[loc].forEach(p =>
            console.log(`  ${p.getTail()} (${p.getModel()})`)
        );
    }


    //print unavailable planes
    console.log("\nUnavailable Aircraft:");
    if (unavailable.length === 0) {
        console.log("  None");
    } else {
        unavailable.forEach(p =>
            console.log(`  ${p.getTail()} (${p.getModel()}) - Days left in maintenance: ${p.getEndMaintenanceDay() - currentDay}`)
        );
    }

    menu();
}


function increaseDay(){
    if(currentDay === 14){
        console.log("Unable to increase day further");
        menu();
    }else{
        currentDay++;
        console.log("=== Increasing Day ===");
        console.log("Current day: ", currentDay);
        menu();
    }

}//end of increaseDay

function decreaseDay(){
    console.log("=== Decreasing Day ===");
    if(currentDay === 1){
        console.log("Unable to decrease day further");
        menu();
    }else{
        console.log("=== Decreasing Day ===");        
        currentDay--;
        console.log("Current day: ", currentDay);
        menu();

    }

}//end of increaseDay

// -------------------------
buildAircraftMap();
console.log("Aircraft map loaded.");
menu();