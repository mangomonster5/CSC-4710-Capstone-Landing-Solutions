const GetAllAircrafts = async () => {
    try {
        const response = await fetch("http://localhost:5001/GetAllAircrafts");

        if (!response.ok) {
            throw new Error("Failed to fetch aircrafts");
        }

        const data = await response.json();

        // group by sim_day
        const grouped: Record<number, any[]> = {};

        for (const aircraft of data) {
            const day = aircraft.sim_day;

            if (!grouped[day]) {
                grouped[day] = [];
            }

            grouped[day].push(aircraft);
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

export default GetAllAircrafts;