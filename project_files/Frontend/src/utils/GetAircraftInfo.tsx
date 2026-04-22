const GetAircraftInfo = (aircrafts: Aircraft[], flight: Flight): Aircraft | undefined => {

    const aircraftId = flight.aircraft_id

    return aircrafts.find(a => a.aircraft_id === aircraftId);

};

export default GetAircraftInfo;