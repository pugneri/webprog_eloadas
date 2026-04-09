const employmentsApiUrl = "./api/foglalkozasok.php";
const countiesApiUrl = "./api/megyek.php";

const employmentForm = document.getElementById("employment-form");
const fkodInput = document.getElementById("fkod");
const countySelect = document.getElementById("megyekod");
const mezogazdasagInput = document.getElementById("mezogazdasag");
const iparInput = document.getElementById("ipar");
const szolgaltatasInput = document.getElementById("szolgaltatas");
const resetBtn = document.getElementById("reset-btn");
const tableBody = document.getElementById("employment-table-body");
const messageBox = document.getElementById("message-box");

function showMessage(message, isError = false) {
    messageBox.innerHTML = `<div class="message ${isError ? "error" : ""}">${message}</div>`;
}

function clearMessage() {
    messageBox.innerHTML = "";
}

function resetForm() {
    employmentForm.reset();
    fkodInput.value = "";
    countySelect.focus();
}

function validateForm(data) {
    if (!Number.isInteger(data.megyekod) || data.megyekod < 1) {
        showMessage("Válassz ki egy megyét a listából.", true);
        return false;
    }

    if ([data.mezogazdasag, data.ipar, data.szolgaltatas].some((value) => !Number.isInteger(value) || value < 0)) {
        showMessage("Az ágazati értékek csak 0 vagy annál nagyobb egész számok lehetnek.", true);
        return false;
    }

    return true;
}

async function fetchJson(url, options = {}) {
    const response = await fetch(url, options);
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch {
        throw new Error(text || "Érvénytelen API válasz.");
    }
}

async function loadCountyOptions(selectedValue = "") {
    try {
        const result = await fetchJson(countiesApiUrl);
        if (!result.success) {
            showMessage(result.message || "Nem sikerült betölteni a megyék listáját.", true);
            return;
        }

        countySelect.innerHTML = '<option value="">Válassz megyét...</option>';
        result.data.forEach((county) => {
            const option = document.createElement("option");
            option.value = county.megyekod;
            option.textContent = `${county.megyenev} (${county.regionev})`;
            if (String(county.megyekod) === String(selectedValue)) option.selected = true;
            countySelect.appendChild(option);
        });
    } catch (error) {
        showMessage("Nem sikerült kapcsolódni a megye lista API-hoz: " + error.message, true);
    }
}

async function loadEmployments() {
    try {
        const result = await fetchJson(employmentsApiUrl);
        if (!result.success) {
            showMessage(result.message || "Hiba történt az adatok betöltésekor.", true);
            return;
        }
        renderTable(result.data);
    } catch (error) {
        showMessage("Nem sikerült kapcsolódni az API-hoz: " + error.message, true);
    }
}

function renderTable(records) {
    tableBody.innerHTML = "";

    records.forEach((record) => {
        const total = Number(record.mezogazdasag) + Number(record.ipar) + Number(record.szolgaltatas);
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${record.megyenev}</td>
            <td>${Number(record.mezogazdasag).toLocaleString("hu-HU")}</td>
            <td>${Number(record.ipar).toLocaleString("hu-HU")}</td>
            <td>${Number(record.szolgaltatas).toLocaleString("hu-HU")}</td>
            <td>${total.toLocaleString("hu-HU")}</td>
            <td>
                <div class="button-group button-group--compact">
                    <button type="button" data-edit='${JSON.stringify(record).replace(/'/g, "&#39;")}'>Szerkesztés</button>
                    <button type="button" data-delete="${record.fkod}">Törlés</button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });

    tableBody.querySelectorAll("button[data-edit]").forEach((button) => {
        button.addEventListener("click", () => editRecord(JSON.parse(button.getAttribute("data-edit"))));
    });

    tableBody.querySelectorAll("button[data-delete]").forEach((button) => {
        button.addEventListener("click", () => deleteRecord(parseInt(button.getAttribute("data-delete"), 10)));
    });
}

employmentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage();

    const data = {
        megyekod: parseInt(countySelect.value, 10),
        mezogazdasag: parseInt(mezogazdasagInput.value, 10),
        ipar: parseInt(iparInput.value, 10),
        szolgaltatas: parseInt(szolgaltatasInput.value, 10)
    };

    if (!validateForm(data)) return;

    try {
        const editingId = fkodInput.value ? parseInt(fkodInput.value, 10) : null;
        const params = new URLSearchParams();
        Object.entries(data).forEach(([key, value]) => params.append(key, value));
        if (editingId !== null) {
            params.append('action', 'update');
            params.append('fkod', editingId);
        }

        const result = await fetchJson(employmentsApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
            body: params.toString()
        });

        if (!result.success) {
            showMessage(result.message || 'A mentés nem sikerült.', true);
            return;
        }

        showMessage(result.message || 'Sikeres mentés.');
        resetForm();
        await loadEmployments();
    } catch (error) {
        showMessage('Hiba történt a mentés során: ' + error.message, true);
    }
});

function editRecord(record) {
    clearMessage();
    fkodInput.value = record.fkod;
    countySelect.value = record.megyekod;
    mezogazdasagInput.value = record.mezogazdasag;
    iparInput.value = record.ipar;
    szolgaltatasInput.value = record.szolgaltatas;
    showMessage(`Szerkesztés alatt: ${record.megyenev}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteRecord(fkod) {
    clearMessage();
    if (!confirm('Biztosan törölni szeretnéd ezt a foglalkoztatási rekordot?')) return;

    try {
        const params = new URLSearchParams();
        params.append('action', 'delete');
        params.append('fkod', fkod);

        const result = await fetchJson(employmentsApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
            body: params.toString()
        });

        if (!result.success) {
            showMessage(result.message || 'A törlés nem sikerült.', true);
            return;
        }

        showMessage(result.message || 'Sikeres törlés.');
        resetForm();
        await loadEmployments();
    } catch (error) {
        showMessage('Hiba történt a törlés során: ' + error.message, true);
    }
}

resetBtn.addEventListener('click', () => {
    clearMessage();
    resetForm();
});

if (window.location.protocol === 'file:') {
    showMessage('Az adatbázisos oldalak nem működnek közvetlenül fájlként megnyitva. Indítsd XAMPP/Apache alól, pl. http://localhost/... címen.', true);
} else {
    loadCountyOptions().then(loadEmployments);
}
