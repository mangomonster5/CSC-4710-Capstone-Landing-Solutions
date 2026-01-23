#include <iostream>
#include <iomanip>
#include <fstream>
#include <cmath>
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

    const double accel_rate = 25.0; // kt/min
    const double decel_rate = 35.0; // kt/min

    double speed = cruise_speed(max_kmh);
    double time = base_time(miles, speed);

    double accel_time_min = (speed - 280.0) / accel_rate;
    double decel_time_min = (speed - 250.0) / decel_rate;

    time += (accel_time_min + decel_time_min) / 60.0;

    return heading_adjust(time, heading_deg);
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
