// =====================================================================
// DONNÉES PARTAGÉES — mécanique de chargement uniquement.
// Tout le contenu (les 16 lapins, les 11 boss, les taux d'œufs) vit
// maintenant dans lapinous-content.json à la racine du projet.
// Ce fichier ne fait plus que : charger ce JSON, gérer les surcharges
// locales du Dashboard (localStorage), et exposer getSpecies()/getBosses().
// =====================================================================

// Azazel reste ici (pas dans le JSON) : c'est le seul dont la logique
// (nom secret "azazel", aucun malus) est directement liée au code du jeu,
// pas au contenu éditable. Tout le reste vient de lapinous-content.json.
const BASE_SPECIES = {
    az: {
        name: "Azazel", nickname: "le Premier Lapin", rarity: "divin",
        personality: "Calme, sage, intemporel et bienveillant.",
        story: "Bien avant la naissance des royaumes, avant les gardiens et avant les légendes, Azazel parcourait déjà les plaines du monde. On raconte qu'il fut le premier lapin à fouler cette terre et que toutes les lignées actuelles descendent de lui. Ni roi, ni gardien, ni dieu au sens traditionnel, Azazel représente l'origine même de la vie et de l'équilibre. Les plus anciens mythes racontent que lorsqu'il ferme les yeux, le monde rêve, et lorsqu'il les ouvre, une nouvelle ère commence.",
        accessory: "Halo des Origines.",
        likes: ["L'équilibre", "Le silence", "La nature", "Toutes les créatures"],
        dislikes: ["Le chaos", "La corruption", "La destruction inutile"],
        quote: "Avant toutes les légendes, il y avait simplement la vie.",
        power: "Souffle Originel : restaure entièrement les alliés et purifie tous les effets négatifs.",
        faceImg: "./assets/img/species/azazel_face.png",
        coteImg: "./assets/img/species/azazel_cote.png",
        friends: [], rivals: [], hidden: true, noMalus: true,
    },
};

// Pas de boss codé en dur : tous viennent de lapinous-content.json.
const BASE_BOSSES = {};

const RARITY_META = {
    commun: { label: "Commun", color: "#b8bcc4" },
    rare: { label: "Rare", color: "#6ebf77" },
    epique: { label: "Épique", color: "#5b8fd6" },
    legendaire: { label: "Légendaire", color: "#a35bd6" },
    mythique: { label: "Mythique", color: "#f5c34d" },
    divin: { label: "Divin", color: "#d64545" },
    secret: { label: "??? Secret", color: "#2b2b2b" },
};

const RELATIONS_TEXT = [
    "Azur et Bambou sont meilleurs amis.",
    "Caramel suit souvent Flamme dans ses aventures.",
    "Mocha aide Koda à préparer ses missions.",
    "Nova apparaît parfois pour guider le groupe.",
    "Koda protège naturellement les lapins les plus faibles.",
    "Flamme essaie constamment de découvrir le secret de Nova.",
];

// ---- Stockage des surcharges locales (modifications en cours dans le Dashboard,
// avant export vers lapinous-content.json) ----
const CUSTOM_SPECIES_KEY = "lapinous_custom_species";
const CUSTOM_BOSSES_KEY = "lapinous_custom_bosses";
const EGG_RATES_KEY = "lapinous_egg_rates";

function loadCustomSpecies() {
    try { return JSON.parse(localStorage.getItem(CUSTOM_SPECIES_KEY) || "{}"); } catch (e) { return {}; }
}
function loadCustomBosses() {
    try { return JSON.parse(localStorage.getItem(CUSTOM_BOSSES_KEY) || "{}"); } catch (e) { return {}; }
}
function loadEggRates() {
    try {
        const stored = JSON.parse(localStorage.getItem(EGG_RATES_KEY));
        if (stored) return stored;
    } catch (e) {}
    return JSON_EGG_RATES || { commun: 70, rare: 22, epique: 6, legendaire: 2 };
}
function saveEggRates(rates) { localStorage.setItem(EGG_RATES_KEY, JSON.stringify(rates)); }

// ---- Durée des événements (jours avant/après la date d'ancrage), réglable
// depuis le Dashboard. Partagé avec script.js pour le calcul de disponibilité.
const EVENT_WINDOWS_KEY = "lapinous_event_windows";
const DEFAULT_EVENT_WINDOWS = { halloween: 10, noel: 12, paques: 10 };
function loadEventWindows() {
    try {
        const stored = JSON.parse(localStorage.getItem(EVENT_WINDOWS_KEY));
        if (stored) return { ...DEFAULT_EVENT_WINDOWS, ...stored };
    } catch (e) {}
    return { ...DEFAULT_EVENT_WINDOWS, ...(JSON_EVENT_WINDOWS || {}) };
}
function saveEventWindows(windows) { localStorage.setItem(EVENT_WINDOWS_KEY, JSON.stringify(windows)); }

// Ordre de priorité (du moins prioritaire au plus prioritaire) :
//   1. BASE_SPECIES / BASE_BOSSES ci-dessus (juste Azazel, jamais perdu)
//   2. lapinous-content.json à la racine (LE contenu du jeu, partagé)
//   3. localStorage (modifications en cours dans le Dashboard, pas encore exportées)
function getSpecies() { return { ...BASE_SPECIES, ...JSON_SPECIES, ...loadCustomSpecies() }; }
function getBosses() { return { ...BASE_BOSSES, ...JSON_BOSSES, ...loadCustomBosses() }; }

// ============================================================
// CHARGEMENT DE lapinous-content.json (déposé à la racine du projet)
// ============================================================
// ⚠️ fetch() ne fonctionne PAS si tu ouvres index.html directement en double-cliquant
// (protocole file://). Il faut un vrai serveur local (ex: `npx serve`,
// `python -m http.server`) ou être hébergé (GitHub Pages...). Sans ça, le fetch
// échoue silencieusement : le jeu continue avec juste Azazel + tes surcharges
// locales, sans planter — mais sans le contenu principal.
let JSON_SPECIES = {};
let JSON_BOSSES = {};
let JSON_EGG_RATES = null;
let JSON_EVENT_WINDOWS = null;

window.LapinousContentReady = fetch("./lapinous-content.json", { cache: "no-store" })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
        if (data) {
            JSON_SPECIES = data.species || {};
            JSON_BOSSES = data.bosses || {};
            JSON_EGG_RATES = data.eggRates || null;
            JSON_EVENT_WINDOWS = data.eventWindows || null;
        }
    })
    .catch(() => {
        // Pas de fichier, pas de serveur, ou erreur réseau : on continue normalement.
    });
