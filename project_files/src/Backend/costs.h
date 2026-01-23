#include <iostream>
#include <iomanip>
#include <fstream>

#ifndef costs_h
#define costs_h
using namespace std;

class costs{
    private:
        const double GalPriceUS = 6.19;
        const double LitrPriceEU = 1.97;
        const double EUAirportEU = 2100;
        const double USAirportUS = 2000;
        
    public:
        double conversion(int, double, double); //int 1 or 2 if its EU/US, double US price, double EU price
        double fuel_us(double gal);
        double fuel_eu(double L);
        double airport_us(int ops);
        double airport_eu(int ops);
        double flight_cost(double gal, bool intl, bool from_eu, bool to_eu);
        double lease(int n1, int n2, int n3, int n4);
        double ticket_price(double op_cost, int seats);
        double revenue(int pax, double price);
        double profit(double rev, double cost);
};

#endif