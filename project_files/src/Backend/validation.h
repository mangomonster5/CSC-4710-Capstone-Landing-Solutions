#ifndef validation_h
#define validation_h

#include <string>
using namespace std;

class validation {
public:
    // basic number checks
    bool pos(double val);  // check if positive
    bool pos_int(int val);
    bool range(double val, double min, double max);
    bool range_int(int val, int min, int max);
    
    // costs checks
    bool conv_type(int type);  // 1 or 2 for USD/EUR
    bool fuel_ok(double gal);
    bool ops_ok(int ops);
    bool pax_ok(int pax, int cap);
    
    // flight checks
    bool alt_ok(int alt);
    bool speed_ok(double kmh);
    bool heading_ok(double deg);
    bool dist_ok(double miles);  // >150 miles
    
    // airport checks
    bool code_ok(string code);  // 3 letters
    bool code_exists(string code);
    
    // airline checks
    bool tail_ok(string tail);
    bool model_ok(string model);
    bool hours_ok(double hours);
};

#endif