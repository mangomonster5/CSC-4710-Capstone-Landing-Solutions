//types.d.ts
import "bootstrap";



declare global {
  type UserRole = "admin" | "manager" | "employee";

  interface Window {
    bootstrap: any;
  }

  interface User {
    id?: string;
    role: UserRole;
    isAuthenticated: boolean;
  }

  interface Hub {
    code: string,
    name: string,
    city: string,
  }

  type allAircrafts = Aircraft[]

  interface Aircraft {
    aircraft_id: number;
    tail_num: string;
    model: string;
    capacity: number;
    max_speed: number;
    current_airport_id: number | null;
    flight_hours: number;
    hours_since_maint: number;
    status: string;
  }

  type allAirports = Airport[]

  interface Airport {
    airport_id: number;
    name: string;
    iata_code: string;
    city: string;
    metro_pop: number;
    is_hub: number;
    latitude: number;
    longitude: number;
  }


  type allFlights = Flight[][];

  interface Flight {
    flight_id: number;
    flight_num: string;
    sim_day: number;
    flight_date: string; // ISO date string

    origin_airport_id: number;
    destination_airport_id: number;
    aircraft_id: number;

    scheduled_depart: string; // datetime string
    scheduled_arrival: string;
    actual_depart?: string | null;
    actual_arrival?: string | null;

    passenger_count: number;
    flight_status: string;
    delay_minutes: number;
    gate?: string | null;

    flight_distance?: number | null;
    departure_fee?: number | null;
    arrival_fee?: number | null;
    fuel_burned?: number | null;
    fuel_cost?: number | null;
    operating_cost?: number | null;
    ticket_price?: number | null;
  }

}


export { };