#include <iostream>
#include <iomanip>
#include <fstream>

#ifndef costs_h
#define costs_h
using namespace std;

//ops is lease amount


class costs{
    private:
        const double GalPriceUS = 6.19; // US fuel fixed at $6.19 a gallon
        const double LitrPriceEU = 1.97; // Paris fuel is EUR 1.97 a liter
        const double EUAirportEU = 2100; // Paris airport charges EUR 2100 per takeoff and landing
        const double USAirportUS = 2000; // US airports charge $2000 per takeoff/landing
        
    public:
        // Currency conversion between USD and EUR (type: 1 = convert USD to EUR, 2 = convert EUR to USD)
        // US: amount in US dollars; EU: amount in Euros
        // Returns: converted amount
        double conversion(int, double, double); //int 1 or 2 if its EU/US, double US price, double EU price
        
        // Returns US fuel cost in USD given gallons required.
        double fuel_us(double gal); 

        // Returns fuel cost in USD for Paris flights given liters required (EUR converted).
        double fuel_eu(double L);

        // Returns total US airport fees in USD based on number of operations.
        // ops: number of operations (1 takeoff + 1 landing = 2 ops per flight)
        double airport_us(int ops);

        // Returns total Paris airport fees in USD based on operations (EUR converted).
        double airport_eu(int ops);

        // Calculate total operating cost for a single flight
        // gal: gallons of fuel needed
        // intl: true if international flight (to/from Paris)
        // from_eu: true if departing from Paris; to_eu: true if arriving at Paris
        // Returns: total cost in USD (fuel + airport fees)
        double flight_cost(double gal, bool intl, bool from_eu, bool to_eu);

        // Calculate monthly lease cost for entire fleet
        // n1: number of Boeing 737-600 aircraft ($245,000/month each)
        // n2: number of Boeing 737-800 aircraft ($270,000/month each)
        // n3: number of Airbus A220-100 aircraft ($192,000/month each)
        // n4: number of Airbus A220-300 aircraft ($228,000/month each)
        // Returns: total monthly lease cost in USD
        double lease(int n1, int n2, int n3, int n4);

        // Calculate ticket price based on 30% load factor
        // op_cost: operating cost of the flight (from flight_cost)
        // seats: total passenger capacity of aircraft
        // Returns: price per ticket in USD
        double ticket_price(double op_cost, int seats);

        // Calculate revenue from ticket sales
        // pax: number of passengers (short for "passengers")
        // price: ticket price per passenger
        // Returns: total revenue in USD
        double revenue(int pax, double price);

        // Calculate profit or loss
        // rev: total revenue (from revenue function)
        // cost: total costs (fuel, fees, leases, etc)
        // Returns: profit (positive) or loss (negative) in USD
        double profit(double rev, double cost);
};

#endif