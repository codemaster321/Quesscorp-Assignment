import { NavLink } from 'react-router-dom';

// SVG Icons as components
const DashboardIcon = () => (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
);

const EmployeesIcon = () => (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const AttendanceIcon = () => (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M9 16l2 2 4-4" />
    </svg>
);

function Sidebar({ isOpen, closeSidebar }) {
    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-brand">
                    <div className="sidebar-logo">HR</div>
                    <h1 className="sidebar-title">HRMS Lite</h1>
                </div>

                <nav className="sidebar-nav">
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={closeSidebar}
                    >
                        <DashboardIcon />
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/employees"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={closeSidebar}
                    >
                        <EmployeesIcon />
                        Employees
                    </NavLink>

                    <NavLink
                        to="/attendance"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={closeSidebar}
                    >
                        <AttendanceIcon />
                        Attendance
                    </NavLink>
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--grey-700)' }}>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--grey-500)' }}>
                        HRMS Lite v1.0
                    </p>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
