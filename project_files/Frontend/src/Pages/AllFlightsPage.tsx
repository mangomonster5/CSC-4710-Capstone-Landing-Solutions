// Author: Sean Harder


import { useRef, useState } from "react";
import ModalComponent from "../GlobalComponents/ModalComponent";
import HubDropdown from "../GlobalComponents/HubDropdown";
import useAllStateContext from "../context/useAllStateContext";
import GetAircraftInfo from "../utils/GetAircraftInfo";
import GetAirportInfoFromFlight from "../utils/GetAirportInfoFromFlight";



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
    const { allFlights, allAirports, allAircrafts, setAllFlights, selectedSimDay, usFormatter} = useAllStateContext();

    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [purchaseTicketModalIsOpen, setPurchaseTicketModalIsOpen] = useState(false)


    const [selectedFlightModalObject, setSelectedFlightModalObject] = useState<Flight | undefined>(undefined)
    const [selectedHub, setSelectedHub] = useState<Hub | undefined>(undefined)


    const [numberOfTicketsToPurchase, setNumberOfTicketsToPurchase] = useState(0)
    const [loadingPurchase, setLoadingPurchase] = useState<'loading' | 'successful' | 'error' | 'none'>('none')


    // Mapping over the state with all the flights in it, filtering by this
    // - Get Airport Info for that flight, we put false since we want to display where they came from
    // - Get all the flights that have the same iata_code as the currently selected hub
    const arrivalsList = allFlights?.[selectedSimDay - 1]?.filter((flight: Flight) => {
        const airport = GetAirportInfoFromFlight(allAirports, flight, false);
        return airport?.iata_code === selectedHub?.code;
    }) ?? [];

    // Mapping over the state with all the flights in it, filtering by this
    // - Get Airport Info for that flight, we put true since we wnat to display where they are going
    // - Get all the flights that have the same iata_code as the currently selected hub
    const departuresList =
        allFlights?.[selectedSimDay - 1]?.filter((flight: Flight) => {
            const airport = GetAirportInfoFromFlight(allAirports, flight, true);
            return airport?.iata_code === selectedHub?.code;
        }) ?? [];





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


    // This function is called when a user clicks the view flight button
    const handleViewFlightClicked = (passedFlight: Flight) => {
        // update the selected flight obj
        setSelectedFlightModalObject(passedFlight)
        // open the flight modal
        setModalIsOpen(true)
    }

    // This function just makes it easier to display the time on the board for arrivals
    const displayArrivialFlightTime = (passedFlight: Flight) => {
        if (passedFlight.actual_arrival == null) {
            return passedFlight.scheduled_arrival.substring(11, 16)
        } else {
            return passedFlight.actual_arrival.substring(11, 16)
        }
    }

    // This function just makes it easier to display the time on the board for departures
    const displayDepartureFlightTime = (passedFlight: Flight) => {
        if (passedFlight.actual_depart == null) {
            return passedFlight.scheduled_depart.substring(11, 16)
        } else {
            return passedFlight.actual_depart.substring(11, 16)
        }
    }

    // This function is called when the user closes or dismisses the modal
    const handleCloseModal = () => {
        // Closes the modal
        setModalIsOpen(false)
        // This reset the selected obj to prevent crashes and reset ui
        setSelectedFlightModalObject(undefined);
    }


    // This function is called when the user closes or dismisses the modal
    const handleCloseTicketModal = () => {
        // Closes the modal
        setNumberOfTicketsToPurchase(0)
        setPurchaseTicketModalIsOpen(false)
        setLoadingPurchase('none')
    }




    const handleIncrementNumberOfTickets = () => {
        if (selectedFlightModalObject?.passenger_count! + numberOfTicketsToPurchase < GetAircraftInfo(allAircrafts[selectedSimDay - 1], selectedFlightModalObject!)!.capacity!) {
            setNumberOfTicketsToPurchase(numberOfTicketsToPurchase + 1)
        }
    }

    const handleDecrementNumberOfTickets = () => {
        if (0 < numberOfTicketsToPurchase) {
            setNumberOfTicketsToPurchase(numberOfTicketsToPurchase - 1)
        }
    }

    const handleSuccssfulUpdate = () => {

        setLoadingPurchase("successful");
        setModalIsOpen(false)
        setPurchaseTicketModalIsOpen(false)
        setSelectedFlightModalObject(undefined)

        setAllFlights((prev: Flight[][]) => {
            const dayIndex = selectedSimDay - 1;

            return prev.map((dayFlights, i) => {
                if (i !== dayIndex) return dayFlights;

                return dayFlights.map((flight) => {
                    if (flight.flight_id !== selectedFlightModalObject?.flight_id) {
                        return flight;
                    }

                    return {
                        ...flight,
                        passenger_count:
                            flight.passenger_count + numberOfTicketsToPurchase,
                    };
                });
            });
        });


    }

    const handleConfirmPurchase = async () => {
        setLoadingPurchase("loading");

        if (!selectedFlightModalObject) return;

        const flightId = selectedFlightModalObject.flight_id;

        try {
            const res = await fetch(
                `http://localhost:5001/UpdateFlightPassengers/${flightId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        passenger_count: numberOfTicketsToPurchase
                    })
                }
            );

            const data = await res.json();

            console.log(data);
            setTimeout(() => {
                handleSuccssfulUpdate()

                setTimeout(() => {
                    setLoadingPurchase('none')
                }, 2500);
            }, 500);


        } catch (err) {
            console.error(err);
            setLoadingPurchase("error");
        }
    };







    return (
        <div style={{ paddingLeft: '18vw', paddingRight: '18vw', marginTop: '12vh', marginBottom: '12vh' }}>
            <div className="d-flex justify-content-between gap-4">
                <div className=" d-flex flex-column gap-1">
                    <h6 className="mb-0">All Panther Cloud Air Flight's</h6>
                    <div>View current schedules, departure and arrival times, and aircraft assignments for all flights.</div>
                </div>

                {/* 
                    Drop down specifically for this page, 
                    just allows the user to select their current hub to filter by arrivals and departures 
                */}
                <HubDropdown
                    handleSelection={(e) => setSelectedHub(e)}
                    selectedHub={selectedHub}
                    setSelectedHub={setSelectedHub}
                    body={
                        <div className={`mainButton text-center ${selectedHub === undefined ? '' : 'fw-bold'}`}>{selectedHub === undefined ? 'Select Airport' : selectedHub.code}</div>
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
                    <div className="fw-semibold" style={{ width: '450px' }}>{flightDirection === 'arrival' ? 'Orgin' : 'Destination'}</div>
                    <div className="fw-semibold" style={{ width: '200px' }}>Time</div>
                    <div className="fw-semibold" style={{ width: '250px' }}>Flight Number</div>
                    <div className="fw-semibold" style={{ width: '150px' }}>Gate</div>
                    <div className="fw-semibold" style={{ width: '250px' }}>Status</div>
                    <div className="fw-semibold" style={{ width: '150px' }}></div>
                </div>


                {/* This is the main content render */}
                {/* We first check if the segment button is set to arrival or departure */}
                {flightDirection === 'arrival' ? (
                    <>
                        {/* After we check if the arrivals list has any flights for that hub */}
                        {arrivalsList.length > 0 ? (
                            <>
                                {/* If so we display the table with all the flights */}
                                {arrivalsList.map((flight: Flight, i: any) => (
                                    <div key={i} className={`d-flex border-start border-end border-bottom border-dark py-3 px-3 fw-medium ${selectedFlightModalObject?.flight_id === flight.flight_id && 'fw-bold'} ${arrivalsList.length - 1 === i && 'rounded-bottom'}`} style={{ background: selectedFlightModalObject?.flight_id === flight.flight_id ? '#cccccc' : '' }}>
                                        <div className="text-muted" style={{ width: '450px' }}>{'[' + GetAirportInfoFromFlight(allAirports, flight, true)?.iata_code + '] - ' + GetAirportInfoFromFlight(allAirports, flight, true)?.city}</div>
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
                            <>
                                {/* If not, we want to handle empty state */}
                                {/* This is for clearer UI to not confuse the user */}
                                {/* If the hub ISNT selected that is why nothing is showing up */}
                                {/* If the hub IS selected there is a chance the hub has no arrivals */}
                                <div className="py-3 border border-black rounded-bottom text-center fw-medium" style={{ background: '#e6e6e6' }}>
                                    {selectedHub == null ? (
                                        <div>Please select a Airport!</div>
                                    ) : (
                                        <div className="d-flex flex-column gap-2">
                                            <div className="fw-semibold">[{selectedHub.code}] {selectedHub.name}</div>
                                            <div className="fw-normal">Does not have any flights, please select a different Airport!</div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        {/* We first check if the segment button is set to arrival or departure */}
                        {/* After we check if the arrivals list has any flights for that hub */}
                        {departuresList.length > 0 ? (
                            <>
                                {/* If so we display the table with all the flights */}
                                {departuresList.map((flight: Flight, i: any) => (
                                    <div key={i} className={`d-flex border-start border-end border-bottom border-dark py-3 px-3 fw-medium ${selectedFlightModalObject?.flight_id === flight.flight_id && 'fw-bold'} ${arrivalsList.length - 1 === i && 'rounded-bottom'}`} style={{ background: selectedFlightModalObject?.flight_id === flight.flight_id ? '#cccccc' : '' }}>
                                        <div className="text-muted" style={{ width: '450px' }}>{'[' + GetAirportInfoFromFlight(allAirports, flight, false)?.iata_code + '] - ' + GetAirportInfoFromFlight(allAirports, flight, false)?.city}</div>
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
                            <>
                                {/* If not, we want to handle empty state */}
                                {/* This is for clearer UI to not confuse the user */}
                                {/* If the hub ISNT selected that is why nothing is showing up */}
                                {/* If the hub IS selected there is a chance the hub has no arrivals */}
                                <div className="py-3 border border-black rounded-bottom text-center fw-medium" style={{ background: '#e6e6e6' }}>
                                    {selectedHub == null ? (
                                        <div>Please select a Airport!</div>
                                    ) : (
                                        <div className="d-flex flex-column gap-2">
                                            <div className="fw-semibold">[{selectedHub.code}] {selectedHub.name}</div>
                                            <div className="fw-normal">Does not have any flights, please select a different Airport!</div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </>
                )}


            </div>




            {/* This is just a modal component for when the user clicks view flight, we show them all the infomation related to that specific flight */}
            <ModalComponent
                isOpen={modalIsOpen}
                setIsOpen={setModalIsOpen}
                title={`${selectedFlightModalObject?.flight_num} - Panther Cloud Air`}
                onDismiss={() => handleCloseModal()}
                body={
                    <>
                        {/* Does a check for TypeScript to make sure selectedFlightModalObject is set to something, handles crashes */}
                        {selectedFlightModalObject != null && (

                            // This block displays the orgin and destination the IATA_code stacked on top of the city
                            <div className="text-center">
                                <div className=" d-flex justify-content-center gap-2 align-items-center pt-3">
                                    <div className="d-flex flex-column  w-50">
                                        <div className="fw-semibold fs-5">{GetAirportInfoFromFlight(allAirports, selectedFlightModalObject, true)?.iata_code}</div>
                                        <div>{GetAirportInfoFromFlight(allAirports, selectedFlightModalObject, true)?.city}</div>
                                    </div>

                                    <div>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right" viewBox="0 0 16 16">
                                            <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8" />
                                        </svg>
                                    </div>

                                    <div className="d-flex flex-column w-50">
                                        <div className="fw-semibold fs-5">{GetAirportInfoFromFlight(allAirports, selectedFlightModalObject, false)?.iata_code}</div>
                                        <div>{GetAirportInfoFromFlight(allAirports, selectedFlightModalObject, false)?.city}</div>
                                    </div>
                                </div>



                                <div className="d-flex justify-content-center gap-2 align-items-center py-3 mb-3 border-bottom">
                                    {/* This block shows the scheduled time stacked on top of the actual time for departing */}
                                    <div className="d-flex flex-column text-start w-50 px-5">
                                        <div className="d-flex justify-content-between gap-2">
                                            <div className="fw-medium">Scheduled:</div>
                                            <div>{selectedFlightModalObject.scheduled_depart.substring(11, 16)}</div>
                                        </div>
                                        <div className="d-flex justify-content-between gap-2">
                                            <div className="fw-medium">Actual:</div>
                                            <div>{selectedFlightModalObject.actual_depart == null ? selectedFlightModalObject.scheduled_depart.substring(11, 16) : selectedFlightModalObject.actual_depart.substring(11, 16)}</div>
                                        </div>
                                    </div>

                                    {/* This block shows the scheduled time stacked on top of the actual time for arriving */}
                                    <div className="d-flex flex-column text-start w-50 px-5">
                                        <div className="d-flex justify-content-between gap-2">
                                            <div className="fw-medium">Scheduled:</div>
                                            <div>{selectedFlightModalObject.scheduled_arrival.substring(11, 16)}</div>
                                        </div>
                                        <div className="d-flex justify-content-between gap-2">
                                            <div className="fw-medium">Actual:</div>
                                            <div>{selectedFlightModalObject.actual_arrival == null ? selectedFlightModalObject.scheduled_arrival.substring(11, 16) : selectedFlightModalObject.actual_arrival.substring(11, 16)}</div>
                                        </div>
                                    </div>
                                </div>


                                {/* This block shows the current status of the plane */}
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


                                {/* This block shows the current passanger count and next to it the capacity of the plane */}
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
                                            <div>{GetAircraftInfo(allAircrafts[selectedSimDay - 1], selectedFlightModalObject)?.capacity ?? 'N/A'}</div>
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
                                            <div>{GetAircraftInfo(allAircrafts[selectedSimDay - 1], selectedFlightModalObject)?.model ?? 'N/A'}</div>
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
                                            <div>{GetAircraftInfo(allAircrafts[selectedSimDay - 1], selectedFlightModalObject)?.tail_num ?? 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )}
                    </>
                }
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
                        {!(
                            GetAircraftInfo(allAircrafts?.[selectedSimDay - 1], selectedFlightModalObject!)
                                ?.capacity === selectedFlightModalObject?.passenger_count
                        ) && (
                                <button
                                    className="btn btn-success"
                                    onClick={() => setPurchaseTicketModalIsOpen(true)}
                                >
                                    Buy Tickets
                                </button>
                            )}
                    </>
                }
            />


            {/* Buy plane ticket modal */}
            <ModalComponent
                isOpen={purchaseTicketModalIsOpen}
                setIsOpen={setPurchaseTicketModalIsOpen}
                title={`${selectedFlightModalObject?.flight_num} - Panther Cloud Air`}
                onDismiss={() => handleCloseTicketModal()}
                body={
                    <>
                        {selectedFlightModalObject != null && (

                            // This block displays the orgin and destination the IATA_code stacked on top of the city
                            <div className="text-center" style={{ height: '500px' }}>
                                <div className=" d-flex justify-content-center gap-2 align-items-center pt-3 border-bottom pb-3">
                                    <div className="d-flex flex-column  w-50">
                                        <div className="fw-semibold fs-5">{GetAirportInfoFromFlight(allAirports, selectedFlightModalObject, true)?.iata_code}</div>
                                        <div>{GetAirportInfoFromFlight(allAirports, selectedFlightModalObject, true)?.city}</div>
                                    </div>

                                    <div>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right" viewBox="0 0 16 16">
                                            <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8" />
                                        </svg>
                                    </div>

                                    <div className="d-flex flex-column w-50">
                                        <div className="fw-semibold fs-5">{GetAirportInfoFromFlight(allAirports, selectedFlightModalObject, false)?.iata_code}</div>
                                        <div>{GetAirportInfoFromFlight(allAirports, selectedFlightModalObject, false)?.city}</div>
                                    </div>
                                </div>



                                <div className="d-flex justify-content-center gap-2 align-items-center pb-5 mt-5 border-bottom px-5">
                                    <div className="d-flex flex-column text-start w-25">
                                        {numberOfTicketsToPurchase > 0 ? (
                                            <button className="border border-dark rounded" onClick={() => handleDecrementNumberOfTickets()}>-</button>
                                        ) : (
                                            <div></div>
                                        )}
                                    </div>

                                    <div className="d-flex justify-content-center w-100 text-center w-100">
                                        <div className="d-flex flex-column">
                                            <div>Passangers</div>
                                            <div className="fs-5 d-flex gap-2">
                                                <span>{selectedFlightModalObject.passenger_count + numberOfTicketsToPurchase}</span>
                                                <span>/</span>
                                                <span>{GetAircraftInfo(allAircrafts[selectedSimDay - 1], selectedFlightModalObject)?.capacity}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="d-flex flex-column text-start w-25">
                                        {selectedFlightModalObject.passenger_count + numberOfTicketsToPurchase < GetAircraftInfo(allAircrafts[selectedSimDay - 1], selectedFlightModalObject)?.capacity! ? (
                                            <button className="border border-dark rounded" onClick={() => handleIncrementNumberOfTickets()}>+</button>
                                        ) : (
                                            <div></div>
                                        )}
                                    </div>
                                </div>

                                <div className="d-flex justify-content-center gap-2 align-items-center py-3 border-bottom">
                                    <div className="d-flex flex-column text-start w-50 px-5">
                                        <div className="d-flex justify-content-between gap-2">
                                            <div className="fw-medium">Number of Tickets:</div>
                                        </div>
                                    </div>

                                    <div className="d-flex flex-column w-50 px-5">
                                        <div className="d-flex justify-content-end gap-2 align-items-center">
                                            {numberOfTicketsToPurchase}
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-center gap-2 align-items-center py-3 border-bottom">
                                    <div className="d-flex flex-column text-start w-50 px-5">
                                        <div className="d-flex justify-content-between gap-2">
                                            <div className="fw-medium">Ticket Price:</div>
                                        </div>
                                    </div>

                                    <div className="d-flex flex-column w-50 px-5">
                                        <div className="d-flex justify-content-end gap-2 align-items-center">
                                            {usFormatter.format(selectedFlightModalObject.ticket_price!)} + {numberOfTicketsToPurchase} = {usFormatter.format(numberOfTicketsToPurchase * selectedFlightModalObject.ticket_price!)}
                                        </div>
                                    </div>
                                </div>



                            </div>
                        )}
                    </>
                }
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => handleCloseTicketModal()}>Cancel</button>
                        {loadingPurchase === 'successful' ? (
                            <div></div>
                        ) : (
                            <>
                                <button className="btn btn-success" disabled={numberOfTicketsToPurchase === 0} style={{ width: '180px', height: '36px' }} onClick={() => handleConfirmPurchase()}>
                                    {loadingPurchase === 'loading'
                                        ? <div className="d-flex gap-4 justify-content-center">
                                            <div className="spinner-grow" style={{ height: '10px', width: '10px' }} role="status"></div>
                                            <div className="spinner-grow" style={{ height: '10px', width: '10px' }} role="status"></div>
                                            <div className="spinner-grow" style={{ height: '10px', width: '10px' }} role="status"></div>
                                        </div>
                                        : 'Confirm Purchase'
                                    }
                                </button>
                            </>
                        )}
                    </>
                }
            />


            {loadingPurchase === 'successful' && (
                <div
                    className="toast align-items-center text-bg-success  border-0 show position-fixed bottom-0 end-0 m-3"
                    role="alert"
                    aria-live="assertive"
                    aria-atomic="true"
                >
                    <div className="d-flex">
                        <div className="toast-body fw-semibold">
                            Your purchase was successful!
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
}

export default AllFlightsPage;