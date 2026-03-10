#include <iostream>
#include <string>
#include <vector>

#ifndef airline_h
#define airline_h

using namespace std;

/*
 * Aircraft operational model
 * Tracks speed, hours, maintenance, and location
 */
class airline {
private:
    // Identity
    string tail_number;
    string model;
    double max_speeds;
    double fuel;
    double seats;
    double lease;
    double ops;

    // State
    string current_airport;
    double flight_hours;

    // Maintenance
    bool in_maintenance;
    int maintenance_hourse_left;


public:
    //Creator for each individual aircraft
    airline(string tail, string m,
                   double max_speed, double starting_fuel,
                   string start_airport, double seats, double lease);
    
    static vector<airline> preloadFleet();

    // Information on each plane
    string get_tail() const;
    string get_model() const;
    string get_location() const;
    double get_maxSpeed()  const;
    double get_fuel()  const;
    void update_fuel(double f);
    double get_seats() const;
    double get_ops() const;
    double get_hours() const;
    bool available() const;

    // Flight Ops
    bool can_fly(string from) const;
    void fly(double hours, string destination);

    // Maintenance Logs
    bool needs_maintenance() const;
    bool start_maintenance(bool is_hub, int hub_active);
    void advance_hour();

};

#endif
