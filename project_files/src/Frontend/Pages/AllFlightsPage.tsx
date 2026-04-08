import { useState } from "react";
import ModalComponent from "../GlobalComponents/ModalComponent";


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

    // a status map for indicator color
    const statusColorMap: Record<string, string> = {
        'Arrived': '#2ECC43',
        'Baggage Claim': '#2ECC43',
        'On Approach': '#3498DB',
        'On Time': '#3498DB',
        'Boarding': '#3498DB',
        'Taxiing': '#F39C12',
        'Delayed': '#F39C12',
        'Canceled': '#E74C3C',
        'Final Call': '#E74C3C',
    };

    const arrivalsList: flightDirection[] = [
        { airportCode: "LAX", city: "Los Angeles, CA", time: "12:08", flightNumber: "PCA337", gate: "T1-A14", status: "On Approach" },
        { airportCode: "JFK", city: "New York, NY", time: "12:21", flightNumber: "PCA482", gate: "T2-B03", status: "Delayed" },
        { airportCode: "MIA", city: "Miami, FL", time: "12:34", flightNumber: "PCA214", gate: "T3-C07", status: "Arrived" },
        { airportCode: "ORD", city: "Chicago, IL", time: "12:41", flightNumber: "PCA559", gate: "T2-B11", status: "Taxiing" },
        { airportCode: "SEA", city: "Seattle, WA", time: "12:49", flightNumber: "PCA781", gate: "T4-D06", status: "On Approach" },
        { airportCode: "DEN", city: "Denver, CO", time: "12:56", flightNumber: "PCA402", gate: "T1-A09", status: "Arrived" },
        { airportCode: "SFO", city: "San Francisco, CA", time: "13:04", flightNumber: "PCA618", gate: "T3-C12", status: "Baggage Claim" },
        { airportCode: "DFW", city: "Dallas-Fort Worth, TX", time: "13:16", flightNumber: "PCA290", gate: "T2-B18", status: "On Approach" },
        { airportCode: "PHX", city: "Phoenix, AZ", time: "13:23", flightNumber: "PCA734", gate: "T1-A22", status: "Canceled" },
        { airportCode: "DFW", city: "Dallas-Fort Worth, TX", time: "13:46", flightNumber: "PCA290", gate: "T2-B18", status: "On Time" },
        { airportCode: "CLT", city: "Charlotte, NC", time: "13:50", flightNumber: "PCA112", gate: "T2-C03", status: "Arrived" },
        { airportCode: "ATL", city: "Atlanta, GA", time: "14:05", flightNumber: "PCA223", gate: "T1-B02", status: "On Approach" },
        { airportCode: "BOS", city: "Boston, MA", time: "14:12", flightNumber: "PCA334", gate: "T3-C08", status: "Delayed" },
        { airportCode: "IAD", city: "Washington, DC", time: "14:20", flightNumber: "PCA445", gate: "T4-D11", status: "Arrived" },
        { airportCode: "PHL", city: "Philadelphia, PA", time: "14:33", flightNumber: "PCA556", gate: "T2-B09", status: "Taxiing" },
        { airportCode: "LAS", city: "Las Vegas, NV", time: "14:45", flightNumber: "PCA667", gate: "T1-A15", status: "On Approach" },
        { airportCode: "MSP", city: "Minneapolis, MN", time: "14:52", flightNumber: "PCA778", gate: "T3-C01", status: "Arrived" },
        { airportCode: "SAN", city: "San Diego, CA", time: "15:00", flightNumber: "PCA889", gate: "T2-B14", status: "Baggage Claim" },
        { airportCode: "SLC", city: "Salt Lake City, UT", time: "15:15", flightNumber: "PCA990", gate: "T4-D05", status: "Delayed" },
        { airportCode: "HOU", city: "Houston, TX", time: "15:28", flightNumber: "PCA101", gate: "T1-A18", status: "On Approach" },
        { airportCode: "PDX", city: "Portland, OR", time: "15:35", flightNumber: "PCA202", gate: "T3-C06", status: "Arrived" },
        { airportCode: "MCO", city: "Orlando, FL", time: "15:42", flightNumber: "PCA303", gate: "T2-B19", status: "Taxiing" },
        { airportCode: "TPA", city: "Tampa, FL", time: "15:55", flightNumber: "PCA404", gate: "T1-A11", status: "On Approach" },
        { airportCode: "DEN", city: "Denver, CO", time: "16:03", flightNumber: "PCA505", gate: "T4-D12", status: "Arrived" },
        { airportCode: "JAX", city: "Jacksonville, FL", time: "16:15", flightNumber: "PCA606", gate: "T3-C09", status: "Delayed" }
    ];

    const departuresList: flightDirection[] = [
        { airportCode: "LAX", city: "Los Angeles, CA", time: "12:15", flightNumber: "PCA908", gate: "T2-D11", status: "Boarding" },
        { airportCode: "ORD", city: "Chicago, IL", time: "12:22", flightNumber: "PCA441", gate: "T1-B06", status: "On Time" },
        { airportCode: "SEA", city: "Seattle, WA", time: "12:35", flightNumber: "PCA672", gate: "T3-C02", status: "Delayed" },
        { airportCode: "DEN", city: "Denver, CO", time: "12:46", flightNumber: "PCA337", gate: "T1-A14", status: "Boarding" },
        { airportCode: "MIA", city: "Miami, FL", time: "12:54", flightNumber: "PCA189", gate: "T4-E09", status: "On Time" },
        { airportCode: "JFK", city: "New York, NY", time: "12:57", flightNumber: "PCA482", gate: "T2-B03", status: "Delayed" },
        { airportCode: "DFW", city: "Dallas-Fort Worth, TX", time: "12:46", flightNumber: "PCA337", gate: "T1-A14", status: "On Time" },
        { airportCode: "PHX", city: "Phoenix, AZ", time: "13:17", flightNumber: "PCA703", gate: "T3-C15", status: "Boarding" },
        { airportCode: "CLT", city: "Charlotte, NC", time: "13:28", flightNumber: "PCA101", gate: "T1-A12", status: "Final Call" },
        { airportCode: "DEN", city: "Denver, CO", time: "13:42", flightNumber: "PCA337", gate: "T1-A14", status: "Delayed" },
        { airportCode: "ATL", city: "Atlanta, GA", time: "13:50", flightNumber: "PCA211", gate: "T2-C04", status: "Boarding" },
        { airportCode: "BOS", city: "Boston, MA", time: "14:03", flightNumber: "PCA322", gate: "T3-C07", status: "On Time" },
        { airportCode: "IAD", city: "Washington, DC", time: "14:12", flightNumber: "PCA433", gate: "T4-D10", status: "Delayed" },
        { airportCode: "PHL", city: "Philadelphia, PA", time: "14:20", flightNumber: "PCA544", gate: "T1-B09", status: "Boarding" },
        { airportCode: "LAS", city: "Las Vegas, NV", time: "14:33", flightNumber: "PCA655", gate: "T3-C05", status: "On Time" },
        { airportCode: "MSP", city: "Minneapolis, MN", time: "14:45", flightNumber: "PCA766", gate: "T2-B11", status: "Delayed" },
        { airportCode: "SAN", city: "San Diego, CA", time: "14:52", flightNumber: "PCA877", gate: "T1-A16", status: "Boarding" },
        { airportCode: "SLC", city: "Salt Lake City, UT", time: "15:00", flightNumber: "PCA988", gate: "T4-D08", status: "On Time" },
        { airportCode: "HOU", city: "Houston, TX", time: "15:15", flightNumber: "PCA099", gate: "T3-C11", status: "Boarding" },
        { airportCode: "PDX", city: "Portland, OR", time: "15:28", flightNumber: "PCA200", gate: "T1-A17", status: "Delayed" },
        { airportCode: "MCO", city: "Orlando, FL", time: "15:35", flightNumber: "PCA311", gate: "T2-B16", status: "On Time" },
        { airportCode: "TPA", city: "Tampa, FL", time: "15:42", flightNumber: "PCA422", gate: "T4-D14", status: "Boarding" },
        { airportCode: "DEN", city: "Denver, CO", time: "15:55", flightNumber: "PCA533", gate: "T3-C13", status: "Delayed" },
        { airportCode: "JAX", city: "Jacksonville, FL", time: "16:03", flightNumber: "PCA644", gate: "T1-A19", status: "On Time" },
        { airportCode: "RDU", city: "Raleigh, NC", time: "16:15", flightNumber: "PCA755", gate: "T2-B21", status: "Final Call" }
    ];


    const [modalIsOpen, setModalIsOpen] = useState(false)

    return (
        <div style={{ paddingLeft: '18vw', paddingRight: '18vw', marginTop: '12vh', marginBottom: '12vh' }}>
            <div className="d-flex justify-content-between">
                <div className="w-75 d-flex flex-column gap-1">
                    <h6 className="mb-0">All Panther Cloud Air Flight's</h6>
                    <div>View current schedules, departure and arrival times, and aircraft assignments for all flights.</div>
                </div>
                <div className="w-25 align-items-center d-flex justify-content-end">
                    <button className={`segmentButton left ${flightDirection === 'arrival' && 'selected'}`} onClick={() => setFlightDirection('arrival')}>Arrivals</button>
                    <button className={`segmentButton right ${flightDirection === 'departure' && 'selected'}`} style={{ borderLeft: '0px' }} onClick={() => setFlightDirection('departure')}>Departures</button>
                </div>
            </div>


            <div className="mt-5">
                {flightDirection === 'arrival' ? (<h5>Arrivals</h5>) : (<h5>Departures</h5>)}

                <div className="d-flex bg-primary-blue-500  text-white py-3 px-3 fw-medium rounded-top">
                    <div className="fw-semibold" style={{ width: '450px' }}>Origin</div>
                    <div className="fw-semibold" style={{ width: '150px' }}>Time</div>
                    <div className="fw-semibold" style={{ width: '250px' }}>Flight Number</div>
                    <div className="fw-semibold" style={{ width: '200px' }}>Gate</div>
                    <div className="fw-semibold" style={{ width: '250px' }}>Status</div>
                    <div className="fw-semibold" style={{ width: '150px' }}></div>
                </div>

                {flightDirection === 'arrival' ? (
                    <>
                        {arrivalsList.map((flight, i) => (
                            <div className={`d-flex border-start border-end border-bottom border-dark py-3 px-3 fw-medium ${arrivalsList.length - 1 === i && 'rounded-bottom'}`}>
                                <div className="text-muted" style={{ width: '450px' }}>{'[' + flight.airportCode + '] - ' + flight.city}</div>
                                <div className="text-muted fw-normal" style={{ width: '150px' }}>{flight.time}</div>
                                <div className="text-muted fw-normal" style={{ width: '250px' }}>{flight.flightNumber}</div>
                                <div className="text-muted fw-normal" style={{ width: '200px' }}>{flight.gate}</div>
                                <div className="text-muted d-flex align-items-center gap-2" style={{ width: '250px' }}>
                                    <div
                                        className={`rounded-circle border border-dark`}
                                        style={{ width: '10px', height: '10px', background: statusColorMap[flight.status] ?? '' }}
                                    ></div>
                                    <div>{flight.status}</div>
                                </div>
                                <div className="text-muted text-center" style={{ width: '150px' }}>
                                    <button className="rounded border" onClick={() => setModalIsOpen(true)}>View</button>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <>
                        {departuresList.map((flight, i) => (
                            <div className={`d-flex border-start border-end border-bottom border-dark py-3 px-3 fw-medium ${arrivalsList.length - 1 === i && 'rounded-bottom'}`}>
                                <div className="text-muted" style={{ width: '450px' }}>{'[' + flight.airportCode + '] - ' + flight.city}</div>
                                <div className="text-muted fw-normal" style={{ width: '150px' }}>{flight.time}</div>
                                <div className="text-muted fw-normal" style={{ width: '250px' }}>{flight.flightNumber}</div>
                                <div className="text-muted fw-normal" style={{ width: '200px' }}>{flight.gate}</div>
                                <div className="text-muted d-flex align-items-center gap-2" style={{ width: '250px' }}>
                                    <div
                                        className={`rounded-circle border border-dark`}
                                        style={{ width: '10px', height: '10px', background: statusColorMap[flight.status] ?? '' }}
                                    ></div>
                                    <div>{flight.status}</div>
                                </div>
                                <div className="text-muted text-center" style={{ width: '150px' }} onClick={() => setModalIsOpen(true)}>
                                    <button className="rounded border">View</button>
                                </div>
                            </div>
                        ))}
                    </>
                )}


            </div>



            <ModalComponent
                isOpen={modalIsOpen}
                setIsOpen={setModalIsOpen}
                title="[ORD] - Chicago, IL"
                body={
                    <div className="text-center">
                        <div>Flight INFO</div>
                        <div>Flight INFO</div>
                        <div>Flight INFO</div>
                        <div>Flight INFO</div>
                        <div>Flight INFO</div>
                        <div>Flight INFO</div>
                        <div>Flight INFO</div>
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
}

export default AllFlightsPage;