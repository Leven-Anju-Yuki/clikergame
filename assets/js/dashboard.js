document.addEventListener("DOMContentLoaded", () => {
    Promise.all([window.LapinousContentReady || Promise.resolve(), window.LapinousPuzzlesReady || Promise.resolve()]).then(() => {
    const toastContainer = document.getElementById("toastContainer");

    function showToast(message, type = "") {
        const el = document.createElement("div");
        el.className = "toast" + (type ? " " + type : "");
        el.textContent = message;
        toastContainer.appendChild(el);
        setTimeout(() => el.remove(), 3600);
    }

    function fileToDataUrl(file) {
        return new Promise((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve(r.result);
            r.onerror = reject;
            r.readAsDataURL(file);
        });
    }

    // Aperçu immédiat de la photo choisie, avant même d'enregistrer, pour
    // vérifier qu'elle convient (pas besoin de sauvegarder pour la voir).
    window.previewRowImage = function (input) {
        const img = input.parentElement.querySelector(".file-preview");
        if (!img) return;
        const file = input.files[0];
        if (!file) { img.style.display = "none"; return; }
        img.src = URL.createObjectURL(file);
        img.style.display = "block";
    };

    function renderDashboard() {
        const rates = loadEggRates();
        ["commun", "rare", "epique", "legendaire"].forEach((r) => {
            const input = document.getElementById("rate-" + r);
            if (input) input.value = rates[r];
        });
        const windows = loadEventWindows();
        ["halloween", "noel", "paques"].forEach((e) => {
            const input = document.getElementById("window-" + e);
            if (input) input.value = windows[e];
        });
        renderSpeciesTable();
        renderBossTable();
        renderPuzzleAdmin();
        renderCharts();
    }

    function origin(key, isOverride, isAz) {
        return isOverride ? "modifié localement" : isAz ? "code" : "lapinous-content.json";
    }

    // ---- Tableau des lapins ----
    // Disponibilité saisonnière : "aucun" = toujours dispo, sinon uniquement
    // pendant la ou les périodes cochées (voir currentActiveEvents() dans script.js,
    // qui applique exactement les mêmes règles pour les joueurs).
    const EVENT_OPTIONS = [
        { value: "", label: "Aucun (toujours dispo)" },
        { value: "halloween", label: "🎃 Halloween uniquement" },
        { value: "noel", label: "🎄 Noël uniquement" },
        { value: "paques", label: "🐣 Pâques uniquement" },
        { value: "paques,noel", label: "🐣🎄 Pâques + Noël (légendes)" },
    ];
    function speciesEventValue(s) {
        if (!s || !s.event) return "";
        return Array.isArray(s.event) ? s.event.join(",") : s.event;
    }

    function speciesRowHtml(key, s) {
        const img = (s && (s.faceImg || s.coteImg)) || "./assets/img/species/mystery.svg";
        return `
            <td><img src="${img}" class="row-thumb" onerror="this.onerror=null;this.src='./assets/img/species/mystery.svg';">
                <label class="file-preview-wrap"><input type="file" accept="image/*" data-field="faceFile" title="Photo de face" onchange="previewRowImage(this)"><img class="file-preview" alt="aperçu face" style="display:none;"></label>
                <label class="file-preview-wrap"><input type="file" accept="image/*" data-field="coteFile" title="Photo 3/4" onchange="previewRowImage(this)"><img class="file-preview" alt="aperçu 3/4" style="display:none;"></label></td>
            <td><input type="text" data-field="key" value="${key || ""}" ${key ? "readonly" : ""} placeholder="identifiant"></td>
            <td><input type="text" data-field="name" value="${s?.name || ""}"></td>
            <td><input type="text" data-field="nickname" value="${s?.nickname || ""}"></td>
            <td>
                <span class="rarity-dot" style="background:${RARITY_META[s?.rarity || "commun"].color};"></span>
                <select data-field="rarity" onchange="this.previousElementSibling.style.background=({commun:'#b8bcc4',rare:'#6ebf77',epique:'#5b8fd6',legendaire:'#a35bd6',mythique:'#f5c34d',divin:'#d64545'})[this.value]||'#b8bcc4';">
                    ${["commun", "rare", "epique", "legendaire", "mythique", "divin"].map((r) => `<option value="${r}" ${s?.rarity === r ? "selected" : ""}>${RARITY_META[r].label}</option>`).join("")}
                </select>
            </td>
            <td><select data-field="event">
                    ${EVENT_OPTIONS.map((opt) => `<option value="${opt.value}" ${speciesEventValue(s) === opt.value ? "selected" : ""}>${opt.label}</option>`).join("")}
                </select></td>
            <td><textarea data-field="personality">${s?.personality || ""}</textarea></td>
            <td><textarea data-field="story">${s?.story || ""}</textarea></td>
            <td><input type="text" data-field="accessory" value="${s?.accessory || ""}"></td>
            <td><input type="text" data-field="likes" value="${(s?.likes || []).join(", ")}"></td>
            <td><input type="text" data-field="dislikes" value="${(s?.dislikes || []).join(", ")}"></td>
            <td><input type="text" data-field="quote" value="${s?.quote || ""}"></td>
            <td><textarea data-field="power">${s?.power || ""}</textarea></td>
            <td class="row-actions">
                <button class="slot-btn save" data-save-species>${key ? "💾" : "➕ Ajouter"}</button>
                ${key && key !== "az" ? `<button class="slot-btn clear" data-undo-species="${key}">↩️</button>` : ""}
            </td>`;
    }

    function readRowValues(tr, textareaFields = []) {
        const values = {};
        tr.querySelectorAll("[data-field]").forEach((el) => {
            const field = el.dataset.field;
            if (el.type === "file") { values[field] = el.files[0] || null; return; }
            values[field] = el.value;
        });
        return values;
    }

    function renderSpeciesTable() {
        const custom = loadCustomSpecies();
        const tbody = document.getElementById("speciesTableBody");
        tbody.innerHTML = "";
        Object.entries(getSpecies())
            .sort((a, b) => a[1].name.localeCompare(b[1].name))
            .forEach(([key, s]) => {
                const tr = document.createElement("tr");
                tr.dataset.key = key;
                tr.title = `Origine : ${origin(key, !!custom[key], key === "az")}`;
                tr.dataset.search = [key, s.name, s.nickname, s.rarity, speciesEventValue(s), s.personality, s.story, s.accessory, s.quote, s.power, (s.likes || []).join(" "), (s.dislikes || []).join(" ")].join(" ").toLowerCase();
                tr.innerHTML = speciesRowHtml(key, s);
                tbody.appendChild(tr);
            });
        // Ligne vide pour ajouter un nouveau lapin
        const newTr = document.createElement("tr");
        newTr.className = "new-row";
        newTr.innerHTML = speciesRowHtml("", null);
        tbody.appendChild(newTr);

        tbody.querySelectorAll("[data-save-species]").forEach((btn) => {
            btn.addEventListener("click", async () => {
                const tr = btn.closest("tr");
                const v = readRowValues(tr);
                const key = (v.key || "").trim().replace(/\s+/g, "_");
                if (!key) { showToast("Il faut un identifiant pour ce lapin.", "warn"); return; }
                const existing = getSpecies()[key];
                let faceImg = existing?.faceImg || "./assets/img/species/mystery.svg";
                let coteImg = existing?.coteImg || faceImg;
                if (v.faceFile) faceImg = await fileToDataUrl(v.faceFile);
                if (v.coteFile) coteImg = await fileToDataUrl(v.coteFile);
                const entry = {
                    name: v.name.trim() || key,
                    nickname: v.nickname.trim(),
                    rarity: v.rarity,
                    event: v.event ? (v.event.includes(",") ? v.event.split(",") : v.event) : null,
                    personality: v.personality.trim(),
                    story: v.story.trim(),
                    accessory: v.accessory.trim(),
                    likes: v.likes.split(",").map((s) => s.trim()).filter(Boolean),
                    dislikes: v.dislikes.split(",").map((s) => s.trim()).filter(Boolean),
                    quote: v.quote.trim(),
                    power: v.power.trim(),
                    faceImg, coteImg,
                };
                if (!entry.event) delete entry.event;
                const c = loadCustomSpecies();
                c[key] = entry;
                localStorage.setItem(CUSTOM_SPECIES_KEY, JSON.stringify(c));
                renderDashboard();
                showToast(`Lapin "${entry.name}" enregistré ✅`, "success");
            });
        });
        tbody.querySelectorAll("[data-undo-species]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const c = loadCustomSpecies();
                delete c[btn.dataset.undoSpecies];
                localStorage.setItem(CUSTOM_SPECIES_KEY, JSON.stringify(c));
                renderDashboard();
                showToast("Modification locale annulée.");
            });
        });
    }

    // ---- Tableau des boss ----
    function bossRowHtml(key, b) {
        const img = (b && (b.faceImg || b.coteImg)) || "./assets/img/species/mystery.svg";
        const personality = b ? (Array.isArray(b.personality) ? b.personality.join(", ") : b.personality || "") : "";
        return `
            <td><img src="${img}" class="row-thumb" onerror="this.onerror=null;this.src='./assets/img/species/mystery.svg';">
                <label class="file-preview-wrap"><input type="file" accept="image/*" data-field="faceFile" title="Photo de face" onchange="previewRowImage(this)"><img class="file-preview" alt="aperçu face" style="display:none;"></label>
                <label class="file-preview-wrap"><input type="file" accept="image/*" data-field="coteFile" title="Photo 3/4" onchange="previewRowImage(this)"><img class="file-preview" alt="aperçu 3/4" style="display:none;"></label></td>
            <td><input type="text" data-field="key" value="${key || ""}" ${key ? "readonly" : ""} placeholder="identifiant"></td>
            <td><input type="text" data-field="name" value="${b?.name || ""}"></td>
            <td><input type="text" data-field="nickname" value="${b?.nickname || ""}"></td>
            <td><input type="text" data-field="rang" value="${b?.rang || ""}"></td>
            <td><textarea data-field="story">${b?.story || ""}</textarea></td>
            <td><input type="text" data-field="arme" value="${b?.arme || ""}"></td>
            <td><input type="text" data-field="personality" value="${personality}"></td>
            <td><input type="text" data-field="likes" value="${(b?.likes || []).join(", ")}"></td>
            <td><input type="text" data-field="dislikes" value="${(b?.dislikes || []).join(", ")}"></td>
            <td><input type="text" data-field="quote" value="${b?.quote || ""}"></td>
            <td><textarea data-field="power">${b?.power || ""}</textarea></td>
            <td><input type="number" data-field="difficulty" value="${b?.difficulty ?? ""}" min="1"></td>
            <td class="row-actions">
                <button class="slot-btn save" data-save-boss>${key ? "💾" : "➕ Ajouter"}</button>
                ${key ? `<button class="slot-btn clear" data-undo-boss="${key}">↩️</button>` : ""}
            </td>`;
    }

    function renderBossTable() {
        const customBosses = loadCustomBosses();
        const tbody = document.getElementById("bossTableBody");
        tbody.innerHTML = "";
        Object.entries(getBosses())
            .sort((a, b) => (a[1].difficulty || 0) - (b[1].difficulty || 0))
            .forEach(([key, b]) => {
                const tr = document.createElement("tr");
                tr.dataset.key = key;
                tr.title = `Origine : ${origin(key, !!customBosses[key], false)}`;
                tr.innerHTML = bossRowHtml(key, b);
                tbody.appendChild(tr);
            });
        const newTr = document.createElement("tr");
        newTr.className = "new-row";
        newTr.innerHTML = bossRowHtml("", null);
        tbody.appendChild(newTr);

        tbody.querySelectorAll("[data-save-boss]").forEach((btn) => {
            btn.addEventListener("click", async () => {
                const tr = btn.closest("tr");
                const v = readRowValues(tr);
                const key = (v.key || "").trim().replace(/\s+/g, "_");
                if (!key) { showToast("Il faut un identifiant pour ce boss.", "warn"); return; }
                const existing = getBosses()[key];
                let faceImg = existing?.faceImg || "./assets/img/species/mystery.svg";
                let coteImg = existing?.coteImg || faceImg;
                if (v.faceFile) faceImg = await fileToDataUrl(v.faceFile);
                if (v.coteFile) coteImg = await fileToDataUrl(v.coteFile);
                const entry = {
                    name: v.name.trim() || key,
                    nickname: v.nickname.trim(),
                    rang: v.rang.trim(),
                    story: v.story.trim(),
                    arme: v.arme.trim(),
                    personality: v.personality.split(",").map((s) => s.trim()).filter(Boolean),
                    likes: v.likes.split(",").map((s) => s.trim()).filter(Boolean),
                    dislikes: v.dislikes.split(",").map((s) => s.trim()).filter(Boolean),
                    quote: v.quote.trim(),
                    power: v.power.trim(),
                    difficulty: parseInt(v.difficulty, 10) || 20,
                    faceImg, coteImg,
                    friends: existing?.friends || [], rivals: existing?.rivals || [],
                };
                const c = loadCustomBosses();
                c[key] = entry;
                localStorage.setItem(CUSTOM_BOSSES_KEY, JSON.stringify(c));
                renderDashboard();
                showToast(`Boss "${entry.name}" enregistré ✅`, "success");
            });
        });
        tbody.querySelectorAll("[data-undo-boss]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const c = loadCustomBosses();
                delete c[btn.dataset.undoBoss];
                localStorage.setItem(CUSTOM_BOSSES_KEY, JSON.stringify(c));
                renderDashboard();
                showToast("Modification locale annulée.");
            });
        });
    }

    document.getElementById("saveEggRatesBtn").addEventListener("click", () => {
        const rates = {
            commun: parseFloat(document.getElementById("rate-commun").value) || 0,
            rare: parseFloat(document.getElementById("rate-rare").value) || 0,
            epique: parseFloat(document.getElementById("rate-epique").value) || 0,
            legendaire: parseFloat(document.getElementById("rate-legendaire").value) || 0,
        };
        const total = rates.commun + rates.rare + rates.epique + rates.legendaire;
        if (Math.abs(total - 100) > 0.5) {
            showToast(`Le total doit faire 100% (actuellement ${total}%).`, "warn");
            return;
        }
        saveEggRates(rates);
        showToast("Taux d'apparition des œufs mis à jour ✅", "success");
    });

    document.getElementById("saveEventWindowsBtn").addEventListener("click", () => {
        const windows = {
            halloween: parseInt(document.getElementById("window-halloween").value, 10) || 0,
            noel: parseInt(document.getElementById("window-noel").value, 10) || 0,
            paques: parseInt(document.getElementById("window-paques").value, 10) || 0,
        };
        saveEventWindows(windows);
        showToast("Durées des événements mises à jour ✅", "success");
    });


    // ---- Export/Import du CONTENU (lapins + boss + taux d'œufs) ----
    // Contient TOUT (le contenu de base + tes modifications locales), pas
    // seulement les extras. C'est ce fichier qu'il faut déposer à la racine
    // du projet sous le nom "lapinous-content.json" pour que tous les
    // joueurs voient tes changements. Volontairement séparé de la
    // sauvegarde du joueur : aucune donnée de progression ici.
    document.getElementById("exportContentBtn").addEventListener("click", () => {
        const bundle = {
            type: "lapinous-content",
            exportedAt: Date.now(),
            species: getSpecies(),
            bosses: getBosses(),
            eggRates: loadEggRates(),
            eventWindows: loadEventWindows(),
        };
        delete bundle.species.az; // Azazel reste géré par le code, pas par le contenu
        const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "lapinous-content.json"; a.click();
        URL.revokeObjectURL(url);
        showToast("Contenu complet exporté ⬇️ — dépose-le à la racine du projet sous le nom lapinous-content.json", "success");
    });

    document.getElementById("importContentInput").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const bundle = JSON.parse(reader.result);
                const species = bundle.species || bundle.customSpecies; // compat anciens exports
                const bosses = bundle.bosses || bundle.customBosses;
                if (species) localStorage.setItem(CUSTOM_SPECIES_KEY, JSON.stringify(species));
                if (bosses) localStorage.setItem(CUSTOM_BOSSES_KEY, JSON.stringify(bosses));
                if (bundle.eggRates) saveEggRates(bundle.eggRates);
                if (bundle.eventWindows) saveEventWindows(bundle.eventWindows);
                renderDashboard();
                showToast("Contenu importé avec succès ✨ (visible ici, pense à réexporter pour lapinous-content.json)", "success");
            } catch (err) {
                showToast("Fichier de contenu invalide.", "warn");
            }
        };
        reader.readAsText(file);
        e.target.value = "";
    });


    // ============================================================
    // PUZZLES — tableau + menu déroulant illustré pour lier X lapins
    // ============================================================
    function puzzleSpeciesDropdown(selected = []) {
        const set = new Set(selected || []);
        const options = Object.entries(getSpecies())
            .filter(([key, sp]) => !sp.hidden || key === "az")
            .sort((a, b) => (a[1].name || a[0]).localeCompare(b[1].name || b[0]))
            .map(([key, sp]) => {
                const img = sp.faceImg || sp.coteImg || "./assets/img/species/mystery.svg";
                return `<label class="puzzle-species-option">
                    <input type="checkbox" value="${key}" ${set.has(key) ? "checked" : ""}>
                    <img src="${img}" alt="" onerror="this.onerror=null;this.src='./assets/img/species/mystery.svg';">
                    <span><strong>${sp.name || key}</strong><small>${key}</small></span>
                </label>`;
            }).join("");
        return `<details class="puzzle-species-dropdown">
            <summary>🐰 ${set.size} lapin${set.size > 1 ? "s" : ""} lié${set.size > 1 ? "s" : ""} — choisir</summary>
            <div class="puzzle-species-menu">${options}</div>
        </details>`;
    }

    function puzzleAdminRow(puz, index) {
        return `<tr data-puzzle-index="${index}">
            <td class="puzzle-admin-image-cell"><img src="${puz.image || './assets/img/species/mystery.svg'}" alt="${puz.title || ''}" onerror="this.onerror=null;this.src='./assets/img/species/mystery.svg';"></td>
            <td><input class="name-input" data-puzzle-field="id" value="${puz.id || ''}"></td>
            <td><input class="name-input" data-puzzle-field="title" value="${puz.title || ''}"></td>
            <td><input class="name-input puzzle-path-input" data-puzzle-field="image" value="${puz.image || ''}" placeholder="./assets/img/puzzle/image.png"></td>
            <td class="puzzle-links-cell">${puzzleSpeciesDropdown(puz.linkedSpecies)}</td>
            <td class="row-actions puzzle-row-actions"><button class="slot-btn save" data-save-puzzle>💾</button><button class="slot-btn clear" data-delete-puzzle>🗑️</button></td>
        </tr>`;
    }

    function renderPuzzleAdmin() {
        const box = document.getElementById("puzzleAdminList");
        if (!box || !window.getPuzzleCatalog) return;
        const puzzles = window.getPuzzleCatalog() || [];
        box.innerHTML = puzzles.length ? `<div class="puzzle-admin-table-wrap"><table class="puzzle-admin-table">
            <thead><tr><th>Image</th><th>Identifiant</th><th>Titre</th><th>Chemin</th><th>Lapins liés</th><th></th></tr></thead>
            <tbody>${puzzles.map(puzzleAdminRow).join("")}</tbody></table></div>` : '<p class="dash-note">Aucun puzzle pour le moment.</p>';

        box.querySelectorAll('[data-save-puzzle]').forEach((btn) => btn.addEventListener('click', () => {
            const row = btn.closest('tr[data-puzzle-index]');
            const idx = Number(row.dataset.puzzleIndex);
            const list = [...(window.getPuzzleCatalog() || [])];
            const current = { ...(list[idx] || {}) };
            row.querySelectorAll('[data-puzzle-field]').forEach((el) => current[el.dataset.puzzleField] = el.value.trim());
            current.linkedSpecies = Array.from(row.querySelectorAll('.puzzle-species-menu input:checked')).map((el) => el.value);
            if (!current.id) { showToast('Il faut un identifiant de puzzle.', 'warn'); return; }
            list[idx] = current;
            window.saveCustomPuzzles(list);
            renderPuzzleAdmin();
            showToast(`Puzzle "${current.title || current.id}" enregistré ✅`, 'success');
        }));
        box.querySelectorAll('[data-delete-puzzle]').forEach((btn) => btn.addEventListener('click', () => {
            const row = btn.closest('tr[data-puzzle-index]');
            const idx = Number(row.dataset.puzzleIndex);
            const list = [...(window.getPuzzleCatalog() || [])];
            const removed = list.splice(idx, 1)[0];
            window.saveCustomPuzzles(list);
            renderPuzzleAdmin();
            showToast(`Puzzle "${removed?.title || removed?.id || ''}" supprimé.`);
        }));
        box.querySelectorAll('.puzzle-species-menu input').forEach((cb) => cb.addEventListener('change', () => {
            const details = cb.closest('.puzzle-species-dropdown');
            const count = details.querySelectorAll('input:checked').length;
            details.querySelector('summary').textContent = `🐰 ${count} lapin${count > 1 ? 's' : ''} lié${count > 1 ? 's' : ''} — choisir`;
        }));
    }

    document.getElementById('addPuzzleBtn')?.addEventListener('click', () => {
        const list = [...(window.getPuzzleCatalog() || [])];
        list.push({ id: `puzzle_${Date.now()}`, title: 'Nouveau puzzle', image: './assets/img/puzzle/', linkedSpecies: [] });
        window.saveCustomPuzzles(list);
        renderPuzzleAdmin();
    });

    document.getElementById('exportPuzzlesBtn')?.addEventListener('click', () => {
        const bundle = { type: 'lapinous-puzzles', version: 1, levels: window.getPuzzleLevels ? window.getPuzzleLevels() : [], puzzles: window.getPuzzleCatalog ? window.getPuzzleCatalog() : [] };
        const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob); const a = document.createElement('a');
        a.href = url; a.download = 'lapinous-puzzles.json'; a.click(); URL.revokeObjectURL(url);
        showToast('Catalogue des puzzles exporté ✅', 'success');
    });

    document.getElementById('importPuzzlesInput')?.addEventListener('change', (e) => {
        const file = e.target.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = () => { try {
            const data = JSON.parse(reader.result);
            if (!Array.isArray(data.puzzles)) throw new Error('puzzles manquants');
            window.saveCustomPuzzles(data.puzzles);
            if (Array.isArray(data.levels)) window.saveCustomPuzzleLevels(data.levels);
            renderPuzzleAdmin(); showToast('Puzzles importés ✅', 'success');
        } catch (err) { showToast('Fichier de puzzles invalide.', 'warn'); } };
        reader.readAsText(file); e.target.value = '';
    });

    document.getElementById('resetPuzzlesBtn')?.addEventListener('click', () => {
        window.clearCustomPuzzles?.();
        renderPuzzleAdmin();
        showToast("Modifications locales des puzzles annulées.");
    });

    // ---- Sécurité : changer le code du Dashboard ----
    document.getElementById("changeCodeForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const f = e.target;
        const code1 = f.newCode.value.trim();
        const code2 = f.newCode2.value.trim();
        if (code1.length < 4) { showToast("Le code doit faire au moins 4 caractères.", "warn"); return; }
        if (code1 !== code2) { showToast("Les deux codes ne correspondent pas.", "warn"); return; }
        await window.LapinousDashboardAccess.changeDashboardCode(code1);
        f.reset();
        showToast("Code du Dashboard mis à jour ✅", "success");
    });

    // ============================================================
    // CAMEMBERTS (Chart.js)
    // ============================================================
    const PALETTE = ["#ffb5c8", "#f5c34d", "#9fd8a3", "#7fc8ff", "#a35bd6", "#b06a6a", "#8b6b57"];
    const chartInstances = {};

    let lastClickedSlice = {};
    function drawPie(canvasId, labels, data, groups, colors) {
        const ctx = document.getElementById(canvasId);
        if (!ctx || typeof Chart === "undefined") return;
        if (chartInstances[canvasId]) chartInstances[canvasId].destroy();
        chartInstances[canvasId] = new Chart(ctx, {
            type: "pie",
            data: { labels, datasets: [{ data, backgroundColor: colors || PALETTE }] },
            options: {
                plugins: { legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 10 } } } },
                onClick: (evt, elements) => {
                    if (!groups || elements.length === 0) return;
                    const idx = elements[0].index;
                    if (lastClickedSlice[canvasId] === idx) {
                        lastClickedSlice[canvasId] = null;
                        hideSliceDetail(canvasId);
                        return;
                    }
                    lastClickedSlice[canvasId] = idx;
                    showSliceDetail(canvasId, labels[idx], groups[idx] || []);
                },
                onHover: (evt, elements) => {
                    evt.native.target.style.cursor = groups && elements.length ? "pointer" : "default";
                },
            },
        });
    }

    function hideSliceDetail(canvasId) {
        const box = document.getElementById("detail-" + canvasId);
        if (box) box.style.display = "none";
    }

    function showSliceDetail(canvasId, label, items) {
        const box = document.getElementById("detail-" + canvasId);
        if (!box) return;
        box.innerHTML = items.length
            ? `<strong>${label} (${items.length})</strong><ul>${items
                  .map((it) => {
                      const name = typeof it === "string" ? it : it.name;
                      const img = typeof it === "string" ? null : it.img;
                      return `<li>${img ? `<img src="${img}" class="slice-thumb" onerror="this.style.display='none'">` : ""}${name}</li>`;
                  })
                  .join("")}</ul>`
            : `<strong>${label}</strong><p>Aucun.</p>`;
        box.style.display = "block";
    }

    function checkImageExists(src) {
        return new Promise((resolve) => {
            if (!src) return resolve(false);
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = src;
        });
    }

    const EVENT_CHART_LABELS = { halloween: "🎃 Événement (Halloween)", noel: "🎄 Événement (Noël)", paques: "🐣 Événement (Pâques)" };
    const EVENT_CHART_COLORS = { halloween: "#F28C28", noel: "#2E8B57", paques: "#F4A6D7", multi: "#E6C04C" };
    function eventChartCategory(s) {
        if (!s.event) return null;
        const events = Array.isArray(s.event) ? s.event : String(s.event).split(",").map((e) => e.trim());
        if (events.length > 1) return "🎉 Événement (multi-saisons)";
        return EVENT_CHART_LABELS[events[0]] || "🎉 Événement";
    }
    function eventChartColor(s) {
        if (!s.event) return null;
        const events = Array.isArray(s.event) ? s.event : String(s.event).split(",").map((e) => e.trim());
        if (events.length > 1) return EVENT_CHART_COLORS.multi;
        return EVENT_CHART_COLORS[events[0]] || EVENT_CHART_COLORS.multi;
    }

    async function renderCharts() {
        // Lapins par rareté — les lapins d'événement ont leur propre catégorie
        // ET leur propre couleur (Halloween=orange, Noël=vert sapin, Pâques=rose
        // pastel, multi-saisons=or), séparées de la rareté brute.
        const species = getSpecies();
        const rarityCounts = {};
        const rarityNames = {};
        const rarityColors = {};
        Object.values(species).forEach((s) => {
            const category = eventChartCategory(s) || RARITY_META[s.rarity]?.label || s.rarity;
            rarityCounts[category] = (rarityCounts[category] || 0) + 1;
            (rarityNames[category] = rarityNames[category] || []).push({ name: s.name, img: s.faceImg || s.coteImg });
            if (!rarityColors[category]) rarityColors[category] = eventChartColor(s) || RARITY_META[s.rarity]?.color || "#b8bcc4";
        });
        drawPie(
            "chart-rarity",
            Object.keys(rarityCounts),
            Object.values(rarityCounts),
            Object.keys(rarityCounts).map((r) => rarityNames[r]),
            Object.keys(rarityCounts).map((r) => rarityColors[r])
        );

        // Boss par difficulté (buckets)
        const bosses = getBosses();
        const buckets = { "Facile (<30)": 0, "Moyen (30-55)": 0, "Difficile (55-75)": 0, "Très difficile (>75)": 0 };
        const bucketNames = { "Facile (<30)": [], "Moyen (30-55)": [], "Difficile (55-75)": [], "Très difficile (>75)": [] };
        Object.values(bosses).forEach((b) => {
            const d = b.difficulty || 0;
            const label = d < 30 ? "Facile (<30)" : d < 55 ? "Moyen (30-55)" : d < 75 ? "Difficile (55-75)" : "Très difficile (>75)";
            buckets[label]++;
            bucketNames[label].push({ name: b.name, img: b.faceImg || b.coteImg });
        });
        drawPie("chart-difficulty", Object.keys(buckets), Object.values(buckets), Object.keys(buckets).map((k) => bucketNames[k]));

        // Camemberts dédiés par événement : répartition par rareté au sein
        // de chaque saison (Halloween / Noël / Pâques), pour voir en un
        // coup d'œil ce que contient chacune.
        function hasEvent(s, tag) {
            if (!s.event) return false;
            const events = Array.isArray(s.event) ? s.event : String(s.event).split(",").map((e) => e.trim());
            return events.includes(tag);
        }
        function rarityBreakdown(entries) {
            const counts = {};
            const names = {};
            const colors = {};
            entries.forEach((s) => {
                const label = RARITY_META[s.rarity]?.label || s.rarity;
                counts[label] = (counts[label] || 0) + 1;
                (names[label] = names[label] || []).push({ name: s.name, img: s.faceImg || s.coteImg });
                if (!colors[label]) colors[label] = RARITY_META[s.rarity]?.color || "#b8bcc4";
            });
            return {
                labels: Object.keys(counts),
                data: Object.values(counts),
                groups: Object.keys(counts).map((k) => names[k]),
                colors: Object.keys(counts).map((k) => colors[k]),
            };
        }
        ["halloween", "noel", "paques"].forEach((tag) => {
            const entries = Object.values(species).filter((s) => hasEvent(s, tag));
            const { labels, data, groups, colors } = rarityBreakdown(entries);
            drawPie("chart-event-" + tag, labels, data, groups, colors);
        });


        // Complétion des visuels (test réel de chargement d'image face ET côté séparément)
        const speciesEntries = Object.entries(species).filter(([, s]) => !s.hidden);
        const speciesFaceResults = await Promise.all(speciesEntries.map(([, s]) => checkImageExists(s.faceImg)));
        const speciesCoteResults = await Promise.all(speciesEntries.map(([, s]) => checkImageExists(s.coteImg)));
        const speciesFullyFound = speciesEntries.filter((_, i) => speciesFaceResults[i] && speciesCoteResults[i]).length;
        const speciesCompleteNames = speciesEntries.filter((_, i) => speciesFaceResults[i] && speciesCoteResults[i]).map(([, s]) => s.name);
        const speciesIncompleteNames = speciesEntries.filter((_, i) => !(speciesFaceResults[i] && speciesCoteResults[i])).map(([, s]) => s.name);
        drawPie("chart-species-img", ["Complet", "Incomplet"], [speciesFullyFound, speciesEntries.length - speciesFullyFound], [speciesCompleteNames, speciesIncompleteNames]);
        renderMissingList(
            "missing-species-list",
            speciesEntries
                .map(([, s], i) => ({ name: s.name, face: speciesFaceResults[i], cote: speciesCoteResults[i] }))
                .filter((e) => !e.face || !e.cote)
        );

        const bossEntries = Object.entries(bosses);
        const bossFaceResults = await Promise.all(bossEntries.map(([, b]) => checkImageExists(b.faceImg)));
        const bossCoteResults = await Promise.all(bossEntries.map(([, b]) => checkImageExists(b.coteImg)));
        const bossFullyFound = bossEntries.filter((_, i) => bossFaceResults[i] && bossCoteResults[i]).length;
        const bossCompleteNames = bossEntries.filter((_, i) => bossFaceResults[i] && bossCoteResults[i]).map(([, b]) => b.name);
        const bossIncompleteNames = bossEntries.filter((_, i) => !(bossFaceResults[i] && bossCoteResults[i])).map(([, b]) => b.name);
        drawPie("chart-boss-img", ["Complet", "Incomplet"], [bossFullyFound, bossEntries.length - bossFullyFound], [bossCompleteNames, bossIncompleteNames]);
        renderMissingList(
            "missing-boss-list",
            bossEntries
                .map(([, b], i) => ({ name: b.name, face: bossFaceResults[i], cote: bossCoteResults[i] }))
                .filter((e) => !e.face || !e.cote)
        );
    }

    function renderMissingList(elId, missingEntries) {
        const el = document.getElementById(elId);
        if (!el) return;
        if (missingEntries.length === 0) {
            el.innerHTML = `<li class="missing-none">✅ Toutes les images sont là !</li>`;
            return;
        }
        el.innerHTML = missingEntries
            .map((e) => {
                const parts = [];
                if (!e.face) parts.push("face");
                if (!e.cote) parts.push("3/4 (côté)");
                return `<li>❌ ${e.name} — photo ${parts.join(" et ")} manquante</li>`;
            })
            .join("");
    }

    const RARITY_ORDER = ["commun", "rare", "epique", "legendaire", "mythique", "divin", "secret"];
    let sortState = { key: null, dir: 1 };
    function sortSpeciesTable(field) {
        sortState.dir = sortState.key === field ? -sortState.dir : 1;
        sortState.key = field;
        const tbody = document.getElementById("speciesTableBody");
        const rows = Array.from(tbody.querySelectorAll("tr")).filter((tr) => tr.dataset.key);
        const newRow = tbody.querySelector("tr.new-row");
        rows.sort((a, b) => {
            const va = field === "rarity" ? RARITY_ORDER.indexOf(getSpecies()[a.dataset.key]?.rarity) : speciesEventValue(getSpecies()[a.dataset.key]);
            const vb = field === "rarity" ? RARITY_ORDER.indexOf(getSpecies()[b.dataset.key]?.rarity) : speciesEventValue(getSpecies()[b.dataset.key]);
            if (va < vb) return -1 * sortState.dir;
            if (va > vb) return 1 * sortState.dir;
            return 0;
        });
        rows.forEach((r) => tbody.insertBefore(r, newRow));
    }
    document.getElementById("sortRarityBtn").addEventListener("click", () => sortSpeciesTable("rarity"));
    document.getElementById("sortEventBtn").addEventListener("click", () => sortSpeciesTable("event"));

    const speciesSearchInput = document.getElementById("speciesSearch");
    const speciesEventFilter = document.getElementById("speciesEventFilter");
    function applySpeciesFilters() {
        const q = (speciesSearchInput?.value || "").trim().toLowerCase();
        const eventFilter = speciesEventFilter?.value || "";
        document.querySelectorAll("#speciesTableBody tr").forEach((tr) => {
            if (!tr.dataset.search) return; // ligne d'ajout, toujours visible
            const s = getSpecies()[tr.dataset.key];
            const ev = speciesEventValue(s);
            const events = ev ? ev.split(",").map((x) => x.trim()).filter(Boolean) : [];
            const matchesText = q === "" || tr.dataset.search.includes(q);
            const matchesEvent = !eventFilter
                || (eventFilter === "none" && events.length === 0)
                || (eventFilter === "multi" && events.length > 1)
                || events.includes(eventFilter);
            tr.style.display = matchesText && matchesEvent ? "" : "none";
        });
    }
    if (speciesSearchInput) speciesSearchInput.addEventListener("input", applySpeciesFilters);
    if (speciesEventFilter) speciesEventFilter.addEventListener("change", applySpeciesFilters);

    renderDashboard();
    });
});
