import { useMemo, useState } from "react";

const initialRegions = [
    { regiokod: 1, regionev: "Közép-Magyarország" },
    { regiokod: 2, regionev: "Közép-Dunántúl" },
    { regiokod: 3, regionev: "Nyugat-Dunántúl" },
    { regiokod: 4, regionev: "Dél-Dunántúl" },
    { regiokod: 5, regionev: "Észak-Magyarország" },
    { regiokod: 6, regionev: "Észak-Alföld" },
    { regiokod: 7, regionev: "Dél-Alföld" }
];

function App() {
    const [regions, setRegions] = useState(initialRegions);
    const [formData, setFormData] = useState({ regiokod: "", regionev: "" });
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState("");
	const [toast, setToast] = useState({
		visible: false,
		text: "",
		type: "success" //"success" | "error" | "warning"
	});	
    const [error, setError] = useState("");

	const showToast = (text, type = "success") => {
		setToast({
			visible: true,
			text,
			type
		});

		setTimeout(() => {
			setToast({
				visible: false,
				text: "",
				type: "success"
			});
		}, 8000);
	};
	
    const sortedRegions = useMemo(() => [...regions].sort((a, b) => a.regiokod - b.regiokod), [regions]);

    const clearMessages = () => {
        setMessage("");
        setError("");
    };

    const resetForm = () => {
        setFormData({ regiokod: "", regionev: "" });
        setEditingId(null);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const regiokodNumber = Number(formData.regiokod);
        const trimmedRegionName = formData.regionev.trim();

        if (!Number.isInteger(regiokodNumber) || regiokodNumber < 1) {
            showToast("A régiókódnak pozitív egész számnak kell lennie.", "error");
            return false;
        }

        if (trimmedRegionName.length < 2) {
            showToast("A régió neve legalább 2 karakter hosszú legyen.", "warning");
            return false;
        }

        const existingRegion = regions.find((region) => region.regiokod === regiokodNumber);
        if (existingRegion && regiokodNumber !== editingId) {
            showToast("Ez a régiókód már létezik.", "error");
            return false;
        }

        return true;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        clearMessages();

        if (!validateForm()) return;

        const newRegion = {
            regiokod: Number(formData.regiokod),
            regionev: formData.regionev.trim()
        };

        if (editingId === null) {
            setRegions((prev) => [...prev, newRegion]);
            showToast("Az új régió sikeresen hozzáadva.", "success");
        } else {
            setRegions((prev) => prev.map((region) => region.regiokod === editingId ? newRegion : region));
            showToast("A régió adatai sikeresen módosítva lettek.", "success");
        }

        resetForm();
    };

    const handleEdit = (region) => {
        clearMessages();
        setFormData({ regiokod: String(region.regiokod), regionev: region.regionev });
        setEditingId(region.regiokod);
        showToast(`Szerkesztés alatt: ${region.regionev}`, "warning");
    };

    const handleDelete = (regiokod) => {
        clearMessages();
        const selectedRegion = regions.find((region) => region.regiokod === regiokod);
        if (!selectedRegion) {
            showToast("A kiválasztott rekord nem található.", "error");
            return;
        }

        const confirmed = window.confirm(`Biztosan törölni szeretnéd ezt a régiót: ${selectedRegion.regionev}?`);
        if (!confirmed) return;

        setRegions((prev) => prev.filter((region) => region.regiokod !== regiokod));
        if (editingId === regiokod) resetForm();
        showToast(`A(z) ${selectedRegion.regionev} rekord törlése sikeres volt.`, "success");
    };

    return (
        <div className="react-app-wrapper">
            <div className="react-grid">
                <div className="react-card">
                    <h3 style={{ padding: "10px" }}>Régió rögzítése / módosítása</h3>
                    <form onSubmit={handleSubmit} className="react-form">
                        <label htmlFor="regiokod">Régiókód</label>
                        <input id="regiokod" name="regiokod" type="number" min="1" value={formData.regiokod} onChange={handleChange} required />
                        <label htmlFor="regionev">Régió neve</label>
                        <input id="regionev" name="regionev" type="text" maxLength="100" value={formData.regionev} onChange={handleChange} required />
                        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "10px" }}>
                            <button type="submit">Mentés</button>
                            <button type="button" onClick={() => { clearMessages(); resetForm(); }}>Mégsem</button>
                        </div>
                    </form>
                </div>
                    {message && <div className="react-message">{message}</div>}
                    {error && <div className="react-message react-error">{error}</div>}
                <div className="react-card">
                    <h3 style={{ padding: "10px" }}>Régiók listája</h3>
                    <div className="react-table-wrapper" style={{ marginBottom: "16px" }}>
                        <table>
                            <thead>
                                <tr>
									<th style={{ padding: "10px", textAlign: "center" }}>Régiókód</th>
									<th style={{ padding: "10px", textAlign: "center" }}>Régió neve</th>
									<th style={{ padding: "10px", textAlign: "center" }}>Műveletek</th></tr>
                            </thead>
                            <tbody>
                                {sortedRegions.map((region) => (
                                    <tr key={region.regiokod}>
                                        <td style={{ padding: "10px", textAlign: "right" }}>{region.regiokod}</td>
                                        <td>{region.regionev}</td>
                                        <td style={{ padding: "10px", textAlign: "center" }}>
                                            <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
                                                <button type="button" onClick={() => handleEdit(region)}>Szerkesztés</button>
                                                <button type="button" onClick={() => handleDelete(region.regiokod)}>Törlés</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="react-summary">Aktuális régiók száma: <strong>{regions.length}</strong></p>
                </div>
            </div>
			{toast.visible && (
				<div
					style={{
						position: "fixed",
						top: "20px",
						right: "20px",
						zIndex: 9999,
						minWidth: "280px",
						maxWidth: "420px",
						padding: "14px 18px",
						borderRadius: "10px",
						boxShadow: "0 6px 18px rgba(0, 0, 0, 0.15)",
						backgroundColor: toast.type === "success" ? "#d1fae5" : toast.type === "error" ? "#fee2e2" : "#fef3c7",
						color: toast.type === "success" ? "#065f46" : toast.type === "error" ? "#991b1b" : "#92400e",
						border: toast.type === "success" ? "1px solid #a7f3d0" : toast.type === "error" ? "1px solid #fecaca" : "1px solid #fde68a",
						fontWeight: "500",
						transform: "translateY(0)",
						transition: "all 0.25s ease"
					}}>
					{toast.text}
				</div>)}			
        </div>
    );
}

export default App;
