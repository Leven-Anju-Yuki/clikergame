document.addEventListener("DOMContentLoaded", () => {
    (window.LapinousContentReady || Promise.resolve()).then(() => {
    // ============================================================
    // RÉFÉRENCES DOM
    // ============================================================
    const adoptionScreen = document.getElementById("adoptionScreen");
    const gameRoot = document.getElementById("gameRoot");
    const mainNav = document.getElementById("mainNav");
    const gameArea = document.getElementById("gameArea");
    const body = document.body;
    const rabbitImage = document.getElementById("rabbitImage");
    const sceneLabel = document.getElementById("sceneLabel");
    const brandTitle = document.getElementById("brandTitle");
    const toastContainer = document.getElementById("toastContainer");

    const foodBar = document.getElementById("foodBar");
    const energyBar = document.getElementById("energyBar");
    const cleanlinessBar = document.getElementById("cleanlinessBar");
    const friendshipBar = document.getElementById("friendshipBar");

    // Les données des lapins/boss (BASE_SPECIES, RARITY_META, RELATIONS_TEXT,
    // BASE_BOSSES, getSpecies(), getBosses()...) viennent de species-data.js,
    // chargé juste avant ce fichier dans index.html.

    // ============================================================
    // TRAITS ALÉATOIRES (bonus / malus, indépendants de l'espèce)
    // ============================================================
    const TRAITS = {
        aucun: { label: "Aucun trait particulier", emoji: "🐇", desc: "Un compagnon parfaitement équilibré.", gain: {} },
        petit_mangeur: { label: "Petit mangeur", emoji: "🥕", desc: "Se rassasie vite : +3 à chaque repas.", gain: { food: 3 } },
        petit_dormeur: { label: "Petit dormeur", emoji: "⭐", desc: "Récupère vite : +3 d'énergie au dodo.", gain: { energy: 3 } },
        grand_sportif: { label: "Grand sportif", emoji: "⚡", desc: "Doué en agilité : sauts plus faciles, +3 d'amitié.", gain: { friendship: 3 }, agilityBonus: 12 },
        glouton: { label: "Glouton (malchance)", emoji: "🍽️", desc: "Toujours affamé : -2 à chaque repas.", gain: { food: -2 } },
        gros_dormeur: { label: "Gros dormeur (malchance)", emoji: "🛌", desc: "Dur à réveiller : -2 d'énergie au dodo.", gain: { energy: -2 } },
        maladroit: { label: "Maladroit (malchance)", emoji: "🤕", desc: "Sauts difficiles, -2 d'amitié, tombe plus facilement.", gain: { friendship: -2 }, agilityBonus: -8 },
    };
    const AZ_TRAIT = { label: "Chance infinie", emoji: "🍀", desc: "Aucun malus possible.", gain: { food: 3, friendship: 2 }, agilityBonus: 15 };

    // ============================================================
    // ÉTAT DU JEU
    // ============================================================
    function freshSpeciesProgress() {
        return {
            food: 25, energy: 25, cleanliness: 25,
            friendship: 0,
            friendshipTotal: 0,
            currentLevel: 1,
            lastUpgradeLevel: 0,
            boosts: { food: 0, energy: 0, cleanliness: 0, friendship: 0 },
            improvements: { cuisine: false, chambre: false, sdb: false, jardin: false },
        };
    }

    function freshGame() {
        return {
            rabbitName: "", // conservé pour compat de sauvegarde ; utiliser currentRabbitName()
            species: "azur",
            trait: "aucun",
            // TOUT (faim, énergie, propreté, amitié, niveau, améliorations) est propre
            // à CHAQUE lapin : manger avec l'un ne nourrit pas les autres, être ami
            // avec l'un ne rend pas les autres amis.
            progress: { azur: freshSpeciesProgress() },
            speciesNames: {},
            carrots: 0,
            eggs: 0,
            ownedSpecies: [],
            speciesTraits: {},
            discoveredBosses: [],
        };
    }

    // Renvoie (et crée si besoin) la progression du lapin actuellement actif.
    function progress() {
        if (!game.progress[game.species]) game.progress[game.species] = freshSpeciesProgress();
        return game.progress[game.species];
    }

    // Nom du lapin actif (chacun a le sien).
    function currentRabbitName() {
        return game.speciesNames[game.species] || (getSpecies()[game.species] || {}).name || "";
    }

    let game = freshGame();
    let currentZone = "default";
    const UPGRADE_COST = 20;
    const EGG_COST = 45;
    const ROOM_REQUIRED_LEVEL = { cuisine: 2, chambre: 3, sdb: 4, jardin: 5 };

    // ============================================================
    // TOASTS
    // ============================================================
    function showToast(message, type = "") {
        const el = document.createElement("div");
        el.className = "toast" + (type ? " " + type : "");
        el.textContent = message;
        const duration = Math.min(14000, Math.max(6000, message.length * 110));
        el.style.animationDuration = "0.25s, 0.4s";
        el.style.animationDelay = "0s, " + (duration - 400) + "ms";
        toastContainer.appendChild(el);
        setTimeout(() => el.remove(), duration);
    }

    // ============================================================
    // PARTICULES
    // ============================================================
    function spawnParticles(emoji, count = 6) {
        for (let i = 0; i < count; i++) {
            const p = document.createElement("span");
            p.className = "particle";
            p.textContent = emoji;
            const dx = (Math.random() - 0.5) * 120;
            const dx2 = dx + (Math.random() - 0.5) * 60;
            p.style.left = 45 + Math.random() * 10 + "%";
            p.style.top = "55%";
            p.style.setProperty("--dx", dx + "px");
            p.style.setProperty("--dx2", dx2 + "px");
            p.style.animationDelay = Math.random() * 0.15 + "s";
            gameArea.appendChild(p);
            setTimeout(() => p.remove(), 1200);
        }
    }

    // ============================================================
    // SAUVEGARDE : liste illimitée, nommée, datée (le plus proche
    // d'un "dossier de sauvegardes" que le navigateur permette sans
    // serveur) + export/import JSON pour un vrai fichier sur le disque.
    // ============================================================
    const SAVES_KEY = "lapinous_saves";
    const AUTOSAVE_KEY = "lapinous_autosave";

    function serializeGame() { return JSON.stringify({ ...game, savedAt: Date.now() }); }
    function autoSave() { try { localStorage.setItem(AUTOSAVE_KEY, serializeGame()); } catch (e) {} }

    function loadSavesList() {
        try { return JSON.parse(localStorage.getItem(SAVES_KEY) || "[]"); } catch (e) { return []; }
    }
    function writeSavesList(list) { localStorage.setItem(SAVES_KEY, JSON.stringify(list)); }

    function defaultSaveName() {
        const d = new Date();
        const date = d.toLocaleDateString();
        const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        return `${currentRabbitName() || "Partie"} — ${date} ${time}`;
    }

    function createSave(name) {
        const list = loadSavesList();
        list.push({
            id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
            name: (name || "").trim() || defaultSaveName(),
            savedAt: Date.now(),
            data: JSON.parse(serializeGame()),
        });
        writeSavesList(list);
        renderSavesList();
        showToast("Sauvegarde créée 💾", "success");
    }

    function overwriteSave(id) {
        const list = loadSavesList();
        const entry = list.find((s) => s.id === id);
        if (!entry) return;
        entry.data = JSON.parse(serializeGame());
        entry.savedAt = Date.now();
        writeSavesList(list);
        renderSavesList();
        showToast(`"${entry.name}" écrasée avec la partie actuelle ✅`, "success");
    }

    function loadSaveEntry(id) {
        const entry = loadSavesList().find((s) => s.id === id);
        if (!entry) { showToast("Sauvegarde introuvable.", "warn"); return; }
        applyLoadedGame(entry.data);
        showToast(`"${entry.name}" chargée ✨`, "success");
        $("#saveModal").modal("hide");
    }

    function renameSaveEntry(id) {
        const list = loadSavesList();
        const entry = list.find((s) => s.id === id);
        if (!entry) return;
        const newName = window.prompt("Nouveau nom pour cette sauvegarde :", entry.name);
        if (!newName || !newName.trim()) return;
        entry.name = newName.trim();
        writeSavesList(list);
        renderSavesList();
    }

    function deleteSaveEntry(id) {
        writeSavesList(loadSavesList().filter((s) => s.id !== id));
        renderSavesList();
        showToast("Sauvegarde supprimée.");
    }

    function applyLoadedGame(data) {
        const fresh = freshGame();
        const activeSpecies = data.species || "azur";
        let migratedProgress = data.progress || null;

        if (!migratedProgress) {
            // Très ancienne sauvegarde : tout était partagé au lieu d'être propre à chaque lapin.
            migratedProgress = {
                [activeSpecies]: {
                    food: (data.status && data.status.food) ?? 25,
                    energy: (data.status && data.status.energy) ?? 25,
                    cleanliness: (data.status && data.status.cleanliness) ?? 25,
                    friendship: (data.status && data.status.friendship) || 0,
                    friendshipTotal: data.friendshipTotal || 0,
                    currentLevel: data.currentLevel || 1,
                    lastUpgradeLevel: data.lastUpgradeLevel || 0,
                    boosts: { ...freshSpeciesProgress().boosts, ...(data.boosts || {}) },
                    improvements: { ...freshSpeciesProgress().improvements, ...(data.improvements || {}) },
                },
            };
        } else if (data.status && migratedProgress[activeSpecies] && migratedProgress[activeSpecies].food === undefined) {
            // Sauvegarde intermédiaire : l'amitié était déjà propre à chaque lapin,
            // mais faim/énergie/propreté étaient encore partagées. On les rapatrie.
            migratedProgress[activeSpecies] = {
                ...freshSpeciesProgress(),
                ...migratedProgress[activeSpecies],
                food: data.status.food ?? 25,
                energy: data.status.energy ?? 25,
                cleanliness: data.status.cleanliness ?? 25,
            };
        }
        // Complète les champs manquants (nouveaux champs) sur chaque entrée existante.
        Object.keys(migratedProgress).forEach((key) => {
            migratedProgress[key] = { ...freshSpeciesProgress(), ...migratedProgress[key] };
        });

        const speciesNames = data.speciesNames || {};
        if (data.rabbitName && !speciesNames[activeSpecies]) speciesNames[activeSpecies] = data.rabbitName;

        game = {
            ...fresh,
            ...data,
            progress: migratedProgress,
            speciesNames,
        };
        startGameUI();
        autoSave();
    }

    function renderSavesList() {
        const container = document.getElementById("saveSlots");
        const list = loadSavesList().sort((a, b) => b.savedAt - a.savedAt);
        container.innerHTML = "";
        if (list.length === 0) {
            container.innerHTML = `<p class="upgrade-locked-note">Aucune sauvegarde pour l'instant — crée-en une ci-dessus.</p>`;
            return;
        }
        list.forEach((entry, idx) => {
            const date = new Date(entry.savedAt).toLocaleString();
            const row = document.createElement("div");
            row.className = "save-slot";
            row.innerHTML = `
                <div class="save-slot-info">
                    <strong>${idx === 0 ? "⭐ " : ""}${entry.name}</strong>
                    ${entry.data.rabbitName || "Sans nom"} — Niveau ${entry.data.currentLevel || 1} — ${date}
                </div>
                <div class="save-slot-actions">
                    <button class="slot-btn load" data-load-save="${entry.id}">Charger</button>
                    <button class="slot-btn save" data-overwrite-save="${entry.id}">Écraser</button>
                    <button class="slot-btn save" data-rename-save="${entry.id}">Renommer</button>
                    <button class="slot-btn clear" data-delete-save="${entry.id}">✕</button>
                </div>`;
            container.appendChild(row);
        });
        container.querySelectorAll("[data-load-save]").forEach((b) => b.addEventListener("click", () => loadSaveEntry(b.dataset.loadSave)));
        container.querySelectorAll("[data-overwrite-save]").forEach((b) => b.addEventListener("click", () => overwriteSave(b.dataset.overwriteSave)));
        container.querySelectorAll("[data-rename-save]").forEach((b) => b.addEventListener("click", () => renameSaveEntry(b.dataset.renameSave)));
        container.querySelectorAll("[data-delete-save]").forEach((b) => b.addEventListener("click", () => deleteSaveEntry(b.dataset.deleteSave)));
    }

    document.getElementById("newSaveBtn").addEventListener("click", () => {
        const nameInput = document.getElementById("newSaveName");
        createSave(nameInput.value);
        nameInput.value = "";
    });

    document.getElementById("exportBtn").addEventListener("click", () => {
        const blob = new Blob([serializeGame()], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `lapinous-${(currentRabbitName() || "save").toLowerCase()}.json`; a.click();
        URL.revokeObjectURL(url);
        showToast("Partie exportée en JSON ⬇️ (un vrai fichier sur ton disque)", "success");
    });
    document.getElementById("importInput").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                applyLoadedGame(JSON.parse(reader.result));
                showToast("Sauvegarde importée ✨", "success");
                $("#saveModal").modal("hide");
            } catch (err) { showToast("Fichier JSON invalide.", "warn"); }
        };
        reader.readAsText(file);
        e.target.value = "";
    });

    // ============================================================
    // DOSSIER DE SAUVEGARDES RÉEL (File System Access API — Chrome/Edge)
    // ⚠️ Non disponible sur Safari/Firefox. La permission n'est pas
    // conservée après un rechargement : il faut re-choisir le dossier.
    // ============================================================
    let savesDirHandle = null;

    function timestampedFilename(customName) {
        if (customName) return customName.replace(/[^\w\-À-ÿ ]/g, "").trim() + ".json";
        const d = new Date();
        const pad = (n) => String(n).padStart(2, "0");
        const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}h${pad(d.getMinutes())}`;
        return `lapinous-${(currentRabbitName() || "sauvegarde").toLowerCase()}-${stamp}.json`;
    }

    async function renderFolderSaves() {
        const listEl = document.getElementById("folderSavesList");
        if (!savesDirHandle) { listEl.innerHTML = ""; return; }
        const files = [];
        for await (const [name, handle] of savesDirHandle.entries()) {
            if (handle.kind === "file" && name.endsWith(".json")) files.push(name);
        }
        files.sort().reverse(); // les noms datés (AAAA-MM-JJ...) remontent naturellement en haut
        listEl.innerHTML = files.length
            ? files.map((name) => `
                <div class="save-slot">
                    <div class="save-slot-info"><strong>${name}</strong></div>
                    <div class="save-slot-actions"><button class="slot-btn load" data-folder-load="${name}">Charger</button></div>
                </div>`).join("")
            : "<p class='dash-note'>Ce dossier est vide pour l'instant.</p>";
        listEl.querySelectorAll("[data-folder-load]").forEach((b) =>
            b.addEventListener("click", () => loadFromFolder(b.dataset.folderLoad))
        );
    }

    async function loadFromFolder(filename) {
        try {
            const fileHandle = await savesDirHandle.getFileHandle(filename);
            const file = await fileHandle.getFile();
            const text = await file.text();
            applyLoadedGame(JSON.parse(text));
            showToast(`Sauvegarde "${filename}" chargée ✨`, "success");
            $("#saveModal").modal("hide");
        } catch (e) {
            showToast("Impossible de lire ce fichier.", "warn");
        }
    }

    document.getElementById("chooseFolderBtn").addEventListener("click", async () => {
        if (!window.showDirectoryPicker) {
            showToast("Ton navigateur ne supporte pas cette fonctionnalité (utilise Chrome ou Edge).", "warn");
            return;
        }
        try {
            savesDirHandle = await window.showDirectoryPicker();
            document.getElementById("saveToFolderBtn").disabled = false;
            showToast("Dossier de sauvegardes sélectionné 📁", "success");
            renderFolderSaves();
        } catch (e) {
            // Sélection annulée par l'utilisateur : rien à faire.
        }
    });

    document.getElementById("saveToFolderBtn").addEventListener("click", async () => {
        if (!savesDirHandle) return;
        const customName = document.getElementById("folderSaveName").value.trim();
        const filename = timestampedFilename(customName);
        try {
            const fileHandle = await savesDirHandle.getFileHandle(filename, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(serializeGame());
            await writable.close();
            showToast(`Sauvegardé sous "${filename}" 📁`, "success");
            document.getElementById("folderSaveName").value = "";
            renderFolderSaves();
        } catch (e) {
            showToast("Impossible d'écrire dans ce dossier.", "warn");
        }
    });

    // ============================================================
    // ÉCRAN D'ADOPTION — carrousel à un seul lapin (communs)
    // ============================================================
    // ============================================================
    // DISPONIBILITÉ SAISONNIÈRE (Halloween / Noël / Pâques)
    // Mêmes règles utilisées côté Dashboard pour l'aperçu admin.
    // ============================================================
    function getEasterDate(year) {
        // Algorithme de Meeus/Jones/Butcher (calendrier grégorien)
        const a = year % 19;
        const b = Math.floor(year / 100);
        const c = year % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const month = Math.floor((h + l - 7 * m + 114) / 31);
        const day = ((h + l - 7 * m + 114) % 31) + 1;
        return new Date(year, month - 1, day);
    }

    function withinDays(date, anchor, days) {
        const diffDays = Math.abs(date - anchor) / (1000 * 60 * 60 * 24);
        return diffDays <= days;
    }

    function currentActiveEvents(date = new Date()) {
        const windows = loadEventWindows();
        const active = [];
        const year = date.getFullYear();

        // Halloween : ancrée le 31 octobre, ± N jours (réglable dans le Dashboard)
        if (withinDays(date, new Date(year, 9, 31), windows.halloween)) active.push("halloween");

        // Noël : ancrée le 25 décembre, ± N jours — on teste l'année en cours ET la
        // précédente pour couvrir début janvier (le 25 décembre d'avant reste "récent").
        if (
            withinDays(date, new Date(year, 11, 25), windows.noel) ||
            withinDays(date, new Date(year - 1, 11, 25), windows.noel)
        ) active.push("noel");

        // Pâques : date mobile calculée chaque année, ± N jours (réglable)
        const easter = getEasterDate(year);
        if (withinDays(date, easter, windows.paques)) active.push("paques");

        return active;
    }

    function isSpeciesAvailableNow(s) {
        if (!s.event) return true;
        const required = Array.isArray(s.event) ? s.event : String(s.event).split(",").map((e) => e.trim()).filter(Boolean);
        if (required.length === 0) return true;
        const active = currentActiveEvents();
        return required.some((e) => active.includes(e));
    }

    const EVENT_LABELS = { halloween: "🎃 Halloween", noel: "🎄 Noël", paques: "🐣 Pâques" };
    function eventLabelFor(s) {
        const required = Array.isArray(s.event) ? s.event : String(s.event).split(",").map((e) => e.trim()).filter(Boolean);
        return required.map((e) => EVENT_LABELS[e] || e).join(" et ");
    }

    const COMMON_ORDER = () => Object.entries(getSpecies()).filter(([, s]) => s.rarity === "commun").map(([k]) => k);
    let commonIndex = 0;
    let pick = { speciesKey: "azur", trait: "aucun" };

    function randomTrait() {
        const keys = Object.keys(TRAITS);
        return keys[Math.floor(Math.random() * keys.length)];
    }

    function rollEgg() {
        const rates = loadEggRates();
        const species = getSpecies();
        const roll = Math.random() * 100;
        let acc = 0;
        let chosenRarity = "commun";
        for (const rarity of ["commun", "rare", "epique", "legendaire"]) {
            acc += rates[rarity] || 0;
            if (roll <= acc) { chosenRarity = rarity; break; }
        }
        const pool = Object.entries(species).filter(([k, s]) => s.rarity === chosenRarity && !s.hidden && isSpeciesAvailableNow(s));
        if (pool.length === 0) {
            // Rien de dispo dans cette rareté en ce moment (ex: tout événementiel hors saison) → repli sur un commun
            const fallback = Object.entries(species).filter(([k, s]) => s.rarity === "commun" && isSpeciesAvailableNow(s));
            const [key] = fallback[Math.floor(Math.random() * fallback.length)] || [COMMON_ORDER()[0]];
            return { speciesKey: key, trait: randomTrait() };
        }
        const [key] = pool[Math.floor(Math.random() * pool.length)];
        return { speciesKey: key, trait: randomTrait() };
    }

    function renderAdoptionCard() {
        const species = getSpecies();
        const s = species[pick.speciesKey];
        const rarity = RARITY_META[s.rarity];
        const trait = TRAITS[pick.trait];
        const card = document.getElementById("adoptionCard");
        card.innerHTML = `
            <div class="rarity-badge" style="background:${rarity.color};">${rarity.label}</div>
            <img src="${s.faceImg || s.coteImg}" class="adoption-photo" alt="${s.name}" onerror="this.onerror=null;this.src='./assets/img/species/mystery.svg';">
            <div class="adoption-name">${s.name}, ${s.nickname}</div>
            <div class="adoption-personality">${s.personality}</div>
            <div class="trait-badge">${trait.emoji} ${trait.label}</div>
        `;
    }

    // Le nom se pré-remplit avec celui du lapin affiché (modifiable ensuite).
    function showCommon(idx) {
        const order = COMMON_ORDER();
        commonIndex = (idx + order.length) % order.length;
        pick = { speciesKey: order[commonIndex], trait: randomTrait() };
        renderAdoptionCard();
        const s = getSpecies()[pick.speciesKey];
        document.getElementById("rabbitNameInput").value = s.name;
    }

    document.getElementById("prevBreedBtn").addEventListener("click", () => showCommon(commonIndex - 1));
    document.getElementById("nextBreedBtn").addEventListener("click", () => showCommon(commonIndex + 1));

    document.getElementById("rerollTraitBtn").addEventListener("click", () => {
        pick.trait = randomTrait();
        renderAdoptionCard();
    });

    showCommon(0);

    document.getElementById("adoptBtn").addEventListener("click", () => {
        const nameInput = document.getElementById("rabbitNameInput");
        const s = getSpecies()[pick.speciesKey];
        const name = nameInput.value.trim() || s.name;
        game = freshGame();
        if (name.trim().toLowerCase() === "azazel") {
            game.species = "az";
            game.trait = "az_special";
            showToast(`🍀 Tu as deviné son nom... Azazel te rejoint !`, "levelup");
        } else {
            game.species = pick.speciesKey;
            game.trait = pick.trait;
            showToast(`Bienvenue ${name} ! 🎉`, "success");
        }
        game.speciesNames[game.species] = name;
        game.ownedSpecies = [game.species];
        game.speciesTraits = { [game.species]: game.trait };
        startGameUI();
        autoSave();
        spawnParticles("🎉", 8);
    });

    document.getElementById("loadInsteadBtn").addEventListener("click", () => document.getElementById("importInput").click());

    // ============================================================
    // ENCYCLOPÉDIE — cartes cliquables (photo + nom), détails au clic
    // Libre d'accès pour le joueur. Le Dashboard (admin) est un lien
    // séparé, discret, tout en bas de la modale.
    // ============================================================
    function showEncyclopediaDetail(key) {
        const s = getSpecies()[key];
        const rarity = RARITY_META[s.rarity];
        document.getElementById("encyclopediaDetailCard").innerHTML = `
            <div class="encyclopedia-detail-card">
                <img src="${s.faceImg || s.coteImg}" alt="${s.name}" onerror="this.onerror=null;this.src='./assets/img/species/mystery.svg';">
                <div class="entry-body">
                    <div class="entry-header">
                        <strong>${s.name}, ${s.nickname}</strong>
                        <span class="rarity-badge small" style="background:${rarity.color};">${rarity.label}</span>
                    </div>
                    <p><em>${s.personality}</em></p>
                    <p>${s.story}</p>
                    <p><strong>Accessoire :</strong> ${s.accessory}</p>
                    <p><strong>Aime :</strong> ${(s.likes || []).join(", ") || "—"}</p>
                    <p><strong>N'aime pas :</strong> ${(s.dislikes || []).join(", ") || "—"}</p>
                    <p><strong>Pouvoir :</strong> ${s.power}</p>
                    <p class="entry-quote">« ${s.quote} »</p>
                </div>
            </div>`;
        document.getElementById("encyclopediaGrid").style.display = "none";
        document.getElementById("bossGrid").style.display = "none";
        document.getElementById("encyclopediaRelations").style.display = "none";
        document.getElementById("encyclopediaDetail").classList.add("active");
    }

    function showBossDetail(key) {
        const b = getBosses()[key];
        document.getElementById("encyclopediaDetailCard").innerHTML = `
            <div class="encyclopedia-detail-card">
                <img src="${b.faceImg || b.coteImg}" alt="${b.name}" onerror="this.onerror=null;this.src='./assets/img/species/mystery.svg';">
                <div class="entry-body">
                    <div class="entry-header">
                        <strong>${b.name}${b.nickname ? ", " + b.nickname : ""}</strong>
                        <span class="rarity-badge small" style="background:#7a3a3a;">Difficulté ${b.difficulty ?? "?"}</span>
                    </div>
                    ${b.rang ? `<p><em>${b.rang}</em></p>` : ""}
                    ${b.story ? `<p>${b.story.replace(/\n/g, "<br>")}</p>` : ""}
                    ${b.arme ? `<p><strong>Arme :</strong> ${b.arme}</p>` : ""}
                    ${b.personality ? `<p><strong>Personnalité :</strong> ${(Array.isArray(b.personality) ? b.personality.join(", ") : b.personality)}</p>` : ""}
                    <p><strong>Aime :</strong> ${(b.likes || []).join(", ") || "—"}</p>
                    <p><strong>N'aime pas :</strong> ${(b.dislikes || []).join(", ") || "—"}</p>
                    ${b.power ? `<p><strong>Pouvoir :</strong> ${b.power}</p>` : ""}
                    ${b.quote ? `<p class="entry-quote">« ${b.quote} »</p>` : ""}
                </div>
            </div>`;
        document.getElementById("encyclopediaGrid").style.display = "none";
        document.getElementById("bossGrid").style.display = "none";
        document.getElementById("encyclopediaRelations").style.display = "none";
        document.getElementById("encyclopediaDetail").classList.add("active");
    }

    function renderEncyclopedia() {
        const grid = document.getElementById("encyclopediaGrid");
        const species = getSpecies();
        const discovered = localStorage.getItem("lapinous_az_discovered") === "1";
        grid.innerHTML = "";
        Object.entries(species).forEach(([key, s]) => {
            if (s.hidden && !discovered && key !== game.species) return;
            const owned = (game.ownedSpecies || []).includes(key);
            const card = document.createElement("button");
            card.type = "button";
            card.className = "encyclopedia-card" + (owned ? "" : " locked");
            const imgSrc = owned ? (s.faceImg || s.coteImg) : "./assets/img/species/mystery.svg";
            const eventBadge = s.event && !isSpeciesAvailableNow(s) ? `<span class="event-badge">${eventLabelFor(s).split(" ")[0]}</span>` : "";
            card.innerHTML = `<img src="${imgSrc}" alt="${owned ? s.name : '???'}" onerror="this.onerror=null;this.src='./assets/img/species/mystery.svg';"><span class="card-name">${owned ? s.name : "???"}</span>${owned ? '<span class="owned-badge">✓</span>' : ""}${eventBadge}`;
            card.addEventListener("click", () => {
                if (owned) showEncyclopediaDetail(key);
                else if (s.event && !isSpeciesAvailableNow(s)) showToast(`Ce lapin n'apparaît que pendant ${eventLabelFor(s)} — reviens à cette période pour tenter ta chance !`, "warn");
                else showToast("Ce lapin n'est pas encore dans ta collection. Ouvre des œufs pour le débloquer !", "warn");
            });
            grid.appendChild(card);
        });
        const relBox = document.getElementById("encyclopediaRelations");
        relBox.innerHTML = "<strong>Relations connues :</strong><ul>" + RELATIONS_TEXT.map((r) => `<li>${r}</li>`).join("") + "</ul>";
    }

    function renderBossEncyclopedia() {
        const grid = document.getElementById("bossGrid");
        const bosses = getBosses();
        const discovered = game.discoveredBosses || [];
        grid.innerHTML = "";
        Object.entries(bosses).forEach(([key, b]) => {
            const found = discovered.includes(key);
            const card = document.createElement("button");
            card.type = "button";
            card.className = "encyclopedia-card" + (found ? "" : " locked");
            const imgSrc = found ? (b.faceImg || b.coteImg) : "./assets/img/species/mystery.svg";
            card.innerHTML = `<img src="${imgSrc}" alt="${found ? b.name : '???'}" onerror="this.onerror=null;this.src='./assets/img/species/mystery.svg';"><span class="card-name">${found ? b.name : "???"}</span>${found ? '<span class="owned-badge">✓</span>' : ""}`;
            card.addEventListener("click", () => {
                if (found) showBossDetail(key);
                else showToast("Ce boss n'a pas encore été rencontré. Pars à l'aventure depuis le jardin !", "warn");
            });
            grid.appendChild(card);
        });
    }

    function showEncyclopediaTab(tab) {
        document.getElementById("encyclopediaDetail").classList.remove("active");
        document.getElementById("tabRabbitsBtn").classList.toggle("active", tab === "rabbits");
        document.getElementById("tabBossesBtn").classList.toggle("active", tab === "bosses");
        document.getElementById("encyclopediaGrid").style.display = tab === "rabbits" ? "grid" : "none";
        document.getElementById("encyclopediaRelations").style.display = tab === "rabbits" ? "block" : "none";
        document.getElementById("bossGrid").style.display = tab === "bosses" ? "grid" : "none";
        if (tab === "rabbits") renderEncyclopedia();
        else renderBossEncyclopedia();
    }
    document.getElementById("tabRabbitsBtn").addEventListener("click", () => showEncyclopediaTab("rabbits"));
    document.getElementById("tabBossesBtn").addEventListener("click", () => showEncyclopediaTab("bosses"));
    document.getElementById("encyclopediaBackBtn").addEventListener("click", () => {
        const onBosses = document.getElementById("tabBossesBtn").classList.contains("active");
        showEncyclopediaTab(onBosses ? "bosses" : "rabbits");
    });
    document.getElementById("encyclopediaBtn").addEventListener("click", () => {
        showEncyclopediaTab("rabbits");
        $("#encyclopediaModal").modal("show");
    });

    // ============================================================
    // DÉMARRAGE DU JEU
    // ============================================================
    function startGameUI() {
        adoptionScreen.style.display = "none";
        gameRoot.style.display = "flex";
        mainNav.style.display = "flex";
        const s = getSpecies()[game.species];
        brandTitle.textContent = "🐰 " + (currentRabbitName() || s.name);
        if (game.species === "az") localStorage.setItem("lapinous_az_discovered", "1");
        updateStatusBars();
        document.getElementById("level").innerText = progress().currentLevel;
        updateGameArea("default");
    }

    function currentTrait() {
        return game.species === "az" ? AZ_TRAIT : (TRAITS[game.trait] || TRAITS.aucun);
    }
    function traitGain(stat, base) {
        const t = currentTrait();
        const bonus = (t.gain && t.gain[stat]) || 0;
        return Math.max(1, base + bonus);
    }

    // ============================================================
    // BARRES DE STATUT
    // ============================================================
    function updateStatusBars() {
        foodBar.style.width = progress().food + "%";
        energyBar.style.width = progress().energy + "%";
        cleanlinessBar.style.width = progress().cleanliness + "%";
        friendshipBar.style.width = progress().friendship + "%";
    }
    function bounceRabbit() {
        rabbitImage.classList.remove("bounce");
        void rabbitImage.offsetWidth;
        rabbitImage.classList.add("bounce");
    }

    // ============================================================
    // ZONES
    // ============================================================
    function upgradeAvailable(room) {
        return (
            !progress().improvements[room] &&
            progress().currentLevel >= ROOM_REQUIRED_LEVEL[room] &&
            progress().currentLevel > progress().lastUpgradeLevel &&
            progress().friendship >= UPGRADE_COST
        );
    }
    function upgradeButtonHtml(room, icon, onclick) {
        if (progress().improvements[room]) return "";
        if (progress().currentLevel < ROOM_REQUIRED_LEVEL[room]) return "";
        const enabled = upgradeAvailable(room);
        return `<button class="action-btn upgrade" onclick="${onclick}" ${enabled ? "" : "disabled"}>
            <img class="action-icon" src="${icon}" alt="">
            <span>Améliorer (${UPGRADE_COST} 💛)</span>
        </button>`;
    }

    function speciesFaceImg() {
        const s = getSpecies()[game.species];
        return (s && s.faceImg) || "./assets/img/species/mystery.svg";
    }

    // Tous tes lapins partagent le même niveau/stats/progression — changer ici
    // ne fait que choisir lequel te représente (et son trait bonus/malus).
    function collectionSwitcherHtml() {
        const owned = game.ownedSpecies || [];
        if (owned.length <= 1) return "";
        const species = getSpecies();
        const cards = owned
            .map((key) => {
                const s = species[key];
                if (!s) return "";
                const active = key === game.species;
                const img = s.faceImg || s.coteImg || "./assets/img/species/mystery.svg";
                const displayName = game.speciesNames[key] || s.name;
                return `<button class="collection-card${active ? " active" : ""}" onclick="switchActiveSpecies('${key}')" ${active ? "disabled" : ""}>
                    <img src="${img}" alt="${displayName}" onerror="this.onerror=null;this.src='./assets/img/species/mystery.svg';">
                    <span>${displayName}</span>
                </button>`;
            })
            .join("");
        return `<div class="collection-switcher"><p class="upgrade-locked-note">Tes lapins (clique pour changer ton compagnon actif) :</p><div class="collection-row">${cards}</div></div>`;
    }

    window.switchActiveSpecies = function (key) {
        if (key === game.species) return;
        const s = getSpecies()[key];
        if (!s) return;
        game.species = key;
        game.trait = key === "az" ? "az_special" : game.speciesTraits[key] || "aucun";
        brandTitle.textContent = "🐰 " + currentRabbitName();
        document.getElementById("level").innerText = progress().currentLevel;
        updateStatusBars();
        autoSave();
        refreshCurrentZone();
        showToast(`${currentRabbitName()} devient ton compagnon actif ! 🐰 (Niveau ${progress().currentLevel}, tout lui est propre)`, "success");
    };

    const zones = {
        default: {
            label: "🏡 Salon",
            image: () => speciesFaceImg(),
            content: () => `
                <p class="welcome-msg">Te voilà à la maison avec ${currentRabbitName() || "ton lapin"} ! Choisis une pièce en bas pour t'en occuper.</p>
                ${collectionSwitcherHtml()}
                <div class="egg-shop">
                    <div class="carrot-counter">🥕 ${game.carrots} · 🥚 ${game.eggs}</div>
                    <div class="action-row">
                        <button class="action-btn" onclick="buyEgg()"><span class="action-icon-emoji">🥚</span><span>Acheter (${EGG_COST} 🥕)</span></button>
                        <button class="action-btn upgrade" onclick="openEgg()" ${game.eggs > 0 ? "" : "disabled"}><span class="action-icon-emoji">🎁</span><span>Ouvrir un œuf</span></button>
                    </div>
                    <p class="upgrade-locked-note">Gagne des carottes 🥕 en combattant les boss du jardin, achète des œufs ici, puis ouvre-les pour tenter d'obtenir un nouveau compagnon rare, épique ou légendaire (visible dans l'encyclopédie).</p>
                </div>`,
        },
        cuisine: {
            label: "🥕 Cuisine",
            image: () => `./assets/img/zone_cuisine/lapin_cuisine.gif`,
            content: () => progress().improvements.cuisine
                ? `<div class="action-row"><button class="action-btn upgraded" onclick="feedRabbit()"><img class="action-icon" src="./assets/img/zone_cuisine/pomme.png" alt=""><span>Nourrir</span></button></div>`
                : `<div class="action-row">
                    <button class="action-btn" onclick="feedRabbit()"><img class="action-icon" src="./assets/img/zone_cuisine/carotte.png" alt=""><span>Nourrir</span></button>
                    ${upgradeButtonHtml("cuisine", "./assets/img/zone_cuisine/pomme.png", "improveFeedRabbit()")}
                </div>`,
        },
        chambre: {
            label: "🛏️ Chambre",
            image: () => `./assets/img/zone_Chambre/dodo.gif`,
            content: () => progress().improvements.chambre
                ? `<div class="action-row"><button class="action-btn upgraded" onclick="putRabbitToSleep()"><img class="action-icon" src="./assets/img/zone_Chambre/lit.png" alt=""><span>Dodo</span></button></div>`
                : `<div class="action-row">
                    <button class="action-btn" onclick="putRabbitToSleep()"><img class="action-icon" src="./assets/img/zone_Chambre/panier.png" alt=""><span>Dodo</span></button>
                    ${upgradeButtonHtml("chambre", "./assets/img/zone_Chambre/lit.png", "improvePutRabbitToSleep()")}
                </div>`,
        },
        sdb: {
            label: "🛁 Salle de bain",
            image: () => `./assets/img/zone_SdB/lapin_SdB.gif`,
            content: () => progress().improvements.sdb
                ? `<div class="action-row"><button class="action-btn upgraded" onclick="cleanRabbit()"><img class="action-icon" src="./assets/img/zone_SdB/pommeau.png" alt=""><span>Nettoyer</span></button></div>`
                : `<div class="action-row">
                    <button class="action-btn" onclick="cleanRabbit()"><img class="action-icon" src="./assets/img/zone_SdB/brosse.png" alt=""><span>Nettoyer</span></button>
                    ${upgradeButtonHtml("sdb", "./assets/img/zone_SdB/pommeau.png", "improveCleanRabbit()")}
                </div>`,
        },
        jardin: {
            label: "🌿 Jardin",
            image: () => `./assets/img/zone_jardin/entrenement.gif`,
            content: () => {
                const icon = progress().improvements.jardin ? "./assets/img/zone_jardin/agilité.webp" : "./assets/img/zone_jardin/dressage.png";
                const btnClass = progress().improvements.jardin ? "action-btn upgraded" : "action-btn";
                return `<div class="action-row">
                    <button class="${btnClass}" onclick="startAgility()"><img class="action-icon" src="${icon}" alt=""><span>Jouer</span></button>
                    ${progress().improvements.jardin ? "" : upgradeButtonHtml("jardin", "./assets/img/zone_jardin/agilité.webp", "improvePlayWithRabbit()")}
                    <button class="action-btn adventure" onclick="openAdventure()"><span class="action-icon-emoji">⚔️</span><span>Aventure</span></button>
                </div>
                <div class="carrot-counter">🥕 ${game.carrots} carotte${game.carrots > 1 ? "s" : ""}</div>`;
            },
        },
    };

    function updateGameArea(zone) {
        currentZone = zone;
        gameArea.innerHTML = zones[zone].content();
        body.className = "";
        body.classList.add(zone);
        rabbitImage.onerror = () => { rabbitImage.onerror = null; rabbitImage.src = "./assets/img/species/mystery.svg"; };
        rabbitImage.src = zones[zone].image();
        rabbitImage.classList.toggle("photo-frame", zone === "default");
        gameArea.appendChild(rabbitImage);
        sceneLabel.textContent = zones[zone].label;
        document.querySelectorAll(".room-tab").forEach((btn) => btn.classList.toggle("active", btn.dataset.zone === zone));
    }
    function refreshCurrentZone() { updateGameArea(currentZone); }

    // ============================================================
    // STATUTS / NIVEAU
    // ============================================================
    function checkStatus() {
        if (progress().food <= 10) showToast(`${currentRabbitName() || "Ton lapin"} a faim ! 🥕`, "warn");
        if (progress().energy <= 10) showToast(`${currentRabbitName() || "Ton lapin"} est fatigué ! 😴`, "warn");
        if (progress().cleanliness <= 10) showToast(`${currentRabbitName() || "Ton lapin"} a besoin d'un bain ! 🫧`, "warn");
    }
    function checkLevelUp() {
        const nextThreshold = progress().currentLevel * 25;
        if (progress().friendshipTotal >= nextThreshold) {
            progress().currentLevel += 1;
            progress().food = Math.min(progress().food + 25, 100);
            progress().energy = Math.min(progress().energy + 25, 100);
            progress().cleanliness = Math.min(progress().cleanliness + 25, 100);
            document.getElementById("level").innerText = progress().currentLevel;
            showToast(`🎉 Niveau ${progress().currentLevel} atteint !`, "levelup");
            spawnParticles("🎉", 10);
            refreshCurrentZone();
            updateStatusBars();
        }
    }
    function gainFriendship(amount) {
        progress().friendship = Math.min(progress().friendship + amount, 100);
        progress().friendshipTotal += amount;
        checkLevelUp();
    }

    // ============================================================
    // ACTIONS
    // ============================================================
    window.feedRabbit = function () {
        if (progress().food >= 100) { showToast("Le lapin est déjà rassasié !"); }
        else {
            progress().food = Math.min(progress().food + traitGain("food", 5) + progress().boosts.food, 100);
            gainFriendship(5); bounceRabbit(); spawnParticles("🥕", 5);
        }
        updateStatusBars(); checkStatus(); autoSave();
    };
    window.putRabbitToSleep = function () {
        if (progress().energy >= 100) { showToast("Le lapin est déjà bien reposé !"); }
        else {
            progress().energy = Math.min(progress().energy + traitGain("energy", 5) + progress().boosts.energy, 100);
            gainFriendship(5); bounceRabbit(); spawnParticles("💤", 5);
        }
        updateStatusBars(); checkStatus(); autoSave();
    };
    window.cleanRabbit = function () {
        if (progress().cleanliness >= 100) { showToast("Le lapin est déjà tout propre !"); }
        else {
            progress().cleanliness = Math.min(progress().cleanliness + 5 + progress().boosts.cleanliness, 100);
            gainFriendship(5); bounceRabbit(); spawnParticles("🫧", 5);
        }
        updateStatusBars(); checkStatus(); autoSave();
    };

    // ---- Mini-jeu d'agilité ----
    let agilityRAF = null;
    window.startAgility = function () {
        if (progress().food <= 5 || progress().energy <= 5 || progress().cleanliness <= 5) {
            showToast("Votre lapin n'est pas en état de jouer maintenant !", "warn");
            return;
        }
        const t = currentTrait();
        const sweetWidth = Math.min(55, Math.max(15, 30 + (t.agilityBonus || 0)));
        const sweetStart = 50 - sweetWidth / 2;

        gameArea.innerHTML = `
            <div class="action-row" style="flex-direction:column;align-items:center;">
                <div class="agility-hint">Clique sur "Sauter !" quand le curseur est dans la zone verte 🎯</div>
                <div class="agility-track" id="agilityTrack">
                    <div class="agility-sweet" style="left:${sweetStart}%;width:${sweetWidth}%;"></div>
                    <div class="agility-marker" id="agilityMarker" style="left:0%;"></div>
                </div>
                <button class="action-btn" onclick="jumpAgility(${sweetStart}, ${sweetWidth})" style="margin-top:14px;"><span>Sauter !</span></button>
            </div>`;
        gameArea.appendChild(rabbitImage);

        const marker = document.getElementById("agilityMarker");
        const start = performance.now();
        function loop(now) {
            const t2 = (now - start) / 900;
            const pos = ((Math.sin(t2) + 1) / 2) * 100;
            if (marker) marker.style.left = pos + "%";
            window._agilityPos = pos;
            agilityRAF = requestAnimationFrame(loop);
        }
        agilityRAF = requestAnimationFrame(loop);
    };

    window.jumpAgility = function (sweetStart, sweetWidth) {
        cancelAnimationFrame(agilityRAF);
        const pos = window._agilityPos || 0;
        const success = pos >= sweetStart && pos <= sweetStart + sweetWidth;
        if (success) {
            gainFriendship(5 + traitGain("friendship", 0) + progress().boosts.friendship);
            progress().food = Math.max(progress().food - 5, 0);
            progress().energy = Math.max(progress().energy - 5, 0);
            progress().cleanliness = Math.max(progress().cleanliness - 5, 0);
            showToast(`${currentRabbitName() || "Ton lapin"} réussit son saut ! 🐇✨`, "success");
            spawnParticles("💛", 6);
        } else {
            progress().friendship = Math.max(progress().friendship - 5, 0);
            progress().cleanliness = Math.max(progress().cleanliness - 8, 0);
            showToast(`${currentRabbitName() || "Ton lapin"} rate son saut et se salit un peu... 😥`, "warn");
            spawnParticles("💦", 4);
        }
        bounceRabbit(); updateStatusBars(); checkStatus(); autoSave();
        setTimeout(() => refreshCurrentZone(), 700);
    };

    // ---- Aventure / combat contre les boss légumes ----
    function playerPower() {
        const t = currentTrait();
        const combatBonus = (t.gain && (t.gain.friendship || 0)) * 2;
        const conditionBonus = Math.round(((progress().food + progress().energy + progress().cleanliness) / 3) / 5);
        return progress().currentLevel * 8 + combatBonus + conditionBonus;
    }

    window.openAdventure = function () {
        if (progress().energy <= 10 || progress().food <= 10) {
            showToast("Ton lapin est trop épuisé ou affamé pour partir à l'aventure !", "warn");
            return;
        }
        body.classList.add("battle-scene");
        const bosses = getBosses();
        const power = playerPower();
        const rows = Object.entries(bosses)
            .sort((a, b) => a[1].difficulty - b[1].difficulty)
            .map(([key, b]) => {
                const diff = b.difficulty - power;
                const label = diff > 15 ? "💀 Très dangereux" : diff > 0 ? "⚠️ Difficile" : "🙂 Faisable";
                return `<button class="boss-card" onclick="prepareFight('${key}')">
                    <img src="${b.faceImg || b.coteImg}" alt="${b.name}" onerror="this.onerror=null;this.src='./assets/img/species/mystery.svg';">
                    <div class="boss-name">${b.name}</div>
                    <div class="boss-power">Difficulté ${b.difficulty}</div>
                    <div class="boss-diff">${label}</div>
                </button>`;
            })
            .join("");
        gameArea.innerHTML = `
            <div class="action-row" style="flex-direction:column;align-items:center;">
                <div class="agility-hint">Ta puissance actuelle : <strong>${power}</strong> — choisis un adversaire 🥕</div>
                <div class="boss-grid">${rows}</div>
                <button class="ghost-btn" onclick="leaveAdventure()" style="margin-top:10px;">← Retour au jardin</button>
            </div>`;
        gameArea.appendChild(rabbitImage);
    };

    window.leaveAdventure = function () {
        body.classList.remove("battle-scene");
        refreshCurrentZone();
    };

    // Écran de confrontation : ton lapin (vue 3/4) face au boss, avant résolution.
    // Le boss est marqué comme "découvert" dès qu'on le rencontre (visible ensuite
    // dans l'encyclopédie), pas seulement en cas de victoire.
    window.prepareFight = function (key) {
        const boss = getBosses()[key];
        const s = getSpecies()[game.species];
        if (!boss) return;

        if (!game.discoveredBosses) game.discoveredBosses = [];
        if (!game.discoveredBosses.includes(key)) {
            game.discoveredBosses.push(key);
            autoSave();
        }

        gameArea.innerHTML = `
            <div class="vs-screen">
                <div class="vs-side">
                    <img src="${s.coteImg || s.faceImg}" alt="${s.name}" onerror="this.onerror=null;this.src='./assets/img/species/mystery.svg';">
                    <div class="vs-name">${currentRabbitName() || s.name}</div>
                    <div class="vs-sub">Niveau ${progress().currentLevel}</div>
                </div>
                <div class="vs-mark">⚔️</div>
                <div class="vs-side">
                    <img src="${boss.coteImg || boss.faceImg}" alt="${boss.name}" onerror="this.onerror=null;this.src='./assets/img/species/mystery.svg';">
                    <div class="vs-name">${boss.name}</div>
                    <div class="vs-sub">Difficulté ${boss.difficulty}</div>
                </div>
            </div>
            <div class="action-row" style="margin-top:16px;">
                <button class="action-btn adventure" onclick="fightBoss('${key}')"><span>⚔️ Combattre !</span></button>
                <button class="ghost-btn" onclick="openAdventure()">← Choisir un autre adversaire</button>
            </div>`;
    };

    window.fightBoss = function (key) {
        const boss = getBosses()[key];
        if (!boss) return;
        const power = playerPower();
        const successChance = Math.min(0.92, Math.max(0.08, 0.5 + (power - boss.difficulty) / (boss.difficulty * 2 || 1)));
        const win = Math.random() < successChance;

        progress().energy = Math.max(progress().energy - 10, 0);
        progress().cleanliness = Math.max(progress().cleanliness - 5, 0);

        if (win) {
            const reward = Math.max(2, Math.round(boss.difficulty * 0.3) + Math.floor(Math.random() * 3));
            game.carrots += reward;
            gainFriendship(3);
            showToast(`Victoire contre ${boss.name} ! +${reward} 🥕`, "success");
            spawnParticles("🥕", 8);
        } else {
            progress().friendship = Math.max(progress().friendship - 5, 0);
            showToast(`${boss.name} était trop fort... ${currentRabbitName() || "Ton lapin"} rentre fatigué. 😥`, "warn");
            spawnParticles("💦", 5);
        }
        updateStatusBars();
        checkStatus();
        autoSave();
        setTimeout(() => window.openAdventure(), 900);
    };

    // ---- Boutique à œufs (Salon) ----
    window.buyEgg = function () {
        if (game.carrots < EGG_COST) {
            showToast(`Pas assez de carottes (il en faut ${EGG_COST}).`, "warn");
            return;
        }
        game.carrots -= EGG_COST;
        game.eggs += 1;
        showToast("Œuf acheté ! 🥚", "success");
        spawnParticles("🥚", 4);
        autoSave();
        refreshCurrentZone();
    };

    window.openEgg = function () {
        if (game.eggs <= 0) {
            showToast("Tu n'as aucun œuf à ouvrir. Achète-en un d'abord !", "warn");
            return;
        }
        game.eggs -= 1;
        const result = rollEgg();
        const s = getSpecies()[result.speciesKey];
        const isNew = !game.ownedSpecies.includes(result.speciesKey);
        if (isNew) {
            game.ownedSpecies.push(result.speciesKey);
            game.speciesTraits[result.speciesKey] = result.trait;
            game.speciesNames[result.speciesKey] = s.name;
        }
        showToast(
            isNew
                ? `🥚 L'œuf éclot... c'est ${s.name} (${RARITY_META[s.rarity].label}) ! Nouveau dans ton encyclopédie 📖 — clique sur lui dans le Salon pour jouer avec.`
                : `🥚 L'œuf éclot... encore un ${s.name} (${RARITY_META[s.rarity].label}). Il rejoint la collection.`,
            "levelup"
        );
        spawnParticles("✨", 10);
        autoSave();
        refreshCurrentZone();
    };

    // ---- Améliorations ----
    function purchaseUpgrade(room, statKey, message) {
        if (!upgradeAvailable(room)) { showToast("Pas encore assez d'amitié, ou amélioration déjà achetée récemment.", "warn"); return; }
        progress().friendship -= UPGRADE_COST;
        progress().boosts[statKey] += 2;
        progress().improvements[room] = true;
        progress().lastUpgradeLevel = progress().currentLevel;
        showToast(message, "success");
        spawnParticles("✨", 8);
        updateStatusBars(); refreshCurrentZone(); autoSave();
    }
    window.improveFeedRabbit = () => purchaseUpgrade("cuisine", "food", "La carotte devient une pomme : votre lapin se nourrit mieux !");
    window.improvePutRabbitToSleep = () => purchaseUpgrade("chambre", "energy", "Le panier devient un vrai lit : votre lapin récupère mieux !");
    window.improveCleanRabbit = () => purchaseUpgrade("sdb", "cleanliness", "La brosse devient une douche : votre lapin se nettoie mieux !");
    window.improvePlayWithRabbit = () => purchaseUpgrade("jardin", "friendship", "Le dressage devient un parcours d'agilité !");

    // ============================================================
    // RENOMMER
    // ============================================================
    document.getElementById("renameBtn").addEventListener("click", () => {
        document.getElementById("renameInput").value = currentRabbitName();
        $("#renameModal").modal("show");
    });
    document.getElementById("renameConfirmBtn").addEventListener("click", () => {
        const val = document.getElementById("renameInput").value.trim();
        if (val) {
            if (val.toLowerCase() === "azazel" && game.species !== "az") {
                game.species = "az";
                game.trait = "az_special";
                if (!game.ownedSpecies.includes("az")) game.ownedSpecies.push("az");
                localStorage.setItem("lapinous_az_discovered", "1");
                game.speciesNames.az = val;
                brandTitle.textContent = "🐰 " + val;
                refreshCurrentZone();
                showToast("🍀 Azazel a répondu à son nom... et prend sa place !", "levelup");
                spawnParticles("🍀", 10);
            } else {
                game.speciesNames[game.species] = val;
                brandTitle.textContent = "🐰 " + val;
                showToast("Nom mis à jour !", "success");
            }
            autoSave();
        }
        $("#renameModal").modal("hide");
    });

    // ============================================================
    // DÉCONNEXION — retour à l'écran de sélection des lapins
    // ============================================================
    document.getElementById("logoutBtn").addEventListener("click", () => {
        const hasSave = loadSavesList().length > 0;
        const warning = hasSave
            ? "Te déconnecter ramène à l'écran de sélection des lapins. Pense à bien avoir sauvegardé dans un emplacement (💾) si tu veux le retrouver."
            : "⚠️ Tu n'as AUCUNE sauvegarde dans un emplacement (💾) ! Si tu te déconnectes maintenant, ce lapin sera perdu définitivement. Continuer quand même ?";
        if (!window.confirm(warning)) return;

        localStorage.removeItem(AUTOSAVE_KEY);
        game = freshGame();
        currentZone = "default";
        gameRoot.style.display = "none";
        mainNav.style.display = "none";
        adoptionScreen.style.display = "flex";
        showCommon(0);
        showToast("Déconnecté. À bientôt ! 👋");
    });

    // ============================================================
    // NAVIGATION
    // ============================================================
    document.getElementById("salonBtn").addEventListener("click", () => updateGameArea("default"));
    document.getElementById("cuisineBtn").addEventListener("click", () => updateGameArea("cuisine"));
    document.getElementById("chambreBtn").addEventListener("click", () => updateGameArea("chambre"));
    document.getElementById("jardinBtn").addEventListener("click", () => updateGameArea("jardin"));
    document.getElementById("sdbBtn").addEventListener("click", () => updateGameArea("sdb"));
    document.getElementById("saveModal").addEventListener("show.bs.modal", () => {
        renderSavesList();
        renderFolderSaves();
    });

    // ============================================================
    // CYCLE JOUR / NUIT
    // ============================================================
    function updateDayNight() {
        const h = new Date().getHours();
        let phase = "day";
        if (h >= 6 && h < 11) phase = "morning";
        else if (h >= 11 && h < 18) phase = "day";
        else if (h >= 18 && h < 21) phase = "evening";
        else phase = "night";
        body.setAttribute("data-time", phase);
    }
    updateDayNight();
    setInterval(updateDayNight, 5 * 60 * 1000);

    const SEASON_BANNER_TEXT = {
        halloween: "🎃 Halloween est là ! Des lapins effrayants rôdent dans les œufs...",
        noel: "🎄 Noël est là ! Des invités légendaires apparaissent dans les œufs...",
        paques: "🐣 Pâques est là ! La chasse aux lapins légendaires est ouverte...",
    };
    function updateSeasonalDecor() {
        const active = currentActiveEvents();
        ["halloween", "noel", "paques"].forEach((e) => body.classList.toggle("season-" + e, active.includes(e)));
        const banner = document.getElementById("eventBanner");
        if (!banner) return;
        if (active.length === 0) {
            banner.style.display = "none";
            banner.innerHTML = "";
            return;
        }
        banner.innerHTML = active.map((e) => `<span>${SEASON_BANNER_TEXT[e]}</span>`).join("");
        banner.style.display = "flex";
    }
    updateSeasonalDecor();
    setInterval(updateSeasonalDecor, 5 * 60 * 1000);

    // ============================================================
    // RAPPEL DE RETOUR
    // ============================================================
    function checkComeback() {
        const last = parseInt(localStorage.getItem("lapinous_last_visit") || "0", 10);
        const now = Date.now();
        if (last && now - last > 6 * 60 * 60 * 1000) {
            setTimeout(() => showToast(`Ça faisait longtemps ! ${currentRabbitName() || "Ton lapin"} est content de te revoir 💛`, "success"), 800);
        }
        localStorage.setItem("lapinous_last_visit", String(now));
    }

    // ============================================================
    // INITIALISATION
    // ============================================================
    const auto = localStorage.getItem(AUTOSAVE_KEY);
    if (auto) {
        try {
            applyLoadedGame(JSON.parse(auto));
            checkComeback();
        } catch (e) {}
    }
    });
});
