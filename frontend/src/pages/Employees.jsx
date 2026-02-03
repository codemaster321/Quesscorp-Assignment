import { useState, useEffect } from 'react';
import { getEmployees, createEmployee, deleteEmployee } from '../services/api';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';

const PlusIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const TrashIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
);

const EditIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const SearchIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const UsersIcon = () => (
    <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

// Department options
const DEPARTMENTS = [
    'Engineering',
    'Human Resources',
    'Marketing',
    'Sales',
    'Finance',
    'Operations',
    'Product',
    'Design',
    'Legal',
    'Other'
];

function Employees({ addToast }) {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [formData, setFormData] = useState({
        employee_id: '',
        full_name: '',
        email: '',
        department: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [editingEmployee, setEditingEmployee] = useState(null);

    // Fetch employees
    async function fetchEmployees() {
        try {
            setLoading(true);
            const data = await getEmployees();
            setEmployees(data.employees);
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchEmployees();
    }, []);

    // Form validation
    function validateForm() {
        const errors = {};

        if (!formData.employee_id.trim()) {
            errors.employee_id = 'Employee ID is required';
        }

        if (!formData.full_name.trim()) {
            errors.full_name = 'Full name is required';
        } else if (formData.full_name.length < 2) {
            errors.full_name = 'Name must be at least 2 characters';
        }

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!formData.department) {
            errors.department = 'Department is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }

    // Handle form input change
    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    }

    // Handle form submission
    async function handleSubmit(e) {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setIsSubmitting(true);
            if (editingEmployee) {
                // Update
                await updateEmployee(editingEmployee.employee_id, formData);
                addToast(`Employee ${formData.full_name} updated successfully`, 'success');
            } else {
                // Create
                await createEmployee(formData);
                addToast(`Employee ${formData.full_name} added successfully`, 'success');
            }
            setIsModalOpen(false);
            setEditingEmployee(null);
            setFormData({ employee_id: '', full_name: '', email: '', department: '' });
            setFormErrors({});
            fetchEmployees();
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    }

    // Handle delete
    async function handleDelete() {
        if (!deleteTarget) return;

        try {
            setIsDeleting(true);
            await deleteEmployee(deleteTarget.employee_id);
            addToast(`Employee ${deleteTarget.full_name} deleted`, 'success');
            setDeleteTarget(null);
            fetchEmployees();
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setIsDeleting(false);
        }
    }

    // Open modal for editing
    function handleEdit(employee) {
        setEditingEmployee(employee);
        setFormData({
            employee_id: employee.employee_id,
            full_name: employee.full_name,
            email: employee.email,
            department: employee.department
        });
        setIsModalOpen(true);
    }

    // Close modal and reset form
    function handleCloseModal() {
        setIsModalOpen(false);
        setEditingEmployee(null);
        setFormData({ employee_id: '', full_name: '', email: '', department: '' });
        setFormErrors({});
    }

    if (loading) {
        return <LoadingSpinner text="Loading employees..." />;
    }

    return (
        <div>
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                <div>
                    <h1 className="page-title">Employees</h1>
                    <p className="page-subtitle">Manage your organization's employee records</p>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', flex: '1', justifyContent: 'flex-end', minWidth: '300px' }}>
                    <div className="search-container" style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--grey-400)' }}>
                            <SearchIcon />
                        </span>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search employees by name or ID..."
                            style={{ paddingLeft: '40px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button className="btn btn-primary" onClick={() => { setEditingEmployee(null); setIsModalOpen(true); }}>
                        <PlusIcon />
                        Add Employee
                    </button>
                </div>
            </header>

            {/* Employee List */}
            <div className="card">
                {employees.length === 0 ? (
                    <EmptyState
                        icon={<UsersIcon />}
                        title="No employees yet"
                        description="Get started by adding your first employee to the system."
                        action={
                            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                                <PlusIcon />
                                Add First Employee
                            </button>
                        }
                    />
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Employee ID</th>
                                    <th>Full Name</th>
                                    <th>Email</th>
                                    <th>Department</th>
                                    <th>Added</th>
                                    <th style={{ width: '80px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees
                                    .filter(emp =>
                                        emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
                                    )
                                    .map((employee) => (
                                        <tr key={employee.id}>
                                            <td>
                                                <span className="badge badge-neutral">{employee.employee_id}</span>
                                            </td>
                                            <td style={{ fontWeight: 'var(--font-medium)' }}>{employee.full_name}</td>
                                            <td style={{ color: 'var(--grey-600)' }}>{employee.email}</td>
                                            <td>{employee.department}</td>
                                            <td style={{ color: 'var(--grey-500)', fontSize: 'var(--text-sm)' }}>
                                                {new Date(employee.created_at).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => handleEdit(employee)}
                                                        title="Edit employee"
                                                    >
                                                        <EditIcon />
                                                    </button>
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => setDeleteTarget(employee)}
                                                        title="Delete employee"
                                                        style={{ color: 'var(--danger)' }}
                                                    >
                                                        <TrashIcon />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Employee Modal */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Add New Employee">
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label" htmlFor="employee_id">Employee ID *</label>
                            <input
                                type="text"
                                id="employee_id"
                                name="employee_id"
                                className="form-input"
                                placeholder="e.g., EMP001"
                                value={formData.employee_id}
                                onChange={handleChange}
                            />
                            {formErrors.employee_id && <span className="form-error">{formErrors.employee_id}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="full_name">Full Name *</label>
                            <input
                                type="text"
                                id="full_name"
                                name="full_name"
                                className="form-input"
                                placeholder="e.g., John Doe"
                                value={formData.full_name}
                                onChange={handleChange}
                            />
                            {formErrors.full_name && <span className="form-error">{formErrors.full_name}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="email">Email Address *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="form-input"
                                placeholder="e.g., john.doe@company.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {formErrors.email && <span className="form-error">{formErrors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="department">Department *</label>
                            <select
                                id="department"
                                name="department"
                                className="form-select"
                                value={formData.department}
                                onChange={handleChange}
                            >
                                <option value="">Select a department</option>
                                {DEPARTMENTS.map((dept) => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                            {formErrors.department && <span className="form-error">{formErrors.department}</span>}
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? (editingEmployee ? 'Saving...' : 'Adding...') : (editingEmployee ? 'Save Changes' : 'Add Employee')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Delete Employee"
                message={`Are you sure you want to delete "${deleteTarget?.full_name}"? This action cannot be undone and will also remove all their attendance records.`}
                confirmText="Delete Employee"
                isLoading={isDeleting}
            />
        </div>
    );
}

export default Employees;
