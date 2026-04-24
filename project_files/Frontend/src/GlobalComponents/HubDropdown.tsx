import React, { Dispatch, ReactNode, SetStateAction } from 'react';
import useAllStateContext from '../context/useAllStateContext';



interface HubDropdownProps {
    selectedHub: Airport | undefined;
    setSelectedHub: Dispatch<SetStateAction<Airport | undefined>>;
    handleSelection: (selection: any) => void;
    body: ReactNode;
}

const HubDropdown: React.FC<HubDropdownProps> = ({ selectedHub, setSelectedHub, handleSelection, body }) => {

    const {allAirports} = useAllStateContext()

    if (allAirports == null) return

    return (
        <div className="dropdown d-flex align-items-center">
            <div
                className="card d-flex flex-column no-i-cursor gap-1 dropdown-toggle text-wrap p-0 border-0"
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
                {allAirports.map((airport: Airport) => (
                    <li key={airport.iata_code} onClick={() => handleSelection(airport)} style={{ cursor: "pointer" }}>
                        <div className={`dropdown-item ${selectedHub && selectedHub.iata_code === airport.iata_code
                            ? 'bg-primary-blue-500 text-white'
                            : ''}`}>
                            <span className="fw-bold">[{airport.iata_code}]</span> {airport.name}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )

}

export default HubDropdown;