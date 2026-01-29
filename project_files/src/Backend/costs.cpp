#include <iostream>
#include <iomanip>
#include <fstream>
#include "costs.h"
using namespace std;

// xe.com rate 01/31/26
const double EUR_USD = 1.20;

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

// US airport fees
// ops: operations (takeoff + landing = 2 ops total per flight)
// USAirportUS = $2000 per operation (page 5)
// Example: 2 operations (ops) * $2000 = $4000
double costs::airport_us(int ops)
{
    return ops * USAirportUS;
}

// Paris airport fees
// ops: operations (takeoff + landing = 2 ops total per flight)
// EUAirportEU = €2100 per operation from (page 4)
// Example: 2 ops * €2100 = €4200 = $4578 USD (Converts EUR to USD automatically)
double costs::airport_eu(int ops)
{
    return conversion(2, 0, ops * EUAirportEU);
}

// Total flight operating cost
// The number is used later for ticket_price() which is two functions below
double costs::flight_cost(double gal, bool intl, bool from_eu, bool to_eu)
{
    double c = 0; // c = total cost accumulator
    
    if(intl && to_eu){
        // International flight to Paris: convert gallons to liters
        double L = gal * 3.78541; // convert gallons to liters
        c += fuel_eu(L); // use Paris fuel pricing
    } else {
        c += fuel_us(gal); // Domestic US flight; use US fuel pricing
    }
    
    c += from_eu ? airport_eu(1) : airport_us(1); // takeoff fee
    c += to_eu ? airport_eu(1) : airport_us(1); // landing fee
    
    return c;
}

// Monthly lease cost for entire fleet
// Our fleet is 15+15+12+13 = 55 aircraft total
// Example: lease(15, 15, 12, 13) = $12,954,000/month
double costs::lease(int n1, int n2, int n3, int n4)
{
    return (n1 * 245000) + (n2 * 270000) + (n3 * 192000) + (n4 * 228000);
    // n1 = 737-600 at $245k/month
    // n2 = 737-800 at $270k/month  
    // n3 = A220-100 at $192k/month
    // n4 = A220-300 at $228k/month
}

// Ticket pricing based on 30% load factor
// op_cost: operating cost from flight_cost() (ex: $50,000)
// seats: aircraft capacity (ex: 162 for 737-800)
// 
// Example calculation:
//   737-800 has 162 seats
//   30% of 162 = 48.6 passengers expected
//   If flight costs $50,000 to operate
//   Ticket price = $50,000 / 48.6 = $1,028.81 per ticket
//
// If you actually get 75% full (goal from spec), you make extra profit: 75% of 162 = 121 passengers
//   Revenue = 121 * $1,028.81 = $124,485
//   Profit = $124,485 - $50,000 = $74,485
double costs::ticket_price(double op_cost, int seats)
{
    double pax = seats * 0.30; // pax = passengers (30% load factor)
    if(pax == 0) return 0; // avoid divide by zero
    return op_cost / pax; // dividing the cost by expected passengers
}

// Revenue calculation (pax=passengers)
// price: ticket price from ticket_price()
// Example: 100 passengers * $500/ticket = $50,000 revenue
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