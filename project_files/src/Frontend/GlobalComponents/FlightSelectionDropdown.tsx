import React, { ReactNode } from 'react';

interface FlightSelectionDropdownProps {
excludeCode?: string; // STILL TESTING 
handleSelection: (selection: any) => void
body: ReactNode;
}

const FlightSelectionDropdown: React.FC<FlightSelectionDropdownProps> = ({ excludeCode, handleSelection, body }) => {

const airports = [
{ code: "ATL", name: "Hartsfield-Jackson Atlanta International", city: "Atlanta, GA" },
{ code: "DFW", name: "Dallas/Fort Worth International", city: "Dallas/Fort Worth, TX" },
{ code: "DEN", name: "Denver International", city: "Denver, CO" },
{ code: "ORD", name: "O'Hare International", city: "Chicago, IL" },
{ code: "LAX", name: "Los Angeles International", city: "Los Angeles, CA" },
{ code: "JFK", name: "John F. Kennedy International", city: "New York, NY" },
{ code: "CLT", name: "Charlotte Douglas International", city: "Charlotte, NC" },
{ code: "LAS", name: "McCarran International", city: "Las Vegas, NV" },
{ code: "MCO", name: "Orlando International", city: "Orlando, FL" },
{ code: "MIA", name: "Miami International", city: "Miami, FL" },
{ code: "PHX", name: "Phoenix Sky Harbor International", city: "Phoenix, AZ" },
{ code: "SEA", name: "Seattle-Tacoma International", city: "Seattle, WA" },
{ code: "SFO", name: "San Francisco International", city: "San Francisco, CA" },
{ code: "EWR", name: "Newark Liberty International", city: "Newark, NJ" },
{ code: "IAH", name: "George Bush Intercontinental", city: "Houston, TX" },
{ code: "BOS", name: "Logan International", city: "Boston, MA" },
{ code: "MSP", name: "Minneapolis-Saint Paul International", city: "Minneapolis, MN" },
{ code: "FLL", name: "Fort Lauderdale-Hollywood International", city: "Fort Lauderdale, FL" },
{ code: "LGA", name: "LaGuardia", city: "New York, NY" },
{ code: "DTW", name: "Detroit Metropolitan Wayne County", city: "Detroit, MI" },
{ code: "PHL", name: "Philadelphia International", city: "Philadelphia, PA" },
{ code: "SLC", name: "Salt Lake City International", city: "Salt Lake City, UT" },
{ code: "BWI", name: "Baltimore/Washington International", city: "Baltimore, MD" },
{ code: "IAD", name: "Washington Dulles International", city: "Dulles, VA" },
{ code: "SAN", name: "San Diego International", city: "San Diego, CA" },
{ code: "DCA", name: "Ronald Reagan Washington National", city: "Arlington, VA" },
{ code: "TPA", name: "Tampa International", city: "Tampa, FL" },
{ code: "BNA", name: "Nashville International", city: "Nashville, TN" },
{ code: "AUS", name: "Austin-Bergstrom International", city: "Austin, TX" },
{ code: "HNL", name: "Daniel K. Inouye International", city: "Honolulu, HI" },
{ code: "CDG", name: "Charles de Gaulle", city: "Paris, France" }
];

return (

<>
{body}

{airports.filter((airport) => airport.code !== excludeCode).map((airport) => (
<div
key={airport.code}
onClick={() => handleSelection({ code: airport.code, name: airport.name, city: airport.city })}
style={{ cursor: "pointer" }}
>
[{airport.code}] {airport.name}
</div>
))}
</>
);
};

export default FlightSelectionDropdown;