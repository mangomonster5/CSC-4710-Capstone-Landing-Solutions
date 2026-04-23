// Author: Sean Harder

// This function is a simple filtering, we take the flight, and map the entire airports array to find the airport with the origin_airport_id or destination_airport_id
// Once the airport is found, the entire airport object is returned allowing you to deconstruct values like airport.city

const GetAirportInfoFromFlight = (airports: Airport[], flight: Flight, useOriginId: boolean): Airport | undefined => {
    if (airports == null) return;


    const airportId = useOriginId
        ? flight.origin_airport_id
        : flight.destination_airport_id;

    return airports.find(a => a.airport_id === airportId);

};

export default GetAirportInfoFromFlight;