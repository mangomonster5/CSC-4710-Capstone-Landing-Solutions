/*
 * Aircraft operational model
 * Tracks speed, hours, maintenance, and location
 */

import { start } from "repl";

//const for the tailCombos
const usedCombos = [];


class Airline {

    constructor(tail, model, maxSpeed, startingFuel, startAirport, hub, seats, lease) {
        // Identity
        this.tail_number = tail;
        this.model = model;
        this.max_speeds = maxSpeed;
        this.fuel = startingFuel;
        this.seats = seats;
        this.ops = lease;

        // State
        this.current_airport = startAirport;
        this.hub = hub;
        this.flight_hours = 0.0;

        // Maintenance
        this.in_maintenance = false;
        this.maintenanceDay = null;
        this.endMaintenanceDay = null;

    
    }

    // --------------------
    // Getters
    // --------------------

    getTail() { return this.tail_number; }
    getModel() { return this.model; }
    getLocation() { return this.current_airport; }
    getHub() {return this.hub}
    getMaxSpeed() { return this.max_speeds; }
    getFuel() { return this.fuel; }
    getSeats() { return this.seats; }
    getOps() { return this.ops; } //operations numbers
    getHours() { return this.flight_hours; }
    getMaintenanceDay() {return this.maintenanceDay; }
    getEndMaintenanceDay() {return this.endMaintenanceDay; }

    available() {
        if(this.in_maintenance){
            return false;
        }else{
            return true;
        }
    }


    /// -------
    // Setters
    // ---------

    setLocation(loc){
        this.current_airport = loc;
    }

    setUnavailable(){
        this.in_maintenance = true;
    }

    //MUST TAKE IN MINUTES
    updateHours(time){ 
        this.flight_hours += time / 60;
    }

    updateFuel(f) {
        this.fuel = f;
    }

    static setTailCode(){
        const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ"; //minus I and O
        let tailCode;
    
        //creates a tailcode and makes sure it isnt already existing, if it is, recreate it.
        do {
            tailCode =
                alphabet[Math.floor(Math.random() * alphabet.length)] +
                alphabet[Math.floor(Math.random() * alphabet.length)];
        } while (usedCombos.includes(tailCode));

        usedCombos.push(tailCode);
        
        return tailCode;

    }

    
    // --------------------
    // Flight Operations
    // --------------------

    canFly(from) {
        if (this.in_maintenance) return false;
        return this.current_airport === from;
    }

    fly(hours, destination) {
        if (this.in_maintenance) return;

        this.flight_hours += hours;
        this.current_airport = destination;
    }

    // --------------------
    // Maintenance
    // --------------------

    needsMaintenance() {
        return this.flight_hours >= 200.0;
    }

    startMaintenance(startDay){
        this.maintenanceDay = startDay;
        this.endMaintenanceDay = startDay += 2;
    }

    advanceHour() {
        if (this.in_maintenance) {
            this.maintenance_hours_left--;
            if (this.maintenance_hours_left <= 0) {
                this.in_maintenance = false;
            }
        }
    }

    resetMaintenance(){
        this.in_maintenance = false;
        this.maintenanceDay = null;
        this.endMaintenanceDay = null;
        this.flight_hours = 0.0;


    }

    
    //Total plane locations:
    /*
    JFK → 7
    LAX → 7
    ORD → 5
    DFW → 5
    ATL → 3
    EWR → 2
    LGA → 2
    IAH → 2
    PHX → 2
    MIA → 2
    SFO → 2
    SEA → 2
    BOS → 1
    PHL → 1
    DCA → 1
    IAD → 1
    FLL → 1
    LAS → 1
    DEN → 1
    MCO → 1
    SAN → 1
    DTW → 1
    MSP → 1
    BWI → 1
    TPA → 1
    BNA → 1
    total airports = 
    */
    // --------------------


    //creating the planes

    //beoing 737-600 = 15
    //boeing 737-800 = 15
    //airbus a220-100 = 12
    //airbus a220-300 = 13
    //airbus a350-1000 = 1


    static preloadFleet() {
    const fleet = [];
    let tail = 100;

    // =========================
    // B737-600 (15 total)
    // =========================
    for (let i = 0; i < 5; i++) { // ORD → 5
        fleet.push(new Airline(
            `N${tail++}${Airline.setTailCode()}`,
            "Boeing 737-600",
            850,
            6785,
            "ORD",
            "ORD",
            130,
            245000
        ));
    }

    // spread
    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Boeing 737-600", 850, 6785, "ATL", "JFK", 130, 245000));
    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Boeing 737-600", 850, 6785, "ATL", "JFK", 130, 245000));
    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Boeing 737-600", 850, 6785, "ATL", "JFK", 130, 245000));

    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Boeing 737-600", 850, 6785, "DFW", "DFW", 130, 245000));
    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Boeing 737-600", 850, 6785, "DFW", "DFW", 130, 245000));
    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Boeing 737-600", 850, 6785, "DFW", "DFW", 130, 245000));
    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Boeing 737-600", 850, 6785, "DFW", "DFW", 130, 245000));
    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Boeing 737-600", 850, 6785, "DFW", "DFW", 130, 245000));

    // fill remaining singles
    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Boeing 737-600", 850, 6785, "BNA", "DFW", 130, 245000));
    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Boeing 737-600", 850, 6785, "DTW", "ORD", 130, 245000));

    // =========================
    // B737-800 (15 total)
    // =========================
    for (let i = 0; i < 7; i++) { // LAX → 7
        fleet.push(new Airline(
            `N${tail++}${Airline.setTailCode()}`,
            "Boeing 737-800",
            876,
            6785,
            "LAX",
            "LAX",
            189,
            270000
        ));
    }

    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Boeing 737-800", 876, 6785, "EWR", "LAX", 189, 270000));
    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Boeing 737-800", 876, 6785, "EWR", "LAX", 189, 270000));

    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Boeing 737-800", 876, 6785, "MIA", "JFK", 189, 270000));
    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Boeing 737-800", 876, 6785, "MIA", "JFK", 189, 270000));

    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Boeing 737-800", 876, 6785, "PHX", "DFW", 189, 270000));
    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Boeing 737-800", 876, 6785, "PHX", "DFW", 189, 270000));

    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Boeing 737-800", 876, 6785, "LAS", "DFW", 189, 270000));
    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Boeing 737-800", 876, 6785, "BWI", "LAX", 189, 270000));

    // =========================
    // A220-100 (12 total)
    // =========================
    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Airbus A220-100", 829, 5760, "LGA", "ORD", 135, 192000));
    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Airbus A220-100", 829, 5760, "LGA", "ORD", 135, 192000));

    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Airbus A220-100", 829, 5760, "IAH", "DFW", 135, 192000));
    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Airbus A220-100", 829, 5760, "IAH", "DFW", 135, 192000));

    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Airbus A220-100", 829, 5760, "SFO", "ORD", 135, 192000));
    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Airbus A220-100", 829, 5760, "SFO", "ORD", 135, 192000));

    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Airbus A220-100", 829, 5760, "SEA", "LAX", 135, 192000));
    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Airbus A220-100", 829, 5760, "SEA", "LAX", 135, 192000));

    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Airbus A220-100", 829, 5760, "BOS", "JFK", 135, 192000));
    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Airbus A220-100", 829, 5760, "PHL", "DFW", 135, 192000));

    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Airbus A220-100", 829, 5760, "DCA", "JFK", 135, 192000));
    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Airbus A220-100", 829, 5760, "SAN", "LAX", 135, 192000));

    // =========================
    // A220-300 (13 total)
    // =========================
    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Airbus A220-300", 871, 5681, "JFK", "JFK", 130, 228000));
    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Airbus A220-300", 871, 5681, "JFK", "JFK", 130, 228000));
    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Airbus A220-300", 871, 5681, "JFK", "JFK", 130, 228000));
    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Airbus A220-300", 871, 5681, "JFK", "JFK", 130, 228000));
    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Airbus A220-300", 871, 5681, "JFK", "JFK", 130, 228000));
    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Airbus A220-300", 871, 5681, "JFK", "JFK", 130, 228000));

    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Airbus A220-300", 871, 5681, "MCO", "JFK", 130, 228000));
    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Airbus A220-300", 871, 5681, "FLL", "JFK", 130, 228000));
    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Airbus A220-300", 871, 5681, "IAD", "JFK", 130, 228000));

    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Airbus A220-300", 871, 5681, "DEN", "ORD", 130, 228000));
    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Airbus A220-300", 871, 5681, "MSP", "ORD", 130, 228000));
    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Airbus A220-300", 871, 5681, "TPA", "JFK", 130, 228000));
    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Airbus A220-300", 871, 5681, "LAS", "DFW", 130, 228000));

    // =========================
    // A350
    // =========================
    fleet.push(new Airline(`N${tail++}${Airline.setTailCode()}`, "Airbus A350-1000", 1100, 44460, "JFK", "JFK", 480, 280000));

    return fleet;

    }
}

export default Airline; // Use this for modules
