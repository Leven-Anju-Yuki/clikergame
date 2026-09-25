// Catalogue des puzzles, séparé du code pour pouvoir ajouter facilement des images
// et les relier à autant de lapins que nécessaire par leur identifiant de lapinous-content.json.
let JSON_PUZZLES = [];
let JSON_PUZZLE_LEVELS = [];
const CUSTOM_PUZZLES_KEY = "lapinous_custom_puzzles";
const CUSTOM_PUZZLE_LEVELS_KEY = "lapinous_custom_puzzle_levels";

function loadCustomPuzzles() {
    try { return JSON.parse(localStorage.getItem(CUSTOM_PUZZLES_KEY) || "null"); } catch (e) { return null; }
}
function loadCustomPuzzleLevels() {
    try { return JSON.parse(localStorage.getItem(CUSTOM_PUZZLE_LEVELS_KEY) || "null"); } catch (e) { return null; }
}
function saveCustomPuzzles(puzzles) { localStorage.setItem(CUSTOM_PUZZLES_KEY, JSON.stringify(puzzles || [])); }
function saveCustomPuzzleLevels(levels) { localStorage.setItem(CUSTOM_PUZZLE_LEVELS_KEY, JSON.stringify(levels || [])); }
function clearCustomPuzzles() {
    localStorage.removeItem(CUSTOM_PUZZLES_KEY);
    localStorage.removeItem(CUSTOM_PUZZLE_LEVELS_KEY);
}

window.LapinousPuzzlesReady = fetch("./lapinous-puzzles.json", { cache: "no-store" })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
        if (!data) return;
        JSON_PUZZLES = Array.isArray(data.puzzles) ? data.puzzles : [];
        JSON_PUZZLE_LEVELS = Array.isArray(data.levels) ? data.levels : [];
    })
    .catch(() => {
        JSON_PUZZLES = [];
        JSON_PUZZLE_LEVELS = [];
    });

window.getPuzzleCatalog = () => loadCustomPuzzles() || JSON_PUZZLES;
window.getPuzzleLevels = () => loadCustomPuzzleLevels() || JSON_PUZZLE_LEVELS;
window.saveCustomPuzzles = saveCustomPuzzles;
window.saveCustomPuzzleLevels = saveCustomPuzzleLevels;
window.clearCustomPuzzles = clearCustomPuzzles;
