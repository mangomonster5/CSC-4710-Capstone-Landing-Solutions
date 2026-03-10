#include <iostream>
#include <string>
#include <cctype>
#include <limits>
#include "validation.h"
#include "airport.h"
using namespace std;

// basic checks
bool validation::pos(double val) {
    return val > 0;
}

bool validation::pos_int(int val) {
    return val > 0;
}

bool validation::range(double val, double min, double max) {
    return val >= min && val <= max;
}

bool validation::range_int(int val, int min, int max) {
    return val >= min && val <= max;
}

// costs validation
bool validation::conv_type(int type) {
    return type == 1 || type == 2;  // 1=USD->EUR, 2=EUR->USD
}

bool validation::fuel_ok(double gal) {
    return gal > 0 && gal < 50000;
}

bool validation::ops_ok(int ops) {
    return ops > 0 && ops <= 10;  // usually 2
}

bool validation::pax_ok(int pax, int cap) {
    return pax >= 0 && pax <= cap;
}

// flight validation
bool validation::alt_ok(int alt) {
    return alt >= 10000 && alt <= 45000;
}

bool validation::speed_ok(double kmh) {
    return kmh > 0 && kmh <= 1000;
}

bool validation::heading_ok(double deg) {
    return deg >= 0 && deg < 360;
}

bool validation::dist_ok(double miles) {
    return miles > 150;  // project spec
}

// airport validation
bool validation::code_ok(string code) {
    if (code.length() != 3) return false;
    for (char c : code) {
        if (!isupper(c)) return false;
    }
    return true;
}

bool validation::code_exists(string code) {
    return airport::airports.find(code) != airport::airports.end();
}

// airline validation
bool validation::tail_ok(string tail) {
    if (tail.length() < 8) return false;
    if (tail[4] != '-') return false;
    return true;
}

bool validation::model_ok(string model) {
    return model == "Boeing 737-600" || 
           model == "Boeing 737-800" || 
           model == "Airbus A220-100" || 
           model == "Airbus A220-300";
}

bool validation::hours_ok(double hours) {
    return hours >= 0 && hours <= 300;
}