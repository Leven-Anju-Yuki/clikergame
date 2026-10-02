document.addEventListener("DOMContentLoaded", () => {
    Promise.all([
        window.LapinousContentReady || Promise.resolve(),
        window.LapinousPuzzlesReady || Promise.resolve(),
    ]).then(() => {
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
            aucun: {
                label: "Aucun trait particulier",
                emoji: "🐇",
                desc: "Un compagnon parfaitement équilibré.",
                gain: {},
            },
            petit_mangeur: {
                label: "Petit mangeur",
                emoji: "🥕",
                desc: "Se rassasie vite : +3 à chaque repas.",
                gain: { food: 3 },
            },
            petit_dormeur: {
                label: "Petit dormeur",
                emoji: "⭐",
                desc: "Récupère vite : +3 d'énergie au dodo.",
                gain: { energy: 3 },
            },
            grand_sportif: {
                label: "Grand sportif",
                emoji: "⚡",
                desc: "Doué en agilité : sauts plus faciles, +3 d'amitié.",
                gain: { friendship: 3 },
                agilityBonus: 12,
            },
            glouton: {
                label: "Glouton (malchance)",
                emoji: "🍽️",
                desc: "Toujours affamé : -2 à chaque repas.",
                gain: { food: -2 },
            },
            gros_dormeur: {
                label: "Gros dormeur (malchance)",
                emoji: "🛌",
                desc: "Dur à réveiller : -2 d'énergie au dodo.",
                gain: { energy: -2 },
            },
            maladroit: {
                label: "Maladroit (malchance)",
                emoji: "🤕",
                desc: "Sauts difficiles, -2 d'amitié, tombe plus facilement.",
                gain: { friendship: -2 },
                agilityBonus: -8,
            },
        };
        const AZ_TRAIT = {
            label: "Chance infinie",
            emoji: "🍀",
            desc: "Aucun malus possible.",
            gain: { food: 3, friendship: 2 },
            agilityBonus: 15,
        };

        // ============================================================
        // ÉTAT DU JEU
        // ============================================================
        function freshSpeciesProgress() {
            return {
                food: 25,
                energy: 25,
                cleanliness: 25,
                friendship: 0,
                friendshipTotal: 0,
                currentLevel: 1,
                lastUpgradeLevel: 0,
                boosts: { food: 0, energy: 0, cleanliness: 0, friendship: 0 },
                improvements: { cuisine: false, chambre: false, sdb: false, jardin: false },
                // Les doublons peuvent renforcer définitivement l'attaque de CE lapin.
                // 5 segments, +2 puissance par segment, soit +10 au maximum.
                attackTraining: { points: 0, max: 5, bonus: 0, completed: false },
                // Progression propre à ce lapin dans les mini-jeux.
                minigames: {
                    puzzle: { unlockedPuzzle: 0, puzzles: {} },
                    memory: { level: 0, completed: 0 },
                    lapidoku: { level: 0, completed: 0 },
                },
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
                duplicateCounts: {},
                records: { eggsOpened: 0, eggsBought: 0, bossesDefeated: 0, agilityPlayed: 0, puzzlesCompleted: 0 },
                audio: { muted: false, ambience: true, sfx: true },
            };
        }

        // Renvoie (et crée si besoin) la progression du lapin actuellement actif.
        function progress() {
            if (!game.progress[game.species]) game.progress[game.species] = freshSpeciesProgress();
            ensureAttackTraining(game.progress[game.species]);
            return game.progress[game.species];
        }

        function ensureAttackTraining(p) {
            if (!p.attackTraining)
                p.attackTraining = { points: 0, max: 5, bonus: 0, completed: false };
            p.attackTraining.max = Number(p.attackTraining.max) || 5;
            p.attackTraining.points = Math.max(
                0,
                Math.min(p.attackTraining.max, Number(p.attackTraining.points) || 0),
            );
            p.attackTraining.bonus = p.attackTraining.points;
            p.attackTraining.completed =
                p.attackTraining.completed || p.attackTraining.points >= p.attackTraining.max;
            return p.attackTraining;
        }

        function progressForSpecies(key) {
            if (!game.progress[key]) game.progress[key] = freshSpeciesProgress();
            ensureAttackTraining(game.progress[key]);
            return game.progress[key];
        }

        // Nom du lapin actif (chacun a le sien).
        function currentRabbitName() {
            return game.speciesNames[game.species] || (getSpecies()[game.species] || {}).name || "";
        }

        let game = freshGame();
        let currentZone = "default";
        const BOSS_MYSTERY_IMG = "./assets/img/bosses/mystery_boss.svg";
        const UPGRADE_COST = 20;
        const EGG_COST = 45;
        const ROOM_REQUIRED_LEVEL = { cuisine: 2, chambre: 3, sdb: 4, jardin: 5 };

        // ============================================================
        // TOASTS
        // ============================================================
        function showToast(message, type = "", durationOverride = null) {
            if (!toastContainer) return;
            const el = document.createElement("div");
            el.className = "toast readable-toast" + (type ? " " + type : "");
            const text = document.createElement("span");
            text.className = "toast-message";
            text.textContent = message;
            el.setAttribute("role", "status");
            const close = document.createElement("button");
            close.className = "toast-close";
            close.type = "button";
            close.setAttribute("aria-label", "Fermer la notification");
            close.textContent = "OK";
            // Fondu propre avant de retirer réellement le toast du DOM
            // (la CSS n'avait pas de durée d'animation : sans ça le popup
            // disparaissait quasi instantanément, avant même d'être lu).
            const dismiss = () => { el.classList.add("toast-leaving"); setTimeout(() => el.remove(), 260); };
            close.onclick = dismiss;
            el.append(text, close);
            toastContainer.appendChild(el);
            // Toutes les notifications se ferment seules, y compris les avertissements.
            const duration = Math.min(12000, Math.max(1500, durationOverride ?? (String(message).length > 90 ? 8000 : 5000)));
            setTimeout(dismiss, duration);
            while (toastContainer.children.length > 3) toastContainer.firstElementChild.remove();
        }

        function ensureNewSystems() {
            game.records = { eggsOpened: 0, eggsBought: 0, bossesDefeated: 0, agilityPlayed: 0, puzzlesCompleted: 0, ...(game.records || {}) };
            game.audio = { muted: false, ambience: true, sfx: true, ...(game.audio || {}) };
            window.LapinousAchievements.ensure(game);
        }

        function recordAchievement(metric, amount = 1, dailyAmount = amount) {
            window.LapinousAchievements.record(game, metric, amount, new Date(), dailyAmount);
        }

        let achievementTab = 'daily';
        function achievementPanelHtml() {
            const entries = window.LapinousAchievements.list(game);
            const rows = list => list.map(a => `<article class="achievement-row ${a.claimed ? 'claimed' : a.value >= a.target ? 'ready' : ''}">
                <div><span class="achievement-status">${a.claimed ? '✓ Accompli' : a.value >= a.target ? '🎁 Récompense disponible' : 'En cours'}${a.step ? ` · Palier ${a.step}/${a.steps}` : ''}</span><strong>${a.title}</strong><small>${a.text || 'Objectif permanent'}${a.day && !entries.today.includes(a) ? ` · ${a.day}` : ''}</small>
                <progress max="${a.target}" value="${a.value}" aria-label="${a.title}"></progress><small>${a.value} / ${a.target}</small></div>
                <button type="button" class="ghost-btn" data-achievement="${a.id}" data-day="${a.day || ''}" ${a.claimed || a.value < a.target ? 'disabled' : ''}>${a.claimed ? '✓ Récupéré' : a.value >= a.target ? `Récupérer ${a.reward} 🥕` : `${a.reward} 🥕`}</button>
                </article>`).join('');
            return `<section class="achievement-section" data-records-panel="daily"><h3>☀️ Défis du jour</h3><p>Renouvelés à minuit, selon l’heure de ton appareil. Les récompenses acquises restent récupérables.</p>${rows(entries.today)}
                ${entries.pending.length ? `<h3>🎁 Récompenses des jours précédents</h3>${rows(entries.pending)}` : ''}</section>
                <section class="achievement-section" data-records-panel="longterm"><h3>🌟 Grands succès</h3><p>Récupère ta récompense pour révéler le palier suivant. Les jeux du Salon et l’agilité du Jardin comptent.</p>${rows(entries.permanent)}</section>`;
        }

        function attachAchievementPanel(overlay) {
            const card = overlay.querySelector('.records-card');
            card.setAttribute('role', 'dialog');
            card.setAttribute('aria-modal', 'true');
            card.setAttribute('aria-label', 'Succès et records');
            const grid = card.querySelector('.records-grid');
            const nav = document.createElement('nav');
            nav.className = 'records-tabs';
            nav.setAttribute('aria-label', 'Catégories des succès');
            nav.innerHTML = [['daily','☀️ Par jour'],['longterm','🌟 Long terme'],['records','🏆 Records']].map(([id,label]) => `<button type="button" data-records-tab="${id}" aria-controls="records-panel-${id}">${label}</button>`).join('');
            const content = document.createElement('div');
            content.className = 'records-body';
            content.innerHTML = achievementPanelHtml() + `<section data-records-panel="records"><h3>Tous tes records</h3><p class="achievement-total">Récompenses récupérées : ${game.achievements.earnedCarrots} 🥕 · ${Object.keys(game.achievements.days).length} jours enregistrés</p></section>`;
            content.querySelector('[data-records-panel="records"]').prepend(grid);
            card.append(nav, content);
            const selectTab = id => {
                achievementTab = id;
                nav.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.recordsTab === id)));
                content.querySelectorAll('[data-records-panel]').forEach(p => {
                    p.id = `records-panel-${p.dataset.recordsPanel}`;
                    p.hidden = p.dataset.recordsPanel !== id;
                });
                content.scrollTop = 0;
            };
            selectTab(achievementTab);
            overlay.addEventListener('click', e => {
                const tab = e.target.closest('[data-records-tab]');
                if (tab) { selectTab(tab.dataset.recordsTab); return; }
                const button = e.target.closest('[data-achievement]');
                if (!button || button.disabled) return;
                const reward = window.LapinousAchievements.claim(game, button.dataset.achievement, button.dataset.day || null);
                if (!reward) return;
                autoSave();
                showToast(`Succès récupéré : +${reward} carottes !`, 'success');
                // Met à jour le solde sans interrompre un combat ou un mini-jeu.
                document.querySelectorAll('.carrot-counter').forEach(balance => {
                    balance.textContent = balance.textContent.includes('🥚')
                        ? `🥕 ${game.carrots} · 🥚 ${game.eggs}` : `🥕 ${game.carrots} carottes`;
                });
                const scroll = content.scrollTop;
                overlay.remove(); window.showLapinousRecords();
                document.querySelector('.records-body').scrollTop = scroll;
            });
            autoSave();
        }

        const AUDIO_FILES = {
            // Sons facultatifs absents : null emp?che toute requ?te vers un fichier inexistant.
            ambience: "./assets/audio/ambience.mp3",
            click: "./assets/audio/common/click.mp3", purchase: "./assets/audio/common/purchase.mp3",
            levelup: "./assets/audio/common/level_up.mp3", eggCrack: "./assets/audio/egg/egg-crack.mp3",
            eggRare: null, attack: "./assets/audio/combat/attaque_physique.mp3",
            magic: "./assets/audio/combat/attaque_magique.mp3",
            feed: "./assets/audio/action/manger.mp3",
            sleep: "./assets/audio/action/dormir.mp3",
            clean: "./assets/audio/action/doucher.mp3",
            defeat: null,
            critical: "./assets/audio/combat/critical.mp3", victory: "./assets/audio/combat/victoire.mp3",
            // Ambiance d'Halloween : piano angoissant + rire de sorcière joués ensemble en boucle
            halloween: ["./assets/audio/halloween/piano_angoissant.mp3", "./assets/audio/halloween/rire_de_sorciere.mp3"],
            noel: "./assets/audio/noel/jingle-bells.mp3",
            paques: "./assets/audio/paques/ambience.mp3",
            hohoho: "./assets/audio/noel/ho-ho-ho-merry-christmas.mp3",
            monsterCombat: "./assets/audio/combat/cris_monstre_deb_combat.mp3"
        };
        const SFX_VOLUMES = {monsterCombat: 0.25, victory: 0.25};
        let ambienceAudios = [];
        let ambienceKey = "";
        // Cache des <audio> déjà chargés pour éviter de re-télécharger/décoder le fichier
        // à chaque déclenchement, ce qui causait un petit temps de latence.
        const AUDIO_CACHE = {};
        function getCachedAudio(src) {
            if (!AUDIO_CACHE[src]) {
                const a = new Audio(src);
                a.preload = "auto";
                AUDIO_CACHE[src] = a;
            }
            return AUDIO_CACHE[src];
        }
        // Précharge tous les sons dès le démarrage pour qu'ils soient prêts à jouer
        // instantanément (au lieu d'être téléchargés au moment où on en a besoin).
        Object.values(AUDIO_FILES).forEach((entry) => {
            (Array.isArray(entry) ? entry : [entry]).filter(Boolean).forEach(getCachedAudio);
        });
        let activeCareAudio = null;
        let careAudioTimer = null;
        let buttonPlayedSfx = false;
        function playSfx(name) {
            if (name !== "click") buttonPlayedSfx = true;
            ensureNewSystems(); if (game.audio.muted || !game.audio.sfx || !AUDIO_FILES[name]) return;
            const files = Array.isArray(AUDIO_FILES[name]) ? AUDIO_FILES[name] : [AUDIO_FILES[name]];
            files.forEach((f) => {
                // cloneNode() permet de rejouer un son déjà en cours (ex: clics rapides)
                // sans attendre qu'il se termine, tout en gardant le fichier déjà préchargé.
                const a = getCachedAudio(f).cloneNode();
                a.volume = SFX_VOLUMES[name] ?? 0.55;
                if (["feed", "sleep", "clean"].includes(name)) {
                    if (activeCareAudio) { activeCareAudio.pause(); activeCareAudio.currentTime = 0; }
                    clearTimeout(careAudioTimer);
                    activeCareAudio = a;
                    a.addEventListener("playing", () => {
                        careAudioTimer = setTimeout(() => { a.pause(); a.currentTime = 0; }, 5000);
                    }, { once: true });
                }
                a.play().catch(() => {});
            });
        }
        function updateAmbience() {
            ensureNewSystems();
            const event = currentActiveEvents().find(name => AUDIO_FILES[name]);
            const wanted = event ? AUDIO_FILES[event] : AUDIO_FILES.ambience;
            const files = Array.isArray(wanted) ? wanted : [wanted];
            const enabled = !game.audio.muted && game.audio.ambience;
            const key = enabled ? files.join('|') : '';
            // Changer de pièce ne redémarre pas la musique déjà en cours.
            if (key === ambienceKey) {
                if (enabled) ambienceAudios.filter(a => a.paused).forEach(a => a.play().catch(() => {}));
                return;
            }
            ambienceAudios.forEach(a => { a.pause(); a.currentTime = 0; });
            ambienceAudios = [];
            ambienceKey = key;
            if (!enabled) return;
            ambienceAudios = files.filter(Boolean).map(src => {
                const audio = getCachedAudio(src).cloneNode();
                audio.loop = true;
                audio.volume = 0.22;
                audio.play().catch(() => {});
                return audio;
            });
        }
        window.toggleLapinousAudio = function () {
            ensureNewSystems(); game.audio.muted = !game.audio.muted; autoSave(); updateAmbience(); renderAudioButton();
            showToast(game.audio.muted ? "🔇 Sons coupés" : "🔊 Sons activés", "success");
        };
        function renderAudioButton() {
            let btn = document.getElementById("lapinousAudioBtn");
            if (!btn) { btn = document.createElement("button"); btn.id="lapinousAudioBtn"; btn.className="audio-toggle"; btn.onclick=window.toggleLapinousAudio; document.body.appendChild(btn); }
            ensureNewSystems(); btn.textContent = game.audio.muted ? "🔇" : "🔊"; btn.title = "Activer / couper les sons"; renderRecordsButton();
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

        function serializeGame() {
            window.LapinousAchievements.ensure(game);
            return JSON.stringify({ ...game, savedAt: Date.now() });
        }
        function autoSave() {
            try {
                localStorage.setItem(AUTOSAVE_KEY, serializeGame());
            } catch (e) {}
        }

        function loadSavesList() {
            try {
                return JSON.parse(localStorage.getItem(SAVES_KEY) || "[]");
            } catch (e) {
                return [];
            }
        }
        function writeSavesList(list) {
            localStorage.setItem(SAVES_KEY, JSON.stringify(list));
        }

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
            if (!entry) {
                showToast("Sauvegarde introuvable.", "warn");
                return;
            }
            applyLoadedGame(entry.data);
            showToast(`"${entry.name}" chargée ✨`, "success");
            bootstrap.Modal.getOrCreateInstance(document.querySelector('#saveModal')).hide();
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
                        improvements: {
                            ...freshSpeciesProgress().improvements,
                            ...(data.improvements || {}),
                        },
                    },
                };
            } else if (
                data.status &&
                migratedProgress[activeSpecies] &&
                migratedProgress[activeSpecies].food === undefined
            ) {
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
            if (data.rabbitName && !speciesNames[activeSpecies])
                speciesNames[activeSpecies] = data.rabbitName;

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
            container
                .querySelectorAll("[data-load-save]")
                .forEach((b) =>
                    b.addEventListener("click", () => loadSaveEntry(b.dataset.loadSave)),
                );
            container
                .querySelectorAll("[data-overwrite-save]")
                .forEach((b) =>
                    b.addEventListener("click", () => overwriteSave(b.dataset.overwriteSave)),
                );
            container
                .querySelectorAll("[data-rename-save]")
                .forEach((b) =>
                    b.addEventListener("click", () => renameSaveEntry(b.dataset.renameSave)),
                );
            container
                .querySelectorAll("[data-delete-save]")
                .forEach((b) =>
                    b.addEventListener("click", () => deleteSaveEntry(b.dataset.deleteSave)),
                );
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
            a.href = url;
            a.download = `lapinous-${(currentRabbitName() || "save").toLowerCase()}.json`;
            a.click();
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
                    bootstrap.Modal.getOrCreateInstance(document.querySelector('#saveModal')).hide();
                } catch (err) {
                    showToast("Fichier JSON invalide.", "warn");
                }
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

        function timestampedFilename(customName, d = new Date()) {
            const pad = n => String(n).padStart(2, '0');
            const base = (customName || `lapinous-${currentRabbitName() || 'sauvegarde'}`)
                .replace(/\.json$/i, '').replace(/[^\w\-À-ÿ ]/g, '').trim() || 'lapinous';
            const stamp = `${pad(d.getDate())}-${pad(d.getMonth()+1)}-${d.getFullYear()}_${pad(d.getHours())}h${pad(d.getMinutes())}`;
            return `${base}-${stamp}.json`;
        }

        const folderSaveTarget = document.createElement('select');
        folderSaveTarget.id = 'folderSaveTarget';
        folderSaveTarget.setAttribute('aria-label', 'Créer une sauvegarde ou remplacer un fichier existant');
        folderSaveTarget.style.cssText = 'display:block;max-width:100%;margin:10px 0;padding:8px';
        document.getElementById('saveToFolderBtn').before(folderSaveTarget);
        folderSaveTarget.innerHTML = '<option value="">Créer une nouvelle sauvegarde datée</option>';

        async function renderFolderSaves() {
            const listEl = document.getElementById('folderSavesList');
            const selected = folderSaveTarget.value;
            folderSaveTarget.innerHTML = '<option value="">Créer une nouvelle sauvegarde datée</option>';
            listEl.replaceChildren();
            if (!savesDirHandle) return;
            const files = [];
            for await (const [name, handle] of savesDirHandle.entries()) {
                if (handle.kind === 'file' && name.toLowerCase().endsWith('.json')) {
                    const file = await handle.getFile();
                    files.push({name, modified: file.lastModified});
                }
            }
            files.sort((a,b) => b.modified - a.modified || a.name.localeCompare(b.name));
            for (const {name} of files) {
                const option = document.createElement('option');
                option.value = name; option.textContent = `Remplacer : ${name}`;
                folderSaveTarget.appendChild(option);
                const row = document.createElement('div'); row.className = 'save-slot';
                const info = document.createElement('div'); info.className = 'save-slot-info';
                const title = document.createElement('strong'); title.textContent = name; info.appendChild(title);
                const actions = document.createElement('div'); actions.className = 'save-slot-actions';
                const load = document.createElement('button'); load.className = 'slot-btn load'; load.textContent = 'Charger';
                load.onclick = () => loadFromFolder(name);
                actions.appendChild(load); row.append(info,actions); listEl.appendChild(row);
            }
            if (files.some(f => f.name === selected)) folderSaveTarget.value = selected;
            if (!files.length) listEl.textContent = "Ce dossier est vide pour l'instant.";
        }

        async function loadFromFolder(filename) {
            try {
                const fileHandle = await savesDirHandle.getFileHandle(filename);
                const file = await fileHandle.getFile();
                const text = await file.text();
                applyLoadedGame(JSON.parse(text));
                showToast(`Sauvegarde "${filename}" chargée ✨`, "success");
                bootstrap.Modal.getOrCreateInstance(document.querySelector('#saveModal')).hide();
            } catch (e) {
                showToast("Impossible de lire ce fichier.", "warn");
            }
        }

        document.getElementById("chooseFolderBtn").addEventListener("click", async () => {
            if (!window.showDirectoryPicker) {
                showToast(
                    "Ton navigateur ne supporte pas cette fonctionnalité (utilise Chrome ou Edge).",
                    "warn",
                );
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
            const replacement = folderSaveTarget.value;
            const filename = replacement || timestampedFilename(customName);
            try {
                let fileHandle;
                if (replacement) {
                    if (!window.confirm(`Remplacer « ${filename} » par la partie actuelle ? L'ancienne sauvegarde sera écrasée.`)) return;
                    fileHandle = await savesDirHandle.getFileHandle(filename);
                } else {
                    try {
                        fileHandle = await savesDirHandle.getFileHandle(filename);
                        if (!window.confirm(`« ${filename} » existe déjà. Remplacer cette sauvegarde ?`)) return;
                    } catch (error) {
                        if (error.name !== 'NotFoundError') throw error;
                        fileHandle = await savesDirHandle.getFileHandle(filename, {create:true});
                    }
                }
                const writable = await fileHandle.createWritable();
                await writable.write(serializeGame());
                await writable.close();
                showToast(`Sauvegardé sous "${filename}" 📁`, "success");
                document.getElementById("folderSaveName").value = "";
                folderSaveTarget.value = "";
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

        let adminTesting = false;
        let adminEvent = "auto";
        let adminSeason = "auto";
        let adminTime = "auto";
        function currentActiveEvents(date = new Date()) {
            if (adminTesting && adminEvent !== "auto") return adminEvent === "none" ? [] : adminEvent === "all" ? ["halloween", "noel", "paques"] : [adminEvent];
            const windows = loadEventWindows();
            const active = [];
            const year = date.getFullYear();

            // Halloween : ancrée le 31 octobre, ± N jours (réglable dans le Dashboard)
            if (withinDays(date, new Date(year, 9, 31), windows.halloween))
                active.push("halloween");

            // Noël : ancrée le 25 décembre, ± N jours — on teste l'année en cours ET la
            // précédente pour couvrir début janvier (le 25 décembre d'avant reste "récent").
            if (
                withinDays(date, new Date(year, 11, 25), windows.noel) ||
                withinDays(date, new Date(year - 1, 11, 25), windows.noel)
            )
                active.push("noel");

            // Pâques : date mobile calculée chaque année, ± N jours (réglable)
            const easter = getEasterDate(year);
            if (withinDays(date, easter, windows.paques)) active.push("paques");

            return active;
        }

        function isSpeciesAvailableNow(s) {
            if (!s.event) return true;
            const required = Array.isArray(s.event)
                ? s.event
                : String(s.event)
                      .split(",")
                      .map((e) => e.trim())
                      .filter(Boolean);
            if (required.length === 0) return true;
            const active = currentActiveEvents();
            return required.some((e) => active.includes(e));
        }

        const EVENT_LABELS = { halloween: "🎃 Halloween", noel: "🎄 Noël", paques: "🐣 Pâques" };
        function eventLabelFor(s) {
            const required = Array.isArray(s.event)
                ? s.event
                : String(s.event)
                      .split(",")
                      .map((e) => e.trim())
                      .filter(Boolean);
            return required.map((e) => EVENT_LABELS[e] || e).join(" et ");
        }

        const COMMON_ORDER = () =>
            Object.entries(getSpecies())
                .filter(([, s]) => s.rarity === "commun")
                .map(([k]) => k);
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
            for (const rarity of ["commun", "rare", "epique", "legendaire", "mythique", "divin"]) {
                acc += rates[rarity] || 0;
                if (roll <= acc) {
                    chosenRarity = rarity;
                    break;
                }
            }
            let pool = Object.entries(species).filter(
                ([k, s]) => s.rarity === chosenRarity && !s.hidden && isSpeciesAvailableNow(s),
            );
            const activeEvents = currentActiveEvents();
            const eventPool = pool.filter(([, sp]) => sp.event && (Array.isArray(sp.event) ? sp.event : String(sp.event).split(",")).some(e => activeEvents.includes(String(e).trim())));
            if (eventPool.length && Math.random() < 0.65) pool = eventPool;
            if (pool.length === 0) {
                // Rien de dispo dans cette rareté en ce moment (ex: tout événementiel hors saison) → repli sur un commun
                const fallback = Object.entries(species).filter(
                    ([k, s]) => s.rarity === "commun" && isSpeciesAvailableNow(s),
                );
                const [key] = fallback[Math.floor(Math.random() * fallback.length)] || [
                    COMMON_ORDER()[0],
                ];
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

        document
            .getElementById("prevBreedBtn")
            .addEventListener("click", () => showCommon(commonIndex - 1));
        document
            .getElementById("nextBreedBtn")
            .addEventListener("click", () => showCommon(commonIndex + 1));

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

        document
            .getElementById("loadInsteadBtn")
            .addEventListener("click", () => document.getElementById("importInput").click());

        // ============================================================
        // ENCYCLOPÉDIE — cartes cliquables (photo + nom), détails au clic
        // Libre d'accès pour le joueur. Le Dashboard (admin) est un lien
        // séparé, discret, tout en bas de la modale.
        // ============================================================
        function linkedPuzzlesForSpecies(key) {
            return puzzleCatalog().filter(
                (puz) => Array.isArray(puz.linkedSpecies) && puz.linkedSpecies.includes(key),
            );
        }

        function encyclopediaProgressHtml(key) {
            const p = progressForSpecies(key);
            const training = ensureAttackTraining(p);
            const pct = training.max ? Math.round((training.points / training.max) * 100) : 100;
            const linked = linkedPuzzlesForSpecies(key);
            const puzzleProgress = p.minigames?.puzzle?.puzzles || {};
            const puzzleHtml = linked.length
                ? linked
                      .map((puz) => {
                          const st = puzzleProgress[puz.id];
                          const done = !!st?.completed;
                          const img = puz.image || "./assets/img/species/mystery.svg";
                          return `<div class="lapin-puzzle-card ${done ? "done" : ""}">
                    <img src="${img}" alt="${puz.title}" onerror="this.onerror=null;this.src='./assets/img/species/mystery.svg';">
                    <span><strong>${puz.title}</strong><small>${done ? "✅ Terminé" : "🧩 À découvrir"}</small></span>
                </div>`;
                      })
                      .join("")
                : '<span class="upgrade-locked-note">Aucun puzzle lié pour le moment.</span>';
            const duplicates = game.duplicateCounts?.[key] || 0;
            return `
            <div class="lapin-progress-box">
                ${attackListHtml(key)}
                <small>${duplicates} doublon${duplicates > 1 ? 's' : ''} obtenu${duplicates > 1 ? 's' : ''}</small>
                <div class="lapin-linked-puzzles"><strong>🧩 Puzzles liés :</strong>${puzzleHtml}</div>
            </div>`;
        }

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
                    <p><strong>Ultime (coup critique) :</strong> ${s.power}</p>
                    ${encyclopediaProgressHtml(key)}
                    <button class="action-btn" onclick="switchActiveSpecies('${key}'); bootstrap.Modal.getOrCreateInstance(document.querySelector('#encyclopediaModal')).hide();">🐰 Choisir ce lapin</button>
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
                <img src="${b.faceImg || b.coteImg}" alt="${b.name}" onerror="this.onerror=null;this.src='./assets/img/bosses/mystery_boss.svg';">
                <div class="entry-body">
                    <div class="entry-header">
                        <strong>${b.name}${b.nickname ? ", " + b.nickname : ""}</strong>
                        <span class="rarity-badge small" style="background:#7a3a3a;">Difficulté ${b.difficulty ?? "?"}</span>
                    </div>
                    ${b.rang ? `<p><em>${b.rang}</em></p>` : ""}
                    ${b.story ? `<p>${b.story.replace(/\n/g, "<br>")}</p>` : ""}
                    ${b.arme ? `<p><strong>Arme :</strong> ${b.arme}</p>` : ""}
                    ${b.personality ? `<p><strong>Personnalité :</strong> ${Array.isArray(b.personality) ? b.personality.join(", ") : b.personality}</p>` : ""}
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
                const realImg = s.faceImg || s.coteImg || "";
                const imgSrc = realImg || "./assets/img/species/mystery.svg";
                const eventBadge =
                    s.event && !isSpeciesAvailableNow(s)
                        ? `<span class="event-badge">${eventLabelFor(s).split(" ")[0]}</span>`
                        : "";
                card.innerHTML = `<img class="${owned ? "" : (realImg ? "rabbit-silhouette" : "")}" src="${imgSrc}" alt="${owned ? s.name : "???"}" onerror="this.onerror=null;this.classList.remove('rabbit-silhouette');this.src='./assets/img/species/mystery.svg';"><span class="card-name">${owned ? s.name : "???"}</span>${owned ? '<span class="owned-badge">✓</span>' : ""}${eventBadge}`;
                card.addEventListener("click", () => {
                    if (owned) showEncyclopediaDetail(key);
                    else if (s.event && !isSpeciesAvailableNow(s))
                        showToast(
                            `Ce lapin n'apparaît que pendant ${eventLabelFor(s)} — reviens à cette période pour tenter ta chance !`,
                            "warn",
                        );
                    else
                        showToast(
                            "Ce lapin n'est pas encore dans ta collection. Ouvre des œufs pour le débloquer !",
                            "warn",
                        );
                });
                grid.appendChild(card);
            });
            const relBox = document.getElementById("encyclopediaRelations");
            relBox.innerHTML =
                "<strong>Relations connues :</strong><ul>" +
                RELATIONS_TEXT.map((r) => `<li>${r}</li>`).join("") +
                "</ul>";
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
                const imgSrc = found ? b.faceImg || b.coteImg : BOSS_MYSTERY_IMG;
                card.innerHTML = `<img src="${imgSrc}" alt="${found ? b.name : "???"}" onerror="this.onerror=null;this.src='./assets/img/bosses/mystery_boss.svg';"><span class="card-name">${found ? b.name : "???"}</span>${found ? '<span class="owned-badge">✓</span>' : ""}`;
                card.addEventListener("click", () => {
                    if (found) showBossDetail(key);
                    else
                        showToast(
                            "Ce boss n'a pas encore été rencontré. Pars à l'aventure depuis le jardin !",
                            "warn",
                        );
                });
                grid.appendChild(card);
            });
        }

        function showEncyclopediaTab(tab) {
            document.getElementById("encyclopediaDetail").classList.remove("active");
            document.getElementById("tabRabbitsBtn").classList.toggle("active", tab === "rabbits");
            document.getElementById("tabBossesBtn").classList.toggle("active", tab === "bosses");
            document.getElementById("encyclopediaGrid").style.display =
                tab === "rabbits" ? "grid" : "none";
            document.getElementById("encyclopediaRelations").style.display =
                tab === "rabbits" ? "block" : "none";
            document.getElementById("bossGrid").style.display = tab === "bosses" ? "grid" : "none";
            if (tab === "rabbits") renderEncyclopedia();
            else renderBossEncyclopedia();
        }
        document
            .getElementById("tabRabbitsBtn")
            .addEventListener("click", () => showEncyclopediaTab("rabbits"));
        document
            .getElementById("tabBossesBtn")
            .addEventListener("click", () => showEncyclopediaTab("bosses"));
        document.getElementById("encyclopediaBackBtn").addEventListener("click", () => {
            const onBosses = document.getElementById("tabBossesBtn").classList.contains("active");
            showEncyclopediaTab(onBosses ? "bosses" : "rabbits");
        });
        document.getElementById("encyclopediaBtn").addEventListener("click", () => {
            showEncyclopediaTab("rabbits");
            bootstrap.Modal.getOrCreateInstance(document.querySelector('#encyclopediaModal')).show();
        });

        // ============================================================
        // DÉMARRAGE DU JEU
        // ============================================================
        function startGameUI() {
            body.classList.add("game-running");
            adoptionScreen.style.display = "none";
            gameRoot.style.display = "flex";
            mainNav.style.display = "flex";
            const s = getSpecies()[game.species];
            brandTitle.textContent = "🐰 " + (currentRabbitName() || s.name);
            if (game.species === "az") localStorage.setItem("lapinous_az_discovered", "1");
            updateStatusBars();
            document.getElementById("level").innerText = progress().currentLevel;
            updateGameArea("default");
            // Petit ho-ho-ho d'accueil dans le salon, si Noël est actif
            if (currentActiveEvents().includes("noel")) playSfx("hohoho");
        }

        function currentTrait() {
            return game.species === "az" ? AZ_TRAIT : TRAITS[game.trait] || TRAITS.aucun;
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
            friendshipBar.style.width = Math.max(0, Math.min(100, ((progress().friendshipTotal - ((progress().currentLevel - 1) * 25)) / 25) * 100)) + "%";
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
        let collectionCarouselIndex = 0;
        function collectionSwitcherHtml() {
            const owned = (game.ownedSpecies || []).filter(k => getSpecies()[k]);
            if (owned.length <= 1) return "";
            const activeIndex = Math.max(0, owned.indexOf(game.species));
            if (collectionCarouselIndex >= owned.length || collectionCarouselIndex < 0) collectionCarouselIndex = activeIndex;
            const key = owned[collectionCarouselIndex], sp = getSpecies()[key];
            const img = sp.faceImg || sp.coteImg || "./assets/img/species/mystery.svg";
            const name = game.speciesNames[key] || sp.name;
            return `<div class="collection-switcher collection-carousel"><p class="upgrade-locked-note">Tes lapins (${collectionCarouselIndex+1}/${owned.length}) :</p><div class="collection-carousel-main"><button class="collection-arrow" onclick="moveCollectionCarousel(-1)">‹</button><button class="collection-card carousel-big ${key===game.species?'active':''}" onclick="switchActiveSpecies('${key}')"><img src="${img}" alt="${name}" onerror="this.src='./assets/img/species/mystery.svg'"><span>${name}${key===game.species?' · actif':''}</span></button><button class="collection-arrow" onclick="moveCollectionCarousel(1)">›</button></div></div>`;
        }
        window.moveCollectionCarousel=function(dir){const owned=(game.ownedSpecies||[]).filter(k=>getSpecies()[k]);if(!owned.length)return;collectionCarouselIndex=(collectionCarouselIndex+dir+owned.length)%owned.length;refreshCurrentZone();};

        // Chaque compagnon dispose d'une zone propre, avec un léger décalage naturel.
        function fitSalonFriends() {
            const area = gameArea.querySelector('.salon-friends');
            if (!area) return;
            const friends = [...area.querySelectorAll('.salon-rabbit-friend')];
            const width = area.clientWidth, height = area.clientHeight;
            if (!friends.length || !width || !height) return;
            const hero = gameArea.querySelector('.salon-active-rabbit-spot');
            const areaBox = area.getBoundingClientRect();
            const heroBox = hero?.getBoundingClientRect();
            const blocked = heroBox ? { left: heroBox.left - areaBox.left - 14, right: heroBox.right - areaBox.left + 14, top: heroBox.top - areaBox.top - 10, bottom: heroBox.bottom - areaBox.top + 18 } : null;
            let slots = [], size = 96;
            for (; size >= 4; size -= 2) {
                const cellW = size + 22, cellH = size * 1.2 + 40;
                const cols = Math.floor(width / cellW), rows = Math.floor(height / cellH);
                slots = [];
                for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
                    const x = (col + .5) * width / cols + ((row * 13 + col * 7) % 5 - 2) * 3;
                    const y = (row + .5) * height / rows + ((row * 7 + col * 11) % 5 - 2) * 4;
                    const left = x - size / 2, right = x + size / 2;
                    const top = y - (size * 1.2 + 20) / 2, bottom = y + (size * 1.2 + 20) / 2;
                    if (blocked && left < blocked.right && right > blocked.left && top < blocked.bottom && bottom > blocked.top) continue;
                    slots.push({ x, y, row, col });
                }
                if (slots.length >= friends.length) break;
            }
            // Répartition stable, décalée et sans cartes ni rangées de collection.
            slots.sort((a, b) => ((a.row * 31 + a.col * 17) % 101) - ((b.row * 31 + b.col * 17) % 101));
            friends.forEach((friend, index) => {
                const slot = slots[index];
                if (!slot) return;
                friend.style.left = `${slot.x}px`;
                friend.style.top = `${slot.y}px`;
                friend.style.setProperty('--companion-size', `${size}px`);
            });
        }

        function salonOwnedRabbitsSceneHtml() {
            const species = getSpecies();
            const owned = (game.ownedSpecies || []).filter(
                (key) => key !== game.species && species[key],
            );
            const friends = owned
                .map((key, index) => {
                    const sp = species[key];
                    const img = sp.faceImg || sp.coteImg || "./assets/img/species/mystery.svg";
                    const name = game.speciesNames[key] || sp.name || key;
                    return `<button class="salon-rabbit-friend friend-${index % 8}" onclick="switchActiveSpecies('${key}')" title="Jouer avec ${name}">
                <img src="${img}" alt="${name}" onerror="this.onerror=null;this.src='./assets/img/species/mystery.svg';">
                <span>${name}</span>
            </button>`;
                })
                .join("");
            return `<div class="salon-world">
            <div class="salon-room-title">🐰 Le Salon de tes compagnons</div>
            <div class="salon-friends">${friends || '<span class="salon-alone-note">Ton premier compagnon profite du Salon ✨</span>'}</div>
            <div id="salonActiveRabbitSpot" class="salon-active-rabbit-spot"><span class="active-rabbit-name">${currentRabbitName()}</span></div>
            <button class="salon-console-object board-game-object" type="button" onclick="openGameConsole()" aria-label="Ouvrir le coin jeux">
                <span class="board-top">
                    <span class="board-grid"></span>
                    <span class="board-card"></span>
                    <span class="board-die"></span>
                    <span class="board-pawn"></span>
                </span>
                <span class="console-object-label">Coin jeux</span>
                <span class="board-sub">Jouer</span>
            </button>
        </div>`;
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
            showToast(
                `${currentRabbitName()} devient ton compagnon actif ! 🐰 (Niveau ${progress().currentLevel}, tout lui est propre)`,
                "success",
            );
        };

        // ============================================================
        // CONSOLE DU SALON / MINI-JEUX
        // ============================================================
        // Les progressions sont enregistrées dans progress(), donc indépendantes
        // pour chaque lapin. On ne peut accéder au puzzle suivant qu'après avoir
        // terminé le précédent, et idem pour les niveaux de difficulté.
        function puzzleCatalog() {
            return (window.getPuzzleCatalog ? window.getPuzzleCatalog() : []) || [];
        }
        function puzzleLevels() {
            return (window.getPuzzleLevels ? window.getPuzzleLevels() : []) || [];
        }
        // --- Disponibilité événementielle des puzzles ---
        // puz.event : "" / absent = toujours dispo ; "halloween" | "noel" | "paques" ;
        // ou plusieurs événements ("paques,noel" ou tableau) = dispo si AU MOINS un est actif.
        function puzzleEvents(puz) {
            let ev = puz.event;
            if (ev === undefined || ev === null) {
                // Anciennes données sans champ "event" : déduction depuis l'id
                if (puz.id === "reve") ev = ["noel", "halloween", "paques"];
                else if (puz.id === "noel") ev = "noel";
                else if (["pacques", "paques"].includes(puz.id)) ev = "paques";
                else if (["halloween", "fantome", "frankenstein", "lapin-bete", "squelette", "vampire-vs-nonne"].includes(puz.id)) ev = "halloween";
                else ev = "";
            }
            const list = Array.isArray(ev) ? ev : String(ev).split(/[,+]/);
            return list.map((e) => String(e).trim().toLowerCase().replace("pacques", "paques")).filter((e) => e && e !== "none" && e !== "aucun");
        }
        function isPuzzleAvailableNow(puz) {
            const required = puzzleEvents(puz);
            if (!required.length) return true;
            const active = currentActiveEvents();
            return required.some((e) => active.includes(e));
        }
        // Un puzzle est débloqué si l'index est atteint, ou si tous les puzzles
        // précédents actuellement disponibles sont terminés (les puzzles
        // événementiels masqués ne bloquent donc pas la suite).
        function isPuzzleUnlocked(index) {
            const mg = ensureMinigameProgress().puzzle;
            if (index <= (mg.unlockedPuzzle || 0)) return true;
            return puzzleCatalog().slice(0, index).every((q) => !isPuzzleAvailableNow(q) || puzzleState(q.id).completed);
        }
        let activePuzzle = null;
        let selectedPuzzleSlot = null;

        function ensureMinigameProgress() {
            const p = progress();
            if (!p.minigames) p.minigames = {};
            if (!p.minigames.puzzle) p.minigames.puzzle = { unlockedPuzzle: 0, puzzles: {} };
            if (!p.minigames.puzzle.puzzles) p.minigames.puzzle.puzzles = {};
            if (!p.minigames.memory) p.minigames.memory = { level: 0, completed: 0 };
            if (!p.minigames.lapidoku) p.minigames.lapidoku = { level: 0, completed: 0 };
            return p.minigames;
        }

        function puzzleState(id) {
            const state = ensureMinigameProgress().puzzle;
            if (!state.puzzles[id])
                state.puzzles[id] = { completed: false, highestCompletedLevel: -1, bestMoves: {} };
            return state.puzzles[id];
        }

        window.openGameConsole = function () {
            const mg = ensureMinigameProgress();
            const availablePuzzles = puzzleCatalog().filter(isPuzzleAvailableNow);
            const completed = availablePuzzles.filter((puz) => mg.puzzle.puzzles[puz.id]?.completed).length;
            gameArea.innerHTML = `
            <div class="console-panel">
                <div class="console-title">🎮 Console Lapinous</div>
                <p class="agility-hint">Joue avec ${currentRabbitName()} pour gagner de l'amitié. Jouer fatigue aussi ton lapin et peut le salir.</p>
                <div class="console-games">
                    <button class="console-game-card" onclick="openPuzzleHub()">
                        <span class="console-game-icon">🧩</span><strong>Puzzles</strong>
                        <small>${completed}/${availablePuzzles.length} images terminées au moins une fois</small>
                    </button>
                    <button class="console-game-card" type="button" onclick="openMemory()">
                        <span class="console-game-icon">🧠</span><strong>Memory</strong><small>${mg.memory.completed || 0} partie(s) terminée(s)</small>
                    </button>
                    <button class="console-game-card" type="button" onclick="openLapidoku()">
                        <span class="console-game-icon">🔢</span><strong>Lapidoku</strong><small>${mg.lapidoku.completed || 0} grille(s) terminée(s)</small>
                    </button>
                </div>
                <button class="ghost-btn" onclick="refreshCurrentZone()">← Retour au Salon</button>
            </div>`;
        };

        window.openPuzzleHub = function () {
            const mg = ensureMinigameProgress().puzzle;
            const catalog = puzzleCatalog();
            const visible = catalog.map((puz,index)=>({puz,index})).filter(({puz}) => isPuzzleAvailableNow(puz));
            const cards = visible.map(({puz,index}) => {
                const st = puzzleState(puz.id);
                const unlocked = isPuzzleUnlocked(index);
                const status = st.completed ? "✅ Terminé" : unlocked ? "À faire" : "🔒 Termine le puzzle précédent";
                const linkedNames = (puz.linkedSpecies || []).map((key) => getSpecies()[key]?.name || key).join(", ");
                return `<button class="puzzle-card ${unlocked ? "" : "locked"}" ${unlocked ? `onclick="openPuzzleLevels(${index})"` : "disabled"}>
                    <img src="${puz.image}" alt="${puz.title}" onerror="this.onerror=null;this.src='./assets/img/species/mystery.svg';">
                    <span><strong>${puz.title}</strong><small>${status}</small>${linkedNames ? `<small>🐰 ${linkedNames}</small>` : ""}</span>
                </button>`;
            }).join("");
            gameArea.innerHTML = `<div class="puzzle-hub"><div class="console-title">🧩 Puzzles de ${currentRabbitName()}</div><p class="agility-hint">Les puzzles événementiels apparaissent uniquement pendant leur événement.</p><div class="puzzle-list">${cards}</div><button class="ghost-btn" onclick="openGameConsole()">← Console</button></div>`;
        };

        window.openPuzzleLevels = function (puzzleIndex) {
            const puz = puzzleCatalog()[puzzleIndex];
            if (!puz) return;
            if (!isPuzzleAvailableNow(puz)) { openPuzzleHub(); return; }
            if (!isPuzzleUnlocked(puzzleIndex)) return;
            const st = puzzleState(puz.id);
            const maxUnlockedLevel = Math.min(
                puzzleLevels().length - 1,
                st.highestCompletedLevel + 1,
            );
            const buttons = puzzleLevels()
                .map((lvl, i) => {
                    const unlocked = i <= maxUnlockedLevel;
                    const done = i <= st.highestCompletedLevel;
                    return `<button class="puzzle-level-btn ${done ? "done" : ""}" ${unlocked ? `onclick="startPuzzle(${puzzleIndex},${i})"` : "disabled"}>
                ${done ? "✅" : unlocked ? "🧩" : "🔒"} ${lvl.label}
            </button>`;
                })
                .join("");
            gameArea.innerHTML = `
            <div class="puzzle-levels">
                <img class="puzzle-preview" src="${puz.image}" alt="${puz.title}" onerror="this.onerror=null;this.src='./assets/img/species/mystery.svg';">
                <div class="console-title">${puz.title}</div>
                <div class="puzzle-level-buttons">${buttons}</div>
                <button class="ghost-btn" onclick="openPuzzleHub()">← Liste des puzzles</button>
            </div>`;
        };

        function shuffledOrder(length) {
            const arr = Array.from({ length }, (_, i) => i);
            do {
                for (let i = arr.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                }
            } while (arr.every((v, i) => v === i));
            return arr;
        }

        function renderActivePuzzle() {
            if (!activePuzzle) return;
            const { puzzleIndex, levelIndex, order, moves } = activePuzzle;
            const puz = puzzleCatalog()[puzzleIndex];
            const lvl = puzzleLevels()[levelIndex];
            const pieces = order
                .map((sourceIndex, slotIndex) => {
                    const sourceRow = Math.floor(sourceIndex / lvl.cols);
                    const sourceCol = sourceIndex % lvl.cols;
                    const x = lvl.cols === 1 ? 0 : (sourceCol / (lvl.cols - 1)) * 100;
                    const y = lvl.rows === 1 ? 0 : (sourceRow / (lvl.rows - 1)) * 100;
                    return `<button draggable="true" data-slot="${slotIndex}" ondragstart="puzzleDragStart(event,${slotIndex})" ondragover="event.preventDefault()" ondrop="puzzleDrop(event,${slotIndex})" class="puzzle-piece ${selectedPuzzleSlot === slotIndex ? "selected" : ""}" onclick="selectPuzzlePiece(${slotIndex})" aria-label="Pièce ${slotIndex + 1}"
                style="background-image:url('${puz.image}');background-size:${lvl.cols * 100}% ${lvl.rows * 100}%;background-position:${x}% ${y}%;"></button>`;
                })
                .join("");
            gameArea.innerHTML = `
            <div class="puzzle-play">
                <div class="puzzle-play-head"><strong>🧩 ${puz.title}</strong><span>${lvl.label} · ${moves} coup${moves > 1 ? "s" : ""}</span></div>
                <div class="puzzle-board" style="--puzzle-cols:${lvl.cols};--puzzle-rows:${lvl.rows};">${pieces}</div>
                <p class="agility-hint">Glisse une pièce sur une autre pour les échanger (ou clique sur deux pièces).</p>
                <div class="puzzle-actions"><button class="ghost-btn" onclick="startPuzzle(${puzzleIndex},${levelIndex})">🔀 Mélanger</button><button class="ghost-btn" onclick="openPuzzleLevels(${puzzleIndex})">← Quitter</button></div>
            </div>`;
        }

        window.startPuzzle = function (puzzleIndex, levelIndex) {
            const puz = puzzleCatalog()[puzzleIndex];
            const lvl = puzzleLevels()[levelIndex];
            if (!puz || !lvl) return;
            const mg = ensureMinigameProgress().puzzle;
            const st = puzzleState(puz.id);
            if (
                !isPuzzleAvailableNow(puz) ||
                !isPuzzleUnlocked(puzzleIndex) ||
                levelIndex > Math.min(puzzleLevels().length - 1, st.highestCompletedLevel + 1)
            )
                return;
            const foodCost = Number(lvl.food || 0);
            const sleepCost = Number(lvl.energy || 0);
            const cleanCost = Number(lvl.cleanliness || 0);
            if (
                progress().energy <= sleepCost ||
                progress().food <= foodCost ||
                progress().cleanliness <= cleanCost
            ) {
                showToast(
                    `${currentRabbitName()} doit manger, dormir ou se laver avant de jouer 🎮`,
                    "warn",
                );
                return;
            }
            activePuzzle = {
                puzzleIndex,
                levelIndex,
                order: shuffledOrder(lvl.rows * lvl.cols),
                moves: 0,
            };
            selectedPuzzleSlot = null;
            renderActivePuzzle();
        };

        window.puzzleDragStart = function (event, slotIndex) {
            window._puzzleDragSlot = slotIndex;
            if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
        };
        window.puzzleDrop = function (event, slotIndex) {
            event.preventDefault();
            if (!activePuzzle || window._puzzleDragSlot == null || window._puzzleDragSlot === slotIndex) return;
            const a = window._puzzleDragSlot, b = slotIndex; window._puzzleDragSlot = null;
            selectedPuzzleSlot = a; window.selectPuzzlePiece(b);
        };

        window.selectPuzzlePiece = function (slotIndex) {
            if (!activePuzzle) return;
            if (selectedPuzzleSlot === null) {
                selectedPuzzleSlot = slotIndex;
                renderActivePuzzle();
                return;
            }
            if (selectedPuzzleSlot === slotIndex) {
                selectedPuzzleSlot = null;
                renderActivePuzzle();
                return;
            }
            const a = selectedPuzzleSlot;
            const b = slotIndex;
            [activePuzzle.order[a], activePuzzle.order[b]] = [
                activePuzzle.order[b],
                activePuzzle.order[a],
            ];
            activePuzzle.moves += 1;
            selectedPuzzleSlot = null;
            const solved = activePuzzle.order.every((v, i) => v === i);
            if (!solved) {
                renderActivePuzzle();
                return;
            }

            const { puzzleIndex, levelIndex, moves } = activePuzzle;
            const puz = puzzleCatalog()[puzzleIndex];
            const lvl = puzzleLevels()[levelIndex];
            const mg = ensureMinigameProgress().puzzle;
            const st = puzzleState(puz.id);
            const wasCompleted = st.completed;
            st.completed = true;
            recordAchievement('gamesWon');
            if (!wasCompleted) { ensureNewSystems(); game.records.puzzlesCompleted += 1; }
            st.highestCompletedLevel = Math.max(st.highestCompletedLevel, levelIndex);
            const previousBest = st.bestMoves[levelIndex];
            st.bestMoves[levelIndex] = previousBest ? Math.min(previousBest, moves) : moves;
            if (puzzleIndex < puzzleCatalog().length - 1)
                mg.unlockedPuzzle = Math.max(mg.unlockedPuzzle || 0, puzzleIndex + 1);

            progress().food = Math.max(0, progress().food - Number(lvl.food || 0));
            progress().energy = Math.max(0, progress().energy - Number(lvl.energy || 0));
            progress().cleanliness = Math.max(
                0,
                progress().cleanliness - Number(lvl.cleanliness || 0),
            );
            gainFriendship(lvl.friendship);
            updateStatusBars();
            autoSave();
            spawnParticles("🧩", 10);
            activePuzzle = null;
            gameArea.innerHTML = `
            <div class="puzzle-win">
                <div class="puzzle-win-icon">🎉</div>
                <div class="console-title">Puzzle terminé !</div>
                <img class="puzzle-preview" src="${puz.image}" alt="${puz.title}" onerror="this.onerror=null;this.src='./assets/img/species/mystery.svg';">
                <p><strong>${moves}</strong> coups · +${lvl.friendship} 💛 · -${Number(lvl.food || 0)} 🥕 · -${lvl.energy} 😴 · -${lvl.cleanliness} 🫧</p>
                <p class="agility-hint">Progression enregistrée pour ${currentRabbitName()}.</p>
                <button class="action-btn" onclick="openPuzzleLevels(${puzzleIndex})"><span>Continuer 🧩</span></button>
                <button class="ghost-btn" onclick="openPuzzleHub()">Voir les puzzles</button>
            </div>`;
        };

        function ensureTechniqueProgress(key) {
            const pr = progressForSpecies(key), legacy = ensureAttackTraining(pr);
            const count = raritySkillCount(getSpecies()[key]?.rarity);
            if (!Array.isArray(pr.attackLevels)) {
                pr.attackLevels = Array(count).fill(0);
                pr.attackLevels[0] = Math.min(5, Math.max(0, Number(legacy.points) || 0));
            }
            pr.attackLevels = Array.from({length:count}, (_,i) => Math.min(5, Math.max(0, Math.floor(Number(pr.attackLevels[i]) || 0))));
            pr.attackFragments = Math.max(0, Math.floor(Number(pr.attackFragments) || 0));
            return pr;
        }
        // Chaque technique nécessite toutes les précédentes à 5/5.
        function isTechniqueUnlocked(r, index) {
            return Number.isInteger(index) && index >= 0 && index < raritySkillCount(r.sp.rarity)
                && Array.from({length:index}, (_,i) => r.pr.attackLevels[i] || 0).every(level => level >= 5);
        }
        function allAttacksMaxed(key) { return ensureTechniqueProgress(key).attackLevels.every(n => n >= 5); }
        function attackListHtml(key, editable = true) {
            const sp = getSpecies()[key] || {}, pr = ensureTechniqueProgress(key);
            const owned = game.ownedSpecies?.includes(key);
            const entries = pr.attackLevels.map((level,index) => {
                const unlocked = isTechniqueUnlocked({sp,pr}, index);
                const t = techniqueFor({key,sp,pr},index);
                const effect = t.kind === 'heal' ? 'Soin et dégâts' : t.kind === 'guard' ? 'Dégâts et protection' : 'Dégâts';
                return `<div style="padding:8px 0;border-bottom:1px solid #79558b33"><strong>${index+1}. ${t.name}</strong> <small>· ${effect} · amélioration ${level}/5${!unlocked ? ' · 🔒 Termine les attaques précédentes à 5/5' : ''}</small>${editable && owned ? `<button type="button" class="ghost-btn" onclick="upgradeRabbitAttack('${key}',${index})" ${!unlocked || !pr.attackFragments || level>=5 ? 'disabled' : ''}>${!unlocked ? 'Verrouillée' : level>=5 ? 'MAX' : 'Améliorer · 1 fragment'}</button>` : ''}</div>`;
            }).join('');
            return `<div class="lapin-attack-list"><strong>⚔️ ${pr.attackLevels.length} attaque${pr.attackLevels.length>1?'s':''}</strong>${owned?`<p>💎 ${pr.attackFragments} fragment${pr.attackFragments>1?'s':''} disponible${pr.attackFragments>1?'s':''} pour ce lapin.</p>`:''}${entries}<p><small>🌟 Ultime : ${powerName(sp)} · hors de la liste, nécessite 100 % de charge.</small></p></div>`;
        }
        window.upgradeRabbitAttack = function(key,index) {
            if (!game.ownedSpecies?.includes(key) || !Number.isInteger(index)) return;
            const pr = ensureTechniqueProgress(key);
            if (index<0 || index>=pr.attackLevels.length || !pr.attackFragments || pr.attackLevels[index]>=5) return;
            if (!isTechniqueUnlocked({sp:getSpecies()[key],pr}, index)) return;
            pr.attackFragments--; pr.attackLevels[index]++;
            const t = techniqueFor({key,sp:getSpecies()[key],pr},index);
            autoSave(); showToast(`✨ ${t.name} améliorée : ${pr.attackLevels[index]}/5`, 'levelup');
            if (document.getElementById('encyclopediaDetail')?.classList.contains('active')) showEncyclopediaDetail(key);
            else refreshCurrentZone();
        };
        function duplicateChoiceHtml() {
            const pending = game.pendingDuplicate;
            if (!pending) return '';
            const sp = getSpecies()[pending.speciesKey]; if (!sp) return '';
            const pr = ensureTechniqueProgress(pending.speciesKey);
            const options = pr.attackLevels.map((level,i) => isTechniqueUnlocked({sp,pr}, i) && level < 5 ? `<option value="${i}">${techniqueFor({key:pending.speciesKey,sp,pr},i).name} · ${level}/5</option>` : '').join('');
            return `<div class="duplicate-choice"><div class="duplicate-title">✨ Doublon : ${sp.name}</div><p>Recycle-le ou reçois un fragment pour ce lapin.</p><div class="action-row"><button class="action-btn" onclick="resolveDuplicate('carrots')">🥕 +${pending.carrotReward} carottes</button><button class="action-btn adventure" onclick="resolveDuplicate('fragment')">💎 Garder le fragment</button></div>${!allAttacksMaxed(pending.speciesKey)?`<label>Attaque à améliorer <select id="duplicateAttackTarget">${options}</select></label><button class="action-btn adventure" onclick="resolveDuplicate('attack',Number(document.getElementById('duplicateAttackTarget').value))">⚔️ Améliorer cette attaque</button>`:'<p>Toutes les attaques sont au maximum.</p>'}<small>Les fragments conservés se dépensent dans la fiche du lapin.</small></div>`;
        }
        window.resolveDuplicate = function(choice,index) {
            const pending = game.pendingDuplicate; if (!pending) return;
            if (!['carrots','fragment','attack'].includes(choice)) return;
            const pr = ensureTechniqueProgress(pending.speciesKey);
            if (choice === 'attack' && (!Number.isInteger(index) || index<0 || index>=pr.attackLevels.length || pr.attackLevels[index]>=5)) return;
            if (choice === 'attack' && !isTechniqueUnlocked({sp:getSpecies()[pending.speciesKey],pr}, index)) return;
            if (choice === 'carrots') { game.carrots += pending.carrotReward; showToast(`🥕 +${pending.carrotReward} carottes`, 'success'); }
            else {
                pr.attackFragments++;
                if (choice === 'attack') { pr.attackFragments--; pr.attackLevels[index]++; }
                showToast(choice==='attack'?'⚔️ Attaque choisie améliorée !':'💎 Fragment conservé pour ce lapin.', 'levelup');
            }
            game.pendingDuplicate = (game.pendingDuplicates || []).shift() || null;
            autoSave(); refreshCurrentZone();
        };

        const zones = {
            default: {
                label: "🏡 Salon",
                image: () => speciesFaceImg(),
                content: () => `
                <p class="welcome-msg">Te voilà à la maison avec ${currentRabbitName() || "ton lapin"} ! Clique sur un compagnon du Salon pour changer de lapin, ou sur la console pour jouer.</p>
                ${duplicateChoiceHtml()}
                ${salonOwnedRabbitsSceneHtml()}
                <div class="egg-shop">
                    <div class="carrot-counter">🥕 ${game.carrots} · 🥚 ${game.eggs}</div>
                    <div class="action-row">
                        <button class="action-btn" onclick="buyEgg()"><span class="action-icon-emoji">🥚</span><span>Acheter (${EGG_COST} 🥕)</span></button>
                        <button class="action-btn upgrade" onclick="openEgg()" ${game.eggs > 0 ? "" : "disabled"}><span class="action-icon-emoji">🎁</span><span>Ouvrir un œuf</span></button><button class="action-btn upgrade" onclick="openTenEggs()" ${game.eggs >= 10 && !game.pendingDuplicate ? "" : "disabled"}><span>🥚 Ouvrir 10 œufs</span></button>
                    </div>
                    <p class="upgrade-locked-note">Gagne des carottes 🥕 en combattant les boss du jardin, achète des œufs ici, puis ouvre-les pour tenter d’obtenir un nouveau compagnon rare, épique ou légendaire (visible dans l'encyclopédie).</p>
                </div>`,
            },
            cuisine: {
                label: "🥕 Cuisine",
                image: () => `./assets/img/Zone_cuisine/lapin_cuisine.png`,
                content: () =>
                    progress().improvements.cuisine
                        ? `<div class="action-row"><button class="action-btn upgraded" onclick="feedRabbit()"><img class="action-icon" src="./assets/img/Zone_cuisine/pomme.png" alt=""><span>Nourrir</span></button></div>`
                        : `<div class="action-row">
                    <button class="action-btn" onclick="feedRabbit()"><img class="action-icon" src="./assets/img/Zone_cuisine/carotte.png" alt=""><span>Nourrir</span></button>
                    ${upgradeButtonHtml("cuisine", "./assets/img/Zone_cuisine/pomme.png", "improveFeedRabbit()")}
                </div>`,
            },
            chambre: {
                label: "🛏️ Chambre",
                image: () => `./assets/img/Zone_Chambre/dodo.png`,
                content: () =>
                    progress().improvements.chambre
                        ? `<div class="action-row"><button class="action-btn upgraded" onclick="putRabbitToSleep()"><img class="action-icon" src="./assets/img/Zone_Chambre/lit.png" alt=""><span>Dodo</span></button></div>`
                        : `<div class="action-row">
                    <button class="action-btn" onclick="putRabbitToSleep()"><img class="action-icon" src="./assets/img/Zone_Chambre/panier.png" alt=""><span>Dodo</span></button>
                    ${upgradeButtonHtml("chambre", "./assets/img/Zone_Chambre/lit.png", "improvePutRabbitToSleep()")}
                </div>`,
            },
            sdb: {
                label: "🛁 Salle de bain",
                image: () => `./assets/img/Zone_SdB/lapin_SdB.png`,
                content: () =>
                    progress().improvements.sdb
                        ? `<div class="action-row"><button class="action-btn upgraded" onclick="cleanRabbit()"><img class="action-icon" src="./assets/img/Zone_SdB/pommeau.png" alt=""><span>Nettoyer</span></button></div>`
                        : `<div class="action-row">
                    <button class="action-btn" onclick="cleanRabbit()"><img class="action-icon" src="./assets/img/Zone_SdB/brosse.png" alt=""><span>Nettoyer</span></button>
                    ${upgradeButtonHtml("sdb", "./assets/img/Zone_SdB/pommeau.png", "improveCleanRabbit()")}
                </div>`,
            },
            jardin: {
                label: "🌿 Jardin",
                image: () => `./assets/img/Zone_jardin/entrenement.png`,
                content: () => {
                    const icon = progress().improvements.jardin
                        ? "./assets/img/Zone_jardin/agilite.png"
                        : "./assets/img/Zone_jardin/cliker.png";
                    const btnClass = progress().improvements.jardin
                        ? "action-btn upgraded"
                        : "action-btn";
                    return `<div class="action-row">
                    <button class="${btnClass}" onclick="startAgility()"><img class="action-icon" src="${icon}" alt=""><span>Jouer</span></button>
                    ${progress().improvements.jardin ? "" : upgradeButtonHtml("jardin", "./assets/img/Zone_jardin/agilite.webp", "improvePlayWithRabbit()")}
                    <button class="action-btn adventure" onclick="openAdventure()"><span class="action-icon-emoji">⚔️</span><span>Aventure</span></button>
                </div>
                <div class="carrot-counter">🥕 ${game.carrots} carotte${game.carrots > 1 ? "s" : ""}</div>`;
                },
            },
        };

        function updateGameArea(zone) {
            currentZone = zone;
            gameArea.innerHTML = zones[zone].content();
            ["default", "cuisine", "chambre", "sdb", "jardin", "battle-scene"].forEach((c) =>
                body.classList.remove(c),
            );
            body.classList.add("game-running", zone);
            rabbitImage.onerror = () => {
                rabbitImage.onerror = null;
                rabbitImage.src = "./assets/img/species/mystery.svg";
            };
            rabbitImage.src = zones[zone].image();
            rabbitImage.classList.toggle("photo-frame", zone === "default");
            if (zone === "default") {
                const activeSpot = document.getElementById("salonActiveRabbitSpot");
                (activeSpot || gameArea).appendChild(rabbitImage);
            } else {
                gameArea.appendChild(rabbitImage);
            }
            sceneLabel.textContent = zones[zone].label;
            document
                .querySelectorAll(".room-tab")
                .forEach((btn) => btn.classList.toggle("active", btn.dataset.zone === zone));
        }
        function refreshCurrentZone() {
            updateGameArea(currentZone);
        }

        window.showLapinousRecords=function(){document.querySelector('.records-overlay')?.remove();ensureNewSystems();const owned=(game.ownedSpecies||[]).length;const maxLevel=Math.max(1,...Object.values(game.progress||{}).map(p=>Number(p.currentLevel)||1));const overlay=document.createElement('div');overlay.className='records-overlay';overlay.innerHTML=`<div class="records-card"><button class="records-close" aria-label="Fermer">×</button><h2>🏆 Succès et records</h2><div class="records-grid"><div><strong>${owned}</strong><span>Lapins collectionnés</span></div><div><strong>${game.records.eggsOpened}</strong><span>Œufs ouverts</span></div><div><strong>${game.records.eggsBought}</strong><span>Œufs achetés</span></div><div><strong>${game.records.bossesDefeated}</strong><span>Boss vaincus</span></div><div><strong>${game.records.agilityPlayed}</strong><span>Parties d’agilité</span></div><div><strong>${game.records.puzzlesCompleted}</strong><span>Jeux/puzzles terminés</span></div><div><strong>${maxLevel}</strong><span>Meilleur niveau</span></div><div><strong>${game.carrots}</strong><span>Carottes actuelles</span></div></div></div>`;document.body.appendChild(overlay);attachAchievementPanel(overlay);overlay.onclick=e=>{if(e.target===overlay||e.target.classList.contains('records-close'))overlay.remove();};};
        function renderRecordsButton(){let b=document.getElementById('lapinousRecordsBtn');if(!b){b=document.createElement('button');b.id='lapinousRecordsBtn';b.className='records-toggle';b.textContent='🏆';b.title='Records';b.onclick=window.showLapinousRecords;document.body.appendChild(b);}}

        // ============================================================
        // STATUTS / NIVEAU
        // ============================================================
        function checkStatus() {
            if (progress().food <= 10)
                showToast(`${currentRabbitName() || "Ton lapin"} a faim ! 🥕`, "warn");
            if (progress().energy <= 10)
                showToast(`${currentRabbitName() || "Ton lapin"} est fatigué ! 😴`, "warn");
            if (progress().cleanliness <= 10)
                showToast(`${currentRabbitName() || "Ton lapin"} a besoin d'un bain ! 🫧`, "warn");
        }
        function checkLevelUp() {
            while (progress().currentLevel < 100 && progress().friendshipTotal >= progress().currentLevel * 25) {
                progress().currentLevel += 1;
                if (game.species === "az" && progress().currentLevel % 10 === 0) {
                    ensureTechniqueProgress("az").attackFragments += 1;
                    showToast(`💎 Azazel atteint le niveau ${progress().currentLevel} : +1 fragment pour améliorer ses attaques !`, "levelup");
                }
                if (game.species === "az" && progress().currentLevel % 20 === 0) {
                    showToast(`🌟 Azazel atteint le palier ${progress().currentLevel} : sa compétence secrète devient plus puissante !`, "levelup");
                }
                if (progress().currentLevel % 20 === 0) { game.eggs += 1; showToast(`🎁 Niveau ${progress().currentLevel} : un œuf offert !`, "levelup"); }
                else showToast(`🎉 Niveau ${progress().currentLevel} atteint !`, "levelup");
                playSfx("levelup"); spawnParticles("🎉", 10);
            }
            if (progress().currentLevel >= 100) progress().currentLevel = 100;
            document.getElementById("level").innerText = progress().currentLevel;
            updateStatusBars();
        }
        function gainFriendship(amount) {
            const scaled = Math.max(1, Math.round(amount * 0.45));
            progress().friendshipTotal = Math.max(0, progress().friendshipTotal + scaled);
            progress().friendship = Math.max(0, Math.min(100, progress().friendship + scaled));
            checkLevelUp();
        }

        // ============================================================
        // ACTIONS
        // ============================================================
        window.feedRabbit = function () {
            playSfx("feed");
            if (progress().food >= 100) {
                showToast("Le lapin est déjà rassasié !");
            } else {
                progress().food = Math.min(
                    progress().food + traitGain("food", 5) + progress().boosts.food,
                    100,
                );
                bounceRabbit();
                spawnParticles("🥕", 5);
            }
            updateStatusBars();
            checkStatus();
            autoSave();
        };
        window.putRabbitToSleep = function () {
            playSfx("sleep");
            if (progress().energy >= 100) {
                showToast("Le lapin est déjà bien reposé !");
            } else {
                progress().energy = Math.min(
                    progress().energy + traitGain("energy", 5) + progress().boosts.energy,
                    100,
                );
                bounceRabbit();
                spawnParticles("💤", 5);
            }
            updateStatusBars();
            checkStatus();
            autoSave();
        };
        window.cleanRabbit = function () {
            playSfx("clean");
            if (progress().cleanliness >= 100) {
                showToast("Le lapin est déjà tout propre !");
            } else {
                progress().cleanliness = Math.min(
                    progress().cleanliness + 5 + progress().boosts.cleanliness,
                    100,
                );
                bounceRabbit();
                spawnParticles("🫧", 5);
            }
            updateStatusBars();
            checkStatus();
            autoSave();
        };

        // ---- Memory ----
        let memoryState = null;
        window.openMemory = function () {
            const pool = (game.ownedSpecies || []).slice(0, 8);
            const fallback = Object.keys(getSpecies()).slice(0, 8);
            const keys = (pool.length >= 4 ? pool : fallback).slice(0, 6);
            const cards = [...keys, ...keys].sort(() => Math.random() - 0.5).map((key, i) => ({ key, id:i, open:false, found:false }));
            memoryState = { cards, first:null, lock:false, moves:0 };
            renderMemory();
        };
        function renderMemory() {
            if (!memoryState) return;
            gameArea.innerHTML = `<div class="console-panel"><div class="console-title">🧠 Memory</div><p class="agility-hint">Retrouve les paires. Les lapins de ta collection sont utilisés en priorité.</p><div class="memory-grid">${memoryState.cards.map((c,i)=>{const sp=getSpecies()[c.key]||{};return `<button class="memory-card ${c.open||c.found?'open':''}" onclick="flipMemory(${i})" ${c.found?'disabled':''}>${c.open||c.found?`<img src="${sp.faceImg||'./assets/img/species/mystery.svg'}" alt="${sp.name||''}">`:'❓'}</button>`}).join('')}</div><small>${memoryState.moves} coup(s)</small><button class="ghost-btn" onclick="openGameConsole()">← Console</button></div>`;
        }
        window.flipMemory = function(i){
            const st=memoryState;if(!st||st.lock) return; const c=st.cards[i]; if(c.open||c.found)return; c.open=true;
            if(st.first===null){st.first=i;renderMemory();return;} st.moves++; const a=st.cards[st.first];
            if(a.key===c.key){a.found=c.found=true;st.first=null;renderMemory(); if(st.cards.every(x=>x.found)){ensureMinigameProgress().memory.completed++; recordAchievement('gamesWon'); gainFriendship(6); game.records.puzzlesCompleted += 1; showToast('Memory terminé : +6 💛','success'); autoSave();}} else {st.lock=true;renderMemory();setTimeout(()=>{a.open=c.open=false;st.first=null;st.lock=false;renderMemory();},700);}
        };

        // ---- Lapidoku 4x4 ----
        let lapidokuState=null;
        const LAPIDOKU_SOLVED=[1,2,3,4,3,4,1,2,2,1,4,3,4,3,2,1];
        window.openLapidoku=function(){
            const holes=[1,3,4,6,9,11,12,14]; const board=LAPIDOKU_SOLVED.slice(); holes.forEach(i=>board[i]=0); lapidokuState={board,holes:new Set(holes),selected:1}; renderLapidoku();
        };
        function renderLapidoku(){if(!lapidokuState)return;gameArea.innerHTML=`<div class="console-panel"><div class="console-title">🔢 Lapidoku</div><p class="agility-hint">Complète la grille 4×4 : chaque ligne, colonne et bloc 2×2 doit contenir 1, 2, 3 et 4.</p><div class="lapidoku-grid">${lapidokuState.board.map((v,i)=>`<button class="lapidoku-cell ${lapidokuState.holes.has(i)?'editable':'fixed'}" ${lapidokuState.holes.has(i)?`onclick="cycleLapidoku(${i})"`:'disabled'}>${v||'·'}</button>`).join('')}</div><button class="action-btn" onclick="checkLapidoku()">✓ Vérifier</button><button class="ghost-btn" onclick="openGameConsole()">← Console</button></div>`;}
        window.cycleLapidoku=function(i){if(!lapidokuState?.holes.has(i))return;lapidokuState.board[i]=(lapidokuState.board[i]%4)+1;renderLapidoku();};
        window.checkLapidoku=function(){if(!lapidokuState)return;const ok=lapidokuState.board.every((v,i)=>v===LAPIDOKU_SOLVED[i]);if(ok){ensureMinigameProgress().lapidoku.completed++; lapidokuState = null; recordAchievement('gamesWon');gainFriendship(8);showToast('Lapidoku réussi : +8 💛','success');spawnParticles('💛',6);autoSave();openGameConsole();}else showToast('Il reste des erreurs dans la grille 🐰','warn');};

        // ---- Mini-jeu d'agilité : mini-runner ----
        let agilityRAF = null;
        let agilityRun = null;

        window.startAgility = function () {
            if (progress().food <= 5 || progress().energy <= 5 || progress().cleanliness <= 5) {
                showToast("Votre lapin n'est pas en état de jouer maintenant !", "warn");
                return;
            }
            cancelAnimationFrame(agilityRAF);
            const trait = currentTrait();
            agilityRun = {
                startedAt: performance.now(), lastAt: performance.now(),
                y: 0, vy: 0, obstacles: [], spawnIn: 850, distance: 0,
                hits: 0, maxHits: 3, speed: Math.max(0.24, 0.34 - ((trait.agilityBonus || 0) / 1000)),
                running: true
            };
            gameArea.innerHTML = `
              <div class="agility-runner-wrap">
                <div class="agility-runner-head">
                  <strong>🐇 Parcours d'agilité</strong>
                  <span>Distance : <b id="agilityDistance">0</b> m</span>
                  <span>Erreurs : <b id="agilityHits">0</b>/3</span>
                </div>
                <div class="agility-runner" id="agilityRunner" tabindex="0" aria-label="Parcours d'agilité">
                  <div class="agility-ground"></div>
                  <div class="agility-runner-rabbit" id="agilityRabbit">🐇</div>
                  <div class="agility-start-hint" id="agilityHint">ESPACE, ↑ ou clique pour sauter</div>
                </div>
                <div class="agility-runner-controls">
                  <button class="action-btn" id="agilityJumpBtn" onclick="agilityJump()">⬆ Sauter</button>
                  <button class="ghost-btn" onclick="stopAgility(false)">Arrêter</button>
                </div>
                <small>Le parcours accélère progressivement. Trois collisions mettent fin à la partie.</small>
              </div>`;
            const runner = document.getElementById('agilityRunner');
            runner.onclick = (e) => { if (!e.target.closest('button')) agilityJump(); };
            runner.focus();
            window.addEventListener('keydown', agilityKeyHandler);
            agilityRAF = requestAnimationFrame(agilityLoop);
        };

        function agilityKeyHandler(e) {
            if (!agilityRun?.running) return;
            if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); agilityJump(); }
        }

        window.agilityJump = function () {
            if (!agilityRun?.running) return;
            if (agilityRun.y <= 1) agilityRun.vy = 0.68;
            const hint = document.getElementById('agilityHint'); if (hint) hint.remove();
        };

        function agilityLoop(now) {
            if (!agilityRun?.running) return;
            const dt = Math.min(34, now - agilityRun.lastAt); agilityRun.lastAt = now;
            agilityRun.distance += dt * (0.010 + agilityRun.speed * 0.012);
            agilityRun.speed = Math.min(0.72, agilityRun.speed + dt * 0.000006);
            agilityRun.vy -= 0.00215 * dt;
            agilityRun.y += agilityRun.vy * dt;
            if (agilityRun.y < 0) { agilityRun.y = 0; agilityRun.vy = 0; }
            const rabbit = document.getElementById('agilityRabbit');
            if (rabbit) rabbit.style.transform = `translateY(${-Math.min(118, agilityRun.y)}px) scaleX(-1)`;

            agilityRun.spawnIn -= dt;
            if (agilityRun.spawnIn <= 0) {
                const runner = document.getElementById('agilityRunner');
                if (runner) {
                    const el = document.createElement('div'); el.className='agility-obstacle'; el.textContent = Math.random() < .5 ? '🪵' : '🪨';
                    runner.appendChild(el); agilityRun.obstacles.push({ x: 100, hit:false, el });
                }
                agilityRun.spawnIn = 1050 + Math.random()*650 - agilityRun.speed*420;
            }
            for (const o of agilityRun.obstacles) {
                o.x -= dt * agilityRun.speed * 0.095;
                if (o.el) o.el.style.left = o.x + '%';
                if (!o.hit && o.x < 19 && o.x > 8 && agilityRun.y < 43) {
                    o.hit=true; agilityRun.hits++; o.el?.classList.add('hit');
                    const h=document.getElementById('agilityHits'); if(h)h.textContent=agilityRun.hits;
                    spawnParticles('💥',4);
                    if (agilityRun.hits >= agilityRun.maxHits) return stopAgility(true);
                }
                if (o.x < -8) o.el?.remove();
            }
            agilityRun.obstacles = agilityRun.obstacles.filter(o=>o.x>=-8);
            const d=document.getElementById('agilityDistance'); if(d)d.textContent=Math.floor(agilityRun.distance);
            agilityRAF=requestAnimationFrame(agilityLoop);
        }

        window.stopAgility = function (finished = false) {
            if (!agilityRun?.running) { refreshCurrentZone(); return; }
            agilityRun.running=false; cancelAnimationFrame(agilityRAF); window.removeEventListener('keydown', agilityKeyHandler);
            ensureNewSystems(); recordAchievement('agilityPlayed', 1, Math.floor(agilityRun.distance) >= 20 ? 1 : 0);
            const meters=Math.floor(agilityRun.distance);
            const reward=Math.max(1, Math.min(10, Math.floor(meters/18))) + traitGain('friendship',0) + progress().boosts.friendship;
            gainFriendship(reward);
            progress().food=Math.max(0,progress().food-6); progress().energy=Math.max(0,progress().energy-8); progress().cleanliness=Math.max(0,progress().cleanliness-(4+agilityRun.hits*2));
            updateStatusBars(); checkStatus(); autoSave();
            showToast(`${finished?'Parcours terminé':'Entraînement arrêté'} : ${meters} m — +${reward} 💛 d'amitié.`, finished?'warn':'success');
            agilityRun=null; setTimeout(()=>refreshCurrentZone(),1200);
        };

        // ---- Aventure / combat contre les boss légumes ----
        function playerPower() {
            const t = currentTrait();
            const combatBonus = (t.gain && (t.gain.friendship || 0)) * 2;
            const conditionBonus = Math.round(
                (progress().food + progress().energy + progress().cleanliness) / 3 / 5,
            );
            const attackBonus = ensureAttackTraining(progress()).bonus || 0;
            return progress().currentLevel * 8 + combatBonus + conditionBonus + attackBonus;
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
                    const label =
                        diff > 15 ? "💀 Très dangereux" : diff > 0 ? "⚠️ Difficile" : "🙂 Faisable";
                    return `<button class="boss-card" onclick="prepareFight('${key}')">
                    <img src="${b.faceImg || b.coteImg}" alt="${b.name}" onerror="this.onerror=null;this.src='./assets/img/bosses/mystery_boss.svg';">
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

            const playerHp = 90 + progress().currentLevel * 12;
            const bossHp = Math.round(70 + (boss.difficulty || 20) * 1.4);
            gameArea.innerHTML = `
            <div class="fight-stage">
                <div class="fight-hud-side player">
                    <div class="fight-name">🐰 ${currentRabbitName() || s.name}</div>
                    <div class="fight-hp"><div class="fight-hp-fill player-hp" style="width:100%"></div></div>
                    <div class="fight-hp-text">${playerHp} / ${playerHp} PV</div>
                    <div class="fight-crit-label">💥 Critique <span class="fight-crit-text">0%</span></div>
                    <div class="fight-crit"><div class="fight-crit-fill player-crit-fill" style="width:0%"></div></div>
                </div>
                <div class="fight-hud-side boss">
                    <div class="fight-name">🥕 ${boss.name}</div>
                    <div class="fight-hp"><div class="fight-hp-fill boss-hp" style="width:100%"></div></div>
                    <div class="fight-hp-text">${bossHp} / ${bossHp} PV</div>
                    <div class="fight-crit-label">💥 Critique <span class="fight-crit-text">0%</span></div>
                    <div class="fight-crit"><div class="fight-crit-fill boss-crit-fill" style="width:0%"></div></div>
                </div>
                <div class="vs-screen battle-vs">
                    <div class="vs-side fighter player-fighter"><img class="battle-sprite player-sprite" src="${s.coteImg || s.faceImg}" alt="${s.name}" onerror="this.onerror=null;this.src='./assets/img/species/mystery.svg';"><div class="vs-sub">Niveau ${progress().currentLevel}</div><div class="fight-power-name">${powerName(s)}</div></div>
                    <div class="vs-mark">⚔️</div>
                    <div class="vs-side fighter boss-fighter"><img class="battle-sprite boss-sprite" src="${boss.coteImg || boss.faceImg}" alt="${boss.name}" onerror="this.onerror=null;this.src='./assets/img/bosses/mystery_boss.svg';"><div class="vs-sub">Difficulté ${boss.difficulty}</div><div class="fight-power-name">${powerName(boss)}</div></div>
                </div>
                <div id="fightLog" class="fight-log">Prêt au combat !</div>
                <div class="action-row fight-actions"><button class="action-btn adventure" onclick="fightBoss('${key}')"><span>⚔️ Combattre !</span></button><button class="ghost-btn" onclick="openAdventure()">← Autre adversaire</button></div>
            </div>`;
        };

        function sleep(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        }

        function powerMode(entity) {
            const explicit = String(entity?.powerMode || entity?.powerType || "").toLowerCase();
            if (explicit) return explicit;
            const text = String(entity?.power || "").toLowerCase();
            if (/soign|restaur|régén|regen|guér|guer/.test(text)) return "heal";
            if (
                /bouclier|défense|defense|résistance|resistance|esquive|ralent|immobil|endort|réduit|reduit|augmente|renforce|allié|allie/.test(
                    text,
                )
            )
                return "support";
            return "attack";
        }

        function powerName(entity) {
            const text = String(entity?.power || "").trim();
            if (!text) return "Coup critique";
            return text.split(":")[0].trim() || "Coup critique";
        }

        function criticalConfig(entity) {
            const raw = entity?.critical ?? entity?.critique ?? entity?.crit ?? {};
            const obj = typeof raw === "object" && raw !== null ? raw : {};
            const powerMentionsCrit = /critique/i.test(entity?.power || "");
            const chargePerTurn = Number(
                obj.chargePerTurn ??
                    obj.charge ??
                    entity?.criticalCharge ??
                    entity?.critCharge ??
                    (powerMentionsCrit ? 34 : 20),
            );
            const multiplier = Number(
                obj.multiplier ??
                    entity?.criticalMultiplier ??
                    entity?.critMultiplier ??
                    (powerMentionsCrit ? 2 : 1.75),
            );
            return {
                chargePerTurn: Math.max(
                    1,
                    Math.min(100, Number.isFinite(chargePerTurn) ? chargePerTurn : 20),
                ),
                multiplier: Math.max(1.1, Number.isFinite(multiplier) ? multiplier : 1.75),
            };
        }

        function setFightHp(side, hp, maxHp) {
            const fill = gameArea.querySelector(`.${side}-hp`);
            const text = fill?.closest(".fight-hud-side")?.querySelector(".fight-hp-text");
            if (fill) fill.style.width = `${(Math.max(0, hp) / maxHp) * 100}%`;
            if (text) text.textContent = `${Math.max(0, Math.round(hp))} / ${maxHp} PV`;
        }

        function setCritCharge(side, charge) {
            const fill = gameArea.querySelector(`.${side}-crit-fill`);
            const text = fill?.closest(".fight-hud-side")?.querySelector(".fight-crit-text");
            const safe = Math.max(0, Math.min(100, charge));
            if (fill) fill.style.width = `${safe}%`;
            if (text) text.textContent = safe >= 100 ? "CRITIQUE PRÊT !" : `${Math.round(safe)}%`;
        }

        window.fightBoss = async function (key) {
            const boss = getBosses()[key];
            const s = getSpecies()[game.species];
            if (!boss) return;
            const fightButton = gameArea.querySelector(".fight-actions .action-btn");
            if (fightButton) fightButton.disabled = true;

            const power = playerPower();
            const playerMaxHp = 90 + progress().currentLevel * 12;
            const bossMaxHp = Math.round(70 + (boss.difficulty || 20) * 1.4);
            let playerHp = playerMaxHp;
            let bossHp = bossMaxHp;
            let playerCrit = 0;
            let bossCrit = 0;
            const playerCritConfig = criticalConfig(s);
            const bossCritConfig = criticalConfig(boss);
            const log = gameArea.querySelector("#fightLog");
            const playerImg = gameArea.querySelector(".player-sprite");
            const bossImg = gameArea.querySelector(".boss-sprite");

            while (playerHp > 0 && bossHp > 0) {
                playerCrit = Math.min(100, playerCrit + playerCritConfig.chargePerTurn);
                setCritCharge("player", playerCrit);
                await sleep(180);
                const playerIsCrit = playerCrit >= 100;
                let playerDamage = Math.max(6, Math.round(8 + power * 0.22 + Math.random() * 8));
                let playerSupportHeal = 0;
                if (playerIsCrit) {
                    const mode = powerMode(s);
                    playerDamage = Math.round(playerDamage * playerCritConfig.multiplier);
                    if (mode === "heal" || mode === "support") {
                        playerSupportHeal = Math.max(
                            4,
                            Math.round(playerMaxHp * (mode === "heal" ? 0.2 : 0.1)),
                        );
                        playerHp = Math.min(playerMaxHp, playerHp + playerSupportHeal);
                        setFightHp("player", playerHp, playerMaxHp);
                        // Les supports restent utiles en solo : leur pouvoir les soutient aussi,
                        // tout en conservant une attaque critique moins brutale qu'un pur attaquant.
                        playerDamage = Math.round(playerDamage * (mode === "heal" ? 0.6 : 0.75));
                    }
                    playerCrit = 0;
                    setCritCharge("player", 0);
                }
                playerImg?.classList.add("fight-attack-player");
                await sleep(220);
                bossHp = Math.max(0, bossHp - playerDamage);
                if (log)
                    log.textContent = playerIsCrit
                        ? `💥 ${powerName(s)} ! -${playerDamage} PV à ${boss.name}${playerSupportHeal ? ` · +${playerSupportHeal} PV pour ${currentRabbitName() || s.name}` : ""}`
                        : `${currentRabbitName() || s.name} attaque : -${playerDamage} PV à ${boss.name} !`;
                bossImg?.classList.add(playerIsCrit ? "fight-critical-hit" : "fight-hit");
                setFightHp("boss", bossHp, bossMaxHp);
                await sleep(playerIsCrit ? 650 : 420);
                playerImg?.classList.remove("fight-attack-player");
                bossImg?.classList.remove("fight-hit", "fight-critical-hit");
                if (bossHp <= 0) break;

                bossCrit = Math.min(100, bossCrit + bossCritConfig.chargePerTurn);
                setCritCharge("boss", bossCrit);
                await sleep(180);
                const bossIsCrit = bossCrit >= 100;
                let bossDamage = Math.max(
                    5,
                    Math.round(5 + (boss.difficulty || 20) * 0.14 + Math.random() * 7),
                );
                let bossSupportHeal = 0;
                if (bossIsCrit) {
                    const mode = powerMode(boss);
                    bossDamage = Math.round(bossDamage * bossCritConfig.multiplier);
                    if (mode === "heal" || mode === "support") {
                        bossSupportHeal = Math.max(
                            4,
                            Math.round(bossMaxHp * (mode === "heal" ? 0.2 : 0.1)),
                        );
                        bossHp = Math.min(bossMaxHp, bossHp + bossSupportHeal);
                        setFightHp("boss", bossHp, bossMaxHp);
                        bossDamage = Math.round(bossDamage * (mode === "heal" ? 0.6 : 0.75));
                    }
                    bossCrit = 0;
                    setCritCharge("boss", 0);
                }
                bossImg?.classList.add("fight-attack-boss");
                await sleep(220);
                playerHp = Math.max(0, playerHp - bossDamage);
                if (log)
                    log.textContent = bossIsCrit
                        ? `💥 ${powerName(boss)} ! -${bossDamage} PV${bossSupportHeal ? ` · ${boss.name} récupère +${bossSupportHeal} PV` : ""}`
                        : `${boss.name} contre-attaque : -${bossDamage} PV !`;
                playerImg?.classList.add(bossIsCrit ? "fight-critical-hit" : "fight-hit");
                setFightHp("player", playerHp, playerMaxHp);
                await sleep(bossIsCrit ? 650 : 420);
                bossImg?.classList.remove("fight-attack-boss");
                playerImg?.classList.remove("fight-hit", "fight-critical-hit");
            }

            progress().food = Math.max(progress().food - 7, 0);
            progress().energy = Math.max(progress().energy - 10, 0);
            progress().cleanliness = Math.max(progress().cleanliness - 5, 0);

            const fightExhausted =
                bossHp > 0 || playerHp <= Math.max(10, Math.round(playerMaxHp * 0.1));

            if (bossHp <= 0) {
                const reward = Math.max(
                    2,
                    Math.round((boss.difficulty || 20) * 0.3) + Math.floor(Math.random() * 3),
                );
                game.carrots += reward; ensureNewSystems(); recordAchievement('bossesDefeated'); playSfx("victory");
                gainFriendship(3);
                if (log) log.textContent = `🏆 Victoire ! +${reward} 🥕 et +3 💛`;
                spawnParticles("🥕", 8);
            } else {
                playSfx("defeat"); // Une défaite ne retire aucune amitié ni aucun niveau.
                if (log)
                    log.textContent = `${boss.name} gagne ce combat. ${currentRabbitName()} a besoin de repos 😴`;
                spawnParticles("💦", 5);
            }

            if (fightExhausted) {
                progress().food = 0;
                progress().energy = 0;
                progress().cleanliness = 0;
                if (bossHp <= 0) {
                    if (log)
                        log.textContent += ` · ${currentRabbitName()} termine le combat complètement épuisé·e : nourriture, sommeil et propreté tombent à 0.`;
                } else {
                    if (log)
                        log.textContent = `${currentRabbitName()} revient complètement épuisé·e : nourriture, sommeil et propreté tombent à 0.`;
                }
                showToast(
                    `${currentRabbitName()} est KO de fatigue : nourriture, sommeil et propreté à 0.`,
                    "warn",
                );
                spawnParticles("💤", 5);
            }
            updateStatusBars();
            checkStatus();
            autoSave();
            const actions = gameArea.querySelector(".fight-actions");
            if (actions)
                actions.innerHTML = `<button class="action-btn adventure" onclick="prepareFight('${key}')"><span>🔁 Rejouer</span></button><button class="ghost-btn" onclick="openAdventure()">← Boss</button>`;
        };

        // ---- Combat tactique manuel / équipe ----
        let tacticalFight = null;
        let selectedFightTeam = [];
        let fightMode = "manual";
        let fightSpeed = 1;
        let autoFightTimer = null;
        function queueAutoFight() {
            clearTimeout(autoFightTimer);
            const f = tacticalFight;
            if (!f || !f.auto || f.locked) return;
            autoFightTimer = setTimeout(() => {
                if (tacticalFight !== f || !f.auto || !gameArea.querySelector('.tactical')) return;
                const r = f.team[f.active];
                if (r.charge >= 100) window.tacticalAction('ultimate');
                else {
                    const count = raritySkillCount(r.sp.rarity);

                    let best = 0;
                    for (let i = 1; i < count; i++) {
                        if (!isTechniqueUnlocked(r, i)) continue;
                        const t = techniqueFor(r, i);
                        if (t.kind === 'heal' && r.hp < r.maxHp * .45) { best = i; break; }
                        if (t.kind === 'damage' && r.power*t.mult+r.pr.attackLevels[i]*3 > r.power*techniqueFor(r,best).mult+r.pr.attackLevels[best]*3) best = i;
                    }
                    window.tacticalAction('skill', best);
                }
            }, 650 / f.speed);
        }
        window.setFightMode = function(mode) {
            fightMode = mode === 'auto' ? 'auto' : 'manual';
            if (tacticalFight) {
                tacticalFight.auto = fightMode === 'auto';
                clearTimeout(autoFightTimer);
                const btn = gameArea.querySelector('#fightModeToggle');
                if (btn) btn.textContent = tacticalFight.auto ? '⏸ Reprendre en manuel' : '▶ Combat automatique';
                if (!tacticalFight.locked) renderTacticalFight('Mode ' + (tacticalFight.auto ? 'automatique' : 'manuel'));
            }
        };
        window.setFightSpeed = function(value) {
            fightSpeed = Number(value) === 3 ? 3 : 1;
            if (tacticalFight) { tacticalFight.speed = fightSpeed; queueAutoFight(); }
        };
        function fightPause(f, ms) { return sleep(ms / f.speed); }
        function raritySkillCount(rarity){ return ({commun:1,rare:2,epique:3,legendaire:4,mythique:5,divin:6,secret:6})[rarity] || 1; }
        function rabbitCombatStats(key){
            const sp=getSpecies()[key]||{}, pr=progressForSpecies(key), tr=ensureAttackTraining(pr);
            const azTier = key === "az" ? Math.floor(pr.currentLevel / 20) : 0;
            ensureTechniqueProgress(key);
            const basePower = 8 + pr.currentLevel*3 + azTier*8;
            return {key,sp,pr,maxHp:80+pr.currentLevel*10,hp:80+pr.currentLevel*10,power:basePower,charge:0,azTier,guard:0};
        }
        function rabbitDisplayName(r){ return game.speciesNames?.[r.key] || r.sp.name || r.key; }
        function techniqueFor(r,index) {
            const defaults = [
                {name:'Frappe renforcée',kind:'damage',mult:1.35},
                {name:'Frappe éclair',kind:'damage',mult:1.55},
                {name:'Garde héroïque',kind:'guard',mult:.85},
                {name:'Assaut renforcé',kind:'damage',mult:1.85},
                {name:'Second souffle',kind:'heal',mult:.65},
                {name:'Frappe céleste',kind:'damage',mult:2.05}
            ];
            const configured = r.sp.attacks?.[index];
            const fallback = defaults[index] || defaults[0];
            return {name:String(configured?.name || fallback.name), kind:['damage','heal','guard'].includes(configured?.kind)?configured.kind:fallback.kind, mult:Number.isFinite(Number(configured?.mult)) && Number(configured?.mult)>0 ? Number(configured.mult) : fallback.mult};
        }
        function ultimateName(r){ return `${powerName(r.sp)||r.sp.name} — Coup critique`; }
        function nextLivingIndex(f,from){
            if(!f.team.some(x=>x.hp>0)) return -1;
            for(let step=1;step<=f.team.length;step++){const i=(from+step)%f.team.length;if(f.team[i].hp>0)return i;}
            return -1;
        }
        window.toggleFightTeam=function(key,bossKey){
            if(selectedFightTeam.includes(key)) selectedFightTeam=selectedFightTeam.filter(x=>x!==key); else if(selectedFightTeam.length<3) selectedFightTeam.push(key); else showToast('Équipe limitée à 3 lapins.','warn');
            prepareFight(bossKey);
        };
        window.prepareFight = function(key){
            const boss=getBosses()[key]; if(!boss)return; if(!game.discoveredBosses)game.discoveredBosses=[];if(!game.discoveredBosses.includes(key))game.discoveredBosses.push(key);
            const owned=(game.ownedSpecies||[game.species]).slice(); if(!selectedFightTeam.length) selectedFightTeam=owned.slice(0,Math.min(3,owned.length));
            selectedFightTeam=selectedFightTeam.filter(k=>owned.includes(k)).slice(0,3);
            const teamCards=owned.map(k=>{const sp=getSpecies()[k]||{},on=selectedFightTeam.includes(k),pr=progressForSpecies(k);return `<button class="fight-team-card ${on?'selected':''}" onclick="toggleFightTeam('${k}','${key}')"><img src="${sp.faceImg||sp.coteImg||'./assets/img/species/mystery.svg'}"><span>${game.speciesNames?.[k]||sp.name||k}<small>Niv. ${pr.currentLevel} · ${RARITY_META[sp.rarity]?.label||sp.rarity||'Commun'}</small></span></button>`}).join('');
            const preview=selectedFightTeam.map((k,i)=>{const sp=getSpecies()[k]||{};return `<div class="team-preview-rabbit slot-${i+1}"><img src="${sp.coteImg||sp.faceImg||'./assets/img/species/mystery.svg'}"><strong>${game.speciesNames?.[k]||sp.name||k}</strong></div>`}).join('');
            gameArea.innerHTML=`<div class="fight-stage fight-preparation"><div class="console-title">⚔️ Prépare ton équipe contre ${boss.name}</div><p class="agility-hint">Choisis jusqu’à 3 lapins. Les lapins sélectionnés apparaissent directement sur le terrain.</p><div class="fight-team-select">${teamCards}</div><div class="battlefield-preview"><div class="team-preview-side">${preview||'<span>Choisis ton équipe</span>'}</div><div class="vs-mark">VS</div><div class="preview-boss"><img src="${boss.coteImg||boss.faceImg}" onerror="this.src='./assets/img/bosses/mystery_boss.svg'"><strong>${boss.name}</strong></div></div><div class="action-row"><label>Combat <select onchange="setFightMode(this.value)"><option value="manual" ${fightMode==='manual'?'selected':''}>Manuel</option><option value="auto" ${fightMode==='auto'?'selected':''}>Automatique</option></select></label><label>Vitesse <select onchange="setFightSpeed(this.value)"><option value="1" ${fightSpeed===1?'selected':''}>×1</option><option value="3" ${fightSpeed===3?'selected':''}>×3</option></select></label><button class="action-btn adventure" onclick="startTacticalFight('${key}')" ${selectedFightTeam.length?'':'disabled'}>⚔️ Commencer</button><button class="ghost-btn" onclick="openAdventure()">← Boss</button></div></div>`; autoSave();
        };
        window.startTacticalFight=function(key){
            const boss=getBosses()[key]; if(!boss||!selectedFightTeam.length)return; const team=selectedFightTeam.map(rabbitCombatStats); tacticalFight={key,boss,team,active:0,bossMaxHp:100+(boss.difficulty||20)*3,bossHp:100+(boss.difficulty||20)*3,turn:1,locked:false,auto:fightMode==='auto',speed:fightSpeed,bossCharge:0,bossGuard:0}; clearTimeout(autoFightTimer); playSfx("monsterCombat"); renderTacticalFight(`${rabbitDisplayName(team[0])} ouvre le combat !`);
        };
        function renderTacticalFight(message){
            const f=tacticalFight;if(!f)return;if(!f.team.some(x=>x.hp>0)){finishTacticalFight(false);return;}if(f.team[f.active]?.hp<=0)f.active=nextLivingIndex(f,f.active);const r=f.team[f.active];
            const skillN=raritySkillCount(r.sp.rarity);
            const skills=Array.from({length:skillN},(_,i)=>{if (!isTechniqueUnlocked(r,i)) return ""; const t=techniqueFor(r,i);return `<button class="fight-command" onclick="tacticalAction('skill',${i})" >✨ ${t.name}</button>`}).join('');
            const fighters=f.team.map((x,i)=>`<div class="team-fighter battle-slot-${i+1} ${i===f.active?'active-turn':''} ${x.hp<=0?'ko':''}" data-fighter="${i}"><div class="turn-marker">${i===f.active?'▼ TOUR':''}</div><img class="battle-sprite team-rabbit-sprite" src="${x.sp.coteImg||x.sp.faceImg||'./assets/img/species/mystery.svg'}" onerror="this.onerror=null;this.src='./assets/img/species/mystery.svg';"><strong>${rabbitDisplayName(x)}</strong><small>${Math.max(0,x.hp)} / ${x.maxHp} PV</small><div class="mini-hp"><i style="width:${Math.max(0,x.hp)/x.maxHp*100}%"></i></div></div>`).join('');
            gameArea.innerHTML=`<div class="fight-stage tactical"><div class="fight-hud-side player"><div class="fight-name">🐰 Tour de ${rabbitDisplayName(r)}</div><div class="fight-hp"><div class="fight-hp-fill player-hp" style="width:${r.hp/r.maxHp*100}%"></div></div><div class="fight-hp-text">${Math.max(0,r.hp)} / ${r.maxHp} PV</div><div class="fight-crit-label">🌟 Critique ${Math.round(r.charge)}%</div><div class="fight-crit"><div class="fight-crit-fill player-crit-fill" style="width:${r.charge}%"></div></div></div><div class="fight-hud-side boss"><div class="fight-name">🥕 ${f.boss.name}</div><div class="fight-hp"><div class="fight-hp-fill boss-hp" style="width:${f.bossHp/f.bossMaxHp*100}%"></div></div><div class="fight-hp-text">${Math.max(0,f.bossHp)} / ${f.bossMaxHp} PV</div><div class="fight-crit-label">🌟 Critique ${Math.round(f.bossCharge)}%</div><div class="fight-crit"><div class="fight-crit-fill" style="width:${f.bossCharge}%"></div></div></div><div class="team-battlefield"><div class="team-fighters">${fighters}</div><div class="vs-mark">⚔️</div><div class="boss-battle-slot"><img class="battle-sprite boss-sprite" src="${f.boss.coteImg||f.boss.faceImg}" onerror="this.onerror=null;this.src='./assets/img/bosses/mystery_boss.svg';"><strong>${f.boss.name}</strong></div></div><div id="fightLog" class="fight-log">Tour ${f.turn} · ${message}</div><div class="fight-command-grid">${skills}${r.charge>=100?`<button class="fight-command ultimate" onclick="tacticalAction('ultimate')">🌟 ${ultimateName(r)}</button>`:''}<button id="fightModeToggle" class="fight-command" onclick="setFightMode(tacticalFightMode())">${f.auto?'⏸ Reprendre en manuel':'▶ Combat automatique'}</button><label>Vitesse <select onchange="setFightSpeed(this.value)"><option value="1" ${f.speed===1?'selected':''}>×1</option><option value="3" ${f.speed===3?'selected':''}>×3</option></select></label></div></div>`;
            queueAutoFight();
        }
        window.tacticalFightMode = () => tacticalFight?.auto ? 'manual' : 'auto';
        window.tacticalAction=async function(type,index=0){
            const f=tacticalFight;if(!f||f.locked)return;const r=f.team[f.active];
            if (!['attack','skill','ultimate'].includes(type)) return;
            if (type==='ultimate' && r.charge<100) return;
            if (type==='skill' && !isTechniqueUnlocked(r, index)) return;
            clearTimeout(autoFightTimer);f.locked=true;const name=rabbitDisplayName(r);let dmg=0,msg='',heal=0;
            const sprite=gameArea.querySelector(`[data-fighter="${f.active}"] .team-rabbit-sprite`),bossSprite=gameArea.querySelector('.boss-sprite');
            if(type==='attack'){dmg=Math.round(r.power*.85+Math.random()*7);r.charge=Math.min(100,r.charge+criticalConfig(r.sp).chargePerTurn);msg=`🐰 ${name} utilise Coup de patte ! — ${dmg} dégâts.`;playSfx('attack');}
            else if(type==='skill'){
                playSfx('magic');const t=techniqueFor(r,index), bonus=(r.pr.attackLevels[index]||0)*3;r.charge=Math.min(100,r.charge+criticalConfig(r.sp).chargePerTurn);
                if(t.kind==='heal'){heal=Math.max(8,Math.round(r.maxHp*.22+bonus));r.hp=Math.min(r.maxHp,r.hp+heal);dmg=Math.round(r.power*.45+bonus);msg=`✨ ${name} utilise ${t.name} ! +${heal} PV et ${dmg} dégâts.`;}
                else if(t.kind==='guard'){r.guard=Math.max(r.guard,Math.min(.75,.55+(r.pr.attackLevels[index]||0)*.04));dmg=Math.round(r.power*t.mult+bonus);msg=`🛡️ ${name} utilise ${t.name} ! ${dmg} dégâts et se protège.`;}
                else {dmg=Math.round(r.power*t.mult+bonus+Math.random()*8);msg=`✨ ${name} utilise ${t.name} ! — ${dmg} dégâts.`;}
            } else if(type==='ultimate'){dmg=Math.round(r.power*criticalConfig(r.sp).multiplier+Math.random()*12);r.charge=0;const mode=powerMode(r.sp);if(mode==='heal'){f.team.filter(x=>x.hp>0).forEach(x=>x.hp=Math.min(x.maxHp,x.hp+Math.round(x.maxHp*.25)));}else if(mode==='support'){f.team.filter(x=>x.hp>0).forEach(x=>x.guard=Math.max(x.guard,.55));}msg=`🌟 ${name} déclenche ${ultimateName(r)} ! — ${dmg} dégâts !`;playSfx('critical');}
            gameArea.querySelectorAll('.fight-command').forEach(btn=>btn.disabled=true);
            sprite?.classList.add('fight-attack-player');await fightPause(f,240);dmg=Math.max(1,Math.round(dmg*(1-f.bossGuard)));f.bossGuard=0;f.bossHp=Math.max(0,f.bossHp-dmg);bossSprite?.classList.add(type==='ultimate'?'fight-critical-hit':'fight-hit');const log=gameArea.querySelector('#fightLog');if(log)log.textContent=msg;await fightPause(f,type==='ultimate'?650:430);sprite?.classList.remove('fight-attack-player');bossSprite?.classList.remove('fight-hit','fight-critical-hit');
            if(f.bossHp<=0){finishTacticalFight(true);return;}
            const config=criticalConfig(f.boss);
            f.bossCharge=Math.min(100,f.bossCharge+config.chargePerTurn);
            const bossCritical=f.bossCharge>=100;
            const raw=Math.max(5,Math.round((f.boss.difficulty||20)*.30+Math.random()*8));
            const bd=Math.max(1,Math.round(raw*(bossCritical?config.multiplier:1)*(1-(r.guard||0))));
            r.guard=0;
            const bossMessage=bossCritical ? `🌟 ${f.boss.name} déclenche ${powerName(f.boss)} : ${bd} dégâts !` : `🥕 ${f.boss.name} attaque ${name} : ${bd} dégâts.`;
            if(bossCritical){
                f.bossCharge=0;
                const mode=powerMode(f.boss);
                if(mode==='heal') f.bossHp=Math.min(f.bossMaxHp,f.bossHp+Math.round(f.bossMaxHp*.2));
                else if(mode==='support') f.bossGuard=.4;
            }
            const bossImg=gameArea.querySelector('.boss-sprite');bossImg?.classList.add('fight-attack-boss');
            await fightPause(f,220);r.hp=Math.max(0,r.hp-bd);playSfx(bossCritical?'critical':'attack');
            sprite?.classList.add(bossCritical?'fight-critical-hit':'fight-hit');
            if(log)log.textContent+=` ${bossMessage}${r.hp<=0?` ${name} est K.O. !`:''}`;
            await fightPause(f,bossCritical?650:430);bossImg?.classList.remove('fight-attack-boss');sprite?.classList.remove('fight-hit','fight-critical-hit');
            if(!f.team.some(x=>x.hp>0)){finishTacticalFight(false);return;}
            f.active=nextLivingIndex(f,f.active);f.turn++;f.locked=false;renderTacticalFight(`${msg} ${bossMessage} C'est au tour de ${rabbitDisplayName(f.team[f.active])}.`);
        };
        function finishTacticalFight(win){clearTimeout(autoFightTimer);const f=tacticalFight;if(!f)return;if(win){const reward=Math.max(2,Math.round((f.boss.difficulty||20)*.22));game.carrots+=reward;recordAchievement('bossesDefeated');f.team.forEach(x=>{const old=game.species;game.species=x.key;gainFriendship(3);game.species=old;});playSfx('victory');showToast(`Victoire ! +${reward} 🥕 · +3 💛 pour l’équipe`,'success');}else {playSfx('defeat');showToast('Ton équipe est K.O. Elle a besoin de repos.','warn');}f.team.forEach(x=>{x.pr.food=Math.max(0,x.pr.food-8);x.pr.energy=Math.max(0,x.pr.energy-12);x.pr.cleanliness=Math.max(0,x.pr.cleanliness-5);});updateStatusBars();autoSave();const key=f.key;tacticalFight=null;gameArea.innerHTML=`<div class="console-panel"><div class="console-title">${win?'🏆 Victoire !':'💤 Défaite'}</div><button class="action-btn" onclick="prepareFight('${key}')">🔁 Rejouer</button><button class="ghost-btn" onclick="openAdventure()">← Boss</button></div>`;}

        // ---- Boutique à œufs (Salon) ----
        const EGG_IMAGES = Object.fromEntries(['commun','rare','epique','legendaire','mythique','divin'].map(rarity => [rarity, `./assets/img/oeuf/${rarity}.png`]));
        const EGG_TAPS_TO_HATCH = 5;
        const eggStyle = document.createElement('style');
        eggStyle.textContent = `
            .egg-shell.illustrated-egg { display: inline-flex; align-items: center; justify-content: center; position: relative; border: 0; padding: 0; background: transparent; box-shadow: none; outline: none; appearance: none; -webkit-tap-highlight-color: transparent; cursor: pointer; transform-origin: 50% 85%; width: min(280px, 60vw); height: min(320px, 46vh); touch-action: manipulation; }
            .egg-shell.illustrated-egg img { width: 100%; height: 100%; object-fit: contain; pointer-events: none; }
            .egg-shell.illustrated-egg.shaking { animation: eggContinuousWiggle .48s ease-in-out infinite; }
            .egg-shell.illustrated-egg.hatching { animation: eggContinuousWiggle .18s ease-in-out infinite; --egg-tilt: 22deg; --egg-shift: 9px; }
            .egg-shell.illustrated-egg[hidden], .egg-rabbit[hidden] { display: none !important; }
            .egg-shell.illustrated-egg:focus-visible { outline: none; }
            .egg-shell.illustrated-egg:focus-visible img { filter: drop-shadow(0 0 8px #79558b); }
            .egg-batch-grid > .egg-batch-item { position: relative; min-height: 170px; justify-content: center; overflow: hidden; }
            .egg-batch-shell { width: 100%; display: flex; justify-content: center; transform-origin: 50% 85%; animation: eggWiggle .6s ease-in-out 4; animation-delay: var(--egg-delay); }
            .egg-batch-shell img { height: clamp(75px, 17vh, 150px); width: 100%; object-fit: contain; }
            .egg-batch-shell.breaking { animation: batchEggBreak .3s ease-in forwards; }
            .egg-batch-result { display: flex; flex-direction: column; align-items: center; gap: 3px; animation: batchRabbitAppear .35s ease-out; }
            .egg-batch-result[hidden], .egg-batch-shell[hidden] { display: none !important; }
            @keyframes batchEggBreak { to { transform: scale(1.12); opacity: 0; } }
            @keyframes batchRabbitAppear { from { transform: scale(.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            @media(prefers-reduced-motion:reduce) { .egg-batch-shell, .egg-batch-shell.breaking, .egg-batch-result { animation: none; } }
            @keyframes eggContinuousWiggle { 0%,100% { transform: translateX(calc(-1 * var(--egg-shift, 3px))) rotate(calc(-1 * var(--egg-tilt, 8deg))); } 50% { transform: translateX(var(--egg-shift, 3px)) rotate(var(--egg-tilt, 8deg)); } }
            @keyframes eggWiggle { 0%,100% { transform: rotate(0); } 15% { transform: rotate(-9deg); } 35% { transform: rotate(9deg); } 55% { transform: rotate(-7deg); } 75% { transform: rotate(5deg); } }
            @media(prefers-reduced-motion:reduce) { .egg-shell.illustrated-egg.shaking, .egg-shell.illustrated-egg.hatching { animation: none; } }
        `;
        document.head.appendChild(eggStyle);
        function eggRevealAnimation(speciesData) {
            return new Promise(resolve => {
                const rarity = speciesData.rarity || 'commun';
                const image = EGG_IMAGES[rarity] || EGG_IMAGES.divin;
                const overlay = document.createElement('div');
                overlay.className = `egg-reveal-overlay rarity-${rarity}`;
                overlay.innerHTML = `<div class="egg-reveal-card"><button type="button" class="egg-shell illustrated-egg" aria-label="Toucher l'œuf pour le faire éclore"><img src="${image}" alt="Œuf ${RARITY_META[rarity]?.label || rarity}" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span hidden aria-hidden="true">🥚</span></button><div class="egg-reveal-hint" role="status">Touche l'œuf plusieurs fois : 0/${EGG_TAPS_TO_HATCH}</div><div class="egg-rabbit" hidden><img src="${speciesData.faceImg || speciesData.coteImg}" alt="${speciesData.name}"><strong>${speciesData.name}</strong><span>${RARITY_META[rarity]?.label || rarity}</span><button type="button" class="action-btn">Continuer</button></div></div>`;
                document.body.appendChild(overlay);
                const shell = overlay.querySelector('.egg-shell');
                const hint = overlay.querySelector('.egg-reveal-hint');
                const rabbit = overlay.querySelector('.egg-rabbit');
                let taps = 0, hatching = false;
                shell.onclick = () => {
                    if (hatching) return;
                    taps++;
                    playSfx('eggCrack');
                    hint.textContent = `Quelque chose bouge à l'intérieur… ${taps}/${EGG_TAPS_TO_HATCH}`;
                    // La boucle continue entre les clics ; seule son amplitude augmente.
                    shell.style.setProperty('--egg-tilt', `${8 + taps * 3}deg`);
                    shell.style.setProperty('--egg-shift', `${3 + taps}px`);
                    if (taps < EGG_TAPS_TO_HATCH) { shell.classList.add('shaking'); return; }
                    hatching = true;
                    shell.disabled = true;
                    shell.classList.add('hatching');
                    hint.textContent = 'Il éclot !';
                    setTimeout(() => {
                        overlay.classList.add('cracked');
                        shell.hidden = true; hint.hidden = true; rabbit.hidden = false;
                        if (!['commun','rare'].includes(rarity)) playSfx('eggRare');
                    }, 750);
                };
                rabbit.querySelector('button').onclick = () => { overlay.remove(); resolve(); };
            });
        }
        window.buyEgg = function () {
            if (game.carrots < EGG_COST) {
                showToast(`Pas assez de carottes (il en faut ${EGG_COST}).`, "warn");
                return;
            }
            game.carrots -= EGG_COST;
            game.eggs += 1; ensureNewSystems(); recordAchievement('eggsBought'); playSfx("purchase");
            showToast("Œuf acheté ! 🥚", "success");
            spawnParticles("🥚", 4);
            autoSave();
            refreshCurrentZone();
        };

        let openingEggs = false;
        window.openEgg = async function () {
            if (openingEggs) return;
            if (game.eggs <= 0) {
                showToast("Tu n'as aucun œuf à ouvrir. Achète-en un d'abord !", "warn");
                return;
            }
            if (game.pendingDuplicate) {
                showToast("Choisis d'abord ce que tu fais du doublon précédent.", "warn");
                refreshCurrentZone();
                return;
            }
            openingEggs = true;
            game.eggs -= 1; ensureNewSystems(); recordAchievement('eggsOpened');
            const result = rollEgg();
            const s = getSpecies()[result.speciesKey];
            await eggRevealAnimation(s);
            openingEggs = false;
            const isNew = !game.ownedSpecies.includes(result.speciesKey);
            if (isNew) {
                game.ownedSpecies.push(result.speciesKey);
                game.speciesTraits[result.speciesKey] = result.trait;
                game.speciesNames[result.speciesKey] = s.name;
                showToast(
                    `🥚 L'œuf éclot... c'est ${s.name} (${RARITY_META[s.rarity].label}) ! Nouveau dans ton encyclopédie 📖.`,
                    "levelup",
                );
            } else {
                if (!game.duplicateCounts) game.duplicateCounts = {};
                game.duplicateCounts[result.speciesKey] =
                    (game.duplicateCounts[result.speciesKey] || 0) + 1;
                const rewards = {
                    commun: 5,
                    rare: 10,
                    epique: 18,
                    legendaire: 30,
                    mythique: 45,
                    divin: 70,
                    secret: 70,
                };
                const carrotReward = rewards[s.rarity] || 5;
                const training = ensureAttackTraining(progressForSpecies(result.speciesKey));
                if (allAttacksMaxed(result.speciesKey)) {
                    game.carrots += carrotReward;
                    showToast(
                        `🥚 Doublon : ${s.name}. Toutes ses attaques sont déjà au maximum : +${carrotReward} 🥕 automatiquement.`,
                        "levelup",
                    );
                } else {
                    game.pendingDuplicate = { speciesKey: result.speciesKey, carrotReward };
                    showToast(
                        `🥚 Doublon : ${s.name} ! Choisis entre des carottes ou un fragment d'attaque.`,
                        "levelup",
                    );
                }
            }
            spawnParticles("✨", 10);
            autoSave();
            refreshCurrentZone();
        };

        window.openTenEggs = function () {
            if (openingEggs || game.eggs < 10 || game.pendingDuplicate) return;
            openingEggs = true;
            ensureNewSystems();
            const results = Array.from({length:10}, () => rollEgg());
            game.eggs -= 10; recordAchievement('eggsOpened', 10);
            const rewards = {commun:5,rare:10,epique:18,legendaire:30,mythique:45,divin:70,secret:70};
            game.pendingDuplicates = game.pendingDuplicates || [];
            const cards = results.map(result => {
                const sp = getSpecies()[result.speciesKey];
                const isNew = !game.ownedSpecies.includes(result.speciesKey);
                let label = 'Nouveau !';
                if (isNew) {
                    game.ownedSpecies.push(result.speciesKey);
                    game.speciesTraits[result.speciesKey] = result.trait;
                    game.speciesNames[result.speciesKey] = sp.name;
                    progressForSpecies(result.speciesKey);
                } else {
                    game.duplicateCounts = game.duplicateCounts || {};
                    game.duplicateCounts[result.speciesKey] = (game.duplicateCounts[result.speciesKey] || 0) + 1;
                    const reward = rewards[sp.rarity] || 5;
                    if (allAttacksMaxed(result.speciesKey)) {
                        game.carrots += reward; label = `Doublon : +${reward} 🥕`;
                    } else {
                        game.pendingDuplicates.push({speciesKey:result.speciesKey,carrotReward:reward});
                        label = 'Doublon : choix après ouverture';
                    }
                }
                return {sp,label};
            });
            game.pendingDuplicate = game.pendingDuplicates.shift() || null;
            autoSave(); refreshCurrentZone();
            const overlay = document.createElement('div');
            overlay.className = 'egg-batch-overlay';
            const panel = document.createElement('div'); panel.className = 'egg-batch-card';
            const title = document.createElement('h2'); title.textContent = '🥚 Tes 10 œufs remuent…'; panel.appendChild(title);
            const grid = document.createElement('div'); grid.className = 'egg-batch-grid';
            const animatedCards = cards.map(({sp,label}, index) => {
                const card = document.createElement('div'); card.className = 'egg-batch-item';
                const shell = document.createElement('div'); shell.className = 'egg-batch-shell';
                shell.style.setProperty('--egg-delay', `${index * 40}ms`);
                const egg = document.createElement('img');
                egg.src = EGG_IMAGES[sp.rarity] || EGG_IMAGES.divin;
                egg.alt = `Œuf ${RARITY_META[sp.rarity]?.label || sp.rarity}`;
                egg.onerror = () => { egg.hidden = true; const fallback = document.createElement('span'); fallback.textContent = '🥚'; shell.appendChild(fallback); };
                shell.appendChild(egg);
                const reveal = document.createElement('div'); reveal.className = 'egg-batch-result'; reveal.hidden = true;
                const img = document.createElement('img'); img.src = sp.faceImg || sp.coteImg; img.alt = sp.name;
                const name = document.createElement('strong'); name.textContent = sp.name;
                const rarity = document.createElement('span'); rarity.textContent = RARITY_META[sp.rarity]?.label || sp.rarity;
                const info = document.createElement('small'); info.textContent = label;
                reveal.append(img,name,rarity,info); card.append(shell,reveal); grid.appendChild(card);
                return {shell,reveal};
            });
            const done = document.createElement('button'); done.className = 'action-btn'; done.textContent = 'Éclosion en cours…'; done.disabled = true;
            done.onclick = () => { overlay.remove(); openingEggs = false; refreshCurrentZone(); };
            panel.append(grid,done); overlay.appendChild(panel); document.body.appendChild(overlay);
            // Un son commun au lot évite de superposer dix craquements.
            setTimeout(() => playSfx('eggCrack'), 2600);
            animatedCards.forEach(({shell,reveal}, index) => {
                setTimeout(() => {
                    shell.classList.add('breaking');
                    setTimeout(() => { shell.hidden = true; reveal.hidden = false; }, 300);
                }, 2600 + index * 80);
            });
            setTimeout(() => {
                title.textContent = '🐰 Tes 10 lapins sont révélés !';
                done.disabled = false; done.textContent = 'Continuer';
                if (cards.some(({sp}) => !['commun','rare'].includes(sp.rarity))) playSfx('eggRare');
            }, 2600 + 9 * 80 + 350);
        };

        // ---- Améliorations ----
        function purchaseUpgrade(room, statKey, message) {
            if (!upgradeAvailable(room)) {
                showToast(
                    "Pas encore assez d'amitié, ou amélioration déjà achetée récemment.",
                    "warn",
                );
                return;
            }
            progress().friendship -= UPGRADE_COST;
            progress().boosts[statKey] += 2;
            progress().improvements[room] = true;
            progress().lastUpgradeLevel = progress().currentLevel;
            showToast(message, "success");
            spawnParticles("✨", 8);
            updateStatusBars();
            refreshCurrentZone();
            autoSave();
        }
        window.improveFeedRabbit = () =>
            purchaseUpgrade(
                "cuisine",
                "food",
                "La carotte devient une pomme : votre lapin se nourrit mieux !",
            );
        window.improvePutRabbitToSleep = () =>
            purchaseUpgrade(
                "chambre",
                "energy",
                "Le panier devient un vrai lit : votre lapin récupère mieux !",
            );
        window.improveCleanRabbit = () =>
            purchaseUpgrade(
                "sdb",
                "cleanliness",
                "La brosse devient une douche : votre lapin se nettoie mieux !",
            );
        window.improvePlayWithRabbit = () =>
            purchaseUpgrade("jardin", "friendship", "Le dressage devient un parcours d'agilité !");

        // ============================================================
        // RENOMMER
        // ============================================================
        document.getElementById("renameBtn").addEventListener("click", () => {
            document.getElementById("renameInput").value = currentRabbitName();
            bootstrap.Modal.getOrCreateInstance(document.querySelector('#renameModal')).show();
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
            bootstrap.Modal.getOrCreateInstance(document.querySelector('#renameModal')).hide();
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
            body.classList.remove("game-running");
            adoptionScreen.style.display = "flex";
            showCommon(0);
            showToast("Déconnecté. À bientôt ! 👋");
        });

        // ============================================================
        // NAVIGATION
        // ============================================================
        document
            .getElementById("salonBtn")
            .addEventListener("click", () => updateGameArea("default"));
        document
            .getElementById("cuisineBtn")
            .addEventListener("click", () => updateGameArea("cuisine"));
        document
            .getElementById("chambreBtn")
            .addEventListener("click", () => updateGameArea("chambre"));
        document
            .getElementById("jardinBtn")
            .addEventListener("click", () => updateGameArea("jardin"));
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
            halloween: "🎃 HALLOWEEN — Des lapins mystérieux rôdent dans les œufs !",
            noel: "🎄 NOËL — Les gardiens de l'hiver peuvent apparaître dans les œufs !",
            paques: "🐣 PÂQUES — La grande chasse aux lapins saisonniers est ouverte !",
        };
        const SEASON_ICONS = { halloween: "👻 🦇 🎃", noel: "❄️ 🎁 ✨", paques: "🌸 🥚 🐣" };

        let seasonalAudioContext = null;
        let lastSeasonSound = "";
        function playSeasonSound(eventName, force = false) {
            if (!eventName || (!force && lastSeasonSound === eventName)) return;
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtx) return;
                seasonalAudioContext = seasonalAudioContext || new AudioCtx();
                if (seasonalAudioContext.state === "suspended") seasonalAudioContext.resume();
                const ctx = seasonalAudioContext;
                const now = ctx.currentTime + 0.03;
                const melodies = {
                    halloween: [
                        [196, 0],
                        [165, 0.16],
                        [131, 0.34],
                        [98, 0.56],
                    ],
                    noel: [
                        [523, 0],
                        [659, 0.14],
                        [784, 0.28],
                        [1047, 0.48],
                    ],
                    paques: [
                        [523, 0],
                        [659, 0.12],
                        [587, 0.24],
                        [784, 0.4],
                    ],
                };
                (melodies[eventName] || melodies.paques).forEach(([freq, offset], i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = eventName === "halloween" ? "triangle" : "sine";
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(0.0001, now + offset);
                    gain.gain.exponentialRampToValueAtTime(
                        i === 0 ? 0.09 : 0.065,
                        now + offset + 0.025,
                    );
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.2);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + offset);
                    osc.stop(now + offset + 0.22);
                });
                lastSeasonSound = eventName;
            } catch (e) {
                /* Le jeu reste jouable même si l'audio est indisponible. */
            }
        }

        function updateSeasonalDecor() {
            const active = currentActiveEvents();
            ["halloween", "noel", "paques"].forEach((e) =>
                body.classList.toggle("season-" + e, active.includes(e)),
            );
            const banner = document.getElementById("eventBanner");
            if (!banner) return;
            if (active.length === 0) {
                banner.style.display = "none";
                banner.innerHTML = "";
                lastSeasonSound = "";
                return;
            }
            banner.innerHTML = active
                .map(
                    (e) => `
            <div class="event-banner-line event-${e}">
                <span class="event-banner-icons" aria-hidden="true">${SEASON_ICONS[e]}</span>
                <strong>${SEASON_BANNER_TEXT[e]}</strong>
                <button type="button" class="event-sound-btn" data-event-sound="${e}" aria-label="Jouer le son de ${EVENT_LABELS[e] || e}" title="Jouer le son">🔊</button>
            </div>`,
                )
                .join("");
            banner.style.display = "flex";
            banner.querySelectorAll("[data-event-sound]").forEach((btn) => {
                btn.addEventListener("click", () => playSeasonSound(btn.dataset.eventSound, true));
            });
        }
        updateSeasonalDecor();
        setInterval(updateSeasonalDecor, 5 * 60 * 1000);

        // Les navigateurs interdisent l'audio automatique avant une interaction.
        // Au premier clic/touche du joueur, on joue le jingle de l'événement actif une fois.
        function unlockSeasonAudio() {
            const active = currentActiveEvents();
            if (active.length) playSeasonSound(active[0]);
            updateAmbience();
            window.removeEventListener("pointerdown", unlockSeasonAudio);
            window.removeEventListener("keydown", unlockSeasonAudio);
        }
        window.addEventListener("pointerdown", unlockSeasonAudio, { once: true });
        window.addEventListener("keydown", unlockSeasonAudio, { once: true });

        // Fonds : événement en priorité, sinon nuit de 20 h à 7 h (heure locale).
        const BACKGROUND_FILES = {default:'salon.png',cuisine:'cuisine.png',chambre:'chambre.png',sdb:'salle_de_bain.png',jardin:'jardin.png',combat:'combat.png'};
        // Chemins exacts des fonds fournis (majuscules et suffixes inclus).
        const BACKGROUND_EVENT_FILES = {
            halloween: {default:'Halloween/Salon_halloween.png', cuisine:'Halloween/Cuisine_halloween.png', chambre:'Halloween/Chambre_halloween.png', sdb:'Halloween/salle_de_bain_halloween.png', jardin:'Halloween/Jardin_halloween.png', combat:'Halloween/Combat_halloween.png'},
            noel: {default:'Noel/Salon_noel.png', cuisine:'Noel/Cuisine_noel.png', chambre:'Noel/Chambre_noel.png', sdb:'Noel/salle_de_bain_noel.png', jardin:'Noel/Jardin_noel.png', combat:'Noel/Combat_noel.png'},
            paques: {default:'Paques/Salon_paques.png', cuisine:'Paques/Cuisine_paques.png', chambre:'Paques/Chambre_paques.png', sdb:'Paques/salle_de_bain_paques.png', jardin:'Paques/Jardin_paques.png', combat:'Paques/Conbat_paques.png'}
        };
        const BACKGROUND_EVENT_ALIASES = {halloween:['haloween'],noel:['noël'],paques:['pâques','pacques']};
        const BACKGROUND_EXTENSIONS = ['png','webp','jpg','jpeg'];
        function eventBackgroundFolders(event) {
            const original = String(event).trim();
            const normal = original.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9_-]+/g, '_');
            if (!normal) return [];
            return [...new Set([original, normal, normal.charAt(0).toUpperCase() + normal.slice(1), ...(BACKGROUND_EVENT_ALIASES[normal] || [])])].map(encodeURIComponent);
        }
        function calendarSeason(date = new Date()) {
            const month = date.getMonth();
            return month >= 2 && month <= 4 ? 'printemps' : month >= 5 && month <= 7 ? 'ete' : month >= 8 && month <= 10 ? 'automne' : 'hiver';
        }
        function backgroundCandidates(zone, events, hour, season = calendarSeason()) {
            const file = BACKGROUND_FILES[zone] || BACKGROUND_FILES.default;
            const root = './assets/img/fond/';
            const orderedEvents = [...new Set([...['halloween','noel','paques'].filter(key => events.includes(key)), ...events])];
            const time = adminTesting && adminTime !== 'auto' ? adminTime : (hour >= 20 || hour < 7) ? 'nuit' : 'jour';
            const chosenSeason = adminTesting && adminSeason !== 'auto' ? adminSeason : season;
            const paths = [];
            const room = file.replace(/\.png$/, '');
            for (const event of orderedEvents) {
                const key = String(event).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                const known = BACKGROUND_EVENT_FILES[key];
                if (known) paths.push(root + (known[zone] || known.default));
                // Compatibilité avec les autres dossiers d'événements.
                for (const folder of eventBackgroundFolders(event)) {
                    for (const name of [room, room + '_' + key, room.charAt(0).toUpperCase() + room.slice(1) + '_' + key]) {
                        for (const extension of BACKGROUND_EXTENSIONS) paths.push(root + folder + '/' + name + '.' + extension);
                    }
                }
            }
            paths.push(root + 'Saison/' + time + '/' + file.replace('.png', '_' + chosenSeason + '.png'));
            paths.push(root + 'saison/' + time + '/' + file.replace('.png', '_' + chosenSeason + '.png'));
            // Le ZIP contient déjà fond/ : accepte aussi une extraction dans fond/.
            paths.push(root + 'fond/saison/' + time + '/' + file.replace('.png', '_' + chosenSeason + '.png'));
            paths.push(root + file);
            return paths;
        }
        function backgroundPath(zone, events, hour, season) { return backgroundCandidates(zone, events, hour, season)[0]; }
        const backgroundAvailability = new Map();
        const backgroundFailures = new Map();
        let requestedBackground = '';
        function updateSceneBackground(force = false) {
            const zone = body.classList.contains('battle-scene') ? 'combat' : Object.keys(BACKGROUND_FILES).find(key => body.classList.contains(key)) || 'default';
            const date = new Date();
            const paths = backgroundCandidates(zone, currentActiveEvents(date), date.getHours(), calendarSeason(date));
            const request = paths.join('|');
            if (force !== true && request === requestedBackground) return;
            requestedBackground = request;
            const apply = path => { if (requestedBackground === request) body.style.setProperty('background-image', `url("${path}")`, 'important'); };
            function tryPath(index) {
                const path = paths[index];
                if (!path || requestedBackground !== request) return;
                if (backgroundAvailability.get(path) === true) { apply(path); return; }
                if (backgroundAvailability.get(path) === false && Date.now() - backgroundFailures.get(path) < 60000) { tryPath(index + 1); return; }
                const img = new Image();
                img.onload = () => { backgroundAvailability.set(path, true); apply(path); };
                img.onerror = () => { backgroundAvailability.set(path, false); backgroundFailures.set(path, Date.now()); tryPath(index + 1); };
                img.src = path;
            }
            tryPath(0);
        }
        new MutationObserver(updateSceneBackground).observe(body, {attributes:true,attributeFilter:['class']});
        setInterval(() => { updateSceneBackground(true); updateAmbience(); }, 60 * 1000);
        window.addEventListener('focus', () => { updateSceneBackground(true); updateAmbience(); });
        updateSceneBackground();

        // ============================================================
        // RAPPEL DE RETOUR
        // ============================================================
        function checkComeback() {
            const last = parseInt(localStorage.getItem("lapinous_last_visit") || "0", 10);
            const now = Date.now();
            if (last && now - last > 6 * 60 * 60 * 1000) {
                setTimeout(
                    () =>
                        showToast(
                            `Ça faisait longtemps ! ${currentRabbitName() || "Ton lapin"} est content de te revoir 💛`,
                            "success",
                        ),
                    800,
                );
            }
            localStorage.setItem("lapinous_last_visit", String(now));
        }

        // Outils de test accessibles après saisie du code du Dashboard.
        const isLocalAdmin = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(window.location.hostname.toLowerCase());
        if (isLocalAdmin) {
        let adminBackup = null;
        const adminButton = document.createElement("button");
        adminButton.className = "admin-test-toggle";
        adminButton.textContent = "🛠 Admin";
        document.body.appendChild(adminButton);
        adminButton.onclick = async () => {
            if (!isLocalAdmin) return;
            if (!adminTesting) {
                if (typeof requestDashboardAccess !== "function" || !(await requestDashboardAccess())) return;
                adminBackup = serializeGame();
                adminTesting = true;
            }
            const existing = document.getElementById("adminTestPanel");
            if (existing) { existing.remove(); return; }
            const panel = document.createElement("div");
            panel.id = "adminTestPanel";
            panel.innerHTML = `<strong>🛠 Tests du jeu</strong><button data-test="money">+100 000 🥕</button><button data-test="eggs">+100 œufs</button><button data-test="care">Besoins à 100 %</button><button data-test="collection">Tous les lapins</button><button data-test="level1">Lapin actif : +1 niveau</button><button data-test="level10">Lapin actif : +10 niveaux</button><button data-test="skills">+30 fragments par lapin</button><label>Événement <select id="adminEventSelect"><option value="auto">Calendrier normal</option><option value="none">Aucun</option><option value="halloween">Halloween</option><option value="noel">Noël</option><option value="paques">Pâques</option><option value="all">Tous</option></select></label><label>Saison <select id="adminSeasonSelect"><option value="auto">Saison actuelle</option><option value="printemps">Printemps</option><option value="ete">Été</option><option value="automne">Automne</option><option value="hiver">Hiver</option></select></label><label>Lumière <select id="adminTimeSelect"><option value="auto">Heure actuelle</option><option value="jour">Jour</option><option value="nuit">Nuit</option></select></label><small>Les événements ont priorité sur les saisons.</small><button data-test="restore">Restaurer la partie avant les tests</button><button data-test="close">Fermer</button>`;
            document.body.appendChild(panel);
            panel.querySelector('#adminEventSelect').value = adminEvent;
            panel.querySelector('#adminSeasonSelect').value = adminSeason;
            panel.querySelector('#adminTimeSelect').value = adminTime;
            panel.querySelector('#adminEventSelect').onchange = e => { adminEvent = e.target.value; updateSeasonalDecor(); updateSceneBackground(); updateAmbience(); if (!body.classList.contains("battle-scene")) refreshCurrentZone(); };
            panel.querySelector('#adminSeasonSelect').onchange = e => { adminSeason = e.target.value; updateSceneBackground(); };
            panel.querySelector('#adminTimeSelect').onchange = e => { adminTime = e.target.value; updateSceneBackground(); };
            panel.onclick = e => {
                const action = e.target.dataset.test;
                if (!action || !adminTesting) return;
                if (action === "close") { panel.remove(); return; }
                if (action === "restore") {
                    adminTesting = false; adminEvent = "auto"; adminSeason = "auto"; adminTime = "auto";
                    if (adminBackup) applyLoadedGame(JSON.parse(adminBackup));
                    autoSave(); updateSeasonalDecor(); updateSceneBackground(); updateAmbience(); refreshCurrentZone(); panel.remove(); return;
                }
                if (action === "money") game.carrots += 100000;
                if (action === "eggs") game.eggs += 100;
                if (action === "level1" || action === "level10") {
                    const pr = progress();
                    const increase = Math.min(action === "level10" ? 10 : 1, 100 - pr.currentLevel);
                    if (increase <= 0) {
                        showToast("Ce lapin est déjà au niveau 100.", "warn");
                        return;
                    }
                    // Conserve l'avancement dans le niveau et applique les récompenses habituelles.
                    const gained = increase * 25;
                    pr.friendshipTotal += gained;
                    pr.friendship = Math.min(100, pr.friendship + gained);
                    checkLevelUp();
                }
                if (action === "collection") {
                    game.ownedSpecies = Object.keys(getSpecies());
                    game.ownedSpecies.forEach(key => progressForSpecies(key));
                }
                if (action === "care") (game.ownedSpecies || [game.species]).forEach(key => {
                    const pr = progressForSpecies(key); pr.food = pr.energy = pr.cleanliness = 100;
                });
                if (action === "skills") (game.ownedSpecies || [game.species]).forEach(key => {
                    const pr = ensureTechniqueProgress(key); pr.attackFragments += 30;
                });
                autoSave(); updateStatusBars(); refreshCurrentZone();
            };
        };
        }
        // Ajuste le combat à l'espace disponible sans débordement de page.
        function fitBattleStage() {
            const stage = gameArea.querySelector(".fight-stage");
            if (!stage || !body.classList.contains("battle-scene")) return;
            stage.style.transform = "none";
            if (stage.classList.contains("fight-preparation")) return;
            const css = getComputedStyle(gameArea);
            const available = gameArea.clientHeight - parseFloat(css.paddingTop) - parseFloat(css.paddingBottom);
            const scale = Math.min(1, Math.max(1, available) / stage.scrollHeight);
            stage.style.transformOrigin = "top center";
            stage.style.transform = `scale(${scale})`;
        }
        new MutationObserver(() => requestAnimationFrame(() => { fitBattleStage(); fitSalonFriends(); })).observe(gameArea, { childList: true, subtree: true });
        window.addEventListener("resize", () => { fitBattleStage(); fitSalonFriends(); });
        gameArea.addEventListener("load", () => { fitBattleStage(); fitSalonFriends(); }, true);
        new ResizeObserver(fitSalonFriends).observe(gameArea);

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
        ensureNewSystems();
        renderAudioButton();
        document.addEventListener("click", () => { buttonPlayedSfx = false; }, { capture: true });
        document.addEventListener("click", (e) => {
            const btn = e.target.closest("button");
            if (!btn || btn.disabled || btn.id === "lapinousAudioBtn") return;
            const handler = btn.getAttribute('onclick') || '';
            const hasOwnSound = /feedRabbit|putRabbitToSleep|cleanRabbit|buyEgg|openEgg|openTenEggs|tacticalAction|startTacticalFight|fightBoss/.test(handler) || btn.matches('[data-event-sound], .egg-shell');
            if (!buttonPlayedSfx && !hasOwnSound) playSfx("click");
        }, { passive: true });
        document.addEventListener("pointerdown", () => updateAmbience(), { once: true });

    });
});
