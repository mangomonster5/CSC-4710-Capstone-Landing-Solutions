// Author: Sean Harder

// This function is a simple filtering, we take the flight, and map the entire aircraft array to find the aircraft_id with the flight_id
// Once the aircraft is found, the entire aircraft object is returned allowing you to deconstruct values like aircraft.capacity

const GetAircraftInfo = (aircrafts: Aircraft[], flight: Flight): Aircraft | undefined => {


    const aircraftId = flight.aircraft_id

    return aircrafts.find(a => a.aircraft_id === aircraftId);

};

export default GetAircraftInfo;