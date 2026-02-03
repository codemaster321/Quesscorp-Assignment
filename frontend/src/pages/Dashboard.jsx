import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStats, getEmployees, getAttendance } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

// Icons
const UsersIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px' }}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const CalendarIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px' }}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px' }}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

const XIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px' }}>
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
);

function Dashboard({ addToast }) {
    const [stats, setStats] = useState(null);
    const [recentEmployees, setRecentEmployees] = useState([]);
    const [recentAttendance, setRecentAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                setLoading(true);
                setError(null);

                const [statsData, employeesData, attendanceData] = await Promise.all([
                    getStats(),
                    getEmployees(),
                    getAttendance(),
                ]);

                setStats(statsData);
                setRecentEmployees(employeesData.employees.slice(0, 5));
                setRecentAttendance(attendanceData.records.slice(0, 5));
            } catch (err) {
                setError(err.message);
                addToast(err.message, 'error');
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, [addToast]);

    if (loading) {
        return <LoadingSpinner text="Loading dashboard..." />;
    }

    if (error) {
        return (
            <div className="card">
                <div className="card-body" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                    <p style={{ color: 'var(--danger)', marginBottom: 'var(--space-4)' }}>
                        Failed to load dashboard data
                    </p>
                    <p style={{ color: 'var(--grey-500)', fontSize: 'var(--text-sm)' }}>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <header className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Welcome to HRMS Lite - Your employee and attendance management system</p>
            </header>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon primary">
                        <UsersIcon />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats?.total_employees || 0}</div>
                        <div className="stat-label">Total Employees</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon warning">
                        <CalendarIcon />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats?.total_attendance_records || 0}</div>
                        <div className="stat-label">Attendance Records</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon success">
                        <CheckIcon />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats?.present_count || 0}</div>
                        <div className="stat-label">Present Days</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon danger">
                        <XIcon />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats?.absent_count || 0}</div>
                        <div className="stat-label">Absent Days</div>
                    </div>
                </div>
            </div>

            {/* Recent Data */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-6)' }}>
                {/* Recent Employees */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Recent Employees</h3>
                        <Link to="/employees" className="btn btn-ghost btn-sm">View All</Link>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        {recentEmployees.length === 0 ? (
                            <p style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--grey-500)' }}>
                                No employees yet
                            </p>
                        ) : (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Department</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentEmployees.map((emp) => (
                                        <tr key={emp.id}>
                                            <td>{emp.employee_id}</td>
                                            <td>{emp.full_name}</td>
                                            <td>{emp.department}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Recent Attendance */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Recent Attendance</h3>
                        <Link to="/attendance" className="btn btn-ghost btn-sm">View All</Link>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        {recentAttendance.length === 0 ? (
                            <p style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--grey-500)' }}>
                                No attendance records yet
                            </p>
                        ) : (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentAttendance.map((record) => (
                                        <tr key={record.id}>
                                            <td>{record.employee_name || record.employee_id}</td>
                                            <td>{new Date(record.date).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`badge ${record.status === 'Present' ? 'badge-success' : 'badge-danger'}`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
