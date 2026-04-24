const GetAllFlights = async () => {
    try {
        const response = await fetch("http://localhost:5001/GetAllFlights");

        if (!response.ok) {
            throw new Error("Failed to fetch flights");
        }

        const data = await response.json();

        // group by sim_day
        const grouped: Record<number, any[]> = {};

        for (const flight of data) {
            const day = flight.sim_day;

            if (!grouped[day]) {
                grouped[day] = [];
            }

            grouped[day].push(flight);
        }

        // convert to 2D array sorted by sim_day
        const result = Object.keys(grouped)
            .sort((a, b) => Number(a) - Number(b))
            .map(day => grouped[Number(day)]);

        return result;

    } catch (err) {
        console.error(err);
    }
};

export default GetAllFlights;