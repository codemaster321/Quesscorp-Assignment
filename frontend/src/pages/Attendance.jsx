import { useState, useEffect } from 'react';
import { getEmployees, getAttendance, markAttendance, getAttendanceSummary } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const PlusIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const CalendarIcon = () => (
    <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const FilterIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
);

const SearchIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

function Attendance({ addToast }) {
    const [employees, setEmployees] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [summary, setSummary] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        employee_id: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Present'
    });

    // Filter state
    const [filters, setFilters] = useState({
        date: '',
        employee_id: ''
    });
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch initial data
    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const [employeesData, attendanceData] = await Promise.all([
                    getEmployees(),
                    getAttendance()
                ]);
                setEmployees(employeesData.employees);
                setAttendance(attendanceData.records);
            } catch (err) {
                addToast(err.message, 'error');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Fetch filtered attendance
    async function fetchAttendance() {
        try {
            const data = await getAttendance(filters);
            setAttendance(data.records);
        } catch (err) {
            addToast(err.message, 'error');
        }
    }

    // Apply filters
    useEffect(() => {
        if (!loading) {
            fetchAttendance();
        }
    }, [filters]);

    // Fetch employee summary when selected
    useEffect(() => {
        async function fetchSummary() {
            if (selectedEmployee) {
                try {
                    const data = await getAttendanceSummary(selectedEmployee);
                    setSummary(data);
                } catch (err) {
                    setSummary(null);
                }
            } else {
                setSummary(null);
            }
        }
        fetchSummary();
    }, [selectedEmployee]);

    // Handle mark attendance
    async function handleSubmit(e) {
        e.preventDefault();

        if (!formData.employee_id) {
            addToast('Please select an employee', 'warning');
            return;
        }

        try {
            setIsSubmitting(true);
            await markAttendance(formData);
            addToast(`Attendance marked as ${formData.status}`, 'success');

            // Refresh data
            fetchAttendance();

            // Reset form
            setFormData(prev => ({
                ...prev,
                employee_id: '',
                status: 'Present'
            }));

            // Refresh summary if viewing the same employee
            if (selectedEmployee === formData.employee_id) {
                const data = await getAttendanceSummary(selectedEmployee);
                setSummary(data);
            }
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    }

    // Clear filters
    function clearFilters() {
        setFilters({ date: '', employee_id: '' });
    }

    if (loading) {
        return <LoadingSpinner text="Loading attendance data..." />;
    }

    return (
        <div>
            <header className="page-header">
                <h1 className="page-title">Attendance</h1>
                <p className="page-subtitle">Track and manage employee attendance records</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
                {/* Left Column - Mark Attendance */}
                <div>
                    {/* Mark Attendance Form */}
                    <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                        <div className="card-header">
                            <h3 className="card-title">Mark Attendance</h3>
                        </div>
                        <div className="card-body">
                            {employees.length === 0 ? (
                                <p style={{ color: 'var(--grey-500)', textAlign: 'center' }}>
                                    Add employees first to mark attendance
                                </p>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="mark-employee">Employee *</label>
                                        <select
                                            id="mark-employee"
                                            className="form-select"
                                            value={formData.employee_id}
                                            onChange={(e) => setFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                                        >
                                            <option value="">Select employee</option>
                                            {employees.map((emp) => (
                                                <option key={emp.id} value={emp.employee_id}>
                                                    {emp.full_name} ({emp.employee_id})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="mark-date">Date *</label>
                                        <input
                                            type="date"
                                            id="mark-date"
                                            className="form-input"
                                            value={formData.date}
                                            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Status *</label>
                                        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    value="Present"
                                                    checked={formData.status === 'Present'}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                                />
                                                <span className="badge badge-success">Present</span>
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    value="Absent"
                                                    checked={formData.status === 'Absent'}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                                />
                                                <span className="badge badge-danger">Absent</span>
                                            </label>
                                        </div>
                                    </div>

                                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
                                        <PlusIcon />
                                        {isSubmitting ? 'Marking...' : 'Mark Attendance'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Employee Summary */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Employee Summary</h3>
                        </div>
                        <div className="card-body">
                            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                                <select
                                    className="form-select"
                                    value={selectedEmployee || ''}
                                    onChange={(e) => setSelectedEmployee(e.target.value || null)}
                                >
                                    <option value="">Select employee to view summary</option>
                                    {employees.map((emp) => (
                                        <option key={emp.id} value={emp.employee_id}>
                                            {emp.full_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {summary ? (
                                <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                                    <div style={{
                                        padding: 'var(--space-4)',
                                        background: 'var(--grey-50)',
                                        borderRadius: 'var(--radius-md)',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', color: 'var(--primary-600)' }}>
                                            {summary.attendance_percentage}%
                                        </div>
                                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--grey-500)' }}>
                                            Attendance Rate
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)', textAlign: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-semibold)' }}>
                                                {summary.total_days}
                                            </div>
                                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--grey-500)' }}>Total Days</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-semibold)', color: 'var(--success)' }}>
                                                {summary.present_days}
                                            </div>
                                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--grey-500)' }}>Present</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-semibold)', color: 'var(--danger)' }}>
                                                {summary.absent_days}
                                            </div>
                                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--grey-500)' }}>Absent</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p style={{ color: 'var(--grey-400)', textAlign: 'center', fontSize: 'var(--text-sm)' }}>
                                    Select an employee to view their attendance summary
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Attendance Records */}
                <div className="card">
                    <div className="card-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 className="card-title">Attendance Records</h3>
                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--grey-500)' }}>
                                {attendance.length} record{attendance.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        {/* Filters */}
                        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <FilterIcon />
                                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--grey-600)' }}>Filter:</span>
                            </div>

                            <input
                                type="date"
                                className="form-input"
                                style={{ width: 'auto', padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-sm)' }}
                                value={filters.date}
                                onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                                placeholder="Date"
                            />

                            <select
                                className="form-select"
                                style={{ width: 'auto', padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-sm)' }}
                                value={filters.employee_id}
                                onChange={(e) => setFilters(prev => ({ ...prev, employee_id: e.target.value }))}
                            >
                                <option value="">All employees</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.employee_id}>{emp.full_name}</option>
                                ))}
                            </select>

                            {(filters.date || filters.employee_id) && (
                                <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                                    Clear
                                </button>
                            )}

                            <div className="search-container" style={{ position: 'relative', flex: '1', maxWidth: '300px', marginLeft: 'auto' }}>
                                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--grey-400)' }}>
                                    <SearchIcon />
                                </span>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Search by name or ID..."
                                    style={{ paddingLeft: '32px', paddingBottom: 'var(--space-2)', paddingTop: 'var(--space-2)', fontSize: 'var(--text-sm)' }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card-body" style={{ padding: 0 }}>
                        {attendance.length === 0 ? (
                            <EmptyState
                                icon={<CalendarIcon />}
                                title="No attendance records"
                                description={filters.date || filters.employee_id
                                    ? "No records match your filters. Try adjusting the filters."
                                    : "Start by marking attendance for employees."
                                }
                            />
                        ) : (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Employee ID</th>
                                            <th>Employee Name</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Marked At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendance
                                            .filter(record =>
                                                record.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                record.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
                                            )
                                            .map((record) => (
                                                <tr key={record.id}>
                                                    <td>
                                                        <span className="badge badge-neutral">{record.employee_id}</span>
                                                    </td>
                                                    <td style={{ fontWeight: 'var(--font-medium)' }}>
                                                        {record.employee_name || 'Unknown'}
                                                    </td>
                                                    <td>{new Date(record.date).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}</td>
                                                    <td>
                                                        <span className={`badge ${record.status === 'Present' ? 'badge-success' : 'badge-danger'}`}>
                                                            {record.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ color: 'var(--grey-500)', fontSize: 'var(--text-sm)' }}>
                                                        {new Date(record.marked_at).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Attendance;
