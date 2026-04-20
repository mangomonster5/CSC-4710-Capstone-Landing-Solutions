

const GetAllFlights = async () => {

    try {
        const response = await fetch("http://localhost:5001/GetAllFlights");

        if (!response.ok) {
            throw new Error("Failed to fetch flights");
        }

        const data: Flight[][] = await response.json();

        return data;
    } catch (err) {
        console.error(err);
    }
}

export default GetAllFlights;