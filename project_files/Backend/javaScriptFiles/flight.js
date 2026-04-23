class Flight {

    constructor() {
        // Speed operation
        this.SpeedFactor = 0.80;

        // Cruising altitudes (feet)
        this.IntlAlt = 38000;
        this.Alt1500 = 35000;
        this.AltUnder1500 = 30000;
        this.AltUnder350 = 25000;
        this.AltUnder200 = 20000;

        // Wind & earth rotation
        this.EastFactor = -0.045;
        this.WestFactor = 0.045;

        // Accel / decel (knots per minute)
        this.AccelRate = 25;
        this.DecelRate = 35;

        this.PI = 3.14;
    }

    // --------------------------
    // Cruising altitude
    // --------------------------
    cruiseAltitude(intl, miles) {
        if (intl) return this.IntlAlt;
        if (miles >= 1500) return this.Alt1500;
        if (miles < 200) return this.AltUnder200;
        if (miles < 350) return this.AltUnder350;
        return this.AltUnder1500;
    }

    // --------------------------
    // Cruise speed (km/h)
    // --------------------------
    cruiseSpeed(maxKmh) {
        return maxKmh * this.SpeedFactor;
    }

    // --------------------------
    // Base time (minutes)
    // --------------------------
    baseTime(miles, speedKmh) {
        const km = miles * 1.60934;
        if (speedKmh === 0) return 0;

        const hours = km / speedKmh;
        return hours * 60.0;
    }

    // --------------------------
    // Heading adjustment
    // --------------------------
    headingAdjust(timeMin, headingDeg) {

        while (headingDeg < 0) headingDeg += 360;
        while (headingDeg >= 360) headingDeg -= 360;

        if (headingDeg >= 260 && headingDeg <= 280)
            return timeMin * (1.0 + this.EastFactor);

        if (headingDeg >= 80 && headingDeg <= 100)
            return timeMin * (1.0 + this.WestFactor);

        const factor = (90.0 - headingDeg) / 90.0;
        return timeMin * (1.0 + (factor * this.WestFactor));
    }

    // --------------------------
    // Climb time (minutes)
    // --------------------------
    climbTime(cruiseAltFt) {

        const climbAngleDeg = 6.0;
        const ftPerNm = 6076.12;
        const angleRad = climbAngleDeg * this.PI / 180.0;

        const speed1 = 250.0;
        const vs1 = speed1 * ftPerNm / 60.0 * Math.tan(angleRad);
        const time1 = 10000.0 / vs1;

        const speed2 = 280.0;
        const vs2 = speed2 * ftPerNm / 60.0 * Math.tan(angleRad);
        const time2 = (cruiseAltFt - 10000.0) / vs2;

        return time1 + time2;
    }

    // --------------------------
    // Descent time (minutes)
    // --------------------------
    descentTime(cruiseAltFt) {

        const nmAbove = ((cruiseAltFt - 10000.0) / 1000.0) * 3.0;
        const timeAbove = (nmAbove / 250.0) * 60.0;

        const nmBelow = (10000.0 / 1000.0) * 3.0;
        const timeBelow = (nmBelow / 200.0) * 60.0;

        return timeAbove + timeBelow;
    }

    // --------------------------
    // Flying time (minutes)
    // --------------------------
    flyingTime(miles, maxKmh, headingDeg, altitude) {

        const speed = this.cruiseSpeed(maxKmh);
        let time = this.baseTime(miles, speed);

        const climb = this.climbTime(altitude);
        const descent = this.descentTime(altitude);

        const accelTime = (speed - 280.0) / this.AccelRate;
        const decelTime = (speed - 250.0) / this.DecelRate;

        time += (accelTime + decelTime + climb + descent);

        return this.headingAdjust(time, headingDeg);
    }

    // --------------------------
    // Taxi time
    // --------------------------
    taxi(pop, hub) {
        if (hub) {
            if (pop <= 9000000) return 15;

            const extra = Math.floor((pop - 9000000) / 2000000);
            return (extra + 15 > 20) ? 20 : extra + 15;
        }

        const t = pop * 0.0000075;
        return t > 13 ? 13 : t;
    }

    // --------------------------
    // Gate-to-gate flight time RETURNS IN MINUTES
    // --------------------------
    flightTime(mi, spd, hdg, intl,
               oPop, oHub, dPop, dHub,
               needFuel) {

        let total = 0;

        total += this.taxi(oPop, oHub);
        total += 1; //taxi time on dparting runway

        const alt = this.cruiseAltitude(intl, mi);

        total += this.flyingTime(mi, spd, hdg, alt);

        total += 2; //taxi time on landing runway

        total += this.taxi(dPop, dHub);

        return total; //MINUTES
    }

    // --------------------------
    // Great circle distance (miles)
    // --------------------------
    dist(lat1, lon1, lat2, lon2) {

        const R = 3958.8;

        const a1 = lat1 * this.PI / 180.0;
        const a2 = lat2 * this.PI / 180.0;
        const dlat = (lat2 - lat1) * this.PI / 180.0;
        const dlon = (lon2 - lon1) * this.PI / 180.0;

        const a = Math.sin(dlat/2) * Math.sin(dlat/2) +
                  Math.cos(a1) * Math.cos(a2) *
                  Math.sin(dlon/2) * Math.sin(dlon/2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c;
    }

    // --------------------------
    // Heading (0–360°)
    // --------------------------
    hdg(lat1, lon1, lat2, lon2) {

        const a1 = lat1 * this.PI / 180.0;
        const a2 = lat2 * this.PI / 180.0;
        const dlon = (lon2 - lon1) * this.PI / 180.0;

        const x = Math.sin(dlon) * Math.cos(a2);
        const y = Math.cos(a1) * Math.sin(a2) -
                  Math.sin(a1) * Math.cos(a2) * Math.cos(dlon);

        const bearing = Math.atan2(x, y) * 180.0 / this.PI;

        return (bearing + 360) % 360;
    }

    // --------------------------
    // Fuel usage
    // --------------------------
    fuelNeeded(mi, model) {

        let rate;

        if (model === "Boeing 737-600") rate = 4.8;
        else if (model === "Boeing 737-800") rate = 5.2;
        else if (model === "Airbus A220-100") rate = 4.2;
        else if (model === "Airbus A220-300") rate = 4.6;
        else rate = 5.0;

        return mi * rate;
    }

    // --------------------------
    // Refuel capacity
    // --------------------------
    refuel(model) {
        if (model === "Boeing 737-600" || model === "Boeing 737-800")
            return 6785;
        else if (model === "Airbus A220-100")
            return 5760;
        else if (model === "Airbus A220-300")
            return 5681;
        else if (model == "Airbus A350-1000")
	    return 44460;
	else
            return -1;
    }

    // --------------------------
    // Turnaround time
    // --------------------------
    turn(needsGas) {
        return needsGas ? 50 : 40;
    }
}

export default Flight;
// For CommonJS: module.exports = Flight;
