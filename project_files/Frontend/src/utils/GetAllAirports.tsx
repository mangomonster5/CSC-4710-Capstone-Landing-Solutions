

const GetAllAirports = async () => {

    try {
        const response = await fetch("http://localhost:5001/GetAllAirports");

        if (!response.ok) {
            throw new Error("Failed to fetch flights");
        }

        const data = await response.json();

        return data;
    } catch (err) {
        console.error(err);
    }
}

export default GetAllAirports;