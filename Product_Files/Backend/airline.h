#include <iostream>
#include <string>

#ifndef airline_h
#define airline_h

using namespace std;

/*
 * Aircraft operational model
 * Tracks speed, hours, maintenance, and location
 */
class aircraft {
private:
    // Identity
    string tail_number;
    string model;

    // State
    string current_airport;
    double flight_hours;

    // Maintenance
    bool in_maintenance;
    int maintaince_hourse_left;

public:
    //Creator for each individual aircraft
    aircraft(string tail, string model,
             double max_speed, string start_airport);

    // Information on each plane
    string get_tail() const;
    string get_model() const;
    string get_location() const;
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
