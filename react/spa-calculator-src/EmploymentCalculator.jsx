import { useMemo, useState } from "react";

function EmploymentCalculator() {
    const [formData, setFormData] = useState({ mezogazdasag: "", ipar: "", szolgaltatas: "" });
    const [submitted, setSubmitted] = useState(false);

    const values = useMemo(() => {
        const mezogazdasag = Number(formData.mezogazdasag) || 0;
        const ipar = Number(formData.ipar) || 0;
        const szolgaltatas = Number(formData.szolgaltatas) || 0;
        const total = mezogazdasag + ipar + szolgaltatas;
        const percent = (value) => total === 0 ? 0 : ((value / total) * 100).toFixed(2);
        return {
            mezogazdasag, ipar, szolgaltatas, total,
            mezogazdasagPercent: percent(mezogazdasag),
            iparPercent: percent(ipar),
            szolgaltatasPercent: percent(szolgaltatas)
        };
    }, [formData]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="miniapp-card">
            <h3>Foglalkoztatási kalkulátor</h3>
            <p>Add meg a mezőgazdaság, ipar és szolgáltatás területein dolgozók számát.</p>
            <form className="miniapp-form" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
                <label htmlFor="mezogazdasag">Mezőgazdaság</label>
                <input id="mezogazdasag" name="mezogazdasag" type="number" min="0" value={formData.mezogazdasag} onChange={handleChange} required />
                <label htmlFor="ipar">Ipar</label>
                <input id="ipar" name="ipar" type="number" min="0" value={formData.ipar} onChange={handleChange} required />
                <label htmlFor="szolgaltatas">Szolgáltatás</label>
                <input id="szolgaltatas" name="szolgaltatas" type="number" min="0" value={formData.szolgaltatas} onChange={handleChange} required />
                <div className="miniapp-button-group">
                    <button type="submit">Számítás</button>
                    <button type="button" onClick={() => { setFormData({ mezogazdasag: "", ipar: "", szolgaltatas: "" }); setSubmitted(false); }}>Nullázás</button>
                </div>
            </form>
            {submitted && (
                <div className="result-box">
                    <h4>Eredmények</h4>
                    <p><strong>Összes foglalkoztatott:</strong> {values.total}</p>
                    <p><strong>Mezőgazdaság aránya:</strong> {values.mezogazdasagPercent}%</p>
                    <p><strong>Ipar aránya:</strong> {values.iparPercent}%</p>
                    <p><strong>Szolgáltatás aránya:</strong> {values.szolgaltatasPercent}%</p>
                </div>
            )}
        </div>
    );
}

export default EmploymentCalculator;
