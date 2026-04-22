

const GetAllAircrafts = async () => {

    try {
        const response = await fetch("http://localhost:5001/GetAllAircrafts");

        if (!response.ok) {
            throw new Error("Failed to fetch flights");
        }
        // console.log(response)

        const data = await response.json();

        return data;
    } catch (err) {
        console.error(err);
    }
}

export default GetAllAircrafts;