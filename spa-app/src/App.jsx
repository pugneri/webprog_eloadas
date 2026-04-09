import { useState } from "react";
import TabButton from "./components/TabButton";
import EmploymentCalculator from "./components/EmploymentCalculator";
import CountyRegionGame from "./components/CountyRegionGame";

function App() {
    const [activeTab, setActiveTab] = useState("calculator");

    return (
        <div className="spa-wrapper">
            <div style={{ display: "flex", columnGap: "12px", rowGap: "12px", flexWrap: "wrap", marginBottom: "20px" }}>
                <TabButton label="Foglalkoztatási kalkulátor" isActive={activeTab === "calculator"} onClick={() => setActiveTab("calculator")} />
                <TabButton label="Megye–régió játék" isActive={activeTab === "game"} onClick={() => setActiveTab("game")} />
            </div>
            <div className="spa-content">
                {activeTab === "calculator" && <EmploymentCalculator />}
                {activeTab === "game" && <CountyRegionGame />}
            </div>
        </div>
    );
}

export default App;
