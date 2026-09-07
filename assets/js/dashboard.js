import { DEFAULT_SPECIES, DEFAULT_BOSSES } from './species-data.js';

document.addEventListener("DOMContentLoaded", () => {
    initRarityChart();
    renderRabbitsTable();
    renderBossesTable();
});

// 1. Graphique en Camembert : Répartition par Rareté
function initRarityChart() {
    const ctx = document.getElementById("chart-rarity")?.getContext("2d");
    if (!ctx) return;

    const rarityCounts = { commun: 0, rare: 0, epique: 0, legendaire: 0 };

    Object.values(DEFAULT_SPECIES).forEach(rabbit => {
        const rarity = rabbit.rarity?.toLowerCase() || "commun";
        if (rarityCounts[rarity] !== undefined) {
            rarityCounts[rarity]++;
        }
    });

    new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Commun", "Rare", "Épique", "Légendaire"],
            datasets: [{
                data: [
                    rarityCounts.commun,
                    rarityCounts.rare,
                    rarityCounts.epique,
                    rarityCounts.legendaire
                ],
                backgroundColor: ["#a0a0a0", "#3498db", "#9b59b6", "#f1c40f"]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "bottom" }
            }
        }
    });
}

// 2. Tableau des Lapins
function renderRabbitsTable() {
    const tbody = document.querySelector("#table-rabbits tbody");
    if (!tbody) return;

    const savedData = JSON.parse(localStorage.getItem("lapinous_game_data") || "{}");
    const customNames = savedData.customNames || {};

    tbody.innerHTML = Object.values(DEFAULT_SPECIES).map(rabbit => {
        const customName = customNames[rabbit.id] || "-";
        return `
            <tr>
                <td><strong>${rabbit.name}</strong></td>
                <td>${customName}</td>
                <td><span class="badge bg-secondary">${rabbit.rarity}</span></td>
                <td>${rabbit.personality}</td>
                <td>${savedData.unlockedSpecies?.includes(rabbit.id) ? "✅ Débloqué" : "🔒 Verrouillé"}</td>
            </tr>
        `;
    }).join("");
}

// 3. Tableau des Boss
function renderBossesTable() {
    const tbody = document.querySelector("#table-bosses tbody");
    if (!tbody) return;

    const savedData = JSON.parse(localStorage.getItem("lapinous_game_data") || "{}");
    const unlockedBosses = savedData.unlockedBosses || [];

    tbody.innerHTML = Object.values(DEFAULT_BOSSES).map(boss => {
        const isUnlocked = unlockedBosses.includes(boss.id);
        return `
            <tr>
                <td><strong>${boss.name}</strong></td>
                <td>${boss.title}</td>
                <td>${boss.hp} HP</td>
                <td>${isUnlocked ? "<span class='text-success'>⚔️ Découvert</span>" : "<span class='text-muted'>❓ Inconnu</span>"}</td>
                <td>${boss.description}</td>
            </tr>
        `;
    }).join("");
}