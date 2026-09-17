// =====================================================================
// ACCÈS AU DASHBOARD — même logique que sur le portfolio
// =====================================================================
// Le code n'est jamais stocké en clair : seul son hash SHA-256 l'est.
// dashboard.html est une page à part entière, protégée dès son chargement :
// si le bon code n'est pas saisi, on redirige vers index.html.

const DASHBOARD_CODE_HASH_KEY = "lapinous_dashboard_code_hash";
const DASHBOARD_SESSION_KEY = "lapinous_dashboard_authorized";
const DASHBOARD_ATTEMPTS_KEY = "lapinous_dashboard_attempts";
const DASHBOARD_MAX_ATTEMPTS = 5;
const DASHBOARD_DEFAULT_CODE = "0000";
let dashboardCheckRunning = false;

async function hashDashboardCode(value) {
    const encodedValue = new TextEncoder().encode(value);
    const hashBuffer = await crypto.subtle.digest("SHA-256", encodedValue);
    return Array.from(new Uint8Array(hashBuffer))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
}

// Au tout premier lancement, initialise le hash sur le code par défaut "0000".
async function getStoredDashboardHash() {
    let hash = localStorage.getItem(DASHBOARD_CODE_HASH_KEY);
    if (!hash) {
        hash = await hashDashboardCode(DASHBOARD_DEFAULT_CODE);
        localStorage.setItem(DASHBOARD_CODE_HASH_KEY, hash);
    }
    return hash;
}

// Affiche la demande de code et bloque après cinq erreurs dans le même onglet.
async function requestDashboardAccess() {
    const attempts = Number(sessionStorage.getItem(DASHBOARD_ATTEMPTS_KEY) || "0");
    if (attempts >= DASHBOARD_MAX_ATTEMPTS) {
        window.alert("Trop de tentatives. Ferme cet onglet avant de réessayer.");
        return false;
    }

    const code = window.prompt("Code du Dashboard :");
    if (code === null) return false;

    const storedHash = await getStoredDashboardHash();
    if ((await hashDashboardCode(code.trim())) === storedHash) {
        sessionStorage.setItem(DASHBOARD_SESSION_KEY, "yes");
        sessionStorage.removeItem(DASHBOARD_ATTEMPTS_KEY);
        return true;
    }

    sessionStorage.setItem(DASHBOARD_ATTEMPTS_KEY, String(attempts + 1));
    window.alert("Code incorrect.");
    return false;
}

// Vérifie l'accès dès le chargement de dashboard.html, pas seulement via un bouton.
async function protectDashboardPage(forcePassword = false) {
    if (document.body?.dataset.protectedDashboard !== "true" || dashboardCheckRunning) return;
    dashboardCheckRunning = true;

    try {
        if (forcePassword) sessionStorage.removeItem(DASHBOARD_SESSION_KEY);
        const authorized = sessionStorage.getItem(DASHBOARD_SESSION_KEY) === "yes";
        if (!authorized && !(await requestDashboardAccess())) {
            window.location.replace("./index.html");
            return;
        }
        document.body.classList.remove("dashboard-auth-pending");
    } finally {
        dashboardCheckRunning = false;
    }
}

// Quand on quitte le dashboard, l'autorisation est retirée : la flèche
// « page précédente » redemandera bien le code.
window.addEventListener("pagehide", () => {
    if (document.body?.dataset.protectedDashboard === "true") {
        sessionStorage.removeItem(DASHBOARD_SESSION_KEY);
    }
});

// Le navigateur peut restaurer une ancienne page depuis son cache avec la flèche retour :
// pageshow relance la protection dans ce cas précis.
window.addEventListener("pageshow", (event) => {
    if (document.body?.dataset.protectedDashboard !== "true") return;
    const navigation = performance.getEntriesByType("navigation")[0];
    const cameFromHistory = event.persisted || navigation?.type === "back_forward";
    protectDashboardPage(cameFromHistory);
});

document.addEventListener("DOMContentLoaded", () => protectDashboardPage(false));

// Changer le code (appelé depuis la section "Sécurité" du Dashboard, une fois déverrouillé).
async function changeDashboardCode(newCode) {
    const hash = await hashDashboardCode(newCode.trim());
    localStorage.setItem(DASHBOARD_CODE_HASH_KEY, hash);
}
window.LapinousDashboardAccess = { changeDashboardCode };
