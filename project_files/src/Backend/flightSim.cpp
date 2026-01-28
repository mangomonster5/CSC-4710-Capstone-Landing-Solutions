// compile: g++ flightSim.cpp flight.cpp costs.cpp airline.cpp airport.cpp
//USED TO TEST THE ACTUAL CODE AND SIMULATE FLIGHTS

#include <bits/stdc++.h>

//all the header files
#include "flight.h"
#include "costs.h"
#include "airline.h"
#include "airport.h"
#include "validation.h"

using namespace std;

int main() {
    flight f;  // flight calculations (time, altitude, fuel)
    costs c;   // cost calculations (fuel, tickets, revenue)
    validation v;  // input validation

    // Load airports
    airport::loadAirports();  // loads 30 US airports + CDG
    vector<airline> fleet = airline::preloadFleet();  // loads 55 aircraft

    int choice;  // menu selection

    do {
        cout << "\n=== Airline Menu ===\n";
        cout << "1. Fly a plane\n";
        cout << "2. Check plane status\n";
        cout << "3. Fleet locations\n";
        cout << "0. Exit\n";
        cout << "Choice: ";
        cin >> choice;

        if (choice == 1) {
            airline* selected = nullptr;  // pointer to chosen aircraft
            string from;  // origin airport code
            string dest;  // destination airport code

            //START OF PICKING STARTING AIRPORT
            cout << "Pick one of the following airport codes: " << endl;
            
            list<string> current_airports;  // list of airports with planes

            // loop through the fleet to find where planes are
            for (int i = 0; i < fleet.size(); i++) {
                string loc = fleet[i].get_location();  // get plane location

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

            bool valid = false;  // flag for valid input
            while(!valid){
                cout << "Enter valid starting airport code: ";
                cin >> from; 

                // check if any plane is at this airport
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
                    selected = &fleet[i];  // set pointer to this plane
                    break;
                }
            }

            if(selected == nullptr){  // no available planes
                cout << "No planes at " << from << endl;
                continue;
            }

            //END OF PICKING STARTING AIRPORT

            //START OF PICKING DESTINATION AIRPORT

            cout << "Pick a Destionation Airport: ";
            cin >> dest;

            // fly the plane and get distance
            double miles = airport::flyAircraft(*selected, dest);
            if (miles < 0) continue;  // flight failed

            bool intl = (from == "CDG" || dest == "CDG");  // international if Paris involved
            double max_kmh = 840;  // average cruise speed
            double hdg = 180;  // heading (placeholder)

            // calculate flight details
            int cruiseAlt = f.cruise_altitude(intl, miles);  // altitude in feet
            
            //NEEDS A FIX
            //double flightTime = f.gate_time(miles, max_kmh, hdg, intl, 5000000, false, 5000000, false);  // total time in minutes
            
            //NEEDS A FIX
            double fuel = 1500;//f.fuel(miles, selected->get_model());  // fuel needed in gallons
           
           
            double flightCost = c.flight_cost(fuel, intl, from == "CDG", dest == "CDG");  // operating cost
            int seats = selected->get_seats();  // aircraft capacity
            double ticketPrice = c.ticket_price(flightCost, seats);  // price per ticket

            // output flight info
            cout << "Cruise altitude: " << cruiseAlt << " ft" << endl;
            //cout << "Flight time: " << (int)(flightTime/60) << "h " << (int)flightTime%60 << "m" << endl;
            cout << "Fuel: " << fuel << " gal" << endl;
            cout << "Cost: $" << flightCost << endl;
            cout << "Ticket Price: $" << ticketPrice << " per seat" << endl;

        } else if (choice == 2) {
            string tail;  // tail number to search
            cout << "Enter tail number: ";
            cin >> tail;

            bool found = false;  // flag if plane found
            for(int i = 0; i < fleet.size(); i++){
                if(fleet[i].get_tail() == tail){
                    cout << "\n--- Plane Status ---\n";
                    cout << "Tail Number: " << fleet[i].get_tail() << endl;
                    cout << "Model: " << fleet[i].get_model() << endl;
                    cout << "Location: " << fleet[i].get_location() << endl;
                    cout << "Flight Hours: " << fleet[i].get_hours() << endl;
                    cout << "Available: " << (fleet[i].available() ? "Yes" : "No") << endl;
                    found = true;
                    break;
                }
            }
            if(!found){
                cout << "Tail not found" << endl;
            }
        } else if (choice == 3) {
            list<string> locs;  // unique airport locations
            
            // find all unique locations
            for(int i = 0; i < fleet.size(); i++){
                string loc = fleet[i].get_location();
                bool exists = false;
                for(const auto& a : locs){
                    if(a == loc){
                        exists = true;
                        break;
                    }
                }
                if(!exists) locs.push_back(loc);
            }
            
            // show planes at each location
            cout << "\nFleet at:" << endl;
            for(const auto& loc : locs){
                cout << loc << ":" << endl;
                for(int i = 0; i < fleet.size(); i++){
                    if(fleet[i].get_location() == loc && fleet[i].available()){
                        cout << "  " << fleet[i].get_tail() << " (" << fleet[i].get_model() << ")" << endl;
                    }
                }
            }
        }

    } while (choice != 0);

    cout << "Exiting system.\n";
    return 0;
}