#include <iostream>
#include <iomanip>
#include <fstream>
#include <cmath>
#include "flight.h"
#include "airline.h"

using namespace std;

int flight::cruise_altitude(bool intl, double miles)
{
    if (intl)
        return IntlAlt;

    if (miles >= 1500)
        return Alt1500;
    if (miles < 200)
        return AltUnder200;
    if (miles < 350)
        return AltUnder350;

    return AltUnder1500;
}

double flight::cruise_speed(double max_kmh)
{
    return max_kmh * SpeedFactor;
}

double flight::base_time(double miles, double speed_kmh)
{
    double km = miles * 1.60934;
    if (speed_kmh == 0) return 0;

    double hours = km / speed_kmh;
    return hours * 60.0;   // returns in minutes
}


double flight::heading_adjust(double time_min, double heading_deg)
{
    // Normalize heading
    while (heading_deg < 0) heading_deg += 360;
    while (heading_deg >= 360) heading_deg -= 360;

    // Due East (~270°)
    if (heading_deg >= 260 && heading_deg <= 280)
        return time_min * (1.0 + EastFactor);

    // Due West (~90°)
    if (heading_deg >= 80 && heading_deg <= 100)
        return time_min * (1.0 + WestFactor);

    // Partial adjustment
    double factor = (90.0 - heading_deg) / 90.0;
    return time_min * (1.0 + (factor * WestFactor));
}


double flight::climb_time(int cruise_alt_ft) {
    const double climb_angle_deg = 6.0;
    const double ft_per_nm = 6076.12;

    double angle_rad = climb_angle_deg * PI / 180.0;

    // 250 kt to 10,000 ft
    double speed1 = 250.0;
    double vs1 = speed1 * ft_per_nm / 60.0 * tan(angle_rad);
    double time1 = 10000.0 / vs1;

    // 280 kt above 10,000 ft
    double speed2 = 280.0;
    double vs2 = speed2 * ft_per_nm / 60.0 * tan(angle_rad);
    double time2 = (cruise_alt_ft - 10000.0) / vs2;

    return time1 + time2; // minutes
}


double flight::descent_time(int cruise_alt_ft)
{
    // 1,000 ft per 3 NM
    double nm_total = (cruise_alt_ft / 1000.0) * 3.0;

    // Above 10,000 ft @ 250 kt
    double nm_above = ((cruise_alt_ft - 10000.0) / 1000.0) * 3.0;
    double time_above = (nm_above / 250.0) * 60.0;

    // Below 10,000 ft @ 200 kt
    double nm_below = (10000.0 / 1000.0) * 3.0;
    double time_below = (nm_below / 200.0) * 60.0;

    return time_above + time_below; // minutes


}

//


double flight::flying_time(double miles, double max_kmh, double heading_deg, double altitude)
{

    const double accel_rate = 25.0; // kt/min
    const double decel_rate = 35.0; // kt/min
    

    double speed = cruise_speed(max_kmh);
    double time = base_time(miles, speed);
    double climb = climb_time(altitude);
    double descent = descent_time(altitude);

    double accel_time_min = (speed - 280.0) / accel_rate;
    double decel_time_min = (speed - 250.0) / decel_rate;

    time += (accel_time_min + decel_time_min + climb + descent); //aLready in minutes

    return heading_adjust(time, heading_deg);
}

// taxi time from project 
// pop: metro population of airport
// hub: true if airport is aactually a hub
double flight::taxi(int pop, bool hub)
{
    if(hub){
        // hub airports: 15 min base for <= 9M pop
        if(pop <= 9000000) return 15;
        // add 1 min per 2M people over 9M, max 20 min
        int extra = (pop - 9000000) / 2000000;
        return extra + 15 > 20 ? 20 : extra + 15;
    }
    // non-hub: pop * 0.00075%, max 13 min
    double t = pop * 0.0000075;
    return t > 13 ? 13 : t;
}

// gate to gate time
// mi: flight distance in miles
// spd: cruise speed in miles per hour
// hdg: flight heading in degrees
// intl: true if international flight
// o_pop: origin airport population
// o_hub: true if origin is a hub
// d_pop: destination airport population
// d_hub: true if destination is a hub
// needFuel: true if fuel was needed, adding 10 minutes to flight time
double flight::flight_time(double mi, double spd, double hdg, bool intl,
                         int o_pop, bool o_hub, int d_pop, bool d_hub,
                        bool needFuel)
{
    double total = 0;  // accumulator for total time
    
    total += taxi(o_pop, o_hub);  // origin taxi time
    total += 1;  // takeoff: 1 min on runway (spec page 7)

    int alt = cruise_altitude(intl, mi);  // get cruise altitude
    total += climb_time(alt);  // time to climb

    total += flying_time(mi, spd, hdg, alt);  // cruise time 

    total += descent_time(alt);  // time to descend
    
    total += 2;  // landing: 2 min on runway (spec page 7)

    total += taxi(d_pop, d_hub);  // destination taxi time
    
    total += turn(needFuel); //turnAround Time

    return total;  // total time in minutes
}

// great circle distance 
// lat1, lon1: origin latitude and longitude (degrees)
// lat2, lon2: destination latitude and longitude (degrees)
// R = earth radius, returns miles
double flight::dist(double lat1, double lon1, double lat2, double lon2)
{
    double R = 3958.8;  // earth radius in miles
    
    // convert to radians
    double a1 = lat1 * PI / 180.0;
    double a2 = lat2 * PI / 180.0;
    double dlat = (lat2 - lat1) * PI / 180.0;  // delta latitude
    double dlon = (lon2 - lon1) * PI / 180.0;  // delta longitude
    
    // haversine formula
    double a = sin(dlat/2) * sin(dlat/2) +
               cos(a1) * cos(a2) * sin(dlon/2) * sin(dlon/2);
    double c = 2 * atan2(sqrt(a), sqrt(1-a));
    
    return R * c;  // distance in miles
}

// bearing calculation 
// lat1, lon1: origin latitude and longitude (degrees)
// lat2, lon2: destination latitude and longitude (degrees)
// returns heading 0-360 (0=N, 90=E, 180=S, 270=W)
double flight::hdg(double lat1, double lon1, double lat2, double lon2)
{
    // convert to radians
    double a1 = lat1 * PI / 180.0;
    double a2 = lat2 * PI / 180.0;
    double dlon = (lon2 - lon1) * PI / 180.0;
    
    // bearing formula
    double x = sin(dlon) * cos(a2);
    double y = cos(a1) * sin(a2) - sin(a1) * cos(a2) * cos(dlon);
    
    double bearing = atan2(x, y) * 180.0 / PI;  // convert to degrees
    return fmod(bearing + 360, 360);  // normalize to 0-360
}

// fuel consumption
// fuel rates in gallons per mile by aircraft type is returned
// mi: flight distance in miles
// model: aircraft model string
double flight::fuelNeeded(double mi, string model)
{
    double rate;  // gal per mile
    
    // rates (Page 6)
    if(model == "Boeing 737-600") rate = 4.8;
    else if(model == "Boeing 737-800") rate = 5.2;
    else if(model == "Airbus A220-100") rate = 4.2;
    else if(model == "Airbus A220-300") rate = 4.6;
    else rate = 5.0;  // default
    
    return mi * rate;  // total gallons
}

// refuels flight if needed
//returns the fuel amount to be passed into update_fuel()
double flight::refuel(string model)
{
    if(model == "Boeing 737-600" || model == "Boeing 737-800"){
        return 6785;
    }else if(model == "Airbus A220-100"){
        return 5760;
    }else if(model == "Airbus A220-300"){
        return 5681;
    }else{
        return -1;
    }  
}

// turnaround time
// needs_gas: true if aircraft requires refueling
// 40 min normal, 50 min if refueling
int flight::turn(bool needs_gas)
{
    return needs_gas ? 50 : 40;
}