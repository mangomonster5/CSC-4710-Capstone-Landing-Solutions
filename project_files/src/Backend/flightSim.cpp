// compile: g++ flightSim.cpp flight.cpp costs.cpp airline.cpp airport.cpp validation.cpp -o flightSimulation
//USED TO TEST THE ACTUAL CODE AND SIMULATE FLIGHTS

//#include <bits/stdc++.h>
#include <iostream>
#include <vector>
#include <algorithm>
#include <string>
#include <list>

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

        if (choice == 1) { //FLY A PLANE
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
                if (!valid) {
                    cout << "Not a valid starting code, re-printing valid starting airport codes:\n";

                    int idx = 1;
                    for (const auto& a : current_airports) {
                        cout << idx++ << ": " << a << endl;
                    }
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
            cout << "Available destination airports:" << endl;

            int idx = 1;  // counter
            for (const auto& entry : airport::airports) {
                cout << idx++ << ". " << entry.first << "  " << endl;
            }
            cout << endl;


            cout << "Pick a Destination Airport: " << endl;
            cin >> dest;


            // ====== FLYING THE PLANE ITSELF AND CALCULATING NUMBERS NEEDED =====

            //FUEL SECTION

            //calculates fuel needed and removes it from the plane, 
            //also makes sure the current plane has enough to fly otherwise it picks the next avaiable plane
            bool refuel = false;
            bool needFuel = false; //will tell future calculations if fuel was needed
            double fuel; //holds any fuel
            double miles = airport::flyAircraft(*selected, dest); //returns miles
            double fuelNeed = f.fuelNeeded(miles, selected->get_model());  // fuel needed in gallons
           
            
            
            //checks if refueling is needed
            if(selected->get_fuel() >= fuelNeed){ //no need for fuel
                cout << "this WORKS 2.0" << endl;
                fuel = selected->get_fuel();
                fuel -= fuelNeed;
                selected->update_fuel(fuel);
                refuel = true;
            }
           
           //refuel plane if needed
            if(!refuel){ //need fuel, refuel here
                needFuel = true;
                fuel = f.refuel(selected->get_model()); 
                selected->update_fuel(fuel);
            }

            //DETERMINES CRITICAL NUMBERS AND TRUE/FALSE VALUES FOR REST OF FLIGHT CALCS

            bool intl = (from == "CDG" || dest == "CDG");  // international if Paris involved
            double max_kmh = selected->get_maxSpeed(); // average cruise speed
           
            //Create airport functions based on the to/from locations
            airport& fromAirport = airport::airports[from];
            airport& destAirport = airport::airports[dest];

            //get flight heading
            double hdg = f.hdg(fromAirport.getLatitude(), fromAirport.getLongitude(), 
                                    destAirport.getLatitude(), destAirport.getLongitude()); 

            // calculate flight details
            int cruiseAlt = f.cruise_altitude(intl, miles);  // altitude in feet

            //determines if the either to/from location is a hub or not
            bool fromHub = false;
            bool destHub = false;

            if (from == "DCA" || from == "DFW" || from == "LAX" || from == "JFK") {
                fromHub = true;
            }

            if (dest == "DCA" || dest == "DFW" || dest == "LAX" || dest == "JFK") {
                destHub = true;
            }

            //gets populations of the 2 airports invovles
            long fromPop = fromAirport.getPopulation();
            long destPop = destAirport.getPopulation();
            cout << "FROM POPULATOIN  ======= " << fromPop << endl;

            //parameters: double miles, double max_kmh, double hdg, bool intl, 
            //              int starting pop, bool fromHub, int destination pop, bool dest hub
            //              bool needFuel
            double flightTime = f.flight_time(miles, max_kmh, hdg, intl, 
                fromPop, fromHub, destPop, destHub, needFuel);  // total time in minutes


            //flight costs calc part

            //FOR JIMI TO CHECK AND CONFIRM IT WORKS   
            double flightCost = c.flight_cost(fuelNeed, intl, from == "CDG", dest == "CDG");  // operating cost
            int seats = selected->get_seats();  // aircraft capacity

            double ticketPrice = c.ticket_price(flightCost, seats);  // price per ticket

            
            
            // output flight info

            cout << endl << "===Flight Information ===" << endl;

            cout << "Aircraft " << selected->get_tail() << " flew from " 
            << from << " to " << dest << " (" << miles << " miles)" << endl;


            cout << "Cruise altitude: " << cruiseAlt << " ft" << endl;

            cout << "Flight time: " << (int)(flightTime/60) << "h " << (int)flightTime%60 << "m" << endl;
            cout << "Fuel: " << fuelNeed << " gal" << endl;
            cout << "Cost: $" << flightCost << endl;
            cout << "Ticket Price: $" << ticketPrice << " per seat" << endl;

        } else if (choice == 2) {
            string tail;  // tail number to search

            for (int i = 0; i < fleet.size(); i++) {
                cout << i << ": Tail Number: " << fleet[i].get_tail() << 
                " Location: " << fleet[i].get_location() << endl; // get tail number
            } 
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
                    cout << "Fuel Left: " << fleet[i].get_fuel() << endl;
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