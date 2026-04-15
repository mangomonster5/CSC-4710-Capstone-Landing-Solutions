import { createContext, useState } from "react";

// Using react to create context
const FlightsContext = createContext<any>(undefined);

// Creating a provider used to wrap the app or other children

function AllStateProvider({ children }: { children: any }) {

    // Creating global state to pass throughout the app
    // This is where all the flights will be stored allowing us to filter by day
    const [allFlights, setAllFlights] = useState<AllFlights>([
        // Day 1
        [
            {
                flight_id: 1,
                flight_num: "CS101",
                sim_day: 0,
                flight_date: "2026-04-15",

                origin_airport_id: 1,
                destination_airport_id: 2,
                aircraft_id: 1,

                scheduled_depart: "2026-04-15T08:00:00Z",
                scheduled_arrival: "2026-04-15T12:00:00Z",
                actual_depart: null,
                actual_arrival: null,

                passenger_count: 120,
                flight_status: "scheduled",
                delay_minutes: 0,
                gate: "A12",

                flight_distance: 2475,
                departure_fee: 2000,
                arrival_fee: 1800,
                fuel_burned: 8000,
                fuel_cost: 12000,
                operating_cost: 25000,
                ticket_price: 320
            },
            {
                flight_id: 2,
                flight_num: "CS102",
                sim_day: 0,
                flight_date: "2026-04-15",

                origin_airport_id: 2,
                destination_airport_id: 3,
                aircraft_id: 2,

                scheduled_depart: "2026-04-15T14:00:00Z",
                scheduled_arrival: "2026-04-15T18:00:00Z",
                actual_depart: null,
                actual_arrival: null,

                passenger_count: 95,
                flight_status: "scheduled",
                delay_minutes: 15,
                gate: "B4",

                flight_distance: 1744,
                departure_fee: 1500,
                arrival_fee: 1400,
                fuel_burned: 6000,
                fuel_cost: 9000,
                operating_cost: 18000,
                ticket_price: 280
            }
        ],

        // Day 2
        [
            {
                flight_id: 3,
                flight_num: "CS201",
                sim_day: 1,
                flight_date: "2026-04-16",

                origin_airport_id: 3,
                destination_airport_id: 4,
                aircraft_id: 1,

                scheduled_depart: "2026-04-16T09:30:00Z",
                scheduled_arrival: "2026-04-16T13:00:00Z",
                actual_depart: null,
                actual_arrival: null,

                passenger_count: 140,
                flight_status: "scheduled",
                delay_minutes: 5,
                gate: "C7",

                flight_distance: 975,
                departure_fee: 1200,
                arrival_fee: 1100,
                fuel_burned: 4000,
                fuel_cost: 7000,
                operating_cost: 15000,
                ticket_price: 220
            },
            {
                flight_id: 4,
                flight_num: "CS202",
                sim_day: 1,
                flight_date: "2026-04-16",

                origin_airport_id: 4,
                destination_airport_id: 5,
                aircraft_id: 3,

                scheduled_depart: "2026-04-16T16:00:00Z",
                scheduled_arrival: "2026-04-16T20:30:00Z",
                actual_depart: null,
                actual_arrival: null,

                passenger_count: 110,
                flight_status: "scheduled",
                delay_minutes: 0,
                gate: "D2",

                flight_distance: 1300,
                departure_fee: 1600,
                arrival_fee: 1500,
                fuel_burned: 5000,
                fuel_cost: 8000,
                operating_cost: 17000,
                ticket_price: 260
            }
        ]
    ]);
    const [user, setUser] = useState<User>({
        isAuthenticated: true,
        role: 'employee'
    })


    // ValueToShare definition to pass into provider
    const valueToShare = {
        allFlights,
        setAllFlights,

        user,
        setUser,
    }

    return (
        // Provide the state to all nested children
        <FlightsContext.Provider value={valueToShare}>
            {children}
        </FlightsContext.Provider>
    );
}

// Export provider so it can wrap the app
export { AllStateProvider };

// Export context so other components can consume it via useContext
export default FlightsContext;