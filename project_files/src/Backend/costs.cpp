#include <iostream>
#include <iomanip>
#include <fstream>
#include "costs.h"
using namespace std;

// xe.com rate 01/31/26
const double EUR_USD = 1.09;

// Currency conversion: type 1 = USD->EUR, type 2 = EUR->USD
double costs::conversion(int type, double US, double EU)
{
    if(type == 1) return US / EUR_USD;
    return EU * EUR_USD;
}

// US fuel cost: $6.19/gallon (fixed price)
double costs::fuel_us(double gal)
{
    return gal * GalPriceUS; // GalPriceUS = 6.19 from header
}

// Paris fuel cost: EUR 1.97/liter which will be converted to USD
double costs::fuel_eu(double L)
{
    return conversion(2, 0, L * LitrPriceEU); // LitrPriceEU = 1.97, convert EUR to USD
}

// 
double costs::airport_us(int ops)
{
    return ops * USAirportUS;
}

double costs::airport_eu(int ops)
{
    return conversion(2, 0, ops * EUAirportEU);
}

// Total flight operating cost
double costs::flight_cost(double gal, bool intl, bool from_eu, bool to_eu)
{
    double c = 0;
    
    if(intl && to_eu){
        double L = gal * 3.78541; // convert gallons to liters
        c += fuel_eu(L); // use Paris fuel pricing
    } else {
        c += fuel_us(gal); // use US fuel pricing
    }
    
    c += from_eu ? airport_eu(1) : airport_us(1);
    c += to_eu ? airport_eu(1) : airport_us(1);
    
    return c;
}

// Monthly lease costs
double costs::lease(int n1, int n2, int n3, int n4)
{
    return (n1 * 245000) + (n2 * 270000) + (n3 * 192000) + (n4 * 228000);
    // n1 = 737-600 at $245k/month
    // n2 = 737-800 at $270k/month  
    // n3 = A220-100 at $192k/month
    // n4 = A220-300 at $228k/month
}

// Ticket pricing based on 30% load factor
double costs::ticket_price(double op_cost, int seats)
{
    double pax = seats * 0.30;
    if(pax == 0) return 0;
    return op_cost / pax; // dividing the cost by expected passengers
}

// Revenue calculation (pax=passengers)
double costs::revenue(int pax, double price)
{
    return pax * price; // passengers times ticket price
}

// Profit or loss calculation
// rev: total revenue from ticket sales
// cost: total operating costs (fuel + fees + leases)
double costs::profit(double rev, double cost)
{
    return rev - cost; // revenue minus total costs
}