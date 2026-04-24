import { useEffect, useState } from "react";
import { useMemo } from "react";
import useAllStateContext from "../context/useAllStateContext";
import ModalComponent from "../GlobalComponents/ModalComponent";
import GetAirportInfoFromAircraft from "../utils/GetAirportInfoFromAircraft";

type Flight = {
    flight_id: number;
    flight_num: string;
    sim_day: number;
    origin_airport_id: number;
    destination_airport_id: number;
    aircraft_id: number;
    scheduled_depart: string;
    scheduled_arrival: string;
    actual_depart: string | null;
    actual_arrival: string | null;
    passenger_count: number;
    flight_status: string;
    delay_minutes: number;
    gate: string | null;
    flight_distance: number;
    departure_fee: number;
    arrival_fee: number;
    fuel_burned: number;
    fuel_cost: number;
    operating_cost: number;
    ticket_price: number;
};

const STATUS_COLOR: Record<string, string> = {
    "On Time":  "#198754",
    "Delayed":  "#dc3545",
    "Cancelled": "#6c757d",
    "In Air":   "#167ED9",
};

const FlightInfoPage: React.FC = () => {
    const { allAirports, allAircrafts, selectedSimDay, usFormatter, setAllFlights, allFlights } =
        useAllStateContext();

    const [query, setQuery] = useState("");
    const [submitted, setSubmitted] = useState(false);

    //allFlights is allFlights[simDayIndex] = Flight[]
    //selectedSimDay is 1-based
    const todaysFlights: Flight[] = useMemo(() => {
        if (!allFlights || allFlights.length === 0) return [];
        const idx = (selectedSimDay ?? 1) - 1;
        return allFlights[idx] ?? [];
    }, [allFlights, selectedSimDay]);

    //lookup maps
    const airportMap = useMemo(() => {
        const m: Record<number, { iata_code: string; city: string; name: string }> = {};
        (allAirports ?? []).forEach((a: any) => {
            m[a.airport_id] = { iata_code: a.iata_code, city: a.city, name: a.name };
        });
        return m;
    }, [allAirports]);

    const aircraftMap = useMemo(() => {
        const m: Record<number, { tail_num: string; model: string }> = {};
        (allAircrafts ?? []).forEach((a: any) => {
            //aircraft table sim_day snapshots
            if (a.sim_day === selectedSimDay) {
                m[a.aircraft_id] = { tail_num: a.tail_num, model: a.model };
            }
        });
        return m;
    }, [allAircrafts, selectedSimDay]);

    const filteredFlights: Flight[] = useMemo(() => {
        if (!submitted || query.trim() === "") return [];

        const q = query.trim().toLowerCase();

        return todaysFlights.filter((f) => {
            const origin = airportMap[f.origin_airport_id];
            const dest   = airportMap[f.destination_airport_id];
            const ac     = aircraftMap[f.aircraft_id];

            //flight number, city, aircraft tail or model, status, gate
            return (
                f.flight_num.toLowerCase().includes(q) ||
                origin?.iata_code.toLowerCase().includes(q) ||
                origin?.city.toLowerCase().includes(q) ||
                dest?.iata_code.toLowerCase().includes(q) ||
                dest?.city.toLowerCase().includes(q) ||
                ac?.tail_num.toLowerCase().includes(q) ||
                ac?.model.toLowerCase().includes(q) ||
                f.flight_status.toLowerCase().includes(q) ||
                (f.gate ?? "").toLowerCase().includes(q) ||
                //string
                `${origin?.iata_code}-${dest?.iata_code}`.toLowerCase().includes(q)
            );
        });
    }, [submitted, query, todaysFlights, airportMap, aircraftMap]);

    const handleSearch = () => {
        setSubmitted(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleSearch();
    };

    const formatTime = (dt: string | null) => {
        if (!dt) return "—";
        const d = new Date(dt);
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div
            className="d-flex flex-column gap-5"
            style={{ paddingLeft: "18vw", paddingRight: "18vw", marginTop: "12vh", marginBottom: "12vh" }}
        >
            {/* Header */}
            <div className="d-flex justify-content-center">
                <div className="w-75 d-flex flex-column gap-1 text-center">
                    <h6 className="mb-0 fw-medium">Panther Cloud Air Flight Information</h6>
                    <div>Access flight schedules, timetables, and aircraft assignments..</div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="d-flex w-100">
                <input
                    className="border border-end-0 rounded-start w-75 ps-3 py-3"
                    placeholder="Search by flight number, route, or aircraft…"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        // Reset submitted so results clear when user edits
                        if (submitted) setSubmitted(false);
                    }}
                    onKeyDown={handleKeyDown}
                />
                <button
                    className="w-25 border border-start-0 rounded-end py-3 text-center fw-medium"
                    style={{ color: "white", background: "#167ED9" }}
                    onClick={handleSearch}
                >
                    View Flight Info
                </button>
            </div>

            {/* Results */}
            {submitted && (
                <div>
                    {filteredFlights.length === 0 ? (
                        <div className="text-center text-muted py-4">
                            No flights found for <strong>"{query}"</strong> on Sim Day {selectedSimDay}.
                        </div>
                    ) : (
                        <>
                            <div className="text-muted mb-2" style={{ fontSize: "0.875rem" }}>
                                {filteredFlights.length} result{filteredFlights.length !== 1 ? "s" : ""} for "
                                {query}" — Sim Day {selectedSimDay}
                            </div>

                            <div className="table-responsive">
                                <table className="table table-hover align-middle" style={{ fontSize: "0.9rem" }}>
                                    <thead className="table-light">
                                        <tr>
                                            <th>Flight #</th>
                                            <th>Origin</th>
                                            <th>Destination</th>
                                            <th>Depart</th>
                                            <th>Arrive</th>
                                            <th>Gate</th>
                                            <th>Aircraft</th>
                                            <th>Passengers</th>
                                            <th>Status</th>
                                            <th>Delay</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredFlights.map((f) => {
                                            const origin = airportMap[f.origin_airport_id];
                                            const dest   = airportMap[f.destination_airport_id];
                                            const ac     = aircraftMap[f.aircraft_id];
                                            const statusColor = STATUS_COLOR[f.flight_status] ?? "#6c757d";

                                            return (
                                                <tr key={f.flight_id}>
                                                    <td className="fw-semibold">{f.flight_num}</td>
                                                    <td>
                                                        <span className="fw-semibold">{origin?.iata_code ?? "?"}</span>
                                                        <span className="text-muted d-block" style={{ fontSize: "0.78rem" }}>
                                                            {origin?.city}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="fw-semibold">{dest?.iata_code ?? "?"}</span>
                                                        <span className="text-muted d-block" style={{ fontSize: "0.78rem" }}>
                                                            {dest?.city}
                                                        </span>
                                                    </td>
                                                    <td>{formatTime(f.scheduled_depart)}</td>
                                                    <td>{formatTime(f.scheduled_arrival)}</td>
                                                    <td>{f.gate ?? "—"}</td>
                                                    <td>
                                                        <span className="fw-semibold">{ac?.tail_num ?? "?"}</span>
                                                        <span className="text-muted d-block" style={{ fontSize: "0.78rem" }}>
                                                            {ac?.model}
                                                        </span>
                                                    </td>
                                                    <td>{f.passenger_count.toLocaleString()}</td>
                                                    <td>
                                                        <span
                                                            className="badge"
                                                            style={{
                                                                background: statusColor,
                                                                color: "white",
                                                                fontWeight: 500,
                                                                fontSize: "0.78rem",
                                                            }}
                                                        >
                                                            {f.flight_status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {f.delay_minutes > 0 ? (
                                                            <span style={{ color: "#dc3545" }}>
                                                                +{f.delay_minutes}m
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted">—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default FlightInfoPage;