import { createContext, useState } from "react";
import GetAircraftInfo from "../utils/GetAircraftInfo";

// Using react to create context
const FlightsContext = createContext<any>(undefined);

// Creating a provider used to wrap the app or other children

function AllStateProvider({ children }: { children: any }) {

    // Creating global state to pass throughout the app

    // This is the user state, after a successful login this gets update allowing us to check roles and authentication status
    const localUser = localStorage.getItem("user");
    const defaultUser = {
        isAuthenticated: true,
        role: 'employee'
    }
    const [user, setUser] = useState<User>(localUser == null ? defaultUser : JSON.parse(localUser))

    // This is where all the flights will be stored allowing us to filter by day
    const [allAirports, setAllAirports] = useState<allAirports | undefined>(undefined)
    const [allAircrafts, setAllAircrafts] = useState<allAircrafts | undefined>(undefined)
    const [allFlights, setAllFlights] = useState<allFlights>(generateFlights())

    const [selectedSimDay, setSelectedSimDay] = useState(1)

    if (allFlights !== null) {
        localStorage.setItem("AllFlightsArray", JSON.stringify(allFlights));
    }

    // This is a temperary function made by AI to populate our allFlights state while the backend team works on properly generating it
    function generateFlights(): allFlights {
        const days = 14;
        const flightsPerDay = 200;

        const result: allFlights = [];
        let id = 1;

        const airports = [1, 2, 3, 4, 5];

        for (let d = 0; d < days; d++) {
            const dayFlights: any[] = [];



            for (let f = 0; f < flightsPerDay; f++) {
                const baseDate = new Date(2026, 3, 15 + d);

                const depart = new Date(baseDate);
                depart.setHours(8 + (f % 16));

                const arrival = new Date(depart);
                arrival.setHours(depart.getHours() + 4);

                const origin = airports[Math.floor(Math.random() * airports.length)];
                let destination = airports[Math.floor(Math.random() * airports.length)];

                while (destination === origin) {
                    destination = airports[Math.floor(Math.random() * airports.length)];
                }

                const fuelBurned = 3000 + Math.random() * 6000;

                dayFlights.push({
                    flight_id: id,
                    flight_num: `PCA${100 + id}`,
                    sim_day: d,

                    origin_airport_id: origin,
                    destination_airport_id: destination,
                    aircraft_id: (f % 3) + 1,

                    scheduled_depart: depart.toISOString(),
                    scheduled_arrival: arrival.toISOString(),
                    actual_depart: null,
                    actual_arrival: null,

                    passenger_count: 40 + Math.floor(Math.random() * (130 - 40 + 1)),
                    flight_status: "scheduled",
                    delay_minutes: Math.floor(Math.random() * 20),
                    gate: `A${Math.floor(Math.random() * 20)}`,

                    flight_distance: 800 + Math.floor(Math.random() * 2000),
                    departure_fee: 1000,
                    arrival_fee: 1000,
                    fuel_burned: fuelBurned,
                    fuel_cost: fuelBurned * 1.5,
                    operating_cost: 12000 + Math.floor(Math.random() * 15000),
                    ticket_price: 200 + Math.floor(Math.random() * 200)
                });

                id++;
            }

            result.push(dayFlights);
        }

        return result;
    }





    // ValueToShare definition to pass into provider
    const valueToShare = {
        allFlights,
        setAllFlights,

        allAirports,
        setAllAirports,

        allAircrafts,
        setAllAircrafts,

        selectedSimDay,
        setSelectedSimDay,

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