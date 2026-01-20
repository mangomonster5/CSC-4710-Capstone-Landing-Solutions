#include <iostream>
#include "flight.h"
#include "costs.h"

using namespace std;

int main()
{
    cout << "=== Flight Performance Test ===" << endl << "Using Boeing 737-600 for test" << endl;

    bool intl = true;
    double miles = 3625;        // NYC -> Paris
    double max_kmh = 840;       // typical jet
    double heading = 270;       // East
    double tankGal = 6875;         // total fuel tank (in future will pull from aircraftInfo.h)

    // Create an instance of the class
    flight f;
    costs c;

    cout << "Cruise Altitude: "
         << f.cruise_altitude(intl, miles)
         << " ft" << endl;

    cout << "Cruise Speed: "
         << f.cruise_speed(max_kmh)
         << " km/h" << endl;

    cout << "Flight Time: "
         << f.flight_time(miles, max_kmh, heading)
         << " hours" << endl;

    int alt = f.cruise_altitude(intl, miles);

    cout << "Climb Time: "
         << f.climb_time(alt)
         << " minutes" << endl;

    cout << "Descent Time: "
         << f.descent_time(alt)
         << " minutes" << endl;


     cout << "=== Flight Costs (abbreviated) ===" << endl;

     //cout << 
    return 0;
}
