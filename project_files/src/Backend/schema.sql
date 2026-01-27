-- SQLite database schema for CSC4710 Airline Simulation
PRAGMA foreign_keys = ON;


-- Static reference data

CREATE TABLE IF NOT EXISTS airport (
  airport_id        INTEGER PRIMARY KEY,
  iata_code         TEXT    NOT NULL UNIQUE CHECK (length(iata_code) = 3),
  name              TEXT    NOT NULL,
  city              TEXT,
  state_region      TEXT,
  country           TEXT,
  latitude          REAL,
  longitude         REAL,
  metro_population  INTEGER,
  is_hub            INTEGER NOT NULL DEFAULT 0 CHECK (is_hub IN (0,1))
);

CREATE TABLE IF NOT EXISTS airport_gate (
  gate_id     INTEGER PRIMARY KEY,
  airport_id  INTEGER NOT NULL,
  gate_code   TEXT    NOT NULL,
  is_active   INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1)),
  FOREIGN KEY (airport_id) REFERENCES airport(airport_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  UNIQUE (airport_id, gate_code)
);

CREATE TABLE IF NOT EXISTS aircraft_type (
  aircraft_type_id      INTEGER PRIMARY KEY,
  type_code             TEXT    NOT NULL UNIQUE,
  manufacturer          TEXT,
  model                 TEXT,
  seat_capacity         INTEGER NOT NULL CHECK (seat_capacity >= 0),
  cruise_airspeed_kmh   REAL,
  max_airspeed_kmh      REAL,
  lease_cost_usd_month  REAL
);

CREATE TABLE IF NOT EXISTS aircraft (
  aircraft_id       INTEGER PRIMARY KEY,
  tail_number       TEXT    NOT NULL UNIQUE,
  aircraft_type_id  INTEGER NOT NULL,
  in_service        INTEGER NOT NULL DEFAULT 1 CHECK (in_service IN (0,1)),
  notes             TEXT,
  FOREIGN KEY (aircraft_type_id) REFERENCES aircraft_type(aircraft_type_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS exchange_rate (
  rate_date   TEXT PRIMARY KEY,                -- YYYY-MM-DD (month end)
  eur_to_usd  REAL NOT NULL CHECK (eur_to_usd > 0)
);

CREATE TABLE IF NOT EXISTS scenario_day (
  scenario_day  INTEGER PRIMARY KEY CHECK (scenario_day BETWEEN 1 AND 14),
  description   TEXT
);

-- Timetable

CREATE TABLE IF NOT EXISTS scheduled_trip (
  scheduled_trip_id  INTEGER PRIMARY KEY,
  trip_code          TEXT UNIQUE,
  valid_from_date    TEXT,                     -- YYYY-MM-DD (optional)
  valid_to_date      TEXT,                     -- YYYY-MM-DD (optional)
  CHECK (
    valid_from_date IS NULL OR valid_to_date IS NULL OR valid_from_date <= valid_to_date
  )
);

CREATE TABLE IF NOT EXISTS scheduled_flight (
  scheduled_flight_id        INTEGER PRIMARY KEY,
  scheduled_trip_id          INTEGER NOT NULL,
  origin_airport_id          INTEGER NOT NULL,
  dest_airport_id            INTEGER NOT NULL,
  aircraft_id                INTEGER,          -- optional until finalized
  leg_seq                    INTEGER NOT NULL DEFAULT 1 CHECK (leg_seq >= 1),
  flight_number              TEXT    NOT NULL,
  sched_depart_local_time    TEXT    NOT NULL, -- HH:MM or HH:MM:SS
  sched_arrive_local_time    TEXT    NOT NULL, -- HH:MM or HH:MM:SS
  distance_km                REAL,
  planned_block_minutes      INTEGER CHECK (planned_block_minutes >= 0),
  seat_capacity              INTEGER CHECK (seat_capacity >= 0),
  FOREIGN KEY (scheduled_trip_id) REFERENCES scheduled_trip(scheduled_trip_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (origin_airport_id) REFERENCES airport(airport_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (dest_airport_id) REFERENCES airport(airport_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (aircraft_id) REFERENCES aircraft(aircraft_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CHECK (origin_airport_id <> dest_airport_id),
  UNIQUE (scheduled_trip_id, leg_seq)
);

CREATE TABLE IF NOT EXISTS scheduled_operating_day (
  scheduled_operating_day_id  INTEGER PRIMARY KEY,
  scheduled_flight_id         INTEGER NOT NULL,
  service_date                TEXT    NOT NULL, -- YYYY-MM-DD
  sched_depart_dt_local       TEXT    NOT NULL, -- ISO8601 local datetime string
  sched_arrive_dt_local       TEXT    NOT NULL, -- ISO8601 local datetime string
  FOREIGN KEY (scheduled_flight_id) REFERENCES scheduled_flight(scheduled_flight_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  UNIQUE (scheduled_flight_id, service_date),
  CHECK (sched_depart_dt_local <= sched_arrive_dt_local)
);

-- Simulation of flights

CREATE TABLE IF NOT EXISTS sim_flight (
  sim_flight_id          INTEGER PRIMARY KEY,
  scheduled_flight_id    INTEGER,              -- nullable
  scenario_day           INTEGER NOT NULL,     
  aircraft_id            INTEGER NOT NULL,
  origin_airport_id      INTEGER NOT NULL,
  dest_airport_id        INTEGER NOT NULL,
  flight_number          TEXT    NOT NULL,
  sched_depart_dt_local  TEXT    NOT NULL,
  actual_depart_dt_local TEXT,                 -- nullable
  sched_arrive_dt_local  TEXT    NOT NULL,
  actual_arrive_dt_local TEXT,                 -- nullable
  status                 TEXT    NOT NULL DEFAULT 'SCHEDULED'
    CHECK (status IN ('SCHEDULED','DEPARTED','ARRIVED','CANCELLED')),
  passengers_count       INTEGER NOT NULL DEFAULT 0 CHECK (passengers_count >= 0),
  delay_minutes_total    INTEGER NOT NULL DEFAULT 0 CHECK (delay_minutes_total >= 0),
  cancel_reason          TEXT,
  FOREIGN KEY (scheduled_flight_id) REFERENCES scheduled_flight(scheduled_flight_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  FOREIGN KEY (scenario_day) REFERENCES scenario_day(scenario_day)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (aircraft_id) REFERENCES aircraft(aircraft_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (origin_airport_id) REFERENCES airport(airport_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (dest_airport_id) REFERENCES airport(airport_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CHECK (origin_airport_id <> dest_airport_id),
  CHECK (sched_depart_dt_local <= sched_arrive_dt_local)
);

CREATE TABLE IF NOT EXISTS sim_flight_delay_event (
  delay_event_id  INTEGER PRIMARY KEY,
  sim_flight_id   INTEGER NOT NULL,
  delay_type      TEXT    NOT NULL
    CHECK (delay_type IN ('WEATHER_ENROUTE','ICING_GROUND','GATE_HOLD','JETSTREAM_ADJUST','OTHER')),
  minutes         INTEGER NOT NULL CHECK (minutes > 0),
  notes           TEXT,
  FOREIGN KEY (sim_flight_id) REFERENCES sim_flight(sim_flight_id)
    ON UPDATE CASCADE ON DELETE CASCADE
);

-- Simulation of passengers

CREATE TABLE IF NOT EXISTS passenger (
  passenger_id     INTEGER PRIMARY KEY,
  home_airport_id  INTEGER,
  FOREIGN KEY (home_airport_id) REFERENCES airport(airport_id)
    ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS passenger_itinerary (
  itinerary_id       INTEGER PRIMARY KEY,
  passenger_id       INTEGER NOT NULL,
  source_airport_id  INTEGER NOT NULL,
  dest_airport_id    INTEGER NOT NULL,
  service_date       TEXT    NOT NULL, -- YYYY-MM-DD
  status             TEXT    NOT NULL DEFAULT 'PLANNED'
    CHECK (status IN ('PLANNED','FLOWN','DISRUPTED','CANCELLED')),
  FOREIGN KEY (passenger_id) REFERENCES passenger(passenger_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (source_airport_id) REFERENCES airport(airport_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (dest_airport_id) REFERENCES airport(airport_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CHECK (source_airport_id <> dest_airport_id)
);

CREATE TABLE IF NOT EXISTS passenger_leg (
  passenger_leg_id       INTEGER PRIMARY KEY,
  itinerary_id           INTEGER NOT NULL,
  sim_flight_id          INTEGER NOT NULL,
  leg_seq                INTEGER NOT NULL CHECK (leg_seq >= 1),
  origin_airport_id      INTEGER NOT NULL,
  dest_airport_id        INTEGER NOT NULL,
  sched_depart_dt_local  TEXT,
  actual_depart_dt_local TEXT,
  sched_arrive_dt_local  TEXT,
  actual_arrive_dt_local TEXT,
  FOREIGN KEY (itinerary_id) REFERENCES passenger_itinerary(itinerary_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (sim_flight_id) REFERENCES sim_flight(sim_flight_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (origin_airport_id) REFERENCES airport(airport_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (dest_airport_id) REFERENCES airport(airport_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  UNIQUE (itinerary_id, leg_seq),
  CHECK (origin_airport_id <> dest_airport_id)
);

-- Gates and movement

CREATE TABLE IF NOT EXISTS gate_occupancy (
  gate_occ_id           INTEGER PRIMARY KEY,
  gate_id               INTEGER NOT NULL,
  sim_flight_id          INTEGER NOT NULL,
  aircraft_id            INTEGER NOT NULL,
  occupy_start_dt_local  TEXT    NOT NULL,
  occupy_end_dt_local    TEXT    NOT NULL,
  arriving_pax           INTEGER NOT NULL DEFAULT 0 CHECK (arriving_pax >= 0),
  departing_pax          INTEGER NOT NULL DEFAULT 0 CHECK (departing_pax >= 0),
  FOREIGN KEY (gate_id) REFERENCES airport_gate(gate_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (sim_flight_id) REFERENCES sim_flight(sim_flight_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (aircraft_id) REFERENCES aircraft(aircraft_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CHECK (occupy_start_dt_local <= occupy_end_dt_local)
);

CREATE TABLE IF NOT EXISTS tarmac_wait (
  tarmac_wait_id     INTEGER PRIMARY KEY,
  sim_flight_id      INTEGER NOT NULL,
  airport_id         INTEGER NOT NULL,
  wait_start_dt_local TEXT   NOT NULL,
  wait_end_dt_local   TEXT   NOT NULL,
  minutes            INTEGER CHECK (minutes >= 0),
  FOREIGN KEY (sim_flight_id) REFERENCES sim_flight(sim_flight_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (airport_id) REFERENCES airport(airport_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CHECK (wait_start_dt_local <= wait_end_dt_local)
);

-- Aircraft daily status and maintenance

CREATE TABLE IF NOT EXISTS aircraft_daily_status (
  aircraft_id                         INTEGER NOT NULL,
  service_date                        TEXT    NOT NULL, -- YYYY-MM-DD
  start_airport_id                    INTEGER NOT NULL,
  end_airport_id                      INTEGER NOT NULL,
  flight_minutes                      INTEGER NOT NULL DEFAULT 0 CHECK (flight_minutes >= 0),
  flight_hours_cumulative_since_maint REAL    NOT NULL DEFAULT 0 CHECK (flight_hours_cumulative_since_maint >= 0),
  is_out_of_service                   INTEGER NOT NULL DEFAULT 0 CHECK (is_out_of_service IN (0,1)),
  PRIMARY KEY (aircraft_id, service_date),
  FOREIGN KEY (aircraft_id) REFERENCES aircraft(aircraft_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (start_airport_id) REFERENCES airport(airport_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (end_airport_id) REFERENCES airport(airport_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CHECK (start_airport_id <> end_airport_id OR flight_minutes = 0 OR flight_minutes IS NOT NULL)
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS maintenance_event (
  maintenance_id    INTEGER PRIMARY KEY,
  aircraft_id       INTEGER NOT NULL,
  hub_airport_id    INTEGER NOT NULL,
  maintenance_type  TEXT    NOT NULL
    CHECK (maintenance_type IN ('SCHEDULED_200H','UNSCHEDULED_FAILURE')),
  start_dt_local    TEXT    NOT NULL,
  end_dt_local      TEXT    NOT NULL,
  notes             TEXT,
  FOREIGN KEY (aircraft_id) REFERENCES aircraft(aircraft_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (hub_airport_id) REFERENCES airport(airport_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CHECK (start_dt_local <= end_dt_local)
);

-- Financials

CREATE TABLE IF NOT EXISTS flight_financials (
  flight_fin_id             INTEGER PRIMARY KEY,
  sim_flight_id             INTEGER NOT NULL UNIQUE,
  revenue_usd               REAL    NOT NULL DEFAULT 0,
  fuel_cost_usd             REAL    NOT NULL DEFAULT 0,
  takeoff_landing_fees_usd  REAL    NOT NULL DEFAULT 0,
  terminal_fees_usd         REAL    NOT NULL DEFAULT 0,
  other_costs_usd           REAL    NOT NULL DEFAULT 0,
  FOREIGN KEY (sim_flight_id) REFERENCES sim_flight(sim_flight_id)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS monthly_aircraft_lease_cost (
  aircraft_id     INTEGER NOT NULL,
  month_end_date  TEXT    NOT NULL,  -- YYYY-MM-DD (month end)
  lease_cost_usd  REAL    NOT NULL CHECK (lease_cost_usd >= 0),
  PRIMARY KEY (aircraft_id, month_end_date),
  FOREIGN KEY (aircraft_id) REFERENCES aircraft(aircraft_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (month_end_date) REFERENCES exchange_rate(rate_date)
    ON UPDATE CASCADE ON DELETE RESTRICT
) WITHOUT ROWID;