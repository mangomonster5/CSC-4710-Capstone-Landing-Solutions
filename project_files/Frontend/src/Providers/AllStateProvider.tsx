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
    const [allFlights, setAllFlights] = useState<allFlights | undefined>(undefined)

    const [selectedSimDay, setSelectedSimDay] = useState(1)

    if (allFlights !== null) {
        localStorage.setItem("AllFlightsArray", JSON.stringify(allFlights));
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