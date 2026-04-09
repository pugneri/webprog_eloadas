import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const apiUrl = "./api/lakosok.php";
const countiesApiUrl = "./api/megyek.php";

function App() {
    const [records, setRecords] = useState([]);
    const [counties, setCounties] = useState([]);
    const [formData, setFormData] = useState({ megyekod: "", lakosszam: "" });
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const sortedRecords = useMemo(
        () => [...records].sort((a, b) => (a.megyenev || "").localeCompare(b.megyenev || "", "hu")),
        [records]
    );

    const clearMessages = () => {
        setMessage("");
        setError("");
    };

    const resetForm = () => {
        setFormData({ megyekod: "", lakosszam: "" });
        setEditingId(null);
    };

    const loadRecords = async () => {
        setLoading(true);
        try {
            const response = await axios.get(apiUrl);
            const result = response.data;
            if (!result.success) {
                setError(result.message || "Nem sikerült betölteni az adatokat.");
                return;
            }
            setRecords(result.data || []);
        } catch (err) {
            setError(err?.response?.data?.message || "Hiba történt az adatok betöltésekor.");
        } finally {
            setLoading(false);
        }
    };

    const loadCounties = async () => {
        try {
            const response = await axios.get(countiesApiUrl);
            const result = response.data;
            if (!result.success) {
                setError(result.message || "Nem sikerült betölteni a megyék listáját.");
                return;
            }
            setCounties(result.data || []);
        } catch (err) {
            setError(err?.response?.data?.message || "Hiba történt a megyék listájának betöltésekor.");
        }
    };

    useEffect(() => {
        if (window.location.protocol === "file:") {
            setError("Az adatbázisos oldalak nem működnek közvetlenül fájlként megnyitva. Indítsd Apache/XAMPP alól, pl. http://localhost/... címen.");
            setLoading(false);
            return;
        }
        loadCounties();
        loadRecords();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const megyekod = Number(formData.megyekod);
        const lakosszam = Number(formData.lakosszam);
        if (!Number.isInteger(megyekod) || megyekod < 1 || megyekod > 20) {
            setError("Válassz ki egy megyét a listából.");
            return false;
        }
        if (!Number.isInteger(lakosszam) || lakosszam < 0) {
            setError("A lakosságszám csak 0 vagy annál nagyobb egész szám lehet.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        clearMessages();
        if (!validateForm()) return;

        const payload = new URLSearchParams();
        payload.append("megyekod", Number(formData.megyekod));
        payload.append("lakosszam", Number(formData.lakosszam));
        if (editingId !== null) {
            payload.append("action", "update");
            payload.append("originalMegyekod", editingId);
        }

        try {
            const response = await axios.post(apiUrl, payload.toString(), {
                headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" }
            });
            const result = response.data;

            if (!result.success) {
                setError(result.message || "A mentés nem sikerült.");
                return;
            }

            setMessage(result.message || "A rekord sikeresen mentve lett.");
            resetForm();
            await loadRecords();
        } catch (err) {
            setError(err?.response?.data?.message || "Hiba történt a mentés során.");
        }
    };

    const handleEdit = (record) => {
        clearMessages();
        setFormData({ megyekod: String(record.megyekod), lakosszam: String(record.lakosszam) });
        setEditingId(record.megyekod);
        setMessage(`Szerkesztés alatt: ${record.megyenev || "ismeretlen megye"}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (megyekod, megyenev) => {
        clearMessages();
        if (!window.confirm(`Biztosan törölni szeretnéd ezt a rekordot: ${megyenev || megyekod}?`)) return;

        try {
            const payload = new URLSearchParams();
            payload.append("action", "delete");
            payload.append("megyekod", megyekod);

            const response = await axios.post(apiUrl, payload.toString(), {
                headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" }
            });
            const result = response.data;

            if (!result.success) {
                setError(result.message || "A törlés nem sikerült.");
                return;
            }

            if (editingId === megyekod) resetForm();
            setMessage(result.message || "A rekord sikeresen törölve lett.");
            await loadRecords();
        } catch (err) {
            setError(err?.response?.data?.message || "Hiba történt a törlés során.");
        }
    };

    return (
        <div className="axios-wrapper">
            <div className="axios-grid">
                <div className="axios-card">
                    <h3>Lakossági rekord felvétele / módosítása</h3>
                    <form onSubmit={handleSubmit} className="axios-form">
                        <label htmlFor="megyekod">Megye</label>
                        <select id="megyekod" name="megyekod" value={formData.megyekod} onChange={handleChange} required>
                            <option value="">Válassz megyét...</option>
                            {counties.map((county) => (
                                <option key={county.megyekod} value={county.megyekod}>
                                    {county.megyenev} ({county.regionev})
                                </option>
                            ))}
                        </select>

                        <label htmlFor="lakosszam">Lakosságszám</label>
                        <input id="lakosszam" name="lakosszam" type="number" min="0" value={formData.lakosszam} onChange={handleChange} required />

                        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "14px", marginBottom: "14px" }}>
                            <button type="submit">Mentés</button>
                            <button type="button" onClick={() => { clearMessages(); resetForm(); }}>Űrlap ürítése</button>
                        </div>
                    </form>
                    {message && <div className="axios-message">{message}</div>}
                    {error && <div className="axios-message axios-error">{error}</div>}
                </div>

                <div style={{padding: "16px", borderRadius: "10px", backgroundColor: "#ffffff", boxShadow: "0 4px 12px rgba(0,0,0,0.08)"    }}>
                    <h3 style={{ marginBottom: "16px" }}>Lakossági adatok listája</h3>
                    {loading ? (
                        <p>Adatok betöltése...</p>
                    ) : (
                        <div className="axios-table-wrapper" style={{ marginBottom: "16px" }}>
                            <table style={{width: "100%", borderCollapse: "collapse"}}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: "10px", textAlign: "center" }}>Megye</th>
                                        <th style={{ padding: "10px", textAlign: "center" }}>Lakosság</th>
                                        <th style={{ padding: "10px", textAlign: "center" }}>Műveletek</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedRecords.map((record) => (
                                        <tr key={record.megyekod}>
                                            <td style={{ padding: "10px" }}>{record.megyenev || "-"}</td>
                                            <td style={{ padding: "10px", textAlign: "right" }}>{Number(record.lakosszam).toLocaleString("hu-HU")}</td>
                                            <td style={{ padding: "10px" }}>
                                                <div style={{display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
                                                    <button type="button" onClick={() => handleEdit(record)}>Szerkesztés</button>
                                                    <button type="button" onClick={() => handleDelete(record.megyekod, record.megyenev)}>Törlés</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <p className="axios-summary">Aktuális rekordok száma: <strong>{records.length}</strong></p>
                </div>
            </div>
        </div>
    );
}

export default App;
