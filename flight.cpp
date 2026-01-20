#include <iostream>
#include <iomanip>
#include <fstream>
#include "flight.h"

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
    return km / speed_kmh;
}

double flight::heading_adjust(double time_hr, double heading_deg)
{
    // Normalize heading
    while (heading_deg < 0) heading_deg += 360;
    while (heading_deg >= 360) heading_deg -= 360;

    // Due East (~270°)
    if (heading_deg >= 260 && heading_deg <= 280)
        return time_hr * (1.0 + EastFactor);

    // Due West (~90°)
    if (heading_deg >= 80 && heading_deg <= 100)
        return time_hr * (1.0 + WestFactor);

    // Partial adjustment
    double factor = (90.0 - heading_deg) / 90.0;
    return time_hr * (1.0 + (factor * WestFactor));
}

double flight::flight_time(double miles, double max_kmh, double heading_deg)
{
    double speed = cruise_speed(max_kmh);
    double time = base_time(miles, speed);
    return heading_adjust(time, heading_deg);
}

double flight::climb_time(int altitude_ft)
{
    // Simple approximation using two speed regions
    if (altitude_ft <= 10000)
        return (altitude_ft / 1000.0) * 2.0;

    double low = 10000 / 1000.0 * 2.0;
    double high = (altitude_ft - 10000) / 1000.0 * 1.5;

    return low + high;
}

double flight::descent_time(int altitude_ft)
{
    // 1000 ft per 3 nautical miles @ avg 250 knots
    double nm = (altitude_ft / 1000.0) * 3.0;
    double hours = nm / 250.0;
    return hours * 60.0;
}
