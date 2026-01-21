#include "airline.h"

// Constructor
aircraft::aircraft(string tail, string m,
                   double max_speed, string start_airport)
{
    tail_number = tail;
    model = m;
    max_speed_kmh = max_speed;
    current_airport = start_airport;
    flight_hours = 0.0;
    in_maintenance = false;
    maintenance_days_left = 0;
}

// Getters
string aircraft::get_tail() const { return tail_number; }
string aircraft::get_model() const { return model; }
string aircraft::get_location() const { return current_airport; }
double aircraft::get_hours() const { return flight_hours; }

double aircraft::cruise_speed() const
{
    return max_speed_kmh * OpFactor;
}

bool aircraft::available() const
{
    return !in_maintenance;
}

// Flight rules
bool aircraft::can_fly(string from) const
{
    if (in_maintenance) return false;
    return current_airport == from;
}

void aircraft::fly(double hours, string destination)
{
    if (in_maintenance) return;

    flight_hours += hours;
    current_airport = destination;
}

// Maintenance rules
bool aircraft::needs_maintenance() const
{
    return flight_hours >= 200.0;
}

bool aircraft::start_maintenance(bool is_hub, int hub_active)
{
    if (!is_hub) return false;
    if (hub_active >= 3) return false;
    if (!needs_maintenance()) return false;

    in_maintenance = true;
    maintaince_hours_left = 36;
    flight_hours = 0.0;
    return true;
}

void aircraft::advance_hour()
{
    if (in_maintenance) {
        maintenance_hours_left--;
        if (maintenance_hours_left <= 0) {
            in_maintenance = false;
        }
    }
}
