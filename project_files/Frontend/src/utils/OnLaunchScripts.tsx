import { useEffect } from "react";
import useAllStateContext from "../context/useAllStateContext";
import GetAllFlights from "./GetAllFlights";

const OnLaunchScripts = () => {

    const { setAllFlights } = useAllStateContext();

    useEffect(() => {
        // Get all flights and save it to local state
        const AllFlights = GetAllFlights()
        localStorage.setItem("AllFlightsArray", JSON.stringify(AllFlights));
        setAllFlights(AllFlights)


        
    }, [])





    
}


export default OnLaunchScripts;