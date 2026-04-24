import { useState } from "react";
import ModalComponent from "../GlobalComponents/ModalComponent";
import FlightSelectionDropdown from "../GlobalComponents/FlightSelectionDropdown";

// type flightDirection = {
//     airportCode: string;
//     city: string;
//     time: string;
//     flightNumber: string;
//     gate: string;
//     status: string;
// };

const FlightSelectionPage: React.FC = () => {

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
                        <button className="rounded border" onClick={() => setModalIsOpen(true)}>View</button>
                    </div>
                </div>
                <div className="d-flex border-start border-end border-bottom border-dark rounded-bottom py-3 px-3 fw-medium">
                    <div className="text-muted" style={{ width: '500px' }}>[ORD] - Chicago, IL</div>
                    <div className="text-muted" style={{ width: '350px' }}>PCA908</div>
                    <div className="text-muted" style={{ width: '200px' }}>12 / 246</div>
                    <div className="text-muted text-center" style={{ width: '200px' }}>
                        <button className="rounded border" onClick={() => setModalIsOpen(true)}>View</button>
                    </div>
                </div>
            </div>

            <ModalComponent
                isOpen={modalIsOpen}
                setIsOpen={setModalIsOpen}
                onDismiss={() => setModalIsOpen(false)}
                title="[ORD] - Chicago, IL"
                body={
                    <div className="text-center">
                        <div>BOOKING INFO</div>
                        <div>BOOKING INFO</div>
                        <div>BOOKING INFO</div>
                        <div>BOOKING INFO</div>
                        <div>BOOKING INFO</div>
                        <div>BOOKING INFO</div>
                        <div>BOOKING INFO</div>
                    </div>
                }
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setModalIsOpen(false)}>Cancel</button>
                        <button className="btn btn-success">Buy Flight</button>
                    </>
                }
            />

        </div>
    );
};

export default FlightSelectionPage;