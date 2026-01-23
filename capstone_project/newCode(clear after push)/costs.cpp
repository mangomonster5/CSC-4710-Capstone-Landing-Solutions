#include <iostream>
#include <iomanip>
#include <fstream>
#include "costs.h"
using namespace std;

// xe.com rate 01/31/26
const double EUR_USD = 1.09;

double costs::conversion(int type, double US, double EU)
{
    if(type == 1) return US / EUR_USD;
    return EU * EUR_USD;
}

double costs::fuel_us(double gal)
{
    return gal * GalPriceUS;
}

double costs::fuel_eu(double L)
{
    return conversion(2, 0, L * LitrPriceEU);
}

double costs::airport_us(int ops)
{
    return ops * USAirportUS;
}

double costs::airport_eu(int ops)
{
    return conversion(2, 0, ops * EUAirportEU);
}

double costs::flight_cost(double gal, bool intl, bool from_eu, bool to_eu)
{
    double c = 0;
    
    if(intl && to_eu){
        double L = gal * 3.78541;
        c += fuel_eu(L);
    } else {
        c += fuel_us(gal);
    }
    
    c += from_eu ? airport_eu(1) : airport_us(1);
    c += to_eu ? airport_eu(1) : airport_us(1);
    
    return c;
}

double costs::lease(int n1, int n2, int n3, int n4)
{
    return (n1 * 245000) + (n2 * 270000) + (n3 * 192000) + (n4 * 228000);
}

double costs::ticket_price(double op_cost, int seats)
{
    int pax = seats * 0.30;
    if(pax == 0) return 0;
    return op_cost / pax;
}

double costs::revenue(int pax, double price)
{
    return pax * price;
}

double costs::profit(double rev, double cost)
{
    return rev - cost;
}