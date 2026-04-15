-- Airport Table
CREATE TABLE airport (
    airport_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    iata_code TEXT NOT NULL UNIQUE,
    city TEXT NOT NULL,
    metro_pop INTEGER NOT NULL,
    is_hub INTEGER NOT NULL, -- 0 = false, 1 = true
    latitude REAL NOT NULL,
    longitude REAL NOT NULL
);

-- Aircraft Table
CREATE TABLE aircraft (
    aircraft_id INTEGER PRIMARY KEY AUTOINCREMENT,
    tail_num TEXT NOT NULL UNIQUE,
    model TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    max_speed REAL NOT NULL,
    current_airport_id INTEGER,
    flight_hours REAL DEFAULT 0,
    hours_since_maint REAL DEFAULT 0,
    status TEXT NOT NULL,

    FOREIGN KEY (current_airport_id)
        REFERENCES airport(airport_id)
);

-- Flights Table
CREATE TABLE all_flights (
    flight_id INTEGER PRIMARY KEY AUTOINCREMENT,
    flight_num TEXT NOT NULL,
    sim_day INTEGER NOT NULL,
    flight_date TEXT NOT NULL,

    origin_airport_id INTEGER NOT NULL,
    destination_airport_id INTEGER NOT NULL,
    aircraft_id INTEGER NOT NULL,

    scheduled_depart TEXT NOT NULL,
    scheduled_arrival TEXT NOT NULL,
    actual_depart TEXT,
    actual_arrival TEXT,

    passenger_count INTEGER DEFAULT 0,
    flight_status TEXT NOT NULL,
    delay_minutes INTEGER DEFAULT 0,
    gate TEXT,

    flight_distance REAL,
    departure_fee REAL,
    arrival_fee REAL,
    fuel_burned REAL,
    fuel_cost REAL,
    operating_cost REAL,
    ticket_price REAL,

    FOREIGN KEY (origin_airport_id)
        REFERENCES airport(airport_id),

    FOREIGN KEY (destination_airport_id)
        REFERENCES airport(airport_id),

    FOREIGN KEY (aircraft_id)
        REFERENCES aircraft(aircraft_id)
);

-- User Table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE,
  password TEXT
);