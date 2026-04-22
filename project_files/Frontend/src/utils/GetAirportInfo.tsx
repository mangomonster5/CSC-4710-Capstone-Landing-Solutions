const GetAirportInfo = (airports: Airport[], flight: Flight, useOriginId: boolean): Airport | undefined => {
    if (airports == null) return;


    const airportId = useOriginId
        ? flight.origin_airport_id
        : flight.destination_airport_id;

    return airports.find(a => a.airport_id === airportId);

};

export default GetAirportInfo;