// =====================================================================
// DONNÉES DE BASE DES LAPINS ET BOSS
// =====================================================================

export const DEFAULT_EGG_RATES = {
    commun: 60,
    rare: 25,
    epique: 10,
    legendaire: 5
};

export const BASE_SPECIES = {
    azur: {
        id: "azur",
        name: "Azur",
        nickname: "le Lapin Neige",
        rarity: "commun",
        personality: "Calme, bienveillant et protecteur.",
        story: "Azur vit sur les sommets enneigés du Royaume Polaire.",
        accessory: "Écharpe bleue",
        likes: ["Flocons", "Carottes glacées"],
        dislikes: ["Chaleur excessive"],
        quote: "Le froid ne m'atteint jamais !",
        power: "Bouclier de Givre",
        imageFace: "./assets/img/az/az_assis_de_face.png",
        imageCote: "./assets/img/az/az_assis_3-4.png"
    },
    flamme: {
        id: "flamme",
        name: "Flamme",
        nickname: "le Lapin Feux",
        rarity: "rare",
        personality: "Énergique, impétueux et passionné.",
        story: "Flamme vient des zones volcaniques et adore braver les dangers.",
        accessory: "Bandana rouge",
        likes: ["Piments", "Soleil"],
        dislikes: ["EAU", "Bain"],
        quote: "Ça va chauffer !",
        power: "Boule de Feu",
        imageFace: "./assets/img/flamme/flamme_face.png",
        imageCote: "./assets/img/flamme/flamme_3-4.png"
    }
};

export const BASE_BOSSES = {
    tomarak: {
        id: "tomarak",
        name: "Tomarak",
        title: "Lord de la Peste Rouge",
        power: 12,
        hp: 1500,
        rarity: "legendaire",
        description: "Seigneur tomate mutant projetant du liquide toxique.",
        image: "./assets/img/boss/tomarak.png"
    },
    count_ailula: {
        id: "count_ailula",
        name: "Comte Ailula",
        title: "Le Seigneur Ail Immortel",
        power: 15,
        hp: 2200,
        rarity: "legendaire",
        description: "Aristocrate ail vêtu d'une cape pourpre et armé d'une canne-épée.",
        image: "./assets/img/boss/count_ailula.png"
    },
    marshal_epi_dor: {
        id: "marshal_epi_dor",
        name: "Maréchal Épi-d'Or",
        title: "L'Artilleur Doré",
        power: 18,
        hp: 2800,
        rarity: "epique",
        description: "Commandant maïs armé de revolvers et d'un fusil long.",
        image: "./assets/img/boss/marshal_epi_dor.png"
    },
    shogun_eggplant: {
        id: "shogun_eggplant",
        name: "Shogun Aubergine",
        title: "Le Samouraï Violet",
        power: 22,
        hp: 3500,
        rarity: "legendaire",
        description: "Guerrier légendaire maniant un katana ancestral géant.",
        image: "./assets/img/boss/shogun_eggplant.png"
    },
    lord_carotus: {
        id: "lord_carotus",
        name: "Lord Carotus",
        title: "Le Roi Légendaire",
        power: 30,
        hp: 5000,
        rarity: "legendaire",
        description: "Chef suprême de la Ligue des Légumes Libres.",
        image: "./assets/img/boss/lord_carotus.png"
    },
    grumpy_onion: {
        id: "grumpy_onion",
        name: "Grumpy Onion",
        title: "Ninja Assassin",
        power: 10,
        hp: 1200,
        rarity: "rare",
        description: "Assassin furtif entouré de shurikens d'oignon piqueurs.",
        image: "./assets/img/boss/grumpy_onion.png"
    },
    raging_cabbage: {
        id: "raging_cabbage",
        name: "Raging Cabbage",
        title: "Le Tank de la Ligue",
        power: 14,
        hp: 2000,
        rarity: "epique",
        description: "Berserker de chou résistant armé d'un bouclier solide.",
        image: "./assets/img/boss/raging_cabbage.png"
    },
    spicy_pepper: {
        id: "spicy_pepper",
        name: "Spicy Pepper",
        title: "Expert en Démolition",
        power: 11,
        hp: 1400,
        rarity: "rare",
        description: "Spécialiste de la pyrotechnie et des grenades pimentées.",
        image: "./assets/img/boss/spicy_pepper.png"
    },
    psycho_banana: {
        id: "psycho_banana",
        name: "Psycho Banana",
        title: "Berserker Instable",
        power: 16,
        hp: 2400,
        rarity: "epique",
        description: "Combattant au corps-à-corps maniaque et totalement imprévisible.",
        image: "./assets/img/boss/psycho_banana.png"
    },
    tribal_zucchini: {
        id: "tribal_zucchini",
        name: "Tribal Zucchini",
        title: "Chasseur & Traqueur",
        power: 9,
        hp: 1100,
        rarity: "commun",
        description: "Scout tribal maniant le tomahawk et la lance de bambou.",
        image: "./assets/img/boss/tribal_zucchini.png"
    }
};

/**
 * Retourne le nom affiché : le nom personnalisé si renseigné, sinon le nom de base par défaut.
 */
export function getDisplayName(entity, customNames = {}) {
    if (!entity) return "Inconnu";
    if (customNames[entity.id] && customNames[entity.id].trim() !== "") {
        return customNames[entity.id].trim();
    }
    return entity.name;
}