import React, { ReactNode } from 'react';
import useAllStateContext from '../context/useAllStateContext';

interface FlightSelectionDropdownProps {
    handleSelection: (selection: any) => void;
    body: ReactNode;
    excludeAirport?: Airport | null;
}

const FlightSelectionDropdown: React.FC<FlightSelectionDropdownProps> = ({ handleSelection, body, excludeAirport }) => {
    const { allAirports } = useAllStateContext();

    return (
        <div className="dropdown">
            <div
                className="card d-flex flex-column no-i-cursor gap-1 dropdown-toggle text-wrap"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ cursor: 'pointer' }}
            >
                {body}
            </div>
            <ul
                className="dropdown-menu p-0"
                style={{ maxHeight: '200px', overflowY: 'auto' }}
            >
                {allAirports == null ? (
                    <li className="dropdown-item text-muted">No Airports</li>
                ) : (
                    allAirports
                        .filter((airport: Airport) => airport.airport_id !== excludeAirport?.airport_id)
                        .map((airport: Airport) => (
                            <li key={airport.iata_code} onClick={() => handleSelection(airport)} style={{ cursor: 'pointer' }}>
                                <div className="dropdown-item">
                                    <span className="fw-bold">[{airport.iata_code}]</span> {airport.name}
                                </div>
                            </li>
                        ))
                )}
            </ul>
        </div>
    );
};

export default FlightSelectionDropdown;