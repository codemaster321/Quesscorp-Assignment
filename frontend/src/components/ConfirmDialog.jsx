function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', isLoading = false }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button className="modal-close" onClick={onClose} aria-label="Close dialog">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                <div className="modal-body">
                    <p style={{ color: 'var(--grey-600)', lineHeight: 'var(--leading-relaxed)' }}>{message}</p>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </button>
                    <button className="btn btn-danger" onClick={onConfirm} disabled={isLoading}>
                        {isLoading ? 'Deleting...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDialog;
