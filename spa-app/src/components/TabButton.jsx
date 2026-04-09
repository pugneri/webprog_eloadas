function TabButton({ label, isActive, onClick }) {
    return (
        <button className={`spa-tab-button ${isActive ? "active" : ""}`} onClick={onClick} type="button" style={{ display: "inline-flex", width: "auto", margin: 0 }}>
            {label}
        </button>
    );
}

export default TabButton;
