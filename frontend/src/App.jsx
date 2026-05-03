import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, FileText, LogOut, Bell, X, DollarSign, Clock } from 'lucide-react';
export default function App() {
  // --- Auth and UI States ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); 
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('admin');
  // --- DB States ---
  const [stats, setStats] = useState({ totalEmp: 0, totalPay: 0, totalRecords: 0 });
  const [employees, setEmployees] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  useEffect(() => {
    if (isAuthenticated && userRole === 'admin') {
      // Fetch Dashboard Stats
      fetch('http://localhost:3000/api/stats')
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(err => console.error("Error fetching stats:", err));
      // Fetch Employee Database
      fetch('http://localhost:3000/api/employees')
        .then(res => res.json())
        .then(data => setEmployees(data))
        .catch(err => console.error("Error fetching employees:", err));
      // Fetch Payroll History
      fetch('http://localhost:3000/api/all-payroll')
        .then(res => res.json())
        .then(data => setPayrolls(data))
        .catch(err => console.error("Error fetching payrolls:", err));
    }
  }, [isAuthenticated, userRole]);
  const handleLogin = (e) => {
    e.preventDefault();
    setUserRole(selectedRole);
    setIsAuthenticated(true);
  };
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setActiveTab('dashboard');
  };
  const changeTab = (e, tabName) => {
    e.preventDefault();
    setActiveTab(tabName);
  };
  // --- Component: Login Screen ---
  if (!isAuthenticated) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <div className="brand">
            <div className="logo-box">VIT</div>
            <h2>Tech Solutions</h2>
            <p>Payroll Management System</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Username</label>
              <input type="text" placeholder="Enter username" required />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" required />
            </div>
            <div className="input-group">
              <label>Login As</label>
              <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                <option value="admin">Administrator</option>
                <option value="employee">Staff Member</option>
              </select>
            </div>
            <button type="submit" className="btn-primary">Sign In</button>
          </form>
        </div>
      </div>
    );
  }
  // --- Component: Main Dashboard ---
  return (
    <div className="dashboard-container">
      {/*Sidebar*/}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-box-sm">VIT</div>
          <span>Tech Solutions</span>
        </div>
        <nav className="nav-menu">
          {userRole === 'admin' ? (
            <>
              <a href="#" className={activeTab === 'dashboard' ? 'active' : ''} onClick={(e) => changeTab(e, 'dashboard')}>
                <LayoutDashboard size={18} /> Dashboard
              </a>
              <a href="#" className={activeTab === 'employees' ? 'active' : ''} onClick={(e) => changeTab(e, 'employees')}>
                <Users size={18} /> All Employees
              </a>
              <a href="#" className={activeTab === 'payroll' ? 'active' : ''} onClick={(e) => changeTab(e, 'payroll')}>
                <FileText size={18} /> Payroll Records
              </a>
            </>
          ) : (
            <a href="#" className="active" onClick={(e) => e.preventDefault()}>
              <LayoutDashboard size={18} /> My Portal
            </a>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">{userRole === 'admin' ? 'A' : 'AS'}</div>
            <div className="user-details">
              <span className="u-name">{userRole === 'admin' ? 'Admin User' : 'Advaith S'}</span>
              <span className="u-role">{userRole === 'admin' ? 'Administrator' : 'Staff Member'}</span>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout} title="Log out">
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      {/*Main area*/}
      <main className="main-content">
        <header className="top-bar">
          <h2>
            {userRole === 'admin' && activeTab === 'dashboard' && 'Admin Overview'}
            {userRole === 'admin' && activeTab === 'employees' && 'Employee Database'}
            {userRole === 'admin' && activeTab === 'payroll' && 'Generated Payrolls'}
            {userRole !== 'admin' && 'Employee Portal'}
          </h2>
          <div className="top-actions">
            {userRole === 'admin' && (
              <button className="btn-outline" style={{ marginRight: '10px' }} onClick={() => setIsModalOpen(true)}>
                Generate Payroll
              </button>
            )}
            <Bell size={20} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} />
          </div>
        </header>
        <div className="content-scroll">
            {/*admin view: dashboard */}
            {userRole === 'admin' && activeTab === 'dashboard' && (
              <div>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon b-blue"><Users size={20} /></div>
                    <div className="stat-data"><span>Total Employees</span><h3>{stats.totalEmp || 0}</h3></div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon b-green"><DollarSign size={20} /></div>
                    <div className="stat-data"><span>Total Payroll Paid</span><h3>₹{stats.totalPay ? parseFloat(stats.totalPay).toLocaleString() : '0'}</h3></div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon b-orange"><Clock size={20} /></div>
                    <div className="stat-data"><span>Total Payslips</span><h3>{stats.totalRecords || 0}</h3></div>
                  </div>
                </div>
                <div className="table-container">
                  <div className="table-header">
                    <h3>Recent Employee Activity</h3>
                  </div>
                  <table>
                    <thead><tr><th>ID</th><th>Employee</th><th>Department</th><th>Status</th><th>Base Salary</th></tr></thead>
                    <tbody>
                      {employees.slice(0, 5).map(emp => (
                        <tr key={emp.EmployeeID}>
                          <td>#EMP-{emp.EmployeeID}</td>
                          <td><strong>{emp.Name}</strong></td>
                          <td>{emp.DeptName || 'Unassigned'}</td>
                          <td><span className="badge active">Active</span></td>
                          <td>₹{emp.BasicPay ? parseFloat(emp.BasicPay).toLocaleString() : '0'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {/*admin view: employees*/}
            {userRole === 'admin' && activeTab === 'employees' && (
              <div className="table-container">
                <div className="table-header"><h3>Complete Employee Database</h3></div>
                <table>
                  <thead><tr><th>Emp ID</th><th>Full Name</th><th>Department</th><th>Status</th><th>Basic Pay</th></tr></thead>
                  <tbody>
                    {employees.map(emp => (
                      <tr key={emp.EmployeeID}>
                        <td>#EMP-{emp.EmployeeID}</td>
                        <td><strong>{emp.Name}</strong></td>
                        <td>{emp.DeptName || 'Unassigned'}</td>
                        <td><span className="badge active">Active</span></td>
                        <td>₹{emp.BasicPay ? parseFloat(emp.BasicPay).toLocaleString() : '0'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/*admin view: payroll*/}
            {userRole === 'admin' && activeTab === 'payroll' && (
              <div className="table-container">
                <div className="table-header"><h3>Complete Payroll History</h3></div>
                <table>
                  <thead><tr><th>Payslip ID</th><th>Employee Name</th><th>Period</th><th>Status</th><th>Net Salary</th></tr></thead>
                  <tbody>
                    {payrolls.map(p => (
                      <tr key={p.PayslipID}>
                        <td>#PAY-{p.PayslipID}</td>
                        <td><strong>{p.Name}</strong></td>
                        <td>{p.Month} {p.Year}</td>
                        <td><span className="badge active" style={{background:'#dbeafe', color:'#1e40af'}}>Paid</span></td>
                        <td><strong>₹{parseFloat(p.NetSalary).toLocaleString()}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/*view emp portal*/}
            {userRole === 'employee' && (
               <div style={{ padding: '20px', background: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
                 <h3>Welcome back!</h3>
                 <p>Your employee dashboard will populate here.</p>
               </div>
            )}

        </div>
      </main>
      {/*modal*/}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Generate Monthly Payroll</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Select an employee from the database to calculate salary.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}