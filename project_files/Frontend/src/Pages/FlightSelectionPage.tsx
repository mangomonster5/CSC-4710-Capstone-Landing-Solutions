import { useState, useMemo } from "react";
import ModalComponent from "../GlobalComponents/ModalComponent";
import FlightSelectionDropdown from "../GlobalComponents/FlightSelectionDropdown";
import GetAirportInfoFromFlight from "../utils/GetAirportInfoFromFlight";
import useAllStateContext from "../context/useAllStateContext";
import GetAircraftInfo from "../utils/GetAircraftInfo";

const SIM_DAYS = Array.from({ length: 14 }, (_, i) => ({
    label: `Day ${i + 1}`,
    dayIndex: i,
}));

const FlightSelectionPage: React.FC = () => {
    const { allAirports, allAircrafts, allFlights, usFormatter, setAllFlights, selectedSimDay } = useAllStateContext();

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [from, setFrom] = useState<Airport | null>(null);
    const [to, setTo] = useState<Airport | null>(null);
    const [departureDay, setDepartureDay] = useState<number | null>(null);
    const [returnDay, setReturnDay] = useState<number | null>(null);
    const [searched, setSearched] = useState(false);
    const [bookedFlightIds, setBookedFlightIds] = useState<Set<number>>(new Set());
    const [purchaseTicketModalIsOpen, setPurchaseTicketModalIsOpen] = useState(false);
    const [selectedFlightModalObject, setSelectedFlightModalObject] = useState<Flight | undefined>(undefined);
    const [numberOfTicketsToPurchase, setNumberOfTicketsToPurchase] = useState(0);
    const [loadingPurchase, setLoadingPurchase] = useState<'loading' | 'successful' | 'error' | 'none'>('none');

    const statusColorMap: Record<string, string> = {
        'arrived': '#2ECC43', 'Baggage Claim': '#2ECC43',
        'On Approach': '#3498DB', 'On Time': '#3498DB', 'boarding': '#3498DB', 'scheduled': '#3498DB',
        'Taxiing': '#F39C12', 'Delayed': '#F39C12',
        'Canceled': '#E74C3C', 'Final Call': '#E74C3C',
    };

    const allFlightsFilteredByUser = useMemo(() => {
        if (!searched || !allFlights) return [];
        const dayIdx = departureDay ?? (selectedSimDay - 1);
        const dayFlights: Flight[] = allFlights[dayIdx] ?? [];
        return dayFlights.filter((flight: Flight) => {
            const matchFrom = from ? flight.origin_airport_id === from.airport_id : true;
            const matchTo = to ? flight.destination_airport_id === to.airport_id : true;
            return matchFrom && matchTo;
        });
    }, [searched, allFlights, departureDay, from, to, selectedSimDay]);

    const handleFindFlight = () => setSearched(true);

    const handleBook = (flightId: number) => {
        setBookedFlightIds(prev => { const next = new Set(prev); next.add(flightId); return next; });
    };

    const handleCloseModal = () => { setModalIsOpen(false); setSelectedFlightModalObject(undefined); };
    const handleCloseTicketModal = () => { setNumberOfTicketsToPurchase(0); setPurchaseTicketModalIsOpen(false); setLoadingPurchase('none'); };

    const handleIncrementNumberOfTickets = () => {
        if (selectedFlightModalObject?.passenger_count! + numberOfTicketsToPurchase < GetAircraftInfo(allAircrafts[selectedSimDay - 1], selectedFlightModalObject!)!.capacity!)
            setNumberOfTicketsToPurchase(numberOfTicketsToPurchase + 1);
    };

    const handleDecrementNumberOfTickets = () => {
        if (0 < numberOfTicketsToPurchase) setNumberOfTicketsToPurchase(numberOfTicketsToPurchase - 1);
    };

    const handleViewFlightClicked = (passedFlight: Flight) => { setSelectedFlightModalObject(passedFlight); setModalIsOpen(true); };

    const handleConfirmPurchase = async () => {
        setLoadingPurchase("loading");
        if (!selectedFlightModalObject) return;
        try {
            const res = await fetch(`http://localhost:5001/UpdateFlightPassengers/${selectedFlightModalObject.flight_id}`, {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ passenger_count: numberOfTicketsToPurchase })
            });
            await res.json();
            setTimeout(() => { handleSuccessfulUpdate(); setTimeout(() => setLoadingPurchase('none'), 2500); }, 500);
        } catch (err) { console.error(err); setLoadingPurchase("error"); }
    };

    const handleSuccessfulUpdate = () => {
        setLoadingPurchase("successful"); setModalIsOpen(false); setPurchaseTicketModalIsOpen(false); setSelectedFlightModalObject(undefined);
        setAllFlights((prev: Flight[][]) => {
            const dayIndex = selectedSimDay - 1;
            return prev.map((dayFlights, i) => {
                if (i !== dayIndex) return dayFlights;
                return dayFlights.map((flight) => {
                    if (flight.flight_id !== selectedFlightModalObject?.flight_id) return flight;
                    return { ...flight, passenger_count: flight.passenger_count + numberOfTicketsToPurchase };
                });
            });
        });
    };

    return (
        <div className="d-flex flex-column gap-5" style={{ paddingLeft: '18vw', paddingRight: '18vw', marginTop: '12vh', marginBottom: '12vh' }}>

            <div className="d-flex justify-content-between">
                <div className="w-75 d-flex flex-column gap-1">
                    <h6 className="mb-0 fw-medium">Panther Cloud Air Flight Selection</h6>
                    <div>Compare departure and arrival times, travel duration, and aircraft details to book the option that works best for you.</div>
                </div>
                <div className="w-25 align-items-center d-flex justify-content-end">
                    <button className="mainButton" onClick={handleFindFlight}>Find Flight</button>
                </div>
            </div>

            <div className="d-flex justify-content-between gap-3">

                <div style={{ width: '350px' }}>
                    <div>From</div>
                    <FlightSelectionDropdown
                        excludeAirport={to}
                        handleSelection={(selection: any) => { setFrom(selection); setSearched(false); }}
                        body={
                            from ? (
                                <><div className="fw-semibold">{from.name}</div><div>[{from.iata_code}] - {from.city}</div></>
                            ) : (
                                <div className="d-flex align-items-center" style={{ height: '54px' }}>Please Select an Airport</div>
                            )
                        }
                    />
                </div>

                <div style={{ width: '350px' }}>
                    <div>To</div>
                    <FlightSelectionDropdown
                        excludeAirport={from}
                        handleSelection={(selection: Airport) => { setTo(selection); setSearched(false); }}
                        body={
                            to ? (
                                <><div className="fw-semibold">{to.name}</div><div>[{to.iata_code}] - {to.city}</div></>
                            ) : (
                                <div className="d-flex align-items-center" style={{ height: '54px' }}>Please Select an Airport</div>
                            )
                        }
                    />
                </div>

                <div style={{ width: '110px' }}>
                    <div>Departure</div>
                    <div className="dropdown">
                        <div className="card d-flex flex-column align-items-center justify-content-center dropdown-toggle" data-bs-toggle="dropdown" style={{ height: '80px', cursor: 'pointer' }}>
                            <div className="fw-semibold">{departureDay !== null ? `Day ${departureDay + 1}` : 'Select Day'}</div>
                        </div>
                        <ul className="dropdown-menu p-0" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {SIM_DAYS.map((d) => (
                                <li key={d.dayIndex} className="dropdown-item" style={{ cursor: 'pointer' }}
                                    onClick={() => { setDepartureDay(d.dayIndex); if (returnDay !== null && returnDay <= d.dayIndex) setReturnDay(null); setSearched(false); }}>
                                    {d.label}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div style={{ width: '110px' }}>
                    <div>Return</div>
                    <div className="dropdown">
                        <div className="card d-flex flex-column align-items-center justify-content-center dropdown-toggle" data-bs-toggle="dropdown" style={{ height: '80px', cursor: 'pointer' }}>
                            <div className="fw-semibold">{returnDay !== null ? `Day ${returnDay + 1}` : 'Select Day'}</div>
                        </div>
                        <ul className="dropdown-menu p-0" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {departureDay === null ? (
                                <li className="dropdown-item text-muted" style={{ fontSize: '0.8rem' }}>Select departure first</li>
                            ) : (
                                SIM_DAYS.filter((d) => d.dayIndex > departureDay).map((d) => (
                                    <li key={d.dayIndex} className="dropdown-item" style={{ cursor: 'pointer' }}
                                        onClick={() => { setReturnDay(d.dayIndex); setSearched(false); }}>
                                        {d.label}
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </div>

            </div>

            <div>
                <div className="d-flex border-black text-white py-3 px-3 fw-medium rounded-top" style={{ background: '#167ED9' }}>
                    <div className="fw-semibold" style={{ width: '500px' }}>Origin</div>
                    <div className="fw-semibold" style={{ width: '500px' }}>Destination</div>
                    <div className="fw-semibold" style={{ width: '350px' }}>Flight Number</div>
                    <div className="fw-semibold" style={{ width: '200px' }}>Seats</div>
                    <div className="fw-semibold" style={{ width: '200px' }}></div>
                </div>

                {allFlightsFilteredByUser.length > 0 ? (
                    allFlightsFilteredByUser.map((flight: Flight, index: any) => (
                        <div key={index} className="d-flex border-start border-end border-bottom border-dark py-3 px-3 fw-medium align-items-center">
                            <div className="text-muted" style={{ width: '500px' }}>[{GetAirportInfoFromFlight(allAirports, flight, true)?.iata_code}] - {GetAirportInfoFromFlight(allAirports, flight, true)?.city}</div>
                            <div className="text-muted" style={{ width: '500px' }}>[{GetAirportInfoFromFlight(allAirports, flight, false)?.iata_code}] - {GetAirportInfoFromFlight(allAirports, flight, false)?.city}</div>
                            <div className="text-muted" style={{ width: '350px' }}>PCA{flight.flight_num}</div>
                            <div className="text-muted" style={{ width: '200px' }}>{flight.passenger_count} / {GetAircraftInfo(allAircrafts[selectedSimDay - 1], flight)?.capacity}</div>
                            <div className="d-flex gap-3 align-items-center justify-content-center" style={{ width: '200px' }}>
                                <button className="rounded border text-muted" onClick={() => handleViewFlightClicked(flight)}>View</button>
                                {bookedFlightIds.has(flight.flight_id) ? (
                                    <span style={{ color: '#198754', fontSize: '1.1rem' }}>✓</span>
                                ) : (
                                    <span style={{ cursor: 'pointer', color: '#167ED9', textDecoration: 'underline' }} onClick={() => handleBook(flight.flight_id)}>Book</span>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-3 border border-black rounded-bottom text-center fw-medium" style={{ background: '#e6e6e6' }}>
                        {searched ? 'No flights found for the selected options.' : 'Please select options to find your flight!'}
                    </div>
                )}
            </div>

            <ModalComponent
                isOpen={modalIsOpen} setIsOpen={setModalIsOpen}
                title={`PCA${selectedFlightModalObject?.flight_num} - Panther Cloud Air`}
                onDismiss={() => handleCloseModal()}
                body={
                    selectedFlightModalObject != null ? (
                        <div className="text-center">
                            <div className="d-flex justify-content-center gap-2 align-items-center pt-3">
                                <div className="d-flex flex-column w-50">
                                    <div className="fw-semibold fs-5">{GetAirportInfoFromFlight(allAirports, selectedFlightModalObject, true)?.iata_code}</div>
                                    <div>{GetAirportInfoFromFlight(allAirports, selectedFlightModalObject, true)?.city}</div>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8" />
                                </svg>
                                <div className="d-flex flex-column w-50">
                                    <div className="fw-semibold fs-5">{GetAirportInfoFromFlight(allAirports, selectedFlightModalObject, false)?.iata_code}</div>
                                    <div>{GetAirportInfoFromFlight(allAirports, selectedFlightModalObject, false)?.city}</div>
                                </div>
                            </div>
                            <div className="d-flex justify-content-center gap-2 align-items-center py-3 mb-3 border-bottom">
                                <div className="d-flex flex-column text-start w-50 px-5">
                                    <div className="d-flex justify-content-between gap-2"><div className="fw-medium">Scheduled:</div><div>{selectedFlightModalObject.scheduled_depart.substring(11, 16)}</div></div>
                                    <div className="d-flex justify-content-between gap-2"><div className="fw-medium">Actual:</div><div>{selectedFlightModalObject.actual_depart == null ? selectedFlightModalObject.scheduled_depart.substring(11, 16) : selectedFlightModalObject.actual_depart.substring(11, 16)}</div></div>
                                </div>
                                <div className="d-flex flex-column text-start w-50 px-5">
                                    <div className="d-flex justify-content-between gap-2"><div className="fw-medium">Scheduled:</div><div>{selectedFlightModalObject.scheduled_arrival.substring(11, 16)}</div></div>
                                    <div className="d-flex justify-content-between gap-2"><div className="fw-medium">Actual:</div><div>{selectedFlightModalObject.actual_arrival == null ? selectedFlightModalObject.scheduled_arrival.substring(11, 16) : selectedFlightModalObject.actual_arrival.substring(11, 16)}</div></div>
                                </div>
                            </div>
                            <div className="d-flex justify-content-center gap-2 align-items-center pb-3 mb-3 border-bottom">
                                <div className="d-flex flex-column text-start w-50 px-5"><div className="fw-medium">Status:</div></div>
                                <div className="d-flex flex-column w-50 px-5">
                                    <div className="d-flex justify-content-start gap-2 align-items-center">
                                        <div className="rounded-circle border border-dark" style={{ width: '10px', height: '10px', background: statusColorMap[selectedFlightModalObject.flight_status] ?? '' }}></div>
                                        <div>{selectedFlightModalObject.flight_status}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex justify-content-center gap-2 align-items-center pb-3 mb-3 border-bottom">
                                <div className="d-flex flex-column text-start w-50 px-5"><div className="fw-medium">Passengers:</div></div>
                                <div className="d-flex flex-column w-50 px-5">
                                    <div className="d-flex justify-content-start gap-2">
                                        <div>{selectedFlightModalObject.passenger_count}</div><div>/</div>
                                        <div>{GetAircraftInfo(allAircrafts[selectedSimDay - 1], selectedFlightModalObject)?.capacity ?? 'N/A'}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex justify-content-center gap-2 align-items-center pb-3 mb-3 border-bottom">
                                <div className="d-flex flex-column text-start w-50 px-5"><div className="fw-medium">Aircraft Model:</div></div>
                                <div className="d-flex flex-column text-start w-50 px-5"><div>{GetAircraftInfo(allAircrafts[selectedSimDay - 1], selectedFlightModalObject)?.model ?? 'N/A'}</div></div>
                            </div>
                            <div className="d-flex justify-content-center gap-2 align-items-center pb-3">
                                <div className="d-flex flex-column text-start w-50 px-5"><div className="fw-medium">Tail Number:</div></div>
                                <div className="d-flex flex-column text-start w-50 px-5"><div>{GetAircraftInfo(allAircrafts[selectedSimDay - 1], selectedFlightModalObject)?.tail_num ?? 'N/A'}</div></div>
                            </div>
                        </div>
                    ) : <></>
                }
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
                        {!(GetAircraftInfo(allAircrafts?.[selectedSimDay - 1], selectedFlightModalObject!)?.capacity === selectedFlightModalObject?.passenger_count) && (
                            <button className="btn btn-success" onClick={() => setPurchaseTicketModalIsOpen(true)}>Buy Tickets</button>
                        )}
                    </>
                }
            />

            <ModalComponent
                isOpen={purchaseTicketModalIsOpen} setIsOpen={setPurchaseTicketModalIsOpen}
                title={`PCA${selectedFlightModalObject?.flight_num} - Panther Cloud Air`}
                onDismiss={() => handleCloseTicketModal()}
                body={
                    selectedFlightModalObject != null ? (
                        <div className="text-center" style={{ height: '500px' }}>
                            <div className="d-flex justify-content-center gap-2 align-items-center pt-3 border-bottom pb-3">
                                <div className="d-flex flex-column w-50">
                                    <div className="fw-semibold fs-5">{GetAirportInfoFromFlight(allAirports, selectedFlightModalObject, true)?.iata_code}</div>
                                    <div>{GetAirportInfoFromFlight(allAirports, selectedFlightModalObject, true)?.city}</div>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8" />
                                </svg>
                                <div className="d-flex flex-column w-50">
                                    <div className="fw-semibold fs-5">{GetAirportInfoFromFlight(allAirports, selectedFlightModalObject, false)?.iata_code}</div>
                                    <div>{GetAirportInfoFromFlight(allAirports, selectedFlightModalObject, false)?.city}</div>
                                </div>
                            </div>
                            <div className="d-flex justify-content-center gap-2 align-items-center pb-5 mt-5 border-bottom px-5">
                                <div className="d-flex flex-column text-start w-25">
                                    {numberOfTicketsToPurchase > 0 && <button className="border border-dark rounded" onClick={handleDecrementNumberOfTickets}>-</button>}
                                </div>
                                <div className="d-flex justify-content-center w-100 text-center">
                                    <div className="d-flex flex-column">
                                        <div>Passengers</div>
                                        <div className="fs-5 d-flex gap-2">
                                            <span>{selectedFlightModalObject.passenger_count + numberOfTicketsToPurchase}</span>
                                            <span>/</span>
                                            <span>{GetAircraftInfo(allAircrafts[selectedSimDay - 1], selectedFlightModalObject)?.capacity}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex flex-column text-start w-25">
                                    {selectedFlightModalObject.passenger_count + numberOfTicketsToPurchase < GetAircraftInfo(allAircrafts[selectedSimDay - 1], selectedFlightModalObject)?.capacity! && (
                                        <button className="border border-dark rounded" onClick={handleIncrementNumberOfTickets}>+</button>
                                    )}
                                </div>
                            </div>
                            <div className="d-flex justify-content-center gap-2 align-items-center py-3 border-bottom">
                                <div className="d-flex flex-column text-start w-50 px-5"><div className="fw-medium">Number of Tickets:</div></div>
                                <div className="d-flex flex-column w-50 px-5"><div className="d-flex justify-content-end">{numberOfTicketsToPurchase}</div></div>
                            </div>
                            <div className="d-flex justify-content-center gap-2 align-items-center py-3 border-bottom">
                                <div className="d-flex flex-column text-start w-50 px-5"><div className="fw-medium">Ticket Price:</div></div>
                                <div className="d-flex flex-column w-50 px-5">
                                    <div className="d-flex justify-content-end">{usFormatter.format(selectedFlightModalObject.ticket_price!)} × {numberOfTicketsToPurchase} = {usFormatter.format(numberOfTicketsToPurchase * selectedFlightModalObject.ticket_price!)}</div>
                                </div>
                            </div>
                        </div>
                    ) : <></>
                }
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={handleCloseTicketModal}>Cancel</button>
                        {loadingPurchase !== 'successful' && (
                            <button className="btn btn-success" disabled={numberOfTicketsToPurchase === 0} style={{ width: '180px', height: '36px' }} onClick={handleConfirmPurchase}>
                                {loadingPurchase === 'loading' ? (
                                    <div className="d-flex gap-4 justify-content-center">
                                        <div className="spinner-grow" style={{ height: '10px', width: '10px' }} role="status"></div>
                                        <div className="spinner-grow" style={{ height: '10px', width: '10px' }} role="status"></div>
                                        <div className="spinner-grow" style={{ height: '10px', width: '10px' }} role="status"></div>
                                    </div>
                                ) : 'Confirm Purchase'}
                            </button>
                        )}
                    </>
                }
            />

            {loadingPurchase === 'successful' && (
                <div className="toast align-items-center text-bg-success border-0 show position-fixed bottom-0 end-0 m-3" role="alert">
                    <div className="d-flex"><div className="toast-body fw-semibold">Your purchase was successful!</div></div>
                </div>
            )}

        </div>
    );
};

export default FlightSelectionPage;
