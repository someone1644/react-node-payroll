require('dotenv').config(); // Load environment variables first
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Use process.env to access the secure variables
const db = mysql.createConnection({
    host: process.env.DB_HOST, 
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME 
});

db.connect((err) => {
    if (err) console.error('Database connection failed:', err.message);
    else console.log('Connected to MySQL Database securely!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Node Server running on http://localhost:${PORT}`));

// 1. Get Employee Salary Details (For the Modal)
app.get('/api/salary/:id', (req, res) => {
    const empId = req.params.id;
    const sql = `
        SELECT e.Name, s.BasicPay, s.HRA_Percentage, s.AllowanceAmount, s.PF_Percentage, s.Tax_Percentage 
        FROM Employee e
        JOIN SalaryStructure s ON e.EmployeeID = s.EmployeeID
        WHERE e.EmployeeID = ?
    `;
    db.query(sql, [empId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "Employee not found" });
        res.json(result[0]); 
    });
});

// 2. Save Generated Payroll
app.post('/api/payroll', (req, res) => {
    const { employeeId, month, year, gross, pf, tax, leave, net } = req.body;
    const getSalIdSql = "SELECT SalaryID FROM SalaryStructure WHERE EmployeeID = ?";
    
    db.query(getSalIdSql, [employeeId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: "Salary structure not found" });
        
        const salaryId = results[0].SalaryID;
        const insertSql = `
            INSERT INTO Payroll_Record 
            (EmployeeID, SalaryID, Month, Year, GrossSalary, PF_Deduction, Tax_Deduction, Leave_Deduction, NetSalary) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(insertSql, [employeeId, salaryId, month, year, gross, pf, tax, leave, net], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Success! Payroll permanently saved to database." });
        });
    });
});

// 3. Get Employee's Latest Payslip (For Employee Portal)
app.get('/api/mypayslips/:id', (req, res) => {
    const empId = req.params.id;
    const sql = `SELECT Month, Year, NetSalary FROM Payroll_Record WHERE EmployeeID = ? ORDER BY PayslipID DESC LIMIT 1`;
    db.query(sql, [empId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.json({ NetSalary: 0, Month: "No Data" });
        res.json(results[0]); 
    });
});

// 4. NEW: Get ALL Employees for the Full Table & Dropdown
app.get('/api/employees', (req, res) => {
    const sql = `
        SELECT e.EmployeeID, e.Name, d.DeptName, s.BasicPay 
        FROM Employee e
        LEFT JOIN Department d ON e.DeptID = d.DeptID
        LEFT JOIN SalaryStructure s ON e.EmployeeID = s.EmployeeID
    `;
    db.query(sql, (err, results) => res.json(results));
});

// 5. NEW: Get ALL Payroll Records for the Full Table
app.get('/api/all-payroll', (req, res) => {
    const sql = `
        SELECT p.PayslipID, e.Name, p.Month, p.Year, p.NetSalary 
        FROM Payroll_Record p
        JOIN Employee e ON p.EmployeeID = e.EmployeeID
        ORDER BY p.PayslipID DESC
    `;
    db.query(sql, (err, results) => res.json(results));
});

// 6. NEW: Get Dashboard Statistics
app.get('/api/stats', (req, res) => {
    const sql = `
        SELECT 
            (SELECT COUNT(*) FROM Employee) as totalEmp,
            (SELECT SUM(NetSalary) FROM Payroll_Record) as totalPay,
            (SELECT COUNT(*) FROM Payroll_Record) as totalRecords
        FROM dual
    `;
    db.query(sql, (err, results) => res.json(results[0]));
});

// 7. NEW: Advanced GROUP BY Query - Department Cost Breakdown
app.get('/api/dept-cost', (req, res) => {
    const sql = `
        SELECT 
            d.DeptName, 
            IFNULL(SUM(s.BasicPay + s.AllowanceAmount), 0) AS TotalCost
        FROM Department d
        LEFT JOIN Employee e ON d.DeptID = e.DeptID
        LEFT JOIN SalaryStructure s ON e.EmployeeID = s.EmployeeID
        GROUP BY d.DeptID, d.DeptName
        ORDER BY TotalCost DESC
    `;
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.listen(3000, () => console.log('Node Server running on http://localhost:3000'));