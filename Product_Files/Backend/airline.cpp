#include "airline.h"

// Constructor
airline::airline(string tail, string m,
                   double max_speed, string start_airport)
{
    tail_number = tail;
    model = m;
    max_speed = max_speed;
    current_airport = start_airport;
    flight_hours = 0.0;
    in_maintenance = false;
    maintenance_hourse_left = 0;
}

// Getters
string airline::get_tail() const { return tail_number; }
string airline::get_model() const { return model; }
string airline::get_location() const { return current_airport; }
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
