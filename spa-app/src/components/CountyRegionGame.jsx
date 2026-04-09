import { useMemo, useState } from "react";

const questions = [
    { county: "Budapest", options: ["Közép-Magyarország", "Dél-Alföld", "Nyugat-Dunántúl"], answer: "Közép-Magyarország" },
    { county: "Baranya", options: ["Dél-Dunántúl", "Észak-Magyarország", "Közép-Dunántúl"], answer: "Dél-Dunántúl" },
    { county: "Pest", options: ["Közép-Magyarország", "Észak-Alföld", "Nyugat-Dunántúl"], answer: "Közép-Magyarország" },
    { county: "Zala", options: ["Nyugat-Dunántúl", "Dél-Alföld", "Észak-Magyarország"], answer: "Nyugat-Dunántúl" },
    { county: "Békés", options: ["Dél-Alföld", "Közép-Dunántúl", "Észak-Alföld"], answer: "Dél-Alföld" }
];

function CountyRegionGame() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState("");
    const [feedback, setFeedback] = useState("");
    const [score, setScore] = useState(0);
    const [answered, setAnswered] = useState(false);
    const [finished, setFinished] = useState(false);


    const currentQuestion = useMemo(() => questions[currentIndex], [currentIndex]);

    const handleCheck = () => {
        if (!selectedOption || answered) return;
        if (selectedOption === currentQuestion.answer) {
            setFeedback("Helyes válasz!");
            setScore((prev) => prev + 1);
        } else {
            setFeedback(`Nem jó. A helyes válasz: ${currentQuestion.answer}`);
        }
        setAnswered(true);
    };

    const handleNext = () => {
        setSelectedOption("");
        setFeedback("");
        setAnswered(false);
        if (currentIndex < questions.length - 1) setCurrentIndex((prev) => prev + 1);
        else setFinished(true);
    };

    const handleRestart = () => {
        setCurrentIndex(0); setSelectedOption(""); setFeedback(""); setScore(0); setAnswered(false); setFinished(false);
    };

    if (finished) {
        return (
            <div className="miniapp-card">
                <h3 style={{ marginBottom: "12px" }}>Megye–régió játék</h3>
                <div className="result-box">
                    <p>A játék véget ért. Elért pontszám: <strong>{score}</strong> / {questions.length}</p>
                    <button type="button" onClick={handleRestart} style={{ marginTop: "12px" }}>Új játék</button>
                </div>
            </div>
        );
    }

    return (
        <div className="miniapp-card">
            <h3 style={{ marginBottom: "12px" }}>Megye–régió párosító játék</h3>
            <p>Válaszd ki, hogy az adott megye melyik régióhoz tartozik.</p>
            <div className="quiz-box">
                <p style={{ marginTop: "8px", marginBottom: "8px" }}><strong>{currentIndex + 1}. kérdés:</strong> {currentQuestion.county}</p>
                <div className="option-list">
                    {currentQuestion.options.map((option) => (
                        <label style={{
							display: "flex",
							alignItems: "center",
							gap: "10px",
							padding: "6px 8px",
							borderRadius: "6px",
							cursor: "pointer"
						  }}
						key={option}>
                            <input type="radio" name="region-option" 
								value={option} 
								checked={selectedOption === option} 
								onChange={(event) => setSelectedOption(event.target.value)} 
								disabled={answered}
							/>
                            <span>{option}</span>
                        </label>
                    ))}
                </div>
                <div style={{ display: "flex", columnGap: "12px", rowGap: "14px", flexWrap: "wrap", marginTop: "12px" }}>
                    <button type="button" onClick={handleCheck}
							disabled={!selectedOption || answered}
							style={{opacity: !selectedOption || answered ? 0.6 : 1, cursor: !selectedOption || answered ? "not-allowed" : "pointer"
							}}					
						>Ellenőrzés</button>
                    <button type="button"
							onClick={handleNext}
							disabled={!answered}
							style={{
								opacity: !answered ? 0.6 : 1,
								cursor: !answered ? "not-allowed" : "pointer"
							}}
						>Következő</button>
                </div>
                {feedback && <div className="result-box"
					style={{
					marginTop: "12px",
					padding: "10px",
					borderRadius: "6px",
					backgroundColor: feedback.includes("Helyes") ? "#d4edda" : "#f8d7da",
					color: feedback.includes("Helyes") ? "#155724" : "#721c24"
					}}				
				>{feedback}</div>}
                <p style={{ marginTop: "8px", marginBottom: "8px" }}>Jelenlegi pontszám: <strong>{score}</strong></p>
            </div>
        </div>
    );
}

export default CountyRegionGame;
