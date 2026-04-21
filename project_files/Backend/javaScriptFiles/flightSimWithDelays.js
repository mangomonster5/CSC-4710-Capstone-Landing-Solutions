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

const airportIdMap = {
  ATL: 1, DFW: 2, DEN: 3, ORD: 4, LAX: 5, JFK: 6, CLT: 7,
  LAS: 8, MCO: 9, MIA: 10, PHX: 11, SEA: 12, SFO: 13,
  EWR: 14, IAH: 15, BOS: 16, MSP: 17, FLL: 18, LGA: 19,
  DTW: 20, PHL: 21, SLC: 22, BWI: 23, IAD: 24, SAN: 25,
  DCA: 26, TPA: 27, BNA: 28, AUS: 29, HNL: 30, CDG: 31
};
let aircraftIdMap = {};

function loadAircraftMap() {
  return new Promise((resolve, reject) => {
    db.all("SELECT aircraft_id, tail_num FROM aircraft", [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        rows.forEach(row => {
          aircraftIdMap[row.tail_num] = row.aircraft_id;
        });
        resolve();
      }
    });
  });
}

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
      operating_cost,
      ticket_price
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
// FLY PLANE
// -------------------------
function simluateCurrentDay() {

    //set to only fly the current day of flights
    const currentDayRoutes = scoredRoutes.filter(r => r.day === currentDay);

    //console.log(currentDayRoutes);
    let i = 0;

    //sets used planes to a set so that we can keep using new planes for each flight
    const usedPlanes = new Set();
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
        usedPlanes.add(failedPlane.getTail());
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

        // MAKE SURE THERES ENOUGH GATES TO LAND, IF NOT SKIP  FLIGHT
        //chceks how many flights are at the current location
        // (planes in maintenance dont take a gate)
        let planesAtDest = fleet.filter(p => p.getLocation() === dest && p.available()).length;

        let gatesAvailable = Airport.getNumGates(dest);


        if(planesAtDest >= gatesAvailable){
            console.log(`*** SKIPPING: ${dest} full (${planesAtDest}/${gatesAvailable} gates) ***`);
            i++;  // CRITICAL: increment or we infinite loop
            continue;
        }

        //sets if its an international flight
        const intl = (from === "CDG" || dest === "CDG");

        ///PLANE SELECTION
        let selected; 

        //makes it set to designsted intl plane for the trip
        //OR picks the next plane
        if(intl){
            selected = fleet.find(p => p.getModel() === "Airbus A350-1000");
        }else{
            //makes sure the plane is at the right location, available, and no previously used
            selected = fleet.find(p => p.available() && 
            p.getLocation() === from && 
            !usedPlanes.has(p));
        }

        if(!selected){
            //if no plane unused, just pick the first best one
            selected = fleet.find(p => p.available() && 
            p.getLocation() === from);
        }

        if(!selected){
            i++;
            continue;
        }

        // Fly plane and set it to "used"
        const miles = Airport.flyAircraft(from, dest);
        const fuelNeed = flight.fuelNeeded(miles, selected.getModel());
        usedPlanes.add(selected);
        
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

        console.log("\n=== Flight #", i, "Information ===");


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
        console.log("planes:  ", planesAtDest);
        console.log("gates: ", gatesAvailable);
        console.log("Dest: ", dest);
        
        // INSERT INTO DATABASE
        const today = `2026-01-${String(currentDay).padStart(2, "0")}`;

        const selectedTail = selected.getTail();
        const aircraftId = aircraftIdMap[selectedTail];

        if (!aircraftId) {
        console.error(`No aircraft_id found for tail ${selectedTail}`);
        i++;
        continue;
        }

        const scheduledDepart = `${today} 08:00:00`;
        const scheduledArrival = `${today} 10:00:00`;
        const actualDepart = `${today} 08:00:00`;
        const actualArrival = `${today} 10:00:00`;

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
        gate: "A1",
        flight_distance: miles,
        departure_fee: 2000,
        arrival_fee: 2000,
        fuel_burned: fuelNeed,
        operating_cost: flightCost,
        ticket_price: ticketPrice
        };

        insertFlight(flightRecord);
                
        //sets plane to have updated values
        selected.setLocation(dest);
        selected.updateHours(finalFlightTime);  
                
        //MAINTENANCE SECTION

        //check if plane needs to go into maintence
        if(selected.needsMaintenance()){
            console.log(`*** Aircraft ${selected.getTail()} needs to be sent for maintence***`);

            // gets the plane back to the hub if not already
            if(selected.getLocation() === selected.getHub()){
                console.log("Placing aircraft in maintence area.");
                selected.setUnavailable();
            }else{
                console.log("Flying plane back to hub");

                from = selected.getLocation();
                dest = selected.getHub();

                // Fly plane
                    const miles = Airport.flyAircraft(from, dest);
                    const fuelNeed = flight.fuelNeeded(miles, selected.getModel());

                    let needFuel = false;

                    if (selected.getFuel() < fuelNeed) {
                        needFuel = true;
                        // add fuel to reach full capacity, not just overwrite
                        const refueled = flight.refuel(selected.getModel());
                        console.log(`Refueling ${selected.getTail()} with ${refueled - selected.getFuel()} gallons`);
                        selected.updateFuel(refueled);
                    }

                    selected.updateFuel(selected.getFuel() - fuelNeed);

                    console.log("\n=== Flight Information ===");
                    console.log(`Aircraft ${selected.getTail()} flew from ${from} to ${dest}`)

                    selected.setLocation(dest);

                    console.log("Placing aircraft in maintence area.");

                    //sets the plane unavailable and maintenance days
                    selected.setUnavailable();
                    selected.startMaintenance(currentDay)
                }
        }
        i++; //increase i in order to go to the next flight
    } //end maintenance stuff


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
loadAircraftMap()
  .then(() => {
    console.log("Aircraft map loaded.");
    menu();
  })
  .catch(err => {
    console.error("Failed to load aircraft map:", err);
  });