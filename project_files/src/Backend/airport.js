const EARTH_RADIUS_MI = 3958.8;

class Airport {
    constructor(code = '', latitude = 0, longitude = 0, population = 0) {
        this.code = code;
        this.latitude = latitude;
        this.longitude = longitude;
        this.population = population;
    }

    getCode() { return this.code; }
    getLatitude() { return this.latitude; }
    getLongitude() { return this.longitude; }
    getPopulation() { return this.population; }

    distanceTo(other) {
        let lat1 = this.latitude * Math.PI / 180.0;
        let lon1 = this.longitude * Math.PI / 180.0;
        let lat2 = other.latitude * Math.PI / 180.0;
        let lon2 = other.longitude * Math.PI / 180.0;

        let angle = Math.acos(
            Math.sin(lat1) * Math.sin(lat2) +
            Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)
        );

        return EARTH_RADIUS_MI * angle;
    }

    // Static property for storing all airports
    static airports = {};

    /*====NOTES=====
    STRING
    LAT
    LON
    POP
    */

    static loadAirports() {
        Airport.airports["ATL"] = new Airport("ATL", 33.6324, -84.4333, 6411149);
        Airport.airports["DFW"] = new Airport("DFW", 32.8922, -97.0391, 8344032);
        Airport.airports["DEN"] = new Airport("DEN", 39.8563, -104.6764, 3052498);
        Airport.airports["ORD"] = new Airport("ORD", 41.9803, -87.9090, 9408576);
        Airport.airports["LAX"] = new Airport("LAX", 33.9422, -118.4036, 12927614);
        Airport.airports["JFK"] = new Airport("JFK", 40.6446, -73.7797, 19940274);
        Airport.airports["CLT"] = new Airport("CLT", 35.2163, -80.9539, 2883370);
        Airport.airports["LAS"] = new Airport("LAS", 36.0831, -115.1482, 2398871);
        Airport.airports["MCO"] = new Airport("MCO", 28.4244, -81.3105, 2940513);
        Airport.airports["MIA"] = new Airport("MIA", 25.7923, -80.2823, 6457988);
        Airport.airports["PHX"] = new Airport("PHX", 33.4352, -112.0101, 5186958);
        Airport.airports["SEA"] = new Airport("SEA", 47.4484, -122.3086, 4145494);
        Airport.airports["SFO"] = new Airport("SFO", 37.6191, -122.3816, 4648486);
        Airport.airports["EWR"] = new Airport("EWR", 40.6885, -74.1769, 19940274);
        Airport.airports["IAH"] = new Airport("IAH", 29.9931, -95.3416, 7796182);
        Airport.airports["BOS"] = new Airport("BOS", 42.3656, -71.0096, 5025517);
        Airport.airports["MSP"] = new Airport("MSP", 44.8851, -93.2144, 3757952);
        Airport.airports["FLL"] = new Airport("FLL", 26.0732, -80.1512, 6457988);
        Airport.airports["LGA"] = new Airport("LGA", 40.7766, -73.8742, 19940274);
        Airport.airports["DTW"] = new Airport("DTW", 42.2132, -83.3525, 4400578);
        Airport.airports["PHL"] = new Airport("PHL", 39.8730, -75.2437, 6330422);
        Airport.airports["SLC"] = new Airport("SLC", 40.7903, -111.9771, 1300762);
        Airport.airports["BWI"] = new Airport("BWI", 39.1774, -76.6684, 2859024);
        Airport.airports["IAD"] = new Airport("IAD", 38.9522, -77.4579, 6436489);
        Airport.airports["SAN"] = new Airport("SAN", 32.7379, -117.1897, 3298799);
        Airport.airports["DCA"] = new Airport("DCA", 38.8501, -77.0392, 6436489);
        Airport.airports["TPA"] = new Airport("TPA", 27.9769, -82.5303, 3424560);
        Airport.airports["BNA"] = new Airport("BNA", 36.1249, -86.6762, 2150553);
        Airport.airports["AUS"] = new Airport("AUS", 30.1941, -97.6711, 2550637);
        Airport.airports["HNL"] = new Airport("HNL", 21.3187, -157.9254, 998747);
        Airport.airports["CDG"] = new Airport("CDG", 49.0079, 2.5508, 13171056);
    }

    // Fly airline to destination
    static flyAircraft(plane, destCode) {
        let fromCode = plane.get_location();

        if (!(fromCode in Airport.airports)) {
            console.error("Current airport " + fromCode + " not found!");
            return -1;
        }
        if (!(destCode in Airport.airports)) {
            console.error("Destination airport " + destCode + " not found!");
            return -1;
        }

        let dist = Airport.airports[fromCode].distanceTo(Airport.airports[destCode]);

        if (dist <= 150) {
            console.error("Unable to fly, too close together");
            return -1;
        }

        plane.fly(dist / 500.0, destCode); // approx flight hours at 500 mph
        
        return dist;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Airport;
}