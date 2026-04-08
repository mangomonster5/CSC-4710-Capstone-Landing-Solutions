// flightSim3.js
// Run with: node flightSim3.js

import Airline from './airline.js';
import Flight from './flight.js';
import Costs from './costs.js';
import Airport from './airport.js';
import readline from 'readline';

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



// import the precomputed routes from demand.js
import { routes } from './demand.js';

// now you can use `routes` immediately
//console.log(routes); // top 10 routes

// -------------------------
// INIT SYSTEM
// -------------------------
Airport.loadAirports();
const fleet = Airline.preloadFleet();
const flight = new Flight();
const costs = new Costs();

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
// function menu() {
//     console.log("\n=== Airline Menu ===");
//     console.log("1. PICK THIS TO SEE SIMULATED FLIGHTS");
//     console.log("2. Check plane status");
//     console.log("3. Fleet locations");
//     console.log("0. Exit");

//     rl.question("Choice: ", (choice) => {
//         if (choice === "1") flyPlane();
//         else if (choice === "2") checkStatus();
//         else if (choice === "3") fleetLocations();
//         else {
//             console.log("Exiting system.");
//             rl.close();
//         }
//     });
// }

// -------------------------
// FLY PLANE
// -------------------------
function flyPlane() {

    for(let i = 0; i < 10; i++){

        //makes it so only flights starting where the planes are can be createad and ran
        
        const locations = [...new Set(fleet.map(p => p.getLocation()))];

        
        if (!locations.includes(routes[i].from)) {
            continue;
        }

        let flyingPlane = routes[i];
        let from = flyingPlane.from;
        let dest = flyingPlane.to;

        if (!Airport.airports[from] || !Airport.airports[dest]) {
            console.log("Invalid airport.");
            return menu();
        }

        //sets if its an international flight
        const intl = (from === "CDG" || dest === "CDG");

        let selected; 

        //makes it set to designsted intl plane for the trip
        //OR picks the next plane
        if(intl){
            selected = fleet.find(p => p.getModel() === "Airbus A350-1000");
        }else{
            selected = fleet.find(p => p.available() && p.getLocation() == from);
        }

        if (!selected) {
            console.log("No available plane at this airport.");
            return menu();
        }

        // Fly plane
        //NEED TO CHANGE THIS TO FLY BASED ON FROM/TO NOT SELECTED/DEST **************88
        const miles = Airport.flyAircraft(from, dest);
        const fuelNeed = flight.fuelNeeded(miles, selected.getModel());

        let needFuel = false;
        let refueled;

        if (selected.getFuel() < fuelNeed) {
            needFuel = true;
            // add fuel to reach full capacity, not just overwrite
            refueled = flight.refuel(selected.getModel());
            selected.updateFuel(refueled);
        }

        selected.updateFuel(selected.getFuel() - fuelNeed);

        const fromAirport = Airport.airports[from];
        const destAirport = Airport.airports[dest];


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




        // ✅ Use instance 'costs' instead of class
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

        console.log("\n=== Flight #", i, "Information ===");        
        console.log(`Aircraft ${selected.getTail()} flew from ${from} to ${dest}`);
        console.log(`Distance: ${miles.toFixed(2)} miles`);
        console.log(`Cruise altitude: ${cruiseAlt} ft`);
        console.log(`Flight time: ${Math.floor(flightTime / 60)}h ${Math.floor(flightTime % 60)}m`);
        console.log(`Fuel used: ${fuelNeed.toFixed(2)} gallons`);
        //console.log(`Refueling ${selected.getTail()} with ${refueled - selected.getFuel()} gallons`);
        console.log(`Cost: $${flightCost.toFixed(2)}`);
        console.log(`Ticket Price: $${ticketPrice.toFixed(2)} per seat`);
        
        //sets plane to have updated values
        selected.setLocation(dest);
        selected.updateHours(flightTime);           

        //check if plane needs to go into maintence
        let hours = selected.getHours();

        if(hours >= 200){
            console.log(`*** Aircraft ${selected.getTail()} needs to be sent for maintence***`);

            if(selected.getLocation == selected.getHub){
                console.log("Placing aircraft in maintence area.");
                selected.setUnavailable();
            }else{
                console.log("Flying plane back to hub");

                from = selected.getLocation();
                dest = selected.getHub();

                // Fly plane
                    const miles = Airport.flyAircraft(selected, dest);
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

                    console.log("Placing aircraft in maintence area.");
                    selected.setUnavailable();
                }
        }
    }
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
}

// -------------------------
// FLEET LOCATIONS
// -------------------------
function fleetLocations() {
    const locations = {};

    fleet.forEach(p => {
        if (!locations[p.getLocation()]) locations[p.getLocation()] = [];
        if (p.available()) locations[p.getLocation()].push(p);
    });

    console.log("\nFleet at:");
    for (let loc in locations) {
        console.log(loc + ":");
        locations[loc].forEach(p =>
            console.log(`  ${p.getTail()} (${p.getModel()})`)
        );
    }

    menu();
}

// -------------------------
flyPlane();
