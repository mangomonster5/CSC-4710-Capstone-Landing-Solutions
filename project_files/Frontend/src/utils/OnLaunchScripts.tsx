import { useEffect } from "react";
import useAllStateContext from "../context/useAllStateContext";
import GetAllFlights from "./GetAllFlights";
import GetAllAirports from "./GetAllAirports";
import GetAllAircrafts from "./GetAllAircrafts";

const OnLaunchScripts = () => {

    const { setAllFlights, setAllAirports, setAllAircrafts } = useAllStateContext();

    useEffect(() => {

        const getAllData = async () => {
            // Get all flights and save it to local state
            const AllFlights = await GetAllFlights()
            localStorage.setItem("AllFlightsArray", JSON.stringify(AllFlights));
            setAllFlights(AllFlights)


            // Get all airports and save it to local state
            const AllAirports = await GetAllAirports()
            localStorage.setItem("AllAirportsArray", JSON.stringify(AllAirports));
            setAllAirports(AllAirports)


            // Get all airports and save it to local state
            const AllAircrafts = await GetAllAircrafts()
            localStorage.setItem("AllAircraftsArray", JSON.stringify(AllAircrafts));
            setAllAircrafts(AllAircrafts)
        }

        getAllData()

    }, [])






}


export default OnLaunchScripts;