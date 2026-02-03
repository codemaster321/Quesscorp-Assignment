import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';

function App() {
    const [toasts, setToasts] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
    const closeSidebar = () => setIsSidebarOpen(false);

    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 4000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    return (
        <BrowserRouter>
            <div className={`app-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
                <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />

                {/* Mobile Header Toggle */}
                <button className="mobile-menu-toggle" onClick={toggleSidebar}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px' }}>
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>

                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard addToast={addToast} />} />
                        <Route path="/employees" element={<Employees addToast={addToast} />} />
                        <Route path="/attendance" element={<Attendance addToast={addToast} />} />
                    </Routes>
                </main>

                {/* Toast Notifications */}
                <div className="toast-container">
                    {toasts.map(toast => (
                        <Toast
                            key={toast.id}
                            message={toast.message}
                            type={toast.type}
                            onClose={() => removeToast(toast.id)}
                        />
                    ))}
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;
