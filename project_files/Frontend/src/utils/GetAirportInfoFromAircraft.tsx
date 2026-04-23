// Author: Sean Harder

const GetAirportInfoFromAircraft = (airports: Airport[], aircraft: Aircraft): Airport | undefined => {
    if (airports == null) return;

    return airports.find(a => a.airport_id === aircraft.current_airport_id);

};

export default GetAirportInfoFromAircraft;