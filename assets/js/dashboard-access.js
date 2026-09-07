// =====================================================================
// ACCÈS AU DASHBOARD — même logique que sur le portfolio
// =====================================================================
// Le code n'est jamais stocké en clair : seul son hash SHA-256 l'est.
// Le Dashboard vit dans la même page (une modale), donc ici on ne redirige
// pas vers une autre URL : on bloque simplement l'ouverture de la modale
// tant que le bon code n'a pas été saisi pour cette session d'onglet.

const DASHBOARD_CODE_HASH_KEY = "lapinous_dashboard_code_hash";
const DASHBOARD_SESSION_KEY = "lapinous_dashboard_authorized";
const DASHBOARD_ATTEMPTS_KEY = "lapinous_dashboard_attempts";
const DASHBOARD_MAX_ATTEMPTS = 5;
const DASHBOARD_DEFAULT_CODE = "2653";

async function hashDashboardCode(value) {
    const encodedValue = new TextEncoder().encode(value);
    const hashBuffer = await crypto.subtle.digest("SHA-256", encodedValue);
    return Array.from(new Uint8Array(hashBuffer))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
}

// Au tout premier lancement, initialise le hash sur le code par défaut "2653".
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
        window.alert("Trop de tentatives. Recharge la page pour réessayer.");
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

// À appeler avant d'ouvrir la modale du Dashboard.
async function ensureDashboardUnlocked() {
    const authorized = sessionStorage.getItem(DASHBOARD_SESSION_KEY) === "yes";
    if (authorized) return true;
    return await requestDashboardAccess();
}

// Change le code (depuis l'intérieur du Dashboard, une fois déverrouillé).
async function changeDashboardCode(newCode) {
    const hash = await hashDashboardCode(newCode.trim());
    localStorage.setItem(DASHBOARD_CODE_HASH_KEY, hash);
}

// Le verrou se referme quand on quitte la page (comme sur le portfolio) :
// à la prochaine visite, le code sera redemandé.
window.addEventListener("pagehide", () => {
    sessionStorage.removeItem(DASHBOARD_SESSION_KEY);
});

window.LapinousDashboardAccess = { ensureDashboardUnlocked, changeDashboardCode };
