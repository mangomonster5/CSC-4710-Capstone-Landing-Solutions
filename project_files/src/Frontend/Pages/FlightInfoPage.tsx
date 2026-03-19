import { useState } from "react";


type flightDirection = {
    airportCode: string;
    city: string;
    time: string;
    flightNumber: string;
    gate: string;
    status: string;
};



const FlightInfoPage: React.FC = () => {

    return (
        <div className="d-flex flex-column gap-5" style={{ paddingLeft: '18vw', paddingRight: '18vw', marginTop: '12vh', marginBottom: '12vh' }}>
            <div className="d-flex justify-content-center">
                <div className="w-75 d-flex flex-column gap-1 text-center">
                    <h6 className="mb-0 fw-medium">Panther Cloud Air Flight Information</h6>
                    <div>Access flight schedules, timetables, and aircraft assignments..</div>
                </div>
            </div>

            <div className="d-flex w-100">
                <div className="border border-end-0 rounded-start w-75 ps-3 py-3">Search by flight number, route, or aircraft…</div>
                <div className="w-25 border border-start-0 rounded-end py-3 text-center fw-medium" style={{color: 'white', background: '#167ED9'}}>View Flight Info</div>
            </div>



        </div>
    );
}

export default FlightInfoPage;