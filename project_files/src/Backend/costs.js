// xe.com rate 01/31/26
const EUR_USD = 1.20;

//ops is lease amount

class costs {
    constructor() {
        this.GalPriceUS = 6.19; // US fuel fixed at $6.19 a gallon
        this.LitrPriceEU = 1.97; // Paris fuel is EUR 1.97 a liter
        this.EUAirportEU = 2100; // Paris airport charges EUR 2100 per takeoff and landing
        this.USAirportUS = 2000; // US airports charge $2000 per takeoff/landing
    }

    // Currency conversion between USD and EUR (type: 1 = convert USD to EUR, 2 = convert EUR to USD)
    // US: amount in US dollars; EU: amount in Euros
    // Returns: converted amount
    conversion(type, US, EU) { //int 1 or 2 if its EU/US, double US price, double EU price
        // Currency conversion: type 1 = USD->EUR, type 2 = EUR->USD
        if(type === 1) return US / EUR_USD;
        return EU * EUR_USD;
    }

    // Returns US fuel cost in USD given gallons required.
    // US fuel cost: $6.19/gallon (fixed price)
    fuel_us(gal) {
        return gal * this.GalPriceUS; // GalPriceUS = 6.19 from header
    }

    // Returns fuel cost in USD for Paris flights given liters required (EUR converted).
    // Paris fuel cost: EUR 1.97/liter which will be converted to USD
    fuel_eu(L) {
        return this.conversion(2, 0, L * this.LitrPriceEU); // LitrPriceEU = 1.97, convert EUR to USD
    }

    // Returns total US airport fees in USD based on number of operations.
    // ops: number of operations (1 takeoff + 1 landing = 2 ops per flight)
    // US airport fees
    // ops: operations (takeoff + landing = 2 ops total per flight)
    // USAirportUS = $2000 per operation (page 5)
    // Example: 2 operations (ops) * $2000 = $4000
    airport_us(ops) {
        return ops * this.USAirportUS;
    }

    // Returns total Paris airport fees in USD based on operations (EUR converted).
    // Paris airport fees
    // ops: operations (takeoff + landing = 2 ops total per flight)
    // EUAirportEU = €2100 per operation from (page 4)
    // Example: 2 ops * €2100 = €4200 = $4578 USD (Converts EUR to USD automatically)
    airport_eu(ops) {
        return this.conversion(2, 0, ops * this.EUAirportEU);
    }

    // Calculate total operating cost for a single flight
    // gal: gallons of fuel needed
    // intl: true if international flight (to/from Paris)
    // from_eu: true if departing from Paris; to_eu: true if arriving at Paris
    // Returns: total cost in USD (fuel + airport fees)
    // Total flight operating cost
    // The number is used later for ticket_price() which is two functions below
    flight_cost(gal, intl, from_eu, to_eu) {
        let c = 0; // c = total cost accumulator
        
        if(intl && to_eu){
            // International flight to Paris: convert gallons to liters
            let L = gal * 3.78541; // convert gallons to liters
            c += this.fuel_eu(L); // use Paris fuel pricing
        } else {
            c += this.fuel_us(gal); // Domestic US flight; use US fuel pricing
        }
        
        c += from_eu ? this.airport_eu(1) : this.airport_us(1); // takeoff fee
        c += to_eu ? this.airport_eu(1) : this.airport_us(1); // landing fee
        
        return c;
    }

    // Calculate monthly lease cost for entire fleet
    // n1: number of Boeing 737-600 aircraft ($245,000/month each)
    // n2: number of Boeing 737-800 aircraft ($270,000/month each)
    // n3: number of Airbus A220-100 aircraft ($192,000/month each)
    // n4: number of Airbus A220-300 aircraft ($228,000/month each)
    // Returns: total monthly lease cost in USD
    // Monthly lease cost for entire fleet
    // Our fleet is 15+15+12+13 = 55 aircraft total
    // Example: lease(15, 15, 12, 13) = $12,954,000/month
    lease(n1, n2, n3, n4) {
        return (n1 * 245000) + (n2 * 270000) + (n3 * 192000) + (n4 * 228000);
        // n1 = 737-600 at $245k/month
        // n2 = 737-800 at $270k/month  
        // n3 = A220-100 at $192k/month
        // n4 = A220-300 at $228k/month
    }

    // Calculate ticket price based on 30% load factor
    // op_cost: operating cost of the flight (from flight_cost)
    // seats: total passenger capacity of aircraft
    // Returns: price per ticket in USD
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
    // If you actually get 75% full you make extra profit (75% of 162 = 121 passengers)
    //   Revenue = 121 * $1,028.81 = $124,485
    //   Profit = $124,485 - $50,000 = $74,485
    ticket_price(op_cost, seats) {
        let pax = seats * 0.30; // pax = passengers (30% load factor)
        if(pax === 0) return 0; // avoid divide by zero
        return op_cost / pax; // dividing the cost by expected passengers
    }

    // Calculate revenue from ticket sales
    // pax - number of passengers (short for "passengers"); price - ticket price per passenger
    // Returns: total revenue in USD
    // Revenue calculation (pax=passengers)
    // price: ticket price from ticket_price()
    // Example: 100 passengers * $500/ticket = $50,000 revenue
    revenue(pax, price) {
        return pax * price; // passengers times ticket price
    }

    // Calculate profit or loss
    // rev: total revenue (from revenue function)
    // cost: total costs (fuel, fees, leases, etc)
    // Returns: profit (positive) or loss (negative) in USD
    // Profit or loss calculation
    // rev: total revenue from ticket sales
    // cost: total operating costs (fuel + fees + leases)
    profit(rev, cost) {
        return rev - cost; // revenue minus total costs
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = costs;
}