const regions = [
    { regiokod: 1, regionev: "Közép-Magyarország" },
    { regiokod: 2, regionev: "Közép-Dunántúl" },
    { regiokod: 3, regionev: "Nyugat-Dunántúl" },
    { regiokod: 4, regionev: "Dél-Dunántúl" },
    { regiokod: 5, regionev: "Észak-Magyarország" },
    { regiokod: 6, regionev: "Észak-Alföld" },
    { regiokod: 7, regionev: "Dél-Alföld" }
];

const counties = [
    { megyekod: 1, regiokod: 1, megyenev: "Budapest" },
    { megyekod: 2, regiokod: 7, megyenev: "Bács-Kiskun" },
    { megyekod: 3, regiokod: 4, megyenev: "Baranya" },
    { megyekod: 4, regiokod: 7, megyenev: "Békés" },
    { megyekod: 5, regiokod: 5, megyenev: "Borsod-Abaúj-Zemplén" },
    { megyekod: 6, regiokod: 7, megyenev: "Csongrád" },
    { megyekod: 7, regiokod: 2, megyenev: "Fejér" },
    { megyekod: 8, regiokod: 3, megyenev: "Győr-Moson-Sopron" },
    { megyekod: 9, regiokod: 6, megyenev: "Hajdú-Bihar" },
    { megyekod: 10, regiokod: 5, megyenev: "Heves" },
    { megyekod: 11, regiokod: 6, megyenev: "Jász-Nagykun-Szolnok" },
    { megyekod: 12, regiokod: 2, megyenev: "Komárom-Esztergom" },
    { megyekod: 13, regiokod: 5, megyenev: "Nógrád" },
    { megyekod: 14, regiokod: 1, megyenev: "Pest" },
    { megyekod: 15, regiokod: 4, megyenev: "Somogy" },
    { megyekod: 16, regiokod: 6, megyenev: "Szabolcs-Szatmár-Bereg" },
    { megyekod: 17, regiokod: 4, megyenev: "Tolna" },
    { megyekod: 18, regiokod: 3, megyenev: "Vas" },
    { megyekod: 19, regiokod: 2, megyenev: "Veszprém" },
    { megyekod: 20, regiokod: 3, megyenev: "Zala" }
];

const countyForm = document.getElementById("county-form");
const megyenevInput = document.getElementById("megyenev");
const regiokodSelect = document.getElementById("regiokod");
const originalMegyekodInput = document.getElementById("original-megyekod");
const resetBtn = document.getElementById("reset-btn");
const countyTableBody = document.getElementById("county-table-body");
const messageBox = document.getElementById("message-box");

function getRegionName(regiokod) {
    return regions.find((region) => region.regiokod === regiokod)?.regionev || "Ismeretlen régió";
}

function populateRegions() {
    regiokodSelect.innerHTML = '<option value="">Válassz régiót...</option>';
    regions.forEach((region) => {
        const option = document.createElement("option");
        option.value = region.regiokod;
        option.textContent = region.regionev;
        regiokodSelect.appendChild(option);
    });
}

function renderTable() {
    countyTableBody.innerHTML = "";

    [...counties]
        .sort((a, b) => a.megyenev.localeCompare(b.megyenev, "hu"))
        .forEach((county) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${county.megyenev}</td>
                <td>${getRegionName(county.regiokod)}</td>
                <td>
                    <div class="button-group button-group--compact">
                        <button type="button" data-edit="${county.megyekod}">Szerkesztés</button>
                        <button type="button" data-delete="${county.megyekod}">Törlés</button>
                    </div>
                </td>
            `;
            countyTableBody.appendChild(tr);
        });

    countyTableBody.querySelectorAll("button[data-edit]").forEach((button) => {
        button.addEventListener("click", () => editCounty(parseInt(button.getAttribute("data-edit"), 10)));
    });

    countyTableBody.querySelectorAll("button[data-delete]").forEach((button) => {
        button.addEventListener("click", () => deleteCounty(parseInt(button.getAttribute("data-delete"), 10)));
    });
}

function showMessage(message, isError = false) {
    messageBox.innerHTML = `<div class="message ${isError ? "error" : ""}">${message}</div>`;
}

function clearMessage() {
    messageBox.innerHTML = "";
}

function resetForm() {
    countyForm.reset();
    originalMegyekodInput.value = "";
    megyenevInput.focus();
}

function getNextMegyekod() {
    return counties.length === 0 ? 1 : Math.max(...counties.map((item) => item.megyekod)) + 1;
}

function validateInputs(regiokod, megyenev, originalMegyekod = null) {
    if (!Number.isInteger(regiokod) || regiokod < 1 || regiokod > 7) {
        showMessage("Válassz ki egy létező régiót.", true);
        return false;
    }

    if (!megyenev || megyenev.trim().length < 2) {
        showMessage("A megyenév legalább 2 karakter hosszú legyen.", true);
        return false;
    }

    const duplicate = counties.find((item) => item.megyenev.toLowerCase() === megyenev.trim().toLowerCase() && item.megyekod !== originalMegyekod);
    if (duplicate) {
        showMessage("Ez a megyenév már szerepel a listában.", true);
        return false;
    }

    return true;
}

countyForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearMessage();

    const regiokod = parseInt(regiokodSelect.value, 10);
    const megyenev = megyenevInput.value.trim();
    const originalMegyekod = originalMegyekodInput.value ? parseInt(originalMegyekodInput.value, 10) : null;

    if (!validateInputs(regiokod, megyenev, originalMegyekod)) {
        return;
    }

    if (originalMegyekod === null) {
        counties.push({ megyekod: getNextMegyekod(), regiokod, megyenev });
        showMessage("Az új megye sikeresen hozzá lett adva.");
    } else {
        const countyIndex = counties.findIndex((item) => item.megyekod === originalMegyekod);
        if (countyIndex !== -1) {
            counties[countyIndex] = { ...counties[countyIndex], regiokod, megyenev };
            showMessage("A megye adatai sikeresen módosítva lettek.");
        }
    }

    renderTable();
    resetForm();
});

function editCounty(megyekod) {
    const county = counties.find((item) => item.megyekod === megyekod);
    if (!county) {
        showMessage("A kiválasztott rekord nem található.", true);
        return;
    }

    megyenevInput.value = county.megyenev;
    regiokodSelect.value = county.regiokod;
    originalMegyekodInput.value = county.megyekod;
    showMessage(`Szerkesztés alatt: ${county.megyenev}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteCounty(megyekod) {
    const countyIndex = counties.findIndex((item) => item.megyekod === megyekod);
    if (countyIndex === -1) {
        showMessage("A törlendő rekord nem található.", true);
        return;
    }

    const selectedCounty = counties[countyIndex];
    if (!confirm(`Biztosan törölni szeretnéd ezt a rekordot: ${selectedCounty.megyenev}?`)) {
        return;
    }

    counties.splice(countyIndex, 1);
    renderTable();
    resetForm();
    showMessage(`A(z) ${selectedCounty.megyenev} rekord törlése sikeres volt.`);
}

resetBtn.addEventListener("click", () => {
    clearMessage();
    resetForm();
});

populateRegions();
renderTable();
