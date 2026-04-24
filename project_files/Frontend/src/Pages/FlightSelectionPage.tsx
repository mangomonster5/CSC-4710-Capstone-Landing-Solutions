import { useState } from "react";
import ModalComponent from "../GlobalComponents/ModalComponent";
import FlightSelectionDropdown from "../GlobalComponents/FlightSelectionDropdown";
import GetAirportInfoFromFlight from "../utils/GetAirportInfoFromFlight";
import useAllStateContext from "../context/useAllStateContext";
import GetAircraftInfo from "../utils/GetAircraftInfo";

// type flightDirection = {
//     airportCode: string;
//     city: string;
//     time: string;
//     flightNumber: string;
//     gate: string;
//     status: string;
// };

const FlightSelectionPage: React.FC = () => {
    const { allAirports, allAircrafts, selectedSimDay, usFormatter, setAllFlights } = useAllStateContext()

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [from, setFrom] = useState<Airport | null>(null);
    const [to, setTo] = useState<Airport | null>(null);

    // *
    // storing selected dates as strings
    // *
    const [departureDate, setDepartureDate] = useState<string>('');
    const [returnDate, setReturnDate] = useState<string>('');

    // *
    // formatting dates for readability
    // * 
    const formatDate = (dateStr: string) => {
        if (!dateStr) return null;

        // *
        // timezone func for reset
        //
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };


    // Below is for modals, to view flight and buy a ticket

    // Open and close modal's
    const [purchaseTicketModalIsOpen, setPurchaseTicketModalIsOpen] = useState(false)

    const [selectedFlightModalObject, setSelectedFlightModalObject] = useState<Flight | undefined>(undefined)
    const [numberOfTicketsToPurchase, setNumberOfTicketsToPurchase] = useState(0)
    const [loadingPurchase, setLoadingPurchase] = useState<'loading' | 'successful' | 'error' | 'none'>('none')


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

    // This function is called when the user closes or dismisses the viewing a flight modal (after clicking view on a flight)
    const handleCloseModal = () => {
        // Closes the modal
        setModalIsOpen(false)
        // This reset the selected obj to prevent crashes and reset ui
        setSelectedFlightModalObject(undefined);
    }


    // This function is called when the user closes or dismisses the view the purchase ticket modal modal (after clicking purchase ticket on a flight view modal)
    const handleCloseTicketModal = () => {
        // Closes the modal
        setModalIsOpen(false)
        // This reset the selected obj to prevent crashes and reset ui
        setSelectedFlightModalObject(undefined);
    }


    // This function is called when the user wants buy more tickets
    const handleIncrementNumberOfTickets = () => {
        if (selectedFlightModalObject?.passenger_count! + numberOfTicketsToPurchase < GetAircraftInfo(allAircrafts[selectedSimDay - 1], selectedFlightModalObject!)!.capacity!) {
            setNumberOfTicketsToPurchase(numberOfTicketsToPurchase + 1)
        }
    }

    // This function is called when the user wants buy less tickets
    const handleDecrementNumberOfTickets = () => {
        if (0 < numberOfTicketsToPurchase) {
            setNumberOfTicketsToPurchase(numberOfTicketsToPurchase - 1)
        }
    }


    // This function is called when a user clicks the view flight button
    const handleViewFlightClicked = (passedFlight: Flight) => {
        // update the selected flight obj
        setSelectedFlightModalObject(passedFlight)
        // open the flight modal
        setModalIsOpen(true)
    }


    // This function is called when the user clicks confirm after selcting number of tickets
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




    return (
        <div className="d-flex flex-column gap-5" style={{ paddingLeft: '18vw', paddingRight: '18vw', marginTop: '12vh', marginBottom: '12vh' }}>

            <div className="d-flex justify-content-between">
                <div className="w-75 d-flex flex-column gap-1">
                    <h6 className="mb-0 fw-medium">Panther Cloud Air Flight Selection</h6>
                    <div>Compare departure and arrival times, travel duration, and aircraft details to book the option that works best for you.</div>
                </div>
                <div className="w-25 align-items-center d-flex justify-content-end">
                    <button className={'mainButton'}>Find Flight</button>
                </div>
            </div>

            <div className="d-flex justify-content-between gap-3">

                {/* excludes whichever airport is selected in other */}
                <div style={{ width: '350px' }}>
                    <div>From</div>
                    <FlightSelectionDropdown
                        handleSelection={(selection: any) => { setFrom(selection); }}
                        body={
                            <>
                                {from ? (
                                    <>
                                        <div className="fw-semibold">{from.name}</div>
                                        <div>[{from.iata_code}] - {from.city}</div>
                                    </>
                                ) : (
                                    <div className="d-flex align-items-center" style={{ height: '54px' }}>Please Select an Airport</div>
                                )}
                            </>
                        }
                    />
                </div>

                {/* excludes whichever airport is selected in opposite */}
                <div style={{ width: '350px' }}>
                    <div>To</div>
                    <FlightSelectionDropdown
                        handleSelection={(selection: Airport) => { setTo(selection); }}
                        body={
                            <>
                                {to ? (
                                    <>
                                        <div className="fw-semibold">{to.name}</div>
                                        <div>[{to.iata_code}] - {to.city}</div>
                                    </>
                                ) : (
                                    <div className="d-flex align-items-center" style={{ height: '54px' }}>Please Select an Airport</div>
                                )}
                            </>
                        }
                    />
                </div>

                {/* cal invis input overlaid opens calendar */}
                <div style={{ width: '110px' }}>
                    <div>Departure</div>
                    <div
                        className="card d-flex flex-column align-items-center justify-content-center"
                        style={{ height: '80px', cursor: 'pointer', position: 'relative' }}
                    >
                        <div className="fw-semibold">
                            {departureDate ? formatDate(departureDate) : 'Select Date'}
                        </div>
                        <input
                            type="date"
                            min="2026-01-01"
                            max="2026-12-31"
                            value={departureDate}
                            onChange={(e) => setDepartureDate(e.target.value)}
                            style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                        />
                    </div>
                </div>

                {/* same invisible input as before */}
                <div style={{ width: '110px' }}>
                    <div>Return</div>
                    <div
                        className="card d-flex flex-column align-items-center justify-content-center"
                        style={{ height: '80px', cursor: 'pointer', position: 'relative' }}
                    >
                        <div className="fw-semibold">
                            {returnDate ? formatDate(returnDate) : 'Select Date'}
                        </div>
                        <input
                            type="date"
                            min="2026-01-01"
                            max="2026-12-31"
                            value={returnDate}
                            onChange={(e) => setReturnDate(e.target.value)}
                            style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                        />
                    </div>
                </div>

            </div>

            {/* flight results */}
            <div>
                <div className="d-flex bg-primary-blue-500 border-black text-white py-3 px-3 fw-medium rounded-top">
                    <div className="fw-semibold" style={{ width: '500px' }}>Origin</div>
                    <div className="fw-semibold" style={{ width: '350px' }}>Flight Number</div>
                    <div className="fw-semibold" style={{ width: '200px' }}>Seats</div>
                    <div className="fw-semibold" style={{ width: '200px' }}></div>
                </div>
                <div className="d-flex border-start border-end border-bottom border-dark py-3 px-3 fw-medium">
                    <div className="text-muted" style={{ width: '500px' }}>[ORD] - Chicago, IL</div>
                    <div className="text-muted" style={{ width: '350px' }}>PCA807</div>
                    <div className="text-muted" style={{ width: '200px' }}>40 / 180</div>
                    <div className="text-muted text-center" style={{ width: '200px' }}>
                        {/* THis will work when you map over */}
                        {/* <button className="rounded border" onClick={() => handleViewFlightClicked(flight)}>View</button> */}
                    </div>
                </div>
                <div className="d-flex border-start border-end border-bottom border-dark rounded-bottom py-3 px-3 fw-medium">
                    <div className="text-muted" style={{ width: '500px' }}>[ORD] - Chicago, IL</div>
                    <div className="text-muted" style={{ width: '350px' }}>PCA908</div>
                    <div className="text-muted" style={{ width: '200px' }}>12 / 246</div>
                    <div className="text-muted text-center" style={{ width: '200px' }}>
                        {/* THis will work when you map over */}
                        {/* <button className="rounded border" onClick={() => handleViewFlightClicked(flight)}>View</button> */}
                    </div>
                </div>
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
};

export default FlightSelectionPage;