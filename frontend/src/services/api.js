/**
 * API Service for HRMS Lite
 * Handles all backend communication
 */

// Use environment variable or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(url, config);

        // Handle no-content responses
        if (response.status === 204) {
            return null;
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            throw new Error('Unable to connect to the server. Please check if the backend is running.');
        }
        throw error;
    }
}

// ===== EMPLOYEE API =====

export async function getEmployees() {
    return fetchAPI('/employees');
}

export async function getEmployee(employeeId) {
    return fetchAPI(`/employees/${employeeId}`);
}

export async function createEmployee(employee) {
    return fetchAPI('/employees', {
        method: 'POST',
        body: JSON.stringify(employee),
    });
}

export async function deleteEmployee(employeeId) {
    return fetchAPI(`/employees/${employeeId}`, {
        method: 'DELETE',
    });
}

export async function updateEmployee(employeeId, employee) {
    return fetchAPI(`/employees/${employeeId}`, {
        method: 'PUT',
        body: JSON.stringify(employee),
    });
}

// ===== ATTENDANCE API =====

export async function getAttendance(filters = {}) {
    const params = new URLSearchParams();
    if (filters.date) params.append('date_filter', filters.date);
    if (filters.employeeId) params.append('employee_id', filters.employeeId);

    const queryString = params.toString();
    return fetchAPI(`/attendance${queryString ? `?${queryString}` : ''}`);
}

export async function getEmployeeAttendance(employeeId) {
    return fetchAPI(`/attendance/employee/${employeeId}`);
}

export async function getAttendanceSummary(employeeId) {
    return fetchAPI(`/attendance/summary/${employeeId}`);
}

export async function markAttendance(attendance) {
    return fetchAPI('/attendance', {
        method: 'POST',
        body: JSON.stringify(attendance),
    });
}

export async function deleteAttendance(attendanceId) {
    return fetchAPI(`/attendance/${attendanceId}`, {
        method: 'DELETE',
    });
}

// ===== STATS API =====

export async function getStats() {
    return fetchAPI('/stats');
}

export default {
    getEmployees,
    getEmployee,
    createEmployee,
    deleteEmployee,
    updateEmployee,
    getAttendance,
    getEmployeeAttendance,
    getAttendanceSummary,
    markAttendance,
    deleteAttendance,
    getStats,
};
