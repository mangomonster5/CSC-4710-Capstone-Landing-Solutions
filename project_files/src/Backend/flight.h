#include <iostream>
#include <iomanip>
#include <fstream>
#include <string>

#ifndef flight_h
#define flight_h

using namespace std;

class flight {
    private:
        // Speed operation
        const double SpeedFactor = 0.80;

        // Cruising altitudes (feet)
        const int IntlAlt = 38000;
        const int Alt1500 = 35000;
        const int AltUnder1500 = 30000;
        const int AltUnder350 = 25000;
        const int AltUnder200 = 20000;

        // Wind & earth rotation
        const double EastFactor = -0.045;
        const double WestFactor =  0.045;

        // Climb / descent speeds (knots)
        const int ClimbLow = 250;
        const int ClimbHigh = 280;
        const int DescHigh = 250;
        const int DescLow = 200;

        // Accel / decel (knots per minute)
        const int AccelRate = 25;
        const int DecelRate = 35;

        const double PI = 3.14;

    public:
        // Determine cruising altitude
        int cruise_altitude(bool intl, double miles);

        // Cruise speed (km/h)
        double cruise_speed(double max_kmh);

        // Base flight time (hours)
        double base_time(double miles, double speed_kmh);

        // Adjust time for heading
        double heading_adjust(double time_hr, double heading_deg);

        // Full flight time calculation
        double flight_time(double miles, double max_kmh, double heading_deg);

        // Climb time (minutes)
        double climb_time(int altitude_ft);

        // Descent time (minutes)
        double descent_time(int altitude_ft);

        // Taxi time based on airport population and hub status
        double taxi(int pop, bool hub);

        // Total gate-to-gate time calculation
        double gate_time(double mi, double spd, double hdg, bool intl,
                        int o_pop, bool o_hub, int d_pop, bool d_hub);

        // Distance between two coordinates (miles)
        double dist(double lat1, double lon1, double lat2, double lon2);

        // Heading between two coordinates (degrees)
        double hdg(double lat1, double lon1, double lat2, double lon2);

        // Fuel required for flight based on distance and aircraft model
        double fuel(double mi, string model);

        // Determine whether refueling is required
        bool refuel(double mi);

        // Turnaround time based on refueling requirement
        int turn(bool gas);
};

#endif
