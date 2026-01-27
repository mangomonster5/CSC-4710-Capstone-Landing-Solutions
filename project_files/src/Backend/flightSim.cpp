// compile: g++ flightSim.cpp flight.cpp costs.cpp airline.cpp airport.cpp
//USED TO TEST THE ACTUAL CODE AND SIMULATE FLIGHTS

#include <bits/stdc++.h>

//all the header files
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
    vector<airline> fleet = airline::preloadFleet();

    int choice;

    do {
        cout << "\n=== Airline Menu ===\n";
        cout << "1. Fly a plane\n";
        cout << "2. Check plane status\n";
        cout << "0. Exit\n";
        cout << "Choice: ";
        cin >> choice;

        if (choice == 1) {
            airline* selected = nullptr;
            int p;
            string from;
            string dest;

            //START OF PICKING STARTING AIRPORT
            cout << "Pick one of the following airport codes: " << endl;
            
            list<string> current_airports;

            // loop through the fleet
            for (int i = 0; i < fleet.size(); i++) {
                string loc = fleet[i].get_location();

                // check if it's already in the list
                bool exists = false;
                for (const auto& airport : current_airports) {
                    if (airport == loc) {
                        exists = true;
                        break;
                    }
                }

                // if not in the list, add it
                if (!exists) {
                    current_airports.push_back(loc);
                    cout << current_airports.size() << ": " << loc << endl;
                }
            }

            bool valid = false;
            while(!valid){
                cout << "Enter valid starting airport code: ";
                cin >> from; 

                for(int i = 0; i < fleet.size(); i++){
                    if(from == fleet[i].get_location()){
                        valid = true;
                        break;
                    }
                }
                if(!valid){
                    cout << "Not a valid starting code, re-printing valid starting airport codes: " << endl;
                }

            }

            //for loop to find first avaiable plane at selected location
            for(int i = 0; i < fleet.size(); i++){
                if(from == fleet[i].get_location() && fleet[i].available()){
                    selected = &fleet[i];
                    break;
                }
            }


            //END OF PICKING STARTING AIRPORT

            //START OF PICKING DESTINATION AIRPORT

            cout << "Pick a Destionation Airport: ";
            cin >> dest;

            //cout << airline::can_fly()


            double miles = airport::flyAircraft(*selected, dest);
            if (miles < 0) continue;

            bool intl = false;
            double max_kmh = 840;

            int cruiseAlt = f.cruise_altitude(intl, miles);
            double flightTime = f.flight_time(miles, max_kmh, 180, cruiseAlt);
            int flightCost = c.flight_cost(6000, false, false, false);
            int seats = selected->get_seats();
            cout << "SEATS: " << seats << endl;
            double ticketPrice = c.ticket_price(flightCost, selected->get_seats());

            //cout << "Flight distance: " << miles << " miles\n";
            cout << "Cruise altitude: " << cruiseAlt << " ft" << endl;
            cout << "Flight time: " << flightTime << " hours" << endl;
            //cout << "Seats: " << 
            cout << "Ticket Price: $" << ticketPrice << " per seat" << endl;

        } /*else if (choice == 2) {
            int p;
            cout << "Select plane (1, 2, 3): ";
            cin >> p;

            cout << "\n--- Plane Status ---\n";
            cout << "Tail Number: " << selected->get_tail() << endl;
            cout << "Location: " << selected->get_location() << endl;
            cout << "Flight Hours: " << selected->get_hours() << endl;
            cout << "Available: "
                 << (selected->available() ? "Yes" : "No") << endl;
        }*/

    } while (choice != 0);

    cout << "Exiting system.\n";
    return 0;
}
