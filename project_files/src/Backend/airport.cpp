#include "airport.h"
#include <cmath>
#include <iostream>

using namespace std;

const double EARTH_RADIUS_MI = 3958.8;

airport::airport(string c, double lat, double lon, long pop)
    : code(c), latitude(lat), longitude(lon), population(pop) {}

string airport::getCode() const { return code; }
double airport::getLatitude() const { return latitude; }
double airport::getLongitude() const { return longitude; }
long airport::getPopulation() const { return population; }


double airport::distanceTo(const airport& other) const {
    double lat1 = latitude * M_PI / 180.0;
    double lon1 = longitude * M_PI / 180.0;
    double lat2 = other.latitude * M_PI / 180.0;
    double lon2 = other.longitude * M_PI / 180.0;

    double angle = acos(
        sin(lat1) * sin(lat2) +
        cos(lat1) * cos(lat2) * cos(lon2 - lon1)
    );

    return EARTH_RADIUS_MI * angle;
}

map<string, airport> airport::airports;

/*====NOTES=====
STRING
LAT
LON
POP
*/

void airport::loadAirports() {
    airports["ATL"] = airport("ATL", 33.6324, -84.4333, 6411149);
    airports["DFW"] = airport("DFW", 32.8922, -97.0391, 8344032);
    airports["DEN"] = airport("DEN", 39.8563, -104.6764, 3052498);
    airports["ORD"] = airport("ORD", 41.9803, -87.9090, 9408576);
    airports["LAX"] = airport("LAX", 33.9422, -118.4036, 12927614);
    airports["JFK"] = airport("JFK", 40.6446, -73.7797, 19940274);
    airports["CLT"] = airport("CLT", 35.2163, -80.9539, 2883370);
    airports["LAS"] = airport("LAS", 36.0831, -115.1482, 2398871);
    airports["MCO"] = airport("MCO", 28.4244, -81.3105, 2940513);
    airports["MIA"] = airport("MIA", 25.7923, -80.2823, 6457988);
    airports["PHX"] = airport("PHX", 33.4352, -112.0101, 5186958);
    airports["SEA"] = airport("SEA", 47.4484, -122.3086, 4145494);
    airports["SFO"] = airport("SFO", 37.6191, -122.3816, 4648486);
    airports["EWR"] = airport("EWR", 40.6885, -74.1769, 19940274);
    airports["IAH"] = airport("IAH", 29.9931, -95.3416, 7796182);
    airports["BOS"] = airport("BOS", 42.3656, -71.0096, 5025517);
    airports["MSP"] = airport("MSP", 44.8851, -93.2144, 3757952);
    airports["FLL"] = airport("FLL", 26.0732, -80.1512, 6457988);
    airports["LGA"] = airport("LGA", 40.7766, -73.8742, 19940274);
    airports["DTW"] = airport("DTW", 42.2132, -83.3525, 4400578);
    airports["PHL"] = airport("PHL", 39.8730, -75.2437, 6330422);
    airports["SLC"] = airport("SLC", 40.7903, -111.9771, 1300762);
    airports["BWI"] = airport("BWI", 39.1774, -76.6684, 2859024);
    airports["IAD"] = airport("IAD", 38.9522, -77.4579, 6436489);
    airports["SAN"] = airport("SAN", 32.7379, -117.1897, 3298799);
    airports["DCA"] = airport("DCA", 38.8501, -77.0392, 6436489);
    airports["TPA"] = airport("TPA", 27.9769, -82.5303, 3424560);
    airports["BNA"] = airport("BNA", 36.1249, -86.6762, 2150553);
    airports["AUS"] = airport("AUS", 30.1941, -97.6711, 2550637);
    airports["HNL"] = airport("HNL", 21.3187, -157.9254, 998747);
    airports["CDG"] = airport("CDG", 49.0079, 2.5508, 13171056);
}


// Fly airline to destination
double airport::flyAircraft(airline& plane, const string& destCode) {
    string fromCode = plane.get_location();

    if (airports.find(fromCode) == airports.end()) {
        cerr << "Current airport " << fromCode << " not found!" << endl;
        return -1;
    }
    if (airports.find(destCode) == airports.end()) {
        cerr << "Destination airport " << destCode << " not found!" << endl;
        return -1;
    }

    double dist = airports[fromCode].distanceTo(airports[destCode]);

    if (dist <= 150) {
        cerr << "Unable to fly, too close together" << endl;
        return -1;
    }

    plane.fly(dist / 500.0, destCode); // approx flight hours at 500 mph
    
    return dist;
}
