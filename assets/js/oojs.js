const statsApiUrl = "./api/statisztika.php";

const createCardBtn = document.getElementById("create-card-btn");
const createAllBtn = document.getElementById("create-all-btn");
const clearCardsBtn = document.getElementById("clear-cards-btn");
const oojsContainer = document.getElementById("oojs-container");
const messageBox = document.getElementById("oojs-message-box");

let countyStatistics = [];
let nextIndex = 0;

function showMessage(message, isError = false) {
    messageBox.innerHTML = `<div class="message ${isError ? "error" : ""}">${message}</div>`;
}

function clearMessage() {
    messageBox.innerHTML = "";
}

class AdatKartya {
    constructor(title) {
        this.title = title;
        this.element = document.createElement("article");
        this.element.className = "oojs-card";
    }

    createBaseStructure() {
        const titleElement = document.createElement("h3");
        titleElement.textContent = this.title;
        this.element.appendChild(titleElement);
    }

    appendToContainer(container) {
        container.appendChild(this.element);
    }

    remove() {
        this.element.remove();
    }
}

class MegyeKartya extends AdatKartya {
    constructor(data) {
        super(data.megyenev);
        this.data = data;
    }

    calculateTotalEmployment() {
        return Number(this.data.mezogazdasag) + Number(this.data.ipar) + Number(this.data.szolgaltatas);
    }

    createInfoRow(label, value) {
        const row = document.createElement("p");
        row.innerHTML = `<strong>${label}:</strong> ${value}`;
        return row;
    }

    createDeleteButton() {
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Kártya törlése";
        deleteButton.addEventListener("click", () => {
            this.remove();
            showMessage(`${this.data.megyenev} kártyája törölve lett.`);
        });
        return deleteButton;
    }

    render() {
        this.createBaseStructure();

        const subtitle = document.createElement("p");
        subtitle.className = "oojs-subtitle";
        subtitle.textContent = `${this.data.regionev} | Megyekód: ${this.data.megyekod}`;

        const lakossag = this.createInfoRow("Lakosság", Number(this.data.lakosszam).toLocaleString("hu-HU"));
        const mezogazdasag = this.createInfoRow("Mezőgazdaság", Number(this.data.mezogazdasag).toLocaleString("hu-HU"));
        const ipar = this.createInfoRow("Ipar", Number(this.data.ipar).toLocaleString("hu-HU"));
        const szolgaltatas = this.createInfoRow("Szolgáltatás", Number(this.data.szolgaltatas).toLocaleString("hu-HU"));
        const totalEmployment = this.calculateTotalEmployment();
        const total = this.createInfoRow("Összes foglalkoztatott", totalEmployment.toLocaleString("hu-HU"));
        const percentage = this.createInfoRow(
            "Foglalkoztatottsági arány a lakossághoz",
            this.data.lakosszam > 0 ? `${((totalEmployment / Number(this.data.lakosszam)) * 100).toFixed(2)}%` : "0%"
        );

        this.element.append(subtitle, lakossag, mezogazdasag, ipar, szolgaltatas, total, percentage, this.createDeleteButton());
    }
}

async function loadStatistics() {
    clearMessage();
    try {
        const response = await fetch(statsApiUrl);
        const result = await response.json();

        if (!result.success) {
            showMessage(result.message || "Nem sikerült betölteni a statisztikai adatokat.", true);
            return;
        }

        countyStatistics = result.data || [];
        nextIndex = 0;
        showMessage(`Az adatbázisból ${countyStatistics.length} megye statisztikája betöltve.`);
    } catch {
        showMessage("Nem sikerült kapcsolódni a statisztikai API-hoz.", true);
    }
}

function createNextCard() {
    clearMessage();

    if (countyStatistics.length === 0) {
        showMessage("Még nincs betöltött adat. Frissítsd az oldalt, vagy ellenőrizd az adatbázist.", true);
        return;
    }

    if (nextIndex >= countyStatistics.length) {
        showMessage("Nincs több adatbázisból betöltött kártya.", true);
        return;
    }

    const card = new MegyeKartya(countyStatistics[nextIndex]);
    card.render();
    card.appendToContainer(oojsContainer);
    showMessage(`${countyStatistics[nextIndex].megyenev} kártyája létrehozva.`);
    nextIndex += 1;
}

function createSampleCards() {
    clearMessage();

    if (countyStatistics.length === 0) {
        showMessage("Még nincs betöltött adat az adatbázisból.", true);
        return;
    }

    const endIndex = Math.min(nextIndex + 5, countyStatistics.length);
    for (let i = nextIndex; i < endIndex; i += 1) {
        const card = new MegyeKartya(countyStatistics[i]);
        card.render();
        card.appendToContainer(oojsContainer);
    }

    const createdCount = endIndex - nextIndex;
    nextIndex = endIndex;
    showMessage(`${createdCount} új kártya jött létre az adatbázisból.`);
}

function clearAllCards() {
    oojsContainer.innerHTML = "";
    nextIndex = 0;
    showMessage("Az összes kártya törölve lett.");
}

const dynamicInfoPanel = document.createElement("div");
dynamicInfoPanel.className = "oojs-floating-info";
dynamicInfoPanel.textContent = "OOJS információs panel aktív";
document.body.appendChild(dynamicInfoPanel);

createCardBtn.addEventListener("click", createNextCard);
createAllBtn.addEventListener("click", createSampleCards);
clearCardsBtn.addEventListener("click", clearAllCards);

loadStatistics();
