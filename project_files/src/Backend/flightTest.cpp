// compile: g++ flightTest.cpp flight.cpp costs.cpp airline.cpp airport.cpp
//USED JUST TO TEST FUNCTIONS AND OTHER STUFF

#include <iostream>
#include "flight.h"
#include "costs.h"
#include "airline.h"
#include "airport.h"

using namespace std;

int main() {
    // Create objects
    flight f;
    costs c;
    //airline airline;
    //airport airport' 

    // Load all airports
    airport::loadAirports();

    string from;
    string to;



    // Create a single aircraft starting at DCA
    airline plane1("123ABC", "Boeing 737", 900, "DCA");
    airline plane2("123ABC", "Boeing 737", 900, "DCA");
    airline plane3("123ABC", "Boeing 737", 900, "DCA");

    cout << "=== Flight Test===" << endl;

    // Use existing function to fly plane and get distance
    double miles = airport::flyAircraft(plane, to);
    if (miles < 0) {
        cout << "Error: flight could not be performed." << endl;
        return 1;
    }

    // Flight parameters
    double max_kmh = 840;  // Typical jet
    bool intl = false;     // Domestic flight

    // Calculate flight performance using existing functions
    int cruiseAlt = f.cruise_altitude(intl, miles);
    double cruiseSpeed = f.cruise_speed(max_kmh);
    double flightTime = f.flight_time(miles, max_kmh, 180); // heading hardcoded (approx)
    double climbTime = f.climb_time(cruiseAlt);
    double descentTime = f.descent_time(cruiseAlt);

    cout << "Cruise Altitude: " << cruiseAlt << " ft" << endl;
    cout << "Cruise Speed: " << cruiseSpeed << " km/h" << endl;
    cout << "Flight Time: " << flightTime << " hours" << endl;
    cout << "Climb Time: " << climbTime << " minutes" << endl;
    cout << "Descent Time: " << descentTime << " minutes" << endl;

    // Optional: Calculate flight cost
    double tankGal = 6875;
    double cost = c.flight_cost(tankGal, intl, false, false);
    cout << "Estimated flight cost: $" << cost << endl;

    double ticket = c.ticket_price(cost, 166);

    cout << "Estimated ticket cost: $" << ticket << endl;

    // Show plane status

    cout << endl <<  "=== PLane Status ===" << endl;

    cout << "Plane " << plane.get_tail() 
         << " is now at " << plane.get_location() << endl;
    cout << "Plane total flight hours: " << plane.get_hours() << endl;

    return 0;
}
