// compile: g++ flightSim.cpp flight.cpp costs.cpp airline.cpp airport.cpp
//USED TO TEST THE ACTUAL CODE AND SIMULATE FLIGHTS

#include <iostream>
#include "flight.h"
#include "costs.h"
#include "airline.h"
#include "airport.h"

using namespace std;

int main() {
    flight f;
    costs c;

    // Load airports
    airport::loadAirports();

    // Create 3 aircraft starting at DCA
    airline plane1("A1", "Boeing 737", 900, "DCA");
    airline plane2("A2", "Boeing 737", 900, "DCA");
    airline plane3("A3", "Boeing 737", 900, "DCA");

    int choice;

    do {
        cout << "\n=== Airline Menu ===\n";
        cout << "1. Fly a plane\n";
        cout << "2. Check plane status\n";
        cout << "0. Exit\n";
        cout << "Choice: ";
        cin >> choice;

        if (choice == 1) {
            int p;
            string dest;

            cout << "Select plane (1, 2, 3): ";
            cin >> p;

            cout << "Enter destination airport code: ";
            cin >> dest;

            airline* selected = nullptr;
            if (p == 1) selected = &plane1;
            else if (p == 2) selected = &plane2;
            else if (p == 3) selected = &plane3;

            if (!selected) {
                cout << "Invalid plane selection.\n";
                continue;
            }

            double miles = airport::flyAircraft(*selected, dest);
            if (miles < 0) continue;

            bool intl = false;
            double max_kmh = 840;

            int cruiseAlt = f.cruise_altitude(intl, miles);
            double flightTime = f.flight_time(miles, max_kmh, 180);

            cout << "Flight distance: " << miles << " miles\n";
            cout << "Cruise altitude: " << cruiseAlt << " ft\n";
            cout << "Flight time: " << flightTime << " hours\n";

        } else if (choice == 2) {
            int p;
            cout << "Select plane (1, 2, 3): ";
            cin >> p;

            airline* selected = nullptr;
            if (p == 1) selected = &plane1;
            else if (p == 2) selected = &plane2;
            else if (p == 3) selected = &plane3;

            if (!selected) {
                cout << "Invalid plane selection.\n";
                continue;
            }

            cout << "\n--- Plane Status ---\n";
            cout << "Tail Number: " << selected->get_tail() << endl;
            cout << "Location: " << selected->get_location() << endl;
            cout << "Flight Hours: " << selected->get_hours() << endl;
            cout << "Available: "
                 << (selected->available() ? "Yes" : "No") << endl;
        }

    } while (choice != 0);

    cout << "Exiting system.\n";
    return 0;
}
