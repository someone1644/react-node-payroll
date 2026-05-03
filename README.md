# Modern Payroll Management System

A full-stack enterprise payroll dashboard engineered with a React frontend, Node.js/Express backend, and a secure MySQL database. This system allows administrators to manage employee records, calculate dynamic salary structures, and track monthly payroll disbursements.

## Tech Stack
* **Frontend:** React, Vite, Lucide-React (Icons), Custom CSS
* **Backend:** Node.js, Express.js
* **Database:** MySQL
* **Security:** Environment Variables (`dotenv`) for secure credential management

## Key Features
* **Role-Based UI:** Dynamic routing and component rendering based on 'Admin' vs 'Employee' authentication state.
* **RESTful API Engine:** Custom backend endpoints to serve database queries to the frontend asynchronously.
* **Dynamic Relational Database:** Utilizes foreign keys and cascading deletes across `Department`, `Employee`, `SalaryStructure`, and `Payroll_Record` tables.
* **Advanced SQL Metrics:** Leverages advanced `GROUP BY` queries to calculate total departmental liability in real-time.

## Local Installation & Setup

### 1. Database Setup
Ensure you have MySQL running (locally or via Docker).
Execute the provided `schema.sql` script in your MySQL instance to build the tables and inject dummy data.

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with your database credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=PayrollSystem
PORT=3000
```

Start the server: node server.js

### 3. Frontend Setup:
```
cd frontend
npm install
npm run dev
```