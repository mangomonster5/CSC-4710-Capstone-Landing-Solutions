#ifndef AIRPORT_H
#define AIRPORT_H

#include <string>
#include <map>
#include "airline.h"

using namespace std;

class airport {
private:
    string code;
    double latitude;
    double longitude;
    long population;

public:
    airport() = default;
    airport(string code, double latitude, double longitude, long population);

    string getCode() const;
    double getLatitude() const;
    double getLongitude() const;
    long getPopulation() const;

    double distanceTo(const airport& other) const;

    static map<string, airport> airports;

    static void loadAirports();

    // Fly airline to a destination
    static double flyAircraft(airline& plane, const string& destCode);
};

#endif
