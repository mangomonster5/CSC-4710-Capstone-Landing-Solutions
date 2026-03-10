/*
 * Aircraft operational model
 * Tracks speed, hours, maintenance, and location
 */

class Airline {

    constructor(tail, model, maxSpeed, startingFuel, startAirport, seats, lease) {
        // Identity
        this.tail_number = tail;
        this.model = model;
        this.max_speeds = maxSpeed;
        this.fuel = startingFuel;
        this.seats = seats;
        this.ops = lease;

        // State
        this.current_airport = startAirport;
        this.flight_hours = 0.0;

        // Maintenance
        this.in_maintenance = false;
        this.maintenance_hours_left = 0;
    }

    // --------------------
    // Getters
    // --------------------

    getTail() { return this.tail_number; }
    getModel() { return this.model; }
    getLocation() { return this.current_airport; }
    getMaxSpeed() { return this.max_speeds; }
    getFuel() { return this.fuel; }
    getSeats() { return this.seats; }
    getOps() { return this.ops; }
    getHours() { return this.flight_hours; }

    updateFuel(f) {
        this.fuel = f;
    }

    available() {
        return !this.in_maintenance;
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

    startMaintenance(isHub, hubActive) {
        if (!isHub) return false;
        if (hubActive >= 3) return false;
        if (!this.needsMaintenance()) return false;

        this.in_maintenance = true;
        this.maintenance_hours_left = 36;
        this.flight_hours = 0.0;
        return true;
    }

    advanceHour() {
        if (this.in_maintenance) {
            this.maintenance_hours_left--;
            if (this.maintenance_hours_left <= 0) {
                this.in_maintenance = false;
            }
        }
    }

    // --------------------
    // Static Fleet Loader
    // --------------------

    static preloadFleet() {
        const fleet = [];
        let tail = 1000;

        // 15 Boeing 737-600
        for (let i = 0; i < 15; i++) {
            fleet.push(new Airline(
                `B737-600-${tail++}`,
                "Boeing 737-600",
                850,
                6785,
                "DCA",
                130,
                245000
            ));
        }

        // 15 Boeing 737-800
        for (let i = 0; i < 15; i++) {
            fleet.push(new Airline(
                `B737-800-${tail++}`,
                "Boeing 737-800",
                876,
                6785,
                "DFW",
                189,
                270000
            ));
        }

        // 12 Airbus A220-100
        for (let i = 0; i < 12; i++) {
            fleet.push(new Airline(
                `A220-100-${tail++}`,
                "Airbus A220-100",
                829,
                5760,
                "LAX",
                135,
                192000
            ));
        }

        // 13 Airbus A220-300
        for (let i = 0; i < 13; i++) {
            fleet.push(new Airline(
                `A220-300-${tail++}`,
                "Airbus A220-300",
                871,
                5681,
                "JFK",
                130,
                228000
            ));
        }

        return fleet;
    }
}

export default Airline; // Use this for modules
// module.exports = Airline; // Use this instead if using CommonJS
