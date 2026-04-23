import { useEffect, useState } from "react";
import useAllStateContext from "../context/useAllStateContext";
import ModalComponent from "../GlobalComponents/ModalComponent";
import GetAirportInfoFromAircraft from "../utils/GetAirportInfoFromAircraft";


const AdminPage: React.FC = () => {
    const { allFlights, allAircrafts, allAirports } = useAllStateContext()




    const calculateHoursTillMaintaince = (aircraftHoursLeft: number) => {
        const NumberOfMaxHours = 200

        return NumberOfMaxHours - aircraftHoursLeft
    }


    const usFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    });


    const numberFormatter = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        maximumFractionDigits: 0
    });


    const [selectedRevenue, setSelectedRevenue] = useState<'overall' | 'day' | 'avg flight'>('overall')
    const [totalRevenue, setTotalRevenue] = useState(0)
    const [passangerCount, setPassangerCount] = useState(0)
    const [fuelCosts, setFuelCosts] = useState(0)
    const [arrivalFee, setArrivalFee] = useState(0)
    const [departureFee, setDepartureFee] = useState(0)

    const [revenueSelection, setRevenueSelection] = useState<'detailed' | 'simple'>('detailed')

    const [selectedSimDay, setSelectedSimDay] = useState(1)
    const [selectedSimWeek, setSelectedSimWeek] = useState(1)

    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [selectedAircraftModalObject, setSelectedAircraftModalObject] = useState<null | Aircraft>(null)

    useEffect(() => {
        getRevenue(selectedRevenue)
        getOperationCost(selectedRevenue)
        getHubFees(selectedRevenue)
    }, [selectedSimDay])



    const getRevenue = (passedSelector: 'overall' | 'day' | 'avg flight') => {
        let revenue = 0;
        let passangerCount = 0;


        if (passedSelector === 'overall') {
            allFlights
                .flat()
                .forEach((flight: Flight, index: any) => {
                    if (flight.ticket_price) {
                        revenue += flight.passenger_count * flight.ticket_price
                        passangerCount += flight.passenger_count
                    }
                })
        } else if (passedSelector === 'day') {
            allFlights
                .flat()
                .filter((flight: Flight) => flight.sim_day === selectedSimDay - 1)
                .forEach((flight: Flight, index: any) => {
                    if (flight.ticket_price) {
                        revenue += flight.passenger_count * flight.ticket_price
                        passangerCount += flight.passenger_count
                    }
                })
        } else {
            allFlights
                .flat()
                .forEach((flight: Flight, index: any) => {
                    if (flight.ticket_price) {
                        revenue += flight.passenger_count * flight.ticket_price
                        passangerCount += flight.passenger_count
                    }
                })
            revenue = revenue / (allFlights.flat().length + 1)
            passangerCount = passangerCount / (allFlights.flat().length + 1)
        }

        setTotalRevenue(revenue)
        setPassangerCount(passangerCount)
    }

    const getOperationCost = (passedSelector: 'overall' | 'day' | 'avg flight') => {
        let fuelCosts = 0;


        if (passedSelector === 'overall') {
            allFlights
                .flat()
                .forEach((flight: Flight, index: any) => {
                    if (flight.fuel_cost) {
                        fuelCosts += flight.fuel_cost
                    }
                })
        } else if (passedSelector === 'day') {
            allFlights
                .flat()
                .filter((flight: Flight) => flight.sim_day === selectedSimDay - 1)
                .forEach((flight: Flight, index: any) => {
                    if (flight.fuel_cost) {
                        fuelCosts += flight.fuel_cost
                    }
                })
        } else {
            allFlights
                .flat()
                .forEach((flight: Flight, index: any) => {
                    if (flight.fuel_cost) {
                        fuelCosts += flight.fuel_cost
                    }
                })
            fuelCosts = fuelCosts / (allFlights.flat().length + 1)
        }

        setFuelCosts(fuelCosts)
    }

    const getHubFees = (passedSelector: 'overall' | 'day' | 'avg flight') => {
        let arrivalFee = 0;
        let departureFee = 0;


        if (passedSelector === 'overall') {
            allFlights
                .flat()
                .forEach((flight: Flight, index: any) => {
                    if (flight.departure_fee && flight.arrival_fee) {
                        departureFee += flight.departure_fee
                        arrivalFee += flight.arrival_fee
                    }
                })
        } else if (passedSelector === 'day') {
            allFlights
                .flat()
                .filter((flight: Flight) => flight.sim_day === selectedSimDay - 1)
                .forEach((flight: Flight, index: any) => {
                    if (flight.departure_fee && flight.arrival_fee) {
                        departureFee += flight.departure_fee
                        arrivalFee += flight.arrival_fee
                    }
                })
        } else {
            allFlights
                .flat()
                .forEach((flight: Flight, index: any) => {
                    if (flight.departure_fee && flight.arrival_fee) {
                        departureFee += flight.departure_fee
                        arrivalFee += flight.arrival_fee
                    }
                })
            departureFee = departureFee / (allFlights.flat().length + 1)
            arrivalFee = arrivalFee / (allFlights.flat().length + 1)
        }

        setDepartureFee(departureFee)
        setArrivalFee(arrivalFee)
    }



    const getFinances = (passedSelector: 'overall' | 'day' | 'avg flight') => {
        setSelectedRevenue(passedSelector)
        getRevenue(passedSelector)
        getHubFees(passedSelector)
        getOperationCost(passedSelector)
    }


    const handleIncrementWeek = () => {
        if (selectedSimWeek === 2) {
            setSelectedSimWeek(selectedSimWeek - 1)
        }
    }

    const handleDecrementWeek = () => {
        if (selectedSimWeek === 1) {
            setSelectedSimWeek(selectedSimWeek + 1)
        }
    }




    // Modal

    const handleCloseModal = () => {
        setModalIsOpen(false)
    }


    return (
        <div className="d-flex flex-column gap-5" style={{ paddingLeft: '18vw', paddingRight: '18vw', marginTop: '12vh', marginBottom: '12vh' }}>
            <div className="d-flex">
                <div className="w-75 d-flex flex-column gap-1 text-start">
                    <h6 className="mb-0 fw-medium">Panther Cloud Air Admin Settings</h6>
                    <div>Monitor live flight status, adjust simulation days to evaluate system behavior, and track financial data to ensure performance targets are met</div>
                </div>
            </div>



            <div>
                <h5>Simulation Days</h5>
                <div className="d-flex bg-primary-blue-500 border border-black border-bottom-0 text-white py-3 px-3 fw-medium align-items-center rounded-top justify-content-center gap-4">

                    {selectedSimWeek === 2 ? (
                        <button className="bg-transparent border-0 rouned-circle px-0" onClick={handleIncrementWeek}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" className="bi bi-arrow-left-circle-fill" viewBox="0 0 16 16">
                                <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0m3.5 7.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z" />
                            </svg>
                        </button>
                    ) : <div style={{ height: '26px', width: '20px' }}></div>}

                    <div style={{ height: '26px' }} className="d-flex align-self-center fs-5 fw-semibold">Week #{selectedSimWeek}</div>
                    {selectedSimWeek === 1 ? (
                        <button className="bg-transparent border-0 rouned-circle px-0" onClick={handleDecrementWeek}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" className="bi bi-arrow-right-circle-fill" viewBox="0 0 16 16">
                                <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0M4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z" />
                            </svg>
                        </button>

                    ) : <div style={{ height: '26px', width: '20px' }}></div>}
                </div>

                <div style={{ height: '241px' }} className="border rounded-bottom border-dark d-flex flex-column justify-content-between align-items-center">
                    <div style={{ height: '150px' }} className="w-100 align-items-center justify-content-center d-flex flex-column">
                        <div className="fw-medium">Current Days</div>
                        <div className="fw-semibold fs-5">Day {selectedSimDay}</div>
                    </div>
                    <div className="d-flex gap-2 border-top border-black w-100 justify-content-center gap-5 align-items-center" style={{ height: '100px' }}>
                        {selectedSimWeek === 1 ? (
                            <>
                                {
                                    [0, 1, 2, 3, 4, 5, 6].map((day) =>
                                        <div className="d-flex flex-column text-center gap-1">
                                            <div className={`${selectedSimDay === day + 1 && 'fw-semibold'}`}>Day {day + 1}</div>
                                            <button className={`${selectedSimDay === day + 1 && 'fw-medium text-white'} border rounded px-2 border-black`}
                                                onClick={() => setSelectedSimDay(day + 1)}
                                                style={{ background: selectedSimDay === day + 1 ? '#167ed9' : "#e6e6e6" }}
                                            >{selectedSimDay === day + 1 ? 'Selected' : 'Select'}</button>
                                        </div>
                                    )
                                }
                            </>

                        ) : (
                            <>
                                {[7, 8, 9, 10, 11, 12, 13].map((day) =>
                                    <div className="d-flex flex-column text-center gap-1">
                                        <div>Day {day + 1}</div>
                                        <button className="border rounded px-2 border-black" onClick={() => setSelectedSimDay(day + 1)} style={{ background: 'hsl(0, 0%, 90%)' }}>Select</button>
                                    </div>
                                )}
                            </>

                        )}
                    </div>
                </div>

            </div>

            <div className="w-100">
                <h5>Financial Report</h5>

                {/* header */}
                <div className="d-flex bg-primary-blue-500 gap-5 border-black border border-bottom-0 text-white py-3 px-4 fw-medium rounded-top justify-content-between">
                    <div className="d-flex justify-content-between w-50">
                        <button className={`fw-semibold text-center border-black border ${selectedRevenue === 'overall' ? 'bg-white text-black no-hover' : 'bg-transparent border-0 text-white'} rounded px-2`} disabled={selectedRevenue === 'overall'} onClick={() => getFinances('overall')}>Overall Rev.</button>
                        <button className={`fw-semibold text-center border-black border ${selectedRevenue === 'day' ? 'bg-white text-black no-hover' : 'bg-transparent border-0 text-white'} rounded px-2`} disabled={selectedRevenue === 'day'} onClick={() => getFinances('day')}>Day Rev.</button>
                        <button className={`fw-semibold text-center border-black border ${selectedRevenue === 'avg flight' ? 'bg-white text-black no-hover' : 'bg-transparent border-0 text-white'} rounded px-2`} disabled={selectedRevenue === 'avg flight'} onClick={() => getFinances('avg flight')}>Avg. Flight Rev</button>
                    </div>
                    <div>
                        <button className={`segmentButton left ${revenueSelection === 'detailed' ? 'selected-secondary' : 'bg-white'}`} onClick={() => setRevenueSelection('detailed')}>Detailed</button>
                        <button className={`segmentButton right ${revenueSelection === 'simple' ? 'selected-secondary' : 'bg-white'}`} style={{ borderLeft: '0px' }} onClick={() => setRevenueSelection('simple')}>Simple</button>
                    </div>
                </div>

                <div style={{ height: '241px' }} className="border rounded-bottom border-dark d-flex justify-content-center align-items-center">
                    <div className="d-flex gap-4 align-items-center">
                        <div>
                            <div className="text-start fw-medium">Total Revenue</div>
                            <div className="fw-medium fs-5 text-start">{usFormatter.format(totalRevenue)}</div>
                            <div className="text-start fw-light">{`(${numberFormatter.format(passangerCount)} Pax)`}</div>
                        </div>

                        <div>-</div>

                        {revenueSelection === 'detailed' ? (
                            <>
                                <div>
                                    <div className="text-start fw-medium">Fuel Costs</div>
                                    <div className="fw-medium fs-5 text-start text-danger">{fuelCosts == null ? 'None' : usFormatter.format(fuelCosts)}</div>
                                </div>

                                <div>-</div>

                                <div>
                                    <div className="text-start fw-medium">Departure Fees</div>
                                    <div className="fw-medium fs-5 text-start text-danger">{departureFee == null ? 'None' : usFormatter.format(departureFee)}</div>
                                </div>

                                <div>-</div>

                                <div>
                                    <div className="text-start fw-medium">Departure Fees</div>
                                    <div className="fw-medium fs-5 text-start text-danger">{departureFee == null ? 'None' : usFormatter.format(departureFee)}</div>
                                </div>
                            </>
                        ) : (
                            <div>
                                <div className="text-start fw-medium">Operational Costs</div>
                                <div className="fw-medium fs-5 text-start text-danger">{fuelCosts == null ? 'None' : usFormatter.format(fuelCosts + departureFee + arrivalFee)}</div>
                            </div>
                        )}

                        <div>=</div>

                        <div>
                            <div className="text-start fw-medium">Total Profit</div>
                            <div className="fw-semibold fs-5 text-start text-success">{totalRevenue == null ? 'None' : usFormatter.format((totalRevenue - fuelCosts - departureFee - arrivalFee))}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-100">
                <h5>Aircraft Report</h5>
                {/* header */}
                <div className="d-flex bg-primary-blue-500 border border-black text-white py-3 px-3 fw-medium rounded-top">
                    <div className="fw-semibold" style={{ width: '75px' }}>ID</div>
                    <div className="fw-semibold" style={{ width: '160px' }}>Tail #</div>
                    <div className="fw-semibold" style={{ width: '250px' }}>Model</div>
                    <div className="fw-semibold" style={{ width: '150px' }}>Capacity</div>
                    <div className="fw-semibold" style={{ width: '200px' }}>Status</div>
                    <div className="fw-semibold" style={{ width: '200px' }}>Needs Maintenance</div>
                    <div className="fw-semibold" style={{ width: '100px' }}></div>
                </div>

                <div className="rounded-bottom border-bottom border-black">
                    {allAircrafts != null ? (
                        <>
                            {allAircrafts.map((aircraft: Aircraft, index: any) =>
                                <div key={index} className={`d-flex border-start border-end ${allAircrafts.length - 1 !== index && 'border-bottom'} border-dark py-3 px-3 fw-medium`}>
                                    {/* <div className="text-muted" style={{ width: '160px' }}>{aircraft.tail_num}</div> */}
                                    <div className="fw-semibold" style={{ width: '75px' }}>{aircraft.aircraft_id}</div>
                                    <div className="text-muted" style={{ width: '160px' }}>N1421A</div>
                                    <div className="text-muted" style={{ width: '250px' }}>{aircraft.model}</div>
                                    <div className="text-muted" style={{ width: '150px' }}>{aircraft.capacity}</div>
                                    <div className="text-muted" style={{ width: '200px' }}>{aircraft.status}</div>
                                    <div className="text-muted" style={{ width: '200px' }}>in {calculateHoursTillMaintaince(aircraft.hours_since_maint)} hours</div>
                                    <div className="text-muted text-center" style={{ width: '100px' }}>
                                        <button className="rounded border" onClick={() => [setModalIsOpen(true), setSelectedAircraftModalObject(aircraft)]}>View</button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <>

                        </>
                    )}
                </div>

            </div>










            <ModalComponent
                isOpen={modalIsOpen}
                setIsOpen={setModalIsOpen}
                title={`Aircraft Report`}
                onDismiss={() => handleCloseModal()}
                body={
                    <>
                        {/* Does a check for TypeScript to make sure selectedFlightModalObject is set to something, handles crashes */}
                        {selectedAircraftModalObject != null && (

                            // This block displays the orgin and destination the IATA_code stacked on top of the city
                            <div className="text-center">
                                <div className=" d-flex justify-content-center gap-2 align-items-center py-4 border-bottom">
                                    <div className="d-flex flex-column w-75">
                                        <div className="fw-semibold fs-5"></div>
                                        <div className="fs-5 fw-semibold">{selectedAircraftModalObject.tail_num}</div>
                                        <div>{selectedAircraftModalObject.model}</div>

                                    </div>
                                </div>



                                <div className="d-flex justify-content-center gap-2 align-items-center py-3 border-bottom">

                                    <div className="d-flex flex-column text-start w-100 px-4">
                                        <div className="d-flex justify-content-between gap-2">
                                            <div className="fw-medium">Aircraft At:</div>
                                            <div>{GetAirportInfoFromAircraft(allAirports, selectedAircraftModalObject)?.name}</div>
                                        </div>
                                    </div>
                                </div>


                                <div className="d-flex justify-content-center gap-2 align-items-center py-3 border-bottom">

                                    <div className="d-flex flex-column text-start w-100 px-4">
                                        <div className="d-flex justify-content-between gap-2">
                                            <div className="fw-medium">Status:</div>
                                            <div>{selectedAircraftModalObject.status}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-center gap-2 align-items-center py-3 border-bottom">

                                    <div className="d-flex flex-column text-start w-100 px-4">
                                        <div className="d-flex justify-content-between gap-2">
                                            <div className="fw-medium">Aircraft Num:</div>
                                            <div>ID #{selectedAircraftModalObject.aircraft_id}</div>
                                        </div>
                                    </div>
                                </div>


                                <div className="d-flex justify-content-center gap-2 align-items-center py-3 border-bottom">

                                    <div className="d-flex flex-column text-start w-100 px-4">
                                        <div className="d-flex justify-content-between gap-2">
                                            <div className="fw-medium">Capacity:</div>
                                            <div>{selectedAircraftModalObject.capacity} Pax.</div>
                                        </div>
                                    </div>
                                </div>



                                <div className="d-flex justify-content-center gap-2 align-items-center py-3 border-bottom">

                                    <div className="d-flex flex-column text-start w-100 px-4">
                                        <div className="d-flex justify-content-between gap-2">
                                            <div className="fw-medium">Flight Hours:</div>
                                            <div>{selectedAircraftModalObject.flight_hours} Hours</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-center gap-2 align-items-center py-3 border-bottom">

                                    <div className="d-flex flex-column text-start w-100 px-4">
                                        <div className="d-flex justify-content-between gap-2">
                                            <div className="fw-medium">Hours till maintaince:</div>
                                            <div>{calculateHoursTillMaintaince(selectedAircraftModalObject.hours_since_maint)} Hours</div>
                                        </div>
                                    </div>
                                </div>


                                <div className="d-flex justify-content-center gap-2 align-items-center py-3">

                                    <div className="d-flex flex-column text-start w-100 px-4">
                                        <div className="d-flex justify-content-between gap-2">
                                            <div className="fw-medium">Aircraft Max Speed:</div>
                                            <div>{selectedAircraftModalObject.max_speed} km/h</div>
                                        </div>
                                    </div>

                                </div>

                            </div>
                        )}
                    </>
                }
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => handleCloseModal()}>Close</button>
                    </>
                }
            />


        </div>
    );
}

export default AdminPage;