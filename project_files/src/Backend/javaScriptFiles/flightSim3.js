// flightSim3.js
// Run with: node flightSim3.js

import Airline from './airline.js';
import Flight from './flight.js';
import Costs from './costs.js';
import Airport from './airport.js';
import readline from 'readline';

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
function menu() {
    console.log("\n=== Airline Menu ===");
    console.log("1. Fly a plane");
    console.log("2. Check plane status");
    console.log("3. Fleet locations");
    console.log("0. Exit");

    rl.question("Choice: ", (choice) => {
        if (choice === "1") flyPlane();
        else if (choice === "2") checkStatus();
        else if (choice === "3") fleetLocations();
        else {
            console.log("Exiting system.");
            rl.close();
        }
    });
}

// -------------------------
// FLY PLANE
// -------------------------
function flyPlane() {

    console.log("\nAvailable starting airports:");
    const locations = [...new Set(fleet.map(p => p.getLocation()))];
    locations.forEach(loc => console.log(loc));

    rl.question("From: ", (from) => {
        rl.question("To: ", (dest) => {

            if (!Airport.airports[from] || !Airport.airports[dest]) {
                console.log("Invalid airport.");
                return menu();
            }

            const selected = fleet.find(p =>
                p.getLocation() === from && p.available()
            );

            if (!selected) {
                console.log("No available plane at this airport.");
                return menu();
            }

            // Fly plane
            const miles = Airport.flyAircraft(selected, dest);
            const fuelNeed = flight.fuelNeeded(miles, selected.getModel());

            let needFuel = false;

            if (selected.getFuel() < fuelNeed) {
                needFuel = true;
                // add fuel to reach full capacity, not just overwrite
                const refueled = flight.refuel(selected.getModel());
                //console.log(`Refueling ${selected.getTail()} with ${refueled - selected.getFuel()} gallons`);
                selected.updateFuel(refueled);
            }

            selected.updateFuel(selected.getFuel() - fuelNeed);

            const fromAirport = Airport.airports[from];
            const destAirport = Airport.airports[dest];

            const intl = (from === "CDG" || dest === "CDG");

            const heading = flight.hdg(
                fromAirport.getLatitude(),
                fromAirport.getLongitude(),
                destAirport.getLatitude(),
                destAirport.getLongitude()
            );

            const cruiseAlt = flight.cruiseAltitude(intl, miles);

            const fromHub = ["DCA","DFW","LAX","JFK"].includes(from);
            const destHub = ["DCA","DFW","LAX","JFK"].includes(dest);

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

            console.log("\n=== Flight Information ===");
            console.log(`Aircraft ${selected.getTail()} flew from ${from} to ${dest}`);
            console.log(`Distance: ${miles.toFixed(2)} miles`);
            console.log(`Cruise altitude: ${cruiseAlt} ft`);
            console.log(`Flight time: ${Math.floor(flightTime / 60)}h ${Math.floor(flightTime % 60)}m`);
            console.log(`Fuel used: ${fuelNeed.toFixed(2)} gallons`);
            console.log(`Cost: $${flightCost.toFixed(2)}`);
            console.log(`Ticket Price: $${ticketPrice.toFixed(2)} per seat`);

            menu();
        });
    });
}

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
menu();