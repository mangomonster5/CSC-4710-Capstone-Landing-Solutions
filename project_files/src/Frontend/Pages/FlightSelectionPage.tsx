import { useState } from "react";


type flightDirection = {
    airportCode: string;
    city: string;
    time: string;
    flightNumber: string;
    gate: string;
    status: string;
};



const FlightSelectionPage: React.FC = () => {
    // selection for which table we display

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


                <div className="w-25">
                    <div>From</div>
                    <div className="card d-flex flex-column gap-1">
                        <div className="fw-semibold">O'Hare International</div>
                        <div>[ORD] - Chicago, IL</div>
                    </div>
                </div>
                <div className="w-25">
                    <div>To</div>
                    <div className="card d-flex flex-column gap-1">
                        <div className="fw-semibold">JFK International</div>
                        <div>[JFK] - New York, NY</div>
                    </div>
                </div>
                <div className="w-25">
                    <div>Departure</div>
                    <div className="card d-flex flex-column gap-1">
                        <div className="fw-semibold">Feb, 20th</div>
                        <div>Friday, 2026</div>
                    </div>
                </div>
                <div className="w-25">
                    <div>Return</div>
                    <div className="card d-flex flex-column gap-1">
                        <div className="fw-semibold">Mar, 1st</div>
                        <div>Sunday, 2026</div>
                    </div>
                </div>

            </div>


            <div>
                {/* header */}
                <div className="d-flex bg-primary-blue-500  text-white py-3 px-3 fw-medium rounded-top">
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
                        <button className="rounded border">View</button>
                    </div>
                </div>

                <div className={`d-flex border-start border-end border-bottom border-dark rounded-bottom py-3 px-3 fw-medium`}>
                    <div className="text-muted" style={{ width: '500px' }}>[ORD] - Chicago, IL</div>
                    <div className="text-muted" style={{ width: '350px' }}>PCA908</div>
                    <div className="text-muted" style={{ width: '200px' }}>12 / 246</div>
                    <div className="text-muted text-center" style={{ width: '200px' }}>
                        <button className="rounded border">View</button>
                    </div>
                </div>
            </div>



        </div>
    );
}

export default FlightSelectionPage;