const EmptyIcon = () => (
    <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
        <polyline points="13 2 13 9 20 9" />
    </svg>
);

function EmptyState({ icon, title, description, action }) {
    return (
        <div className="empty-state">
            {icon || <EmptyIcon />}
            <h3 className="empty-title">{title}</h3>
            <p className="empty-description">{description}</p>
            {action}
        </div>
    );
}

export default EmptyState;
