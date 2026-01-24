#include <vector>

#include "airline.h"

// Constructor
airline::airline(string tail, string m,
                   double max_speed, string start_airport, double seat, double lease)
{
    tail_number = tail;
    model = m;
    max_speed = max_speed;
    current_airport = start_airport;
    seats = seat;
    ops = lease;
    flight_hours = 0.0;
    in_maintenance = false;
    maintenance_hourse_left = 0;
}

// Getters
string airline::get_tail() const { return tail_number; }
string airline::get_model() const { return model; }
string airline::get_location() const { return current_airport; }
double airline::get_seats() const { return seats; }
double airline::get_ops() const { return ops;}

double airline::get_hours() const { return flight_hours; }


bool airline::available() const
{
    return !in_maintenance;
}

// Flight rules
bool airline::can_fly(string from) const
{
    if (in_maintenance) return false;
    return current_airport == from;
}

void airline::fly(double hours, string destination)
{
    if (in_maintenance) return;

    flight_hours += hours;
    current_airport = destination;
}

// Maintenance rules
bool airline::needs_maintenance() const
{
    return flight_hours >= 200.0;
}

bool airline::start_maintenance(bool is_hub, int hub_active)
{
    if (!is_hub) return false;
    if (hub_active >= 3) return false;
    if (!needs_maintenance()) return false;

    in_maintenance = true;
    maintenance_hourse_left = 36;
    flight_hours = 0.0;
    return true;
}

void airline::advance_hour()
{
    if (in_maintenance) {
        maintenance_hourse_left--;
        if ( maintenance_hourse_left <= 0) {
            in_maintenance = false;
        }
    }
}


vector<airline> airline::preloadFleet()
{
    vector<airline> fleet;
    int tail = 1000;

    // 15 Boeing 737-600
    for (int i = 0; i < 15; i++) {

        fleet.emplace_back(
            airline("B736-" + to_string(tail++), //tail number
            "Boeing 737-600", //model
            850,        // cruise speed (km/h)
            "DCA", //starting airport
            130, //seats
            245000 //lease) 
            
        ));
    }

    /*
    // 15 Boeing 737-800
    for (int i = 0; i < 15; i++) {
        fleet.emplace_back(
            "B738-" + to_string(tail++), //tail number
            "Boeing 737-800", //model
            876, //cruise speed(km/h)
            "DCA", //starting airport
            189, //seats 
            270000 //lease

        );
    }

    // 12 Airbus A220-100
    for (int i = 0; i < 12; i++) {
        fleet.emplace_back(
            "A221-" + to_string(tail++),//tail number
            "Airbus A220-100", //model
            829, //cruise speed(km/h)
            "DCA", //starting airport
            135, //seats
            192000 //lease
        );
    }

    // 13 Airbus A220-300
    for (int i = 0; i < 13; i++) {
        fleet.emplace_back(
            "A223-" + to_string(tail++), //tail number
            "Airbus A220-300", //model
            871, //cruise speed (km/h)
            "DCA", //starting airport
            130, //seats
            228000 //lease
        );
    }
    */
    return fleet;
}
    

