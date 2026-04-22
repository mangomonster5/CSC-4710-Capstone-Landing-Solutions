import { useState } from "react";
import ModalComponent from "../GlobalComponents/ModalComponent";
import FlightSelectionDropdown from "../GlobalComponents/FlightSelectionDropdown";
import HubDropdown from "../GlobalComponents/HubDropdown";
import useAllStateContext from "../context/useAllStateContext";
import GetAirportInfo from "../utils/GetAirportInfo";
import GetAircraftInfo from "../utils/GetAircraftInfo";


type flightDirection = {
    airportCode: string;
    city: string;
    time: string;
    flightNumber: string;
    gate: string;
    status: string;
};



const AllFlightsPage: React.FC = () => {
    // selection for which table we display
    const [flightDirection, setFlightDirection] = useState('arrival')
    const { allFlights, allAirports, allAircrafts } = useAllStateContext();

    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [selectedFlightModalObject, setSelectedFlightModalObject] = useState<Flight | undefined>(undefined)
    const [selectedHub, setSelectedHub] = useState<Hub | undefined>(undefined)

    const arrivalsList = allFlights[0].filter((flight: Flight) => GetAirportInfo(allAirports, flight, false)?.iata_code === selectedHub?.code)
    const departuresList = allFlights[0].filter((flight: Flight) => GetAirportInfo(allAirports, flight, true)?.iata_code === selectedHub?.code)

    // a status map for indicator color
    const statusColorMap: Record<string, string> = {
        'arrived': '#2ECC43',
        'Baggage Claim': '#2ECC43',
        'On Approach': '#3498DB',
        'On Time': '#3498DB',
        'boarding': '#3498DB',
        'scheduled': '#3498DB',
        'Taxiing': '#F39C12',
        'Delayed': '#F39C12',
        'Canceled': '#E74C3C',
        'Final Call': '#E74C3C',
    };

    const handleViewFlightClicked = (passedFlight: Flight) => {
        console.log(passedFlight)
        setSelectedFlightModalObject(passedFlight)
        setModalIsOpen(true)
    }



    const displayArrivialFlightTime = (passedFlight: Flight) => {
        if (passedFlight.actual_arrival == null) {
            return passedFlight.scheduled_arrival.substring(11, 16)
        } else {
            return passedFlight.actual_arrival.substring(11, 16)
        }
    }


    const displayDepartureFlightTime = (passedFlight: Flight) => {
        if (passedFlight.actual_depart == null) {
            return passedFlight.scheduled_depart.substring(11, 16)
        } else {
            return passedFlight.actual_depart.substring(11, 16)
        }
    }


    const handleCloseModal = () => {
        setModalIsOpen(false)
        setSelectedFlightModalObject(undefined);
    }


    return (
        <div style={{ paddingLeft: '18vw', paddingRight: '18vw', marginTop: '12vh', marginBottom: '12vh' }}>
            <div className="d-flex justify-content-between gap-4">
                <div className=" d-flex flex-column gap-1">
                    <h6 className="mb-0">All Panther Cloud Air Flight's</h6>
                    <div>View current schedules, departure and arrival times, and aircraft assignments for all flights.</div>
                </div>

                <HubDropdown
                    handleSelection={(e) => setSelectedHub(e)}
                    selectedHub={selectedHub}
                    setSelectedHub={setSelectedHub}
                    body={
                        <div className={`mainButton text-center ${selectedHub === undefined ? '' : 'fw-bold'}`}>{selectedHub === undefined ? 'Select Hub' : selectedHub.code}</div>
                    }
                />



                <div className=" align-items-center d-flex justify-content-end">
                    <button className={`segmentButton left ${flightDirection === 'arrival' && 'selected'}`} onClick={() => setFlightDirection('arrival')}>Arrivals</button>
                    <button className={`segmentButton right ${flightDirection === 'departure' && 'selected'}`} style={{ borderLeft: '0px' }} onClick={() => setFlightDirection('departure')}>Departures</button>
                </div>
            </div>


            <div className="mt-5">
                {flightDirection === 'arrival' ? (<h5>Arrivals</h5>) : (<h5>Departures</h5>)}

                <div className="d-flex bg-primary-blue-500  text-white py-3 px-3 fw-medium rounded-top border border-black border-bottom-0">
                    <div className="fw-semibold" style={{ width: '450px' }}>Origin</div>
                    <div className="fw-semibold" style={{ width: '200px' }}>Time</div>
                    <div className="fw-semibold" style={{ width: '250px' }}>Flight Number</div>
                    <div className="fw-semibold" style={{ width: '150px' }}>Gate</div>
                    <div className="fw-semibold" style={{ width: '250px' }}>Status</div>
                    <div className="fw-semibold" style={{ width: '150px' }}></div>
                </div>

                {flightDirection === 'arrival' ? (
                    <>
                        {arrivalsList.length > 0 ? (
                            <>
                                {arrivalsList.map((flight: Flight, i: any) => (
                                    <div key={i} className={`d-flex border-start border-end border-bottom border-dark py-3 px-3 fw-medium ${selectedFlightModalObject?.flight_id === flight.flight_id && 'fw-bold'} ${arrivalsList.length - 1 === i && 'rounded-bottom'}`} style={{ background: selectedFlightModalObject?.flight_id === flight.flight_id ? '#cccccc' : '' }}>
                                        <div className="text-muted" style={{ width: '450px' }}>{'[' + GetAirportInfo(allAirports, flight, true)?.iata_code + '] - ' + GetAirportInfo(allAirports, flight, true)?.city}</div>
                                        <div className="text-muted" style={{ width: '200px' }}>{displayArrivialFlightTime(flight)}</div>
                                        <div className="text-muted" style={{ width: '250px' }}>{flight.flight_num}</div>
                                        <div className="text-muted" style={{ width: '150px' }}>{flight.gate}</div>
                                        <div className="text-muted d-flex align-items-center gap-2  fw-normal" style={{ width: '250px' }}>
                                            <div
                                                className={`rounded-circle border border-dark`}
                                                style={{ width: '10px', height: '10px', background: statusColorMap[flight.flight_status] ?? '' }}
                                            ></div>
                                            <div>{flight.flight_status.slice(0, 1).toUpperCase()}{flight.flight_status.slice(1)}</div>
                                        </div>
                                        <div className="text-muted text-center" style={{ width: '150px' }}>
                                            <button className="rounded border" onClick={() => handleViewFlightClicked(flight)}>View</button>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className="py-3 border border-black rounded-bottom text-center fw-medium" style={{ background: '#e6e6e6' }}>
                                {selectedHub == null ? (
                                    <div>Please select a hub!</div>
                                ) : (
                                    <div className="d-flex flex-column gap-2">
                                        <div className="fw-semibold">[{selectedHub.code}] {selectedHub.name}</div>
                                        <div className="fw-normal">Does not have any flights, please select a different hub!</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {departuresList.length > 0 ? (
                            <>
                                {departuresList.map((flight: Flight, i: any) => (
                                    <div key={i} className={`d-flex border-start border-end border-bottom border-dark py-3 px-3 fw-medium ${selectedFlightModalObject?.flight_id === flight.flight_id && 'fw-bold'} ${arrivalsList.length - 1 === i && 'rounded-bottom'}`} style={{ background: selectedFlightModalObject?.flight_id === flight.flight_id ? '#cccccc' : '' }}>
                                        <div className="text-muted" style={{ width: '450px' }}>{'[' + GetAirportInfo(allAirports, flight, false)?.iata_code + '] - ' + GetAirportInfo(allAirports, flight, false)?.city}</div>
                                        <div className="text-muted" style={{ width: '200px' }}>{displayDepartureFlightTime(flight)}</div>
                                        <div className="text-muted" style={{ width: '250px' }}>{flight.flight_num}</div>
                                        <div className="text-muted" style={{ width: '150px' }}>{flight.gate}</div>
                                        <div className="text-muted d-flex align-items-center gap-2 fw-normal" style={{ width: '250px' }}>
                                            <div
                                                className={`rounded-circle border border-dark`}
                                                style={{ width: '10px', height: '10px', background: statusColorMap[flight.flight_status] ?? '' }}
                                            ></div>
                                            <div>{flight.flight_status.slice(0, 1).toUpperCase()}{flight.flight_status.slice(1)}</div>
                                        </div>
                                        <div className="text-muted text-center" style={{ width: '150px' }} onClick={() => handleViewFlightClicked(flight)}>
                                            <button className="rounded border">{selectedFlightModalObject?.flight_id === flight.flight_id ? 'Selected' : 'View'}</button>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className="py-3 border border-black rounded-bottom text-center fw-medium" style={{ background: '#e6e6e6' }}>
                                {selectedHub == null ? (
                                    <div>Please select a hub!</div>
                                ) : (
                                    <div className="d-flex flex-column gap-2">
                                        <div className="fw-semibold">[{selectedHub.code}] {selectedHub.name}</div>
                                        <div className="fw-normal">Does not have any flights, please select a different hub!</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}


            </div>



            <ModalComponent
                isOpen={modalIsOpen}
                setIsOpen={setModalIsOpen}
                title={`${selectedFlightModalObject?.flight_num} - Panther Cloud Air`}
                onDismiss={() => handleCloseModal()}
                body={
                    <>
                        {selectedFlightModalObject != null && (
                            <div className="text-center">
                                <div className=" d-flex justify-content-center gap-2 align-items-center pt-3">
                                    <div className="d-flex flex-column  w-50">
                                        <div className="fw-semibold fs-5">{GetAirportInfo(allAirports, selectedFlightModalObject, true)?.iata_code}</div>
                                        <div>{GetAirportInfo(allAirports, selectedFlightModalObject, true)?.city}</div>
                                    </div>

                                    <div>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right" viewBox="0 0 16 16">
                                            <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8" />
                                        </svg>
                                    </div>

                                    <div className="d-flex flex-column w-50">
                                        <div className="fw-semibold fs-5">{GetAirportInfo(allAirports, selectedFlightModalObject, false)?.iata_code}</div>
                                        <div>{GetAirportInfo(allAirports, selectedFlightModalObject, false)?.city}</div>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-center gap-2 align-items-center py-3 mb-3 border-bottom">
                                    <div className="d-flex flex-column text-start w-50 px-5">
                                        <div className="d-flex justify-content-between gap-2">
                                            <div className="fw-medium">Scheduled:</div>
                                            <div>{selectedFlightModalObject.scheduled_depart.substring(11, 16)}</div>
                                        </div>
                                        <div className="d-flex justify-content-between gap-2">
                                            <div className="fw-medium">Actual:</div>
                                            <div>{selectedFlightModalObject.actual_depart == null ? selectedFlightModalObject.scheduled_depart.substring(11, 16) : selectedFlightModalObject.actual_depart}</div>
                                        </div>
                                    </div>


                                    <div className="d-flex flex-column text-start w-50 px-5">
                                        <div className="d-flex justify-content-between gap-2">
                                            <div className="fw-medium">Scheduled:</div>
                                            <div>{selectedFlightModalObject.scheduled_arrival.substring(11, 16)}</div>
                                        </div>
                                        <div className="d-flex justify-content-between gap-2">
                                            <div className="fw-medium">Actual:</div>
                                            <div>{selectedFlightModalObject.actual_arrival == null ? selectedFlightModalObject.scheduled_arrival.substring(11, 16) : selectedFlightModalObject.actual_arrival}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-center gap-2 align-items-center pb-3 mb-3 border-bottom">
                                    <div className="d-flex flex-column text-start w-50 px-5">
                                        <div className="d-flex justify-content-between gap-2">
                                            <div className="fw-medium">Status:</div>
                                        </div>
                                    </div>

                                    <div className="d-flex flex-column w-50 px-5">
                                        <div className="d-flex justify-content-start gap-2 align-items-center">
                                            <div
                                                className={`rounded-circle border border-dark`}
                                                style={{ width: '10px', height: '10px', background: statusColorMap[selectedFlightModalObject.flight_status] ?? '' }}
                                            ></div>
                                            <div>{selectedFlightModalObject.flight_status.slice(0, 1).toUpperCase()}{selectedFlightModalObject.flight_status.slice(1)}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-center gap-2 align-items-center pb-3 mb-3 border-bottom">
                                    <div className="d-flex flex-column text-start w-50 px-5">
                                        <div className="d-flex justify-content-between gap-2">
                                            <div className="fw-medium">Passengers:</div>
                                        </div>
                                    </div>

                                    <div className="d-flex flex-column w-50 px-5">
                                        <div className="d-flex justify-content-start gap-2">
                                            <div>{selectedFlightModalObject.passenger_count}</div>
                                            <div>/</div>
                                            <div>{GetAircraftInfo(allAircrafts, selectedFlightModalObject)?.capacity}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-center gap-2 align-items-center pb-3 mb-3 border-bottom">
                                    <div className="d-flex flex-column text-start w-50 px-5">
                                        <div className="d-flex justify-content-between gap-2">
                                            <div className="fw-medium">Aircraft Model:</div>
                                        </div>
                                    </div>

                                    <div className="d-flex flex-column text-start w-50 px-5">
                                        <div className="d-flex justify-content-between gap-2">
                                            <div>{GetAircraftInfo(allAircrafts, selectedFlightModalObject)?.model}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-center gap-2 align-items-center pb-3">
                                    <div className="d-flex flex-column text-start w-50 px-5">
                                        <div className="d-flex justify-content-between gap-2">
                                            <div className="fw-medium">Tail Number:</div>
                                        </div>
                                    </div>

                                    <div className="d-flex flex-column text-start w-50 px-5">
                                        <div className="d-flex justify-content-between gap-2">
                                            <div>{GetAircraftInfo(allAircrafts, selectedFlightModalObject)?.tail_num}</div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )}
                    </>
                }
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => handleCloseModal()}>Cancel</button>
                        <button className="btn btn-success">Buy Flight</button>
                    </>
                }
            />
        </div>
    );
}

export default AllFlightsPage;