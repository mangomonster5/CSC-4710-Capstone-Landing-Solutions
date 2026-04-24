### ~ Panther Cloud Air — Landing Solutions ~ ###

Panther Cloud Air is a full-stack airline operations simulation built by Landing Solutions for CSC 4710 at High Point University. The system simulates 14 days of real airline operations across a 55-aircraft fleet, connecting the top 30 U.S. airports and an international route to Paris (CDG). It models passenger demand, flight scheduling, fuel and operating costs, ticket pricing, and aircraft maintenance — storing all simulation data in a pre-populated SQLite database. The application provides a React + TypeScript frontend with role-based access for employees and administrators, backed by a Node.js/Express API that serves all flight, airport, and aircraft data.

---

<u>Tech Stack<u>

- **Frontend:** React, TypeScript, Bootstrap
- **Backend:** Node.js, Express
- **Database:** SQLite
- **Auth:** bcrypt password hashing
- **Containerization:** Docker

---

<u>Prerequisites<u>

To run the application, prepare your device, and install the following:

- [Node.js](https://nodejs.org/) 
- [npm](https://www.npmjs.com/)
- [Git](https://git-scm.com/)

---

<u>Setup<u>

### 1. Clone the repository

```bash
git clone https://github.com/mangomonster5/CSC-4710-Capstone-Landing-Solutions.git
cd CSC-4710-Capstone-Landing-Solutions
```

### 2. Start the backend server using our scripts

```bash
npm run setup
npm run docker:build
npm start app
```

The backend will start on **http://localhost:3000**. The window of your default browser should open to the login page.

### 3. Start the frontend (in a new terminal)

```bash
cd project_files/Frontend
npm install
npm start
```

The frontend will open on **http://localhost:3000**.

---

<u>Features<u>

- **Flight Info** — Search 250+ daily flights by flight number, route, aircraft tail number, gate, or status
- **All Flights** — Full 14-day timetable view with sim day selector
- **Flight Selection** — Book flights with From/To airport filtering, departure/return day picker, and live seat availability
- **Admin Panel** — Adjust simulation day, view company-wide financials, and manage operational data

---

<u>Team<u>

| Name | Role | 
|------|------|----------------------------|
| Kamryn Wagner | Project Leader           |
| Jimi Adegoroye| Principal Trainer        |
| Finley Myers  | Principal Developer      |
| Sean Harder   | Documentation Specialist |
| Jack Jaramillo| Quality Assurance Manager|

---

*CSC 4710 — Software Engineering Capstone | High Point University | Spring 2026*
