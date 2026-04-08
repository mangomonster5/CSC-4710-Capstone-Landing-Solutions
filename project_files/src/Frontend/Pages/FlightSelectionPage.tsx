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
    // selection for which table we display

    const [modalIsOpen, setModalIsOpen] = useState(false)

    const [from, setFrom] = useState<{ code: string, name: string, city: string } | null>(null)
    const [to, setTo] = useState<{ code: string, name: string, city: string } | null>(null)

    return (
        <div className="d-flex flex-column gap-5" style={{ paddingLeft: '18vw', paddingRight: '18vw', marginTop: '12vh', marginBottom: '12vh' }}>
            <div className="d-flex justify-content-between">
                <div className="w-75 d-flex flex-column gap-1">
                    <h6 className="mb-0 fw-medium">Panther Cloud Air Flight Selection</h6>
                    <div>Compare departure and arrival times, travel duration, and aircraft details to book the option that works best for you.</div>
                </div>
                <div className="w-25 align-items-center d-flex justify-content-end">
                    <button className={'mainButton'} >Find Flight</button>
                </div>
            </div>

            <div className="d-flex justify-content-between gap-3">


                <div style={{ width: '350px' }}>
                    <div>From</div>
                    <FlightSelectionDropdown
                        handleSelection={(selection: any) => { setFrom(selection) }}
                        body={
                            <>
                                {from ?
                                    (
                                        <>
                                            <div className="fw-semibold">{from?.name}</div>
                                            <div>[{from?.code}] - {from?.city}</div>
                                        </>
                                    ) :
                                    (
                                        <div className="d-flex align-items-center" style={{height: '54px'}}>Please Select an Airport</div>
                                    )
                                }
                            </>
                        }
                    />
                </div>
                <div style={{ width: '350px' }}>
                    <div>To</div>
                    <FlightSelectionDropdown
                        handleSelection={(selection: any) => { setTo(selection) }}
                        body={
                            <>
                                {to ?
                                    (
                                        <>
                                            <div className="fw-semibold">{to?.name}</div>
                                            <div>[{to?.code}] - {to?.city}</div>
                                        </>
                                    ) :
                                    (
                                        <div className="d-flex align-items-center" style={{height: '54px'}}>Please Select an Airport</div>
                                    )
                                }

                            </>
                        }
                    />
                </div>

                <div style={{ width: '110px' }}>
                    <div>Departure</div>
                    <div className="card d-flex flex-column align-items-center justify-content-center" style={{ height: '80px' }}>
                        <div className="fw-semibold">Feb, 20th</div>
                    </div>
                </div>
                <div style={{ width: '110px' }}>
                    <div>Return</div>
                    <div className="card d-flex flex-column align-items-center justify-content-center" style={{ height: '80px' }}>
                        <div className="fw-semibold">Mar, 1st</div>
                    </div>
                </div>

            </div>


            <div>
                {/* header */}
                <div className="d-flex bg-primary-blue-500 border-black text-white py-3 px-3 fw-medium rounded-top">
                    <div className="fw-semibold" style={{ width: '500px' }}>Origin</div>
                    <div className="fw-semibold" style={{ width: '350px' }}>Flight Number</div>
                    <div className="fw-semibold" style={{ width: '200px' }}>Seats</div>
                    <div className="fw-semibold" style={{ width: '200px' }}></div>
                </div>

                <div className={`d-flex border-start border-end border-bottom border-dark py-3 px-3 fw-medium`}>
                    <div className="text-muted" style={{ width: '500px' }}>[ORD] - Chicago, IL</div>
                    <div className="text-muted" style={{ width: '350px' }}>PCA807</div>
                    <div className="text-muted" style={{ width: '200px' }}>40 / 180</div>
                    <div className="text-muted text-center" style={{ width: '200px' }}>
                        <button className="rounded border" onClick={() => setModalIsOpen(true)}>View</button>
                    </div>
                </div>

                <div className={`d-flex border-start border-end border-bottom border-dark rounded-bottom py-3 px-3 fw-medium`}>
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
}

export default FlightSelectionPage;