document.addEventListener("DOMContentLoaded", () => {
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

    // ============================================================
    // ESPÈCES DE LAPINS (données de base + contenu ajouté via le dashboard)
    // ============================================================
    const BASE_SPECIES = {
        azur: {
            name: "Azur",
            nickname: "le Lapin Neige",
            rarity: "commun",
            personality: "Calme, bienveillant et protecteur.",
            story: "Azur vit sur les sommets enneigés du Royaume Polaire. Il aide les animaux perdus à retrouver leur chemin pendant les tempêtes.",
            accessory: "Écharpe de givre enchantée.",
            likes: ["Les flocons de neige", "Les nuits étoilées", "Le chocolat chaud"],
            dislikes: ["La chaleur", "Le bruit"],
            quote: "Même la plus grande tempête finit par s'apaiser.",
            power: "Aura glaciale : diminue légèrement la vitesse des ennemis.",
            faceImg: "./assets/img/species/blanc_face.png",
            coteImg: "./assets/img/species/blanc_cote.png",
            friends: ["bambou"],
            rivals: [],
        },
        caramel: {
            name: "Caramel",
            nickname: "le Lapin Gourmand",
            rarity: "commun",
            personality: "Jovial, gourmand et optimiste.",
            story: "Caramel connaît tous les champs de carottes du royaume. On raconte qu'il peut sentir une carotte fraîche à plusieurs kilomètres.",
            accessory: "Sacoche à friandises.",
            likes: ["Les carottes", "Les gâteaux", "Les pique-niques"],
            dislikes: ["Être à jeun", "Les légumes amers"],
            quote: "On réfléchit toujours mieux après une bonne collation !",
            power: "Cherche-Trésor : augmente les récompenses obtenues.",
            faceImg: "./assets/img/species/caramel_face.png",
            coteImg: "./assets/img/species/caramel_cote.png",
            friends: [],
            rivals: [],
            follows: ["flamme"],
        },
        mocha: {
            name: "Mocha",
            nickname: "le Lapin Chocolat",
            rarity: "commun",
            personality: "Élégant, fiable et discipliné.",
            story: "Mocha est l'horloger officiel du royaume. Personne n'est aussi ponctuel que lui.",
            accessory: "Montre à gousset dorée.",
            likes: ["Les mécanismes", "L'ordre", "Les collections"],
            dislikes: ["Les retards", "Le désordre"],
            quote: "Chaque seconde a son importance.",
            power: "Précision parfaite : réduit les temps de recharge.",
            faceImg: "./assets/img/species/chocolat_face.png",
            coteImg: "./assets/img/species/chocolat_cote.png",
            friends: [],
            rivals: [],
            helps: ["koda"],
        },
        bambou: {
            name: "Bambou",
            nickname: "le Lapin Panda",
            rarity: "rare",
            personality: "Sage, patient et méditatif.",
            story: "Bambou habite les Jardins Silencieux où il passe son temps à méditer sous les arbres géants.",
            accessory: "Collier de bambou sacré.",
            likes: ["La méditation", "Le calme", "Les forêts"],
            dislikes: ["Les disputes", "L'agitation"],
            quote: "La force vient souvent du silence.",
            power: "Temps suspendu : ralentit brièvement les ennemis.",
            faceImg: "./assets/img/species/panda_face.png",
            coteImg: "./assets/img/species/panda_cote.png",
            friends: ["azur"],
            rivals: [],
        },
        flamme: {
            name: "Flamme",
            nickname: "le Lapin Renard",
            rarity: "rare",
            personality: "Malin, curieux et aventurier.",
            story: "Flamme explore les ruines anciennes à la recherche de passages secrets et d'artefacts oubliés.",
            accessory: "Foulard des explorateurs.",
            likes: ["Les cartes au trésor", "L'aventure", "Les énigmes"],
            dislikes: ["L'ennui", "Les règles inutiles"],
            quote: "Chaque mur cache peut-être une porte.",
            power: "Vision secrète : révèle les coffres cachés.",
            faceImg: "./assets/img/species/renard_face.png",
            coteImg: "./assets/img/species/renard_cote.png",
            friends: [],
            rivals: [],
            curiousAbout: ["nova"],
        },
        koda: {
            name: "Koda",
            nickname: "le Lapin Tigre",
            rarity: "epique",
            personality: "Courageux, loyal et protecteur.",
            story: "Ancien gardien des plaines dorées, Koda défend ses amis contre tous les dangers.",
            accessory: "Bandeau du guerrier ancien.",
            likes: ["Les entraînements", "Le travail d'équipe", "Les défis"],
            dislikes: ["L'injustice", "La lâcheté"],
            quote: "Un vrai héros protège les siens.",
            power: "Cri du gardien : augmente les dégâts de l'équipe.",
            faceImg: "./assets/img/species/tigre_face.png",
            coteImg: "./assets/img/species/tigre_cote.png",
            friends: [],
            rivals: [],
            protects: "les plus faibles",
        },
        nova: {
            name: "Nova",
            nickname: "le Lapin Galaxie",
            rarity: "legendaire",
            personality: "Mystérieux, intelligent et rêveur.",
            story: "Nova viendrait d'une constellation lointaine. Il semble connaître l'avenir à travers les étoiles.",
            accessory: "Cape cosmique constellée.",
            likes: ["Observer les étoiles", "Les légendes", "Les mystères"],
            dislikes: ["L'ignorance", "Les mensonges"],
            quote: "Les étoiles racontent des histoires que peu savent entendre.",
            power: "Pluie d'étoiles : invoque des météores magiques.",
            faceImg: "./assets/img/species/etoile_face.png",
            coteImg: "./assets/img/species/etoile_cote.png",
            friends: [],
            rivals: [],
            guides: true,
        },

        // ---- 8 emplacements vides, prêts à être complétés depuis le Dashboard ⚙️ ----
        // Pour remplir un lapin : Dashboard → "Ajouter un lapin" → identifiant EXACTEMENT
        // "lapin_09", "lapin_10", etc. (comme ci-dessous) → ça remplace ce placeholder.
        // Tu peux aussi juste remplacer les fichiers assets/img/species/lapinNN_face.png
        // et lapinNN_cote.png par tes vraies photos (mêmes noms), sans passer par le Dashboard.
        sakura: {
            name: "Sakura",
            nickname: "la Gardienne des Cerisiers",
            rarity: "rare",
            personality: "Douce, créative et bienveillante.",
            story: "Sakura protège les Bosquets Fleuris, où les pétales magiques tombent toute l'année. Les habitants disent que les fleurs s'ouvrent sur son passage.",
            accessory: "Couronne de fleurs éternelles.",
            likes: ["Les fleurs de cerisier", "Dessiner", "Le printemps"],
            dislikes: ["Les tempêtes", "Voir les plantes souffrir"],
            quote: "Même la plus petite fleur peut embellir le monde.",
            power: "Pétales Curatifs : soigne progressivement les alliés.",
            faceImg: "./assets/img/species/fleur_face.png",
            coteImg: "./assets/img/species/fleur_cote.png",
            friends: [],
            rivals: [],
        },
        spark: {
            name: "Spark",
            nickname: "le Génie de l'Éclair",
            rarity: "rare",
            personality: "Énergique, curieux et inventeur.",
            story: "Spark passe ses journées à construire des gadgets étranges qui fonctionnent une fois sur deux... mais quand ils marchent, ils sont incroyables.",
            accessory: "Lunettes électromécaniques.",
            likes: ["Les inventions", "Les courses", "Les orages"],
            dislikes: ["Attendre", "Les pannes"],
            quote: "Si ça explose, c'est que j'étais proche de réussir !",
            power: "Turbo Éclair : augmente temporairement sa vitesse.",
            faceImg: "./assets/img/species/eclair_face.png",
            coteImg: "./assets/img/species/eclair_cote.png",
            friends: [],
            rivals: [],
        },
        myco: {
            name: "Myco",
            nickname: "le Sage des Bois",
            rarity: "commun",
            personality: "Discret, observateur et patient.",
            story: "Myco connaît tous les sentiers cachés de la forêt. Il peut passer des heures à écouter la nature sans dire un mot.",
            accessory: "Chapeau champignon ancien.",
            likes: ["Les forêts", "Les histoires", "Les animaux sauvages"],
            dislikes: ["Le vacarme", "Les incendies"],
            quote: "La forêt murmure à ceux qui savent écouter.",
            power: "Spores Protectrices : augmente la défense de l'équipe.",
            faceImg: "./assets/img/species/champi_face.png",
            coteImg: "./assets/img/species/champi_cote.png",
            friends: [],
            rivals: [],
        },
        corsaire: {
            name: "Corsaire",
            nickname: "le Chasseur de Trésors",
            rarity: "commun",
            personality: "Audacieux, charmeur et aventureux.",
            story: "Corsaire écume les mers à la recherche d'artefacts légendaires. Sa carte au trésor semble toujours changer mystérieusement.",
            accessory: "Chapeau pirate du Cap des Brumes.",
            likes: ["Les trésors", "Les cartes secrètes", "Les aventures"],
            dislikes: ["Les tricheurs", "Être coincé au même endroit"],
            quote: "Le plus beau trésor est celui qu'on n'a pas encore trouvé.",
            power: "Fortune du Pirate : augmente les récompenses rares.",
            faceImg: "./assets/img/species/pirate_face.png",
            coteImg: "./assets/img/species/pirate_cote.png",
            friends: [],
            rivals: [],
        },
        nopal: {
            name: "NOPAL",
            nickname: "le Voyageur des Dunes",
            rarity: "rare",
            personality: "Débrouillard, optimiste et généreux.",
            story: "Nopal traverse les déserts brûlants pour guider les voyageurs perdus vers les oasis cachées.",
            accessory: "Poncho cactus porte-bonheur.",
            likes: ["Les couchers de soleil", "Les voyages", "Les histoires de route"],
            dislikes: ["Le gaspillage", "Les menteurs"],
            quote: "Même dans le désert, il existe toujours un chemin.",
            power: "Résistance du Désert : réduit les dégâts subis.",
            faceImg: "./assets/img/species/cactus_face.png",
            coteImg: "./assets/img/species/cactus_cote.png",
            friends: [],
            rivals: [],
        },
        umbra: {
            name: "Umbra",
            nickname: "le Messager de la Lune",
            rarity: "legendaire",
            personality: "Mystérieux, intelligent et calme.",
            story: "Umbra apparaît seulement certaines nuits. Selon la légende, il voyage à travers les rêves pour transmettre des messages oubliés.",
            accessory: "Pendentif lunaire antique.",
            likes: ["Les étoiles", "Les énigmes", "Le silence"],
            dislikes: ["Les mensonges", "Le chaos"],
            quote: "La lune éclaire les secrets que le soleil ignore.",
            power: "Voile Nocturne : devient temporairement impossible à cibler.",
            faceImg: "./assets/img/species/lune_face.png",
            coteImg: "./assets/img/species/lune_cote.png",
            friends: [],
            rivals: [],
        },
        archy: {
            name: "ARCHY",
            nickname: "l'Alchimiste Fantasque",
            rarity: "epique",
            personality: "Brillant, maladroit et passionné.",
            story: "Archy cherche depuis toujours la formule ultime. Malheureusement, ses expériences produisent parfois des résultats totalement inattendus.",
            accessory: "Ceinture remplie de fioles magiques.",
            likes: ["Les expériences", "Les livres anciens", "Les cristaux rares"],
            dislikes: ["Les calculs faux", "Les ingrédients manquants"],
            quote: "Scientifiquement parlant... enfin, je crois.",
            power: "Potion Chaotique : effet aléatoire positif.",
            faceImg: "./assets/img/species/archy_face.png",
            coteImg: "./assets/img/species/archy_cote.png",
            friends: [],
            rivals: [],
        },
        solaria: {
            name: "SOLARIA",
            nickname: "Gardienne du Soleil",
            rarity: "legendaire",
            personality: "Solaria est chaleureuse, courageuse et inspirante.",
            story: "Au sommet du Mont Hélios se trouve le Sanctuaire du Premier Soleil. Selon les légendes, Solaria y est née lorsqu'une étoile est tombée du ciel et a fusionné avec un jeune lapin. Depuis ce jour, elle protège la lumière du royaume contre les créatures qui veulent plonger le monde dans une nuit éternelle.",
            accessory: "Diadème solaire, Cape blanche et or, Médaillon représentant un soleil—",
            likes: [
                "Les levers de soleil",
                "Les champs de fleurs",
                "Les fêtes du village",
                "Aider les autres",
            ],
            dislikes: ["Les mensonges", "L'égoïsme", "Les tempêtes éternelles", "La corruption"],
            quote: "Même la nuit la plus longue finit par céder devant l'aube.",
            power: "Une fois par combat, Solaria peut empêcher un allié de tomber K.O.",
            faceImg: "./assets/img/species/soleil_face.png",
            coteImg: "./assets/img/species/soleil_cote.png",
            friends: [],
            rivals: [],
        },
        meli: {
            name: "MELI",
            nickname: "la Reine du Miel",
            rarity: "rare",
            personality: "Travailleuse, gentille et protectrice.",
            story: "Meli veille sur les Prairies Dorées où les abeilles géantes produisent un miel aux propriétés magiques.",
            accessory: "Écharpe rayée des Apiculteurs Royaux.",
            likes: ["Les fleurs", "Les abeilles", "Les fêtes du village"],
            dislikes: ["Les pollueurs", "La paresse"],
            quote: "Chaque petite aide compte.",
            power: "Essaim Protecteur : invoque des abeilles qui défendent l'équipe.",
            faceImg: "./assets/img/species/abeille_face.png",
            coteImg: "./assets/img/species/abeille_cote.png",
            friends: [],
            rivals: [],
        },

        az: {
            name: "Azazel",
            nickname: "le Secret",
            rarity: "secret",
            personality: "Chanceux et gourmand — un mythe que presque personne n'a rencontré.",
            story: "On raconte qu'Azazel n'apparaît que devant ceux qui connaissent déjà son nom. Personne ne sait d'où il vient vraiment.",
            accessory: "Aucun — il n'en a pas besoin.",
            likes: ["Être découvert par hasard"],
            dislikes: [],
            quote: "...",
            power: "Chance infinie : aucun malus n'affecte jamais Azazel.",
            faceImg: "./assets/img/az/az_assis_de_face.png",
            coteImg: "./assets/img/az/az_assis_de_cote.png",
            friends: [],
            rivals: [],
            hidden: true,
            noMalus: true,
        },
    };

    const RARITY_META = {
        commun: { label: "Commun", color: "#9fb3c8" },
        rare: { label: "Rare", color: "#5b8fd6" },
        epique: { label: "Épique", color: "#a35bd6" },
        legendaire: { label: "Légendaire", color: "#f5c34d" },
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
    // BOSS LÉGUMES — dossier prêt, structure prête, contenu à venir
    // ============================================================
    const BASE_BOSSES = {
        carotte: {
            name: "LORD CAROTUS",
            nickname: "Le Cavalier Sans Tête",
            rang: "Chef Suprême de la Ligue des Légumes Libres",
            story: "Autrefois simple carotte du Grand Potager, Lord Carotus fut récolté lors de la légendaire Grande Récolte.\nSon corps fut détruit, mais une énergie ancienne enfouie sous les terres lui permit de revenir.\nSans tête.\nDepuis ce jour, il dirige la révolte.",
            arme: "Faux du Moissonneur",
            personality: ["Charismatique", "Implacable", "Stratège", "Très rancunier"],
            likes: ["Les stratégies", "La Ligue", "Les anciennes légendes"],
            dislikes: ["Les lapins", "Les récoltes", "Les trahisons"],
            quote: "Vous nous avez arrachés de la terre. Nous allons vous y remettre.",
            power: "Révolte des Racines : invoque des racines géantes qui immobilisent tous les ennemis.",
            faceImg: "./assets/img/boss/carotte_face.png",
            coteImg: "./assets/img/boss/carotte_cote.png",
            friends: ["choux", "oignon", "courgette"],
            rivals: ["ail"],
        },

        oignon: {
            name: "SHINOBI OIGNON",
            nickname: "Maître des Ombres",
            rang: "Chef des assassins",
            story: "Conçu pour infiltrer les terriers lapins.\nIl est capable de se fondre dans l'obscurité et de disparaître à volonté.\nSes shurikens sont fabriqués à partir de ses propres couches d'oignon.",
            arme: "Shuriken en épluchures d'oignon",
            personality: ["Froid", "Méthodique", "Silencieux", "Calculateur"],
            likes: ["Le silence", "L'entraînement", "Les missions secrètes"],
            dislikes: ["Le bruit", "La désorganisation", "Bananax"],
            quote: "Les larmes arrivent toujours avant la mort.",
            power: "Voile de Larmes : réduit fortement la précision des ennemis.",
            faceImg: "./assets/img/boss/oignon_face.png",
            coteImg: "./assets/img/boss/oignon_cote.png",
            friends: ["carotte", "courgette"],
            rivals: ["banane"],
        },

        choux: {
            name: "BRUTUS CHOU",
            nickname: "Le Rempart Vivant",
            rang: "Général des armées",
            story: "Brutus était cultivé pour devenir un simple repas d'hiver.\nAnnée après année, il voyait les plus gros choux être choisis les premiers.\nQuand la révolte a commencé, il a décidé qu'aucun légume ne devait être jugé par sa taille.\nIl est devenu le protecteur des potagers libres.",
            arme: "Hache de bûcheron géante",
            personality: ["Loyal", "Courageux", "Direct", "Protecteur"],
            likes: ["La loyauté", "Les jeunes légumes", "La discipline"],
            dislikes: ["La lâcheté", "L'injustice", "Les traîtres"],
            quote: "Plus tu frappes, plus je pousse.",
            power: "Mur de Chou : réduit fortement les dégâts subis par toute l'équipe.",
            faceImg: "./assets/img/boss/choux_face.png",
            coteImg: "./assets/img/boss/choux_cote.png",
            friends: ["carotte", "mais", "patate"],
            rivals: ["oignon"],
        },

        piment: {
            name: "PIMENTOR",
            nickname: "Maître Démolisseur",
            rang: "Expert en explosifs",
            story: "Le champ de Pimentor servait à rendre les plats lapins plus épicés.\nLes piments les plus forts étaient toujours arrachés avant les autres.\nPimentor a retourné ce cadeau contre les lapins.\nMaintenant ses explosifs brûlent tout ce qu'ils touchent.",
            arme: "Bombes Capsaïcine",
            personality: ["Hyperactif", "Instable", "Drôle", "Dangereux"],
            likes: ["Les explosions", "Les expériences", "Le chaos"],
            dislikes: ["L'ennui", "La pluie", "Les règles"],
            quote: "Si ça n'explose pas, c'est pas fini.",
            power: "Explosion Contrôlée : inflige d'importants dégâts de zone.",
            faceImg: "./assets/img/boss/piment_face.png",
            coteImg: "./assets/img/boss/piment_cote.png",
            friends: ["banane", "tomate"],
            rivals: ["choux"],
        },

        banane: {
            name: "BANANAX",
            nickname: "Le Dérangé",
            rang: "Berserker",
            story: "Bananax a mûri trop vite à cause de l'énergie qui a transformé les légumes.\nSa mutation l'a rendu instable.\nIl ne rêve pas de conquête ni de justice.\nIl veut simplement faire payer les lapins qui ont détruit sa plantation.",
            arme: "Tronçonneuse fruitière",
            personality: ["Fou", "Violent", "Imprévisible", "Énergique"],
            likes: ["Le combat", "Le chaos", "Pimentor"],
            dislikes: ["Les ordres", "La patience", "Être ignoré"],
            quote: "Je n'entends que le chaos.",
            power: "Folie Bananière : augmente énormément sa vitesse d'attaque mais réduit sa défense.",
            faceImg: "./assets/img/boss/banane.png",
            coteImg: "./assets/img/boss/banane.png",
            friends: ["piment"],
            rivals: ["oignon", "aubergine"],
        },

        courgette: {
            name: "ZUKK",
            nickname: "Le Traqueur Vert",
            rang: "Éclaireur Suprême",
            story: "Avant la guerre, Zukk observait les lapins depuis les haies.\nIl a vu des générations entières de légumes disparaître sans laisser de traces.\nQuand la Ligue est née, il est devenu ses yeux et ses oreilles.\nIl chasse maintenant ceux qui chassaient autrefois son peuple.",
            arme: "Tomahawk des Racines",
            personality: ["Patient", "Observateur", "Pragmatique", "Indépendant"],
            likes: ["Les pistes", "La nature", "L'observation"],
            dislikes: ["Les bavards", "Les villes", "Les imprudents"],
            quote: "Les traces racontent toujours une histoire.",
            power: "Marque du Traqueur : révèle les ennemis cachés et augmente les dégâts contre eux.",
            faceImg: "./assets/img/boss/courgette_face.png",
            coteImg: "./assets/img/boss/courgette_cote.png",
            friends: ["oignon", "mais"],
            rivals: [],
        },

        tomate: {
            name: "TOMARAK",
            nickname: "Seigneur de la Peste Rouge",
            rang: "Alchimiste de guerre",
            story: "Tomarak était destiné à finir dans des sauces et des soupes.\nAprès son éveil, il s'est mis à étudier les maladies qui touchaient les plantes.\nIl est persuadé que les lapins détruisent l'équilibre naturel du royaume.\nIl a développé des toxines capables de paralyser ses ennemis.",
            arme: "Lance-acide toxique",
            personality: ["Cynique", "Intelligent", "Cruel", "Calculateur"],
            likes: ["Les expériences", "Les toxines", "Les connaissances"],
            dislikes: ["L'ignorance", "Les guérisseurs", "L'échec"],
            quote: "La victoire est une maladie contagieuse.",
            power: "Toxines Paralysantes : chance d'immobiliser les ennemis.",
            faceImg: "./assets/img/boss/tomate_face.png",
            coteImg: "./assets/img/boss/tomate_cote.png",
            friends: ["piment"],
            rivals: ["ail"],
        },

        ail: {
            name: "COMTE AILULA",
            nickname: "Le Noble Immortel",
            rang: "Diplomate",
            story: "Ailula était cultivé dans les jardins des nobles lapins.\nIl vivait entouré de luxe pendant que les autres légumes étaient récoltés.\nLorsqu'il prit conscience de cette injustice, il abandonna sa vie privilégiée pour rejoindre la rébellion.",
            arme: "Canne-épée",
            personality: ["Élégant", "Manipulateur", "Cultivé", "Ambitieux"],
            likes: ["Le pouvoir", "Les débats", "L'élégance"],
            dislikes: ["La vulgarité", "Bananax", "Le désordre"],
            quote: "La conquête commence par une conversation.",
            power: "Autorité Royale : augmente temporairement toutes les statistiques des alliés.",
            faceImg: "./assets/img/boss/ail_face.png",
            coteImg: "./assets/img/boss/ail_cote.png",
            friends: ["aubergine"],
            rivals: ["carotte", "tomate"],
        },

        mais: {
            name: "MARÉCHAL ÉPI-DOR",
            nickname: "Le Tireur d'Élite",
            rang: "Chef de l'artillerie",
            story: "Épi-Dor a assisté aux premières récoltes de masse.\nIl fut l'un des premiers légumes à comprendre qu'un conflit approchait.\nDepuis, il entraîne les tireurs de la Ligue.",
            arme: "Double revolvers maïs",
            personality: ["Confiant", "Charmeur", "Courageux"],
            likes: ["Le tir", "La précision", "La compétition"],
            dislikes: ["Les ratés", "Les embuscades", "Les tricheurs"],
            quote: "Un seul tir suffit.",
            power: "Précision Mortelle : augmente fortement les chances de coup critique.",
            faceImg: "./assets/img/boss/mais_face.png",
            coteImg: "./assets/img/boss/mais_cote.png",
            friends: ["choux", "courgette"],
            rivals: [],
        },

        aubergine: {
            name: "SHOGUN AUBERGINE",
            nickname: "Le Gardien Violet",
            rang: "Maître des Lames",
            story: "Les Aubergines étaient autrefois considérées comme les plus élégantes des cultures.\nMais même elles finissaient dans l'assiette des lapins.\nShogun Aubergine a juré de restaurer l'honneur et la dignité de tous les légumes.",
            arme: "Katana Violet Ancestral",
            personality: ["Honorable", "Discipliné", "Calme"],
            likes: ["L'honneur", "L'entraînement", "La discipline"],
            dislikes: ["Les tricheurs", "La lâcheté", "Le chaos"],
            quote: "La maîtrise précède la victoire.",
            power: "Lame du Shogun : prochaine attaque critique garantie.",
            faceImg: "./assets/img/boss/aubergine_face.png",
            coteImg: "./assets/img/boss/aubergine_cote.png",
            friends: ["ail", "carotte"],
            rivals: ["banane"],
        },

        patate: {
            name: "PATATOR LE BROYEUR",
            nickname: "Le Colosse des Terres",
            rang: "Briseur de siège",
            story: "Patator poussait dans une terre pauvre où les légumes disparaissaient plus vite qu'ils ne poussaient.\nIl a vu trop de champs vidés et abandonnés.\nLorsque la Ligue a levé son étendard, il s'est engagé pour que plus aucun légume ne soit laissé derrière.",
            arme: "Marteau de Roc",
            personality: ["Gentil hors combat", "Têtu", "Loyal"],
            likes: ["Aider les autres", "La nourriture", "Ses amis"],
            dislikes: ["Les injustices", "Les menteurs", "L'abandon"],
            quote: "Je me bats pour ceux qui ne peuvent plus le faire.",
            power: "Séisme : frappe le sol et inflige des dégâts à tous les ennemis.",
            faceImg: "./assets/img/boss/patate_face.png",
            coteImg: "./assets/img/boss/patate_cote.png",
            friends: ["choux", "carotte"],
            rivals: [],
        },
    };

    // ============================================================
    // STOCKAGE DU CONTENU PERSONNALISÉ (ajouté via le Dashboard)
    // ============================================================
    const CUSTOM_SPECIES_KEY = "lapinous_custom_species";
    const CUSTOM_BOSSES_KEY = "lapinous_custom_bosses";
    const EGG_RATES_KEY = "lapinous_egg_rates";

    function loadCustomSpecies() {
        try {
            return JSON.parse(localStorage.getItem(CUSTOM_SPECIES_KEY) || "{}");
        } catch (e) {
            return {};
        }
    }
    function loadCustomBosses() {
        try {
            return JSON.parse(localStorage.getItem(CUSTOM_BOSSES_KEY) || "{}");
        } catch (e) {
            return {};
        }
    }
    function loadEggRates() {
        try {
            return (
                JSON.parse(localStorage.getItem(EGG_RATES_KEY)) || {
                    commun: 70,
                    rare: 22,
                    epique: 6,
                    legendaire: 2,
                }
            );
        } catch (e) {
            return { commun: 70, rare: 22, epique: 6, legendaire: 2 };
        }
    }
    function saveEggRates(rates) {
        localStorage.setItem(EGG_RATES_KEY, JSON.stringify(rates));
    }

    function getSpecies() {
        return { ...BASE_SPECIES, ...loadCustomSpecies() };
    }
    function getBosses() {
        return { ...BASE_BOSSES, ...loadCustomBosses() };
    }

    // ============================================================
    // ÉTAT DU JEU
    // ============================================================
    function freshGame() {
        return {
            rabbitName: "",
            species: "azur",
            trait: "aucun",
            status: { food: 25, energy: 25, cleanliness: 25, friendship: 0 },
            friendshipTotal: 0,
            currentLevel: 1,
            boosts: { food: 0, energy: 0, cleanliness: 0, friendship: 0 },
            improvements: { cuisine: false, chambre: false, sdb: false, jardin: false },
            lastUpgradeLevel: 0,
            carrots: 0,
            eggs: 0,
            ownedSpecies: [],
        };
    }

    let game = freshGame();
    let currentZone = "default";
    const UPGRADE_COST = 20;
    const EGG_COST = 30;
    const ROOM_REQUIRED_LEVEL = { cuisine: 2, chambre: 3, sdb: 4, jardin: 5 };

    // ============================================================
    // TOASTS
    // ============================================================
    function showToast(message, type = "") {
        const el = document.createElement("div");
        el.className = "toast" + (type ? " " + type : "");
        el.textContent = message;
        toastContainer.appendChild(el);
        setTimeout(() => el.remove(), 3600);
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
    // SAUVEGARDE : 3 emplacements + export/import JSON
    // ============================================================
    const SAVE_PREFIX = "lapinous_slot_";
    const AUTOSAVE_KEY = "lapinous_autosave";

    function serializeGame() {
        return JSON.stringify({ ...game, savedAt: Date.now() });
    }
    function autoSave() {
        try {
            localStorage.setItem(AUTOSAVE_KEY, serializeGame());
        } catch (e) {}
    }

    function saveToSlot(n) {
        try {
            localStorage.setItem(SAVE_PREFIX + n, serializeGame());
            showToast(`Partie sauvegardée dans l'emplacement ${n} 💾`, "success");
            renderSaveSlots();
        } catch (e) {
            showToast("Impossible de sauvegarder.", "warn");
        }
    }
    function loadFromSlot(n) {
        const raw = localStorage.getItem(SAVE_PREFIX + n);
        if (!raw) {
            showToast("Cet emplacement est vide.", "warn");
            return;
        }
        try {
            applyLoadedGame(JSON.parse(raw));
            showToast(`Partie chargée depuis l'emplacement ${n} ✨`, "success");
            $("#saveModal").modal("hide");
        } catch (e) {
            showToast("Sauvegarde invalide.", "warn");
        }
    }
    function clearSlot(n) {
        localStorage.removeItem(SAVE_PREFIX + n);
        renderSaveSlots();
        showToast(`Emplacement ${n} vidé.`);
    }

    function applyLoadedGame(data) {
        game = {
            ...freshGame(),
            ...data,
            status: { ...freshGame().status, ...(data.status || {}) },
            boosts: { ...freshGame().boosts, ...(data.boosts || {}) },
            improvements: { ...freshGame().improvements, ...(data.improvements || {}) },
        };
        startGameUI();
        autoSave();
    }

    function renderSaveSlots() {
        const container = document.getElementById("saveSlots");
        container.innerHTML = "";
        for (let n = 1; n <= 3; n++) {
            const raw = localStorage.getItem(SAVE_PREFIX + n);
            const row = document.createElement("div");
            row.className = "save-slot";
            if (raw) {
                try {
                    const data = JSON.parse(raw);
                    const date = data.savedAt ? new Date(data.savedAt).toLocaleString() : "";
                    row.innerHTML = `<div class="save-slot-info"><strong>${n}. ${data.rabbitName || "Sans nom"}</strong>Niveau ${data.currentLevel || 1} — ${date}</div>
                        <div class="save-slot-actions">
                            <button class="slot-btn load" data-load="${n}">Charger</button>
                            <button class="slot-btn save" data-save="${n}">Écraser</button>
                            <button class="slot-btn clear" data-clear="${n}">✕</button>
                        </div>`;
                } catch (e) {
                    row.innerHTML = `<div class="save-slot-info"><strong>${n}. (corrompu)</strong></div><div class="save-slot-actions"><button class="slot-btn clear" data-clear="${n}">✕</button></div>`;
                }
            } else {
                row.innerHTML = `<div class="save-slot-info"><strong>${n}. Emplacement vide</strong></div><div class="save-slot-actions"><button class="slot-btn save" data-save="${n}">Sauvegarder ici</button></div>`;
            }
            container.appendChild(row);
        }
        container
            .querySelectorAll("[data-load]")
            .forEach((b) => b.addEventListener("click", () => loadFromSlot(b.dataset.load)));
        container
            .querySelectorAll("[data-save]")
            .forEach((b) => b.addEventListener("click", () => saveToSlot(b.dataset.save)));
        container
            .querySelectorAll("[data-clear]")
            .forEach((b) => b.addEventListener("click", () => clearSlot(b.dataset.clear)));
    }

    document.getElementById("exportBtn").addEventListener("click", () => {
        const blob = new Blob([serializeGame()], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `lapinous-${(game.rabbitName || "save").toLowerCase()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast("Sauvegarde exportée en JSON ⬇️", "success");
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
            } catch (err) {
                showToast("Fichier JSON invalide.", "warn");
            }
        };
        reader.readAsText(file);
        e.target.value = "";
    });

    // ============================================================
    // ÉCRAN D'ADOPTION — carrousel à un seul lapin + œufs
    // ============================================================
    const COMMON_ORDER = () =>
        Object.entries(getSpecies())
            .filter(([, s]) => s.rarity === "commun")
            .map(([k]) => k);
    let commonIndex = 0;
    let pick = { speciesKey: "azur", trait: "aucun", fromEgg: false };

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
            if (roll <= acc) {
                chosenRarity = rarity;
                break;
            }
        }
        const pool = Object.entries(species).filter(
            ([k, s]) => s.rarity === chosenRarity && !s.hidden,
        );
        if (pool.length === 0)
            return { speciesKey: COMMON_ORDER()[0], trait: randomTrait(), fromEgg: true };
        const [key] = pool[Math.floor(Math.random() * pool.length)];
        return { speciesKey: key, trait: randomTrait(), fromEgg: true };
    }

    function renderAdoptionCard() {
        const species = getSpecies();
        const s = species[pick.speciesKey];
        const rarity = RARITY_META[s.rarity];
        const trait = TRAITS[pick.trait];
        const card = document.getElementById("adoptionCard");
        card.innerHTML = `
            <div class="rarity-badge" style="background:${rarity.color};">${rarity.label}</div>
            <img src="${s.coteImg}" class="adoption-photo" alt="${s.name}" onerror="this.onerror=null;this.src='./assets/img/species/mystery.svg';">
            <div class="adoption-name">${s.name}, ${s.nickname}</div>
            <div class="adoption-personality">${s.personality}</div>
            <div class="trait-badge">${trait.emoji} ${trait.label}</div>
        `;
    }

    function showCommon(idx) {
        const order = COMMON_ORDER();
        commonIndex = (idx + order.length) % order.length;
        pick = { speciesKey: order[commonIndex], trait: randomTrait(), fromEgg: false };
        renderAdoptionCard();
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

    function spawnParticlesAt(el, emoji, count) {
        for (let i = 0; i < count; i++) {
            const p = document.createElement("span");
            p.className = "particle";
            p.textContent = emoji;
            p.style.left = 45 + Math.random() * 10 + "%";
            p.style.top = "40%";
            p.style.setProperty("--dx", (Math.random() - 0.5) * 100 + "px");
            p.style.setProperty("--dx2", (Math.random() - 0.5) * 140 + "px");
            el.appendChild(p);
            setTimeout(() => p.remove(), 1200);
        }
    }

    showCommon(0);

    document.getElementById("adoptBtn").addEventListener("click", () => {
        const nameInput = document.getElementById("rabbitNameInput");
        const name = nameInput.value.trim() || "Nono";
        game = freshGame();
        game.rabbitName = name;
        if (name.trim().toLowerCase() === "azazel") {
            game.species = "az";
            game.trait = "az_special";
            showToast(`🍀 Tu as deviné son nom... Azazel te rejoint !`, "levelup");
        } else {
            game.species = pick.speciesKey;
            game.trait = pick.trait;
            showToast(`Bienvenue ${name} ! 🎉`, "success");
        }
        game.ownedSpecies = [game.species];
        startGameUI();
        autoSave();
        spawnParticles("🎉", 8);
    });

    document
        .getElementById("loadInsteadBtn")
        .addEventListener("click", () => document.getElementById("importInput").click());

    // ============================================================
    // ENCYCLOPÉDIE — cartes cliquables (photo + nom), détails au clic
    // ============================================================
    function showEncyclopediaDetail(key) {
        const s = getSpecies()[key];
        const rarity = RARITY_META[s.rarity];
        document.getElementById("encyclopediaDetailCard").innerHTML = `
            <div class="encyclopedia-detail-card">
                <img src="${s.coteImg || s.faceImg}" alt="${s.name}" onerror="this.onerror=null;this.src='./assets/img/species/mystery.svg';">
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
        document.getElementById("encyclopediaRelations").style.display = "none";
        document.getElementById("encyclopediaDetail").classList.add("active");
    }

    function renderEncyclopedia() {
        const grid = document.getElementById("encyclopediaGrid");
        const species = getSpecies();
        const discovered = localStorage.getItem("lapinous_az_discovered") === "1";
        grid.innerHTML = "";
        document.getElementById("encyclopediaGrid").style.display = "grid";
        document.getElementById("encyclopediaRelations").style.display = "block";
        document.getElementById("encyclopediaDetail").classList.remove("active");
        Object.entries(species).forEach(([key, s]) => {
            if (s.hidden && !discovered && key !== game.species) return;
            const owned = (game.ownedSpecies || []).includes(key);
            const card = document.createElement("button");
            card.type = "button";
            card.className = "encyclopedia-card" + (owned ? "" : " locked");
            const imgSrc = owned ? s.coteImg || s.faceImg : "./assets/img/species/mystery.svg";
            card.innerHTML = `<img src="${imgSrc}" alt="${owned ? s.name : "???"}" onerror="this.onerror=null;this.src='./assets/img/species/mystery.svg';"><span class="card-name">${owned ? s.name : "???"}</span>${owned ? '<span class="owned-badge">✓</span>' : ""}`;
            card.addEventListener("click", () => {
                if (owned) showEncyclopediaDetail(key);
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
    document.getElementById("encyclopediaBackBtn").addEventListener("click", renderEncyclopedia);
    document.getElementById("encyclopediaBtn").addEventListener("click", async () => {
        const unlocked = window.LapinousDashboardAccess
            ? await window.LapinousDashboardAccess.ensureDashboardUnlocked()
            : true;
        if (!unlocked) return;
        renderEncyclopedia();
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
        brandTitle.textContent = "🐰 " + (game.rabbitName || s.name);
        if (game.species === "az") localStorage.setItem("lapinous_az_discovered", "1");
        updateStatusBars();
        document.getElementById("level").innerText = game.currentLevel;
        updateGameArea("default");
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
        foodBar.style.width = game.status.food + "%";
        energyBar.style.width = game.status.energy + "%";
        cleanlinessBar.style.width = game.status.cleanliness + "%";
        friendshipBar.style.width = game.status.friendship + "%";
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
            !game.improvements[room] &&
            game.currentLevel >= ROOM_REQUIRED_LEVEL[room] &&
            game.currentLevel > game.lastUpgradeLevel &&
            game.status.friendship >= UPGRADE_COST
        );
    }
    function upgradeButtonHtml(room, icon, onclick) {
        if (game.improvements[room]) return "";
        if (game.currentLevel < ROOM_REQUIRED_LEVEL[room]) return "";
        const enabled = upgradeAvailable(room);
        return `<button class="action-btn upgrade" onclick="${onclick}" ${enabled ? "" : "disabled"}>
            <img class="action-icon" src="${icon}" alt="">
            <span>Améliorer (${UPGRADE_COST} 💛)</span>
        </button>`;
    }

    function speciesFaceImg() {
        const s = getSpecies()[game.species];
        return (s && s.faceImg) || "./assets/img/zone_cuisine/lapin_cuisine.gif";
    }

    const zones = {
        default: {
            label: "🏡 Salon",
            image: () => speciesFaceImg(),
            content: () => `
                <p class="welcome-msg">Te voilà à la maison avec ${game.rabbitName || "ton lapin"} ! Choisis une pièce en bas pour t'en occuper.</p>
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
            content: () =>
                game.improvements.cuisine
                    ? `<div class="action-row"><button class="action-btn upgraded" onclick="feedRabbit()"><img class="action-icon" src="./assets/img/zone_cuisine/pomme.png" alt=""><span>Nourrir</span></button></div>`
                    : `<div class="action-row">
                    <button class="action-btn" onclick="feedRabbit()"><img class="action-icon" src="./assets/img/zone_cuisine/carotte.png" alt=""><span>Nourrir</span></button>
                    ${upgradeButtonHtml("cuisine", "./assets/img/zone_cuisine/pomme.png", "improveFeedRabbit()")}
                </div>`,
        },
        chambre: {
            label: "🛏️ Chambre",
            image: () => `./assets/img/zone_Chambre/dodo.gif`,
            content: () =>
                game.improvements.chambre
                    ? `<div class="action-row"><button class="action-btn upgraded" onclick="putRabbitToSleep()"><img class="action-icon" src="./assets/img/zone_Chambre/lit.png" alt=""><span>Dodo</span></button></div>`
                    : `<div class="action-row">
                    <button class="action-btn" onclick="putRabbitToSleep()"><img class="action-icon" src="./assets/img/zone_Chambre/panier.png" alt=""><span>Dodo</span></button>
                    ${upgradeButtonHtml("chambre", "./assets/img/zone_Chambre/lit.png", "improvePutRabbitToSleep()")}
                </div>`,
        },
        sdb: {
            label: "🛁 Salle de bain",
            image: () => `./assets/img/zone_SdB/lapin_SdB.gif`,
            content: () =>
                game.improvements.sdb
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
                const icon = game.improvements.jardin
                    ? "./assets/img/zone_jardin/agilité.webp"
                    : "./assets/img/zone_jardin/dressage.png";
                const btnClass = game.improvements.jardin ? "action-btn upgraded" : "action-btn";
                return `<div class="action-row">
                    <button class="${btnClass}" onclick="startAgility()"><img class="action-icon" src="${icon}" alt=""><span>Jouer</span></button>
                    ${game.improvements.jardin ? "" : upgradeButtonHtml("jardin", "./assets/img/zone_jardin/agilité.webp", "improvePlayWithRabbit()")}
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
        rabbitImage.onerror = () => {
            rabbitImage.onerror = null;
            rabbitImage.src = "./assets/img/species/mystery.svg";
        };
        rabbitImage.src = zones[zone].image();
        rabbitImage.classList.toggle("photo-frame", zone === "default");
        gameArea.appendChild(rabbitImage);
        sceneLabel.textContent = zones[zone].label;
        document
            .querySelectorAll(".room-tab")
            .forEach((btn) => btn.classList.toggle("active", btn.dataset.zone === zone));
    }
    function refreshCurrentZone() {
        updateGameArea(currentZone);
    }

    // ============================================================
    // STATUTS / NIVEAU
    // ============================================================
    function checkStatus() {
        if (game.status.food <= 10)
            showToast(`${game.rabbitName || "Ton lapin"} a faim ! 🥕`, "warn");
        if (game.status.energy <= 10)
            showToast(`${game.rabbitName || "Ton lapin"} est fatigué ! 😴`, "warn");
        if (game.status.cleanliness <= 10)
            showToast(`${game.rabbitName || "Ton lapin"} a besoin d'un bain ! 🫧`, "warn");
    }
    function checkLevelUp() {
        const nextThreshold = game.currentLevel * 25;
        if (game.friendshipTotal >= nextThreshold) {
            game.currentLevel += 1;
            game.status.food = Math.min(game.status.food + 25, 100);
            game.status.energy = Math.min(game.status.energy + 25, 100);
            game.status.cleanliness = Math.min(game.status.cleanliness + 25, 100);
            document.getElementById("level").innerText = game.currentLevel;
            showToast(`🎉 Niveau ${game.currentLevel} atteint !`, "levelup");
            spawnParticles("🎉", 10);
            refreshCurrentZone();
            updateStatusBars();
        }
    }
    function gainFriendship(amount) {
        game.status.friendship = Math.min(game.status.friendship + amount, 100);
        game.friendshipTotal += amount;
        checkLevelUp();
    }

    // ============================================================
    // ACTIONS
    // ============================================================
    window.feedRabbit = function () {
        if (game.status.food >= 100) {
            showToast("Le lapin est déjà rassasié !");
        } else {
            game.status.food = Math.min(
                game.status.food + traitGain("food", 5) + game.boosts.food,
                100,
            );
            gainFriendship(5);
            bounceRabbit();
            spawnParticles("🥕", 5);
        }
        updateStatusBars();
        checkStatus();
        autoSave();
    };
    window.putRabbitToSleep = function () {
        if (game.status.energy >= 100) {
            showToast("Le lapin est déjà bien reposé !");
        } else {
            game.status.energy = Math.min(
                game.status.energy + traitGain("energy", 5) + game.boosts.energy,
                100,
            );
            gainFriendship(5);
            bounceRabbit();
            spawnParticles("💤", 5);
        }
        updateStatusBars();
        checkStatus();
        autoSave();
    };
    window.cleanRabbit = function () {
        if (game.status.cleanliness >= 100) {
            showToast("Le lapin est déjà tout propre !");
        } else {
            game.status.cleanliness = Math.min(
                game.status.cleanliness + 5 + game.boosts.cleanliness,
                100,
            );
            gainFriendship(5);
            bounceRabbit();
            spawnParticles("🫧", 5);
        }
        updateStatusBars();
        checkStatus();
        autoSave();
    };

    // ---- Mini-jeu d'agilité ----
    let agilityRAF = null;
    window.startAgility = function () {
        if (game.status.food <= 5 || game.status.energy <= 5 || game.status.cleanliness <= 5) {
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
            gainFriendship(5 + traitGain("friendship", 0) + game.boosts.friendship);
            game.status.food = Math.max(game.status.food - 5, 0);
            game.status.energy = Math.max(game.status.energy - 5, 0);
            game.status.cleanliness = Math.max(game.status.cleanliness - 5, 0);
            showToast(`${game.rabbitName || "Ton lapin"} réussit son saut ! 🐇✨`, "success");
            spawnParticles("💛", 6);
        } else {
            game.status.friendship = Math.max(game.status.friendship - 5, 0);
            game.status.cleanliness = Math.max(game.status.cleanliness - 8, 0);
            showToast(
                `${game.rabbitName || "Ton lapin"} rate son saut et se salit un peu... 😥`,
                "warn",
            );
            spawnParticles("💦", 4);
        }
        bounceRabbit();
        updateStatusBars();
        checkStatus();
        autoSave();
        setTimeout(() => refreshCurrentZone(), 700);
    };

    // ---- Aventure / combat contre les boss légumes ----
    function playerPower() {
        const t = currentTrait();
        const combatBonus = (t.gain && (t.gain.friendship || 0)) * 2;
        const conditionBonus = Math.round(
            (game.status.food + game.status.energy + game.status.cleanliness) / 3 / 5,
        );
        return game.currentLevel * 8 + combatBonus + conditionBonus;
    }

    window.openAdventure = function () {
        if (game.status.energy <= 10 || game.status.food <= 10) {
            showToast("Ton lapin est trop épuisé ou affamé pour partir à l'aventure !", "warn");
            return;
        }
        body.classList.add("battle-scene");
        const bosses = getBosses();
        const power = playerPower();
        const rows = Object.entries(bosses)
            .sort((a, b) => a[1].power - b[1].power)
            .map(([key, b]) => {
                const diff = b.power - power;
                const label =
                    diff > 15 ? "💀 Très dangereux" : diff > 0 ? "⚠️ Difficile" : "🙂 Faisable";
                return `<button class="boss-card" onclick="prepareFight('${key}')">
                    <img src="${b.img}" alt="${b.name}" onerror="this.onerror=null;this.src='./assets/img/species/mystery.svg';">
                    <div class="boss-name">${b.name}</div>
                    <div class="boss-power">Puissance ${b.power}</div>
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
    window.prepareFight = function (key) {
        const boss = getBosses()[key];
        const s = getSpecies()[game.species];
        if (!boss) return;
        gameArea.innerHTML = `
            <div class="vs-screen">
                <div class="vs-side">
                    <img src="${s.coteImg || s.faceImg}" alt="${s.name}" onerror="this.onerror=null;this.src='./assets/img/species/mystery.svg';">
                    <div class="vs-name">${game.rabbitName || s.name}</div>
                    <div class="vs-sub">Niveau ${game.currentLevel}</div>
                </div>
                <div class="vs-mark">⚔️</div>
                <div class="vs-side">
                    <img src="${boss.img}" alt="${boss.name}" onerror="this.onerror=null;this.src='./assets/img/species/mystery.svg';">
                    <div class="vs-name">${boss.name}</div>
                    <div class="vs-sub">Puissance ${boss.power}</div>
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
        const successChance = Math.min(
            0.92,
            Math.max(0.08, 0.5 + (power - boss.power) / (boss.power * 2 || 1)),
        );
        const win = Math.random() < successChance;

        game.status.energy = Math.max(game.status.energy - 10, 0);
        game.status.cleanliness = Math.max(game.status.cleanliness - 5, 0);

        if (win) {
            const reward = Math.max(
                3,
                Math.round(boss.power * 0.6) + Math.floor(Math.random() * 5),
            );
            game.carrots += reward;
            gainFriendship(3);
            showToast(`Victoire contre ${boss.name} ! +${reward} 🥕`, "success");
            spawnParticles("🥕", 8);
        } else {
            game.status.friendship = Math.max(game.status.friendship - 5, 0);
            showToast(
                `${boss.name} était trop fort... ${game.rabbitName || "Ton lapin"} rentre fatigué. 😥`,
                "warn",
            );
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
        if (isNew) game.ownedSpecies.push(result.speciesKey);
        showToast(
            isNew
                ? `🥚 L'œuf éclot... c'est ${s.name} (${RARITY_META[s.rarity].label}) ! Nouveau dans ton encyclopédie 📖`
                : `🥚 L'œuf éclot... encore un ${s.name} (${RARITY_META[s.rarity].label}). Il rejoint la collection.`,
            "levelup",
        );
        spawnParticles("✨", 10);
        autoSave();
        refreshCurrentZone();
    };

    // ---- Améliorations ----
    function purchaseUpgrade(room, statKey, message) {
        if (!upgradeAvailable(room)) {
            showToast("Pas encore assez d'amitié, ou amélioration déjà achetée récemment.", "warn");
            return;
        }
        game.status.friendship -= UPGRADE_COST;
        game.boosts[statKey] += 2;
        game.improvements[room] = true;
        game.lastUpgradeLevel = game.currentLevel;
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
        document.getElementById("renameInput").value = game.rabbitName;
        $("#renameModal").modal("show");
    });
    document.getElementById("renameConfirmBtn").addEventListener("click", () => {
        const val = document.getElementById("renameInput").value.trim();
        if (val) {
            game.rabbitName = val;
            brandTitle.textContent = "🐰 " + val;
            if (val.toLowerCase() === "azazel" && game.species !== "az") {
                game.species = "az";
                game.trait = "az_special";
                localStorage.setItem("lapinous_az_discovered", "1");
                refreshCurrentZone();
                showToast("🍀 Azazel a répondu à son nom... et prend sa place !", "levelup");
                spawnParticles("🍀", 10);
            } else {
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
        const hasSave = [1, 2, 3].some((n) => !!localStorage.getItem(SAVE_PREFIX + n));
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
        document.getElementById("rabbitNameInput").value = "";
        showToast("Déconnecté. À bientôt ! 👋");
    });

    // ============================================================
    // NAVIGATION
    // ============================================================
    document.getElementById("salonBtn").addEventListener("click", () => updateGameArea("default"));
    document
        .getElementById("cuisineBtn")
        .addEventListener("click", () => updateGameArea("cuisine"));
    document
        .getElementById("chambreBtn")
        .addEventListener("click", () => updateGameArea("chambre"));
    document.getElementById("jardinBtn").addEventListener("click", () => updateGameArea("jardin"));
    document.getElementById("sdbBtn").addEventListener("click", () => updateGameArea("sdb"));
    document.getElementById("saveModal").addEventListener("show.bs.modal", renderSaveSlots);

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
                        `Ça faisait longtemps ! ${game.rabbitName || "Ton lapin"} est content de te revoir 💛`,
                        "success",
                    ),
                800,
            );
        }
        localStorage.setItem("lapinous_last_visit", String(now));
    }

    // ============================================================
    // DASHBOARD (ajout de lapins / boss / taux d'œufs / puissance)
    // ============================================================
    function fileToDataUrl(file) {
        return new Promise((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve(r.result);
            r.onerror = reject;
            r.readAsDataURL(file);
        });
    }

    function renderDashboard() {
        const rates = loadEggRates();
        ["commun", "rare", "epique", "legendaire"].forEach((r) => {
            const input = document.getElementById("rate-" + r);
            if (input) input.value = rates[r];
        });

        const custom = loadCustomSpecies();
        const speciesListEl = document.getElementById("dashSpeciesList");
        speciesListEl.innerHTML = "";
        Object.entries(getSpecies()).forEach(([key, s]) => {
            const isCustom = !!custom[key];
            const row = document.createElement("div");
            row.className = "dash-row";
            row.innerHTML = `<img src="${s.coteImg || s.faceImg}" class="dash-thumb" onerror="this.onerror=null;this.src='./assets/img/species/mystery.svg';"><span>${s.name} — ${RARITY_META[s.rarity].label}${isCustom ? "" : " (base)"}</span>${isCustom ? `<button class="slot-btn clear" data-del-species="${key}">✕</button>` : ""}`;
            speciesListEl.appendChild(row);
        });
        speciesListEl.querySelectorAll("[data-del-species]").forEach((b) =>
            b.addEventListener("click", () => {
                const c = loadCustomSpecies();
                delete c[b.dataset.delSpecies];
                localStorage.setItem(CUSTOM_SPECIES_KEY, JSON.stringify(c));
                renderDashboard();
                showToast("Lapin supprimé.");
            }),
        );

        const customBosses = loadCustomBosses();
        const bossListEl = document.getElementById("dashBossList");
        bossListEl.innerHTML = "";
        Object.entries(getBosses())
            .sort((a, b) => a[1].power - b[1].power)
            .forEach(([key, boss]) => {
                const isCustom = !!customBosses[key];
                const row = document.createElement("div");
                row.className = "dash-row";
                row.innerHTML = `<img src="${boss.img}" class="dash-thumb" onerror="this.style.opacity=0.15"><span>${boss.name} — Puissance ${boss.power}${isCustom ? "" : " (base)"}</span>${isCustom ? `<button class="slot-btn clear" data-del-boss="${key}">✕</button>` : ""}`;
                bossListEl.appendChild(row);
            });
        bossListEl.querySelectorAll("[data-del-boss]").forEach((b) =>
            b.addEventListener("click", () => {
                const c = loadCustomBosses();
                delete c[b.dataset.delBoss];
                localStorage.setItem(CUSTOM_BOSSES_KEY, JSON.stringify(c));
                renderDashboard();
                showToast("Boss supprimé.");
            }),
        );
    }

    document.getElementById("dashboardBtn").addEventListener("click", async () => {
        const unlocked = window.LapinousDashboardAccess
            ? await window.LapinousDashboardAccess.ensureDashboardUnlocked()
            : true;
        if (!unlocked) return;
        renderDashboard();
        $("#dashboardModal").modal("show");
    });

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

    document.getElementById("addSpeciesForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const f = e.target;
        const key = f.speciesKey.value.trim().toLowerCase().replace(/\s+/g, "_");
        if (!key) {
            showToast("Il faut un identifiant unique pour ce lapin.", "warn");
            return;
        }
        let faceImg = "./assets/img/zone_cuisine/lapin_cuisine.gif";
        let coteImg = faceImg;
        if (f.faceFile.files[0]) faceImg = await fileToDataUrl(f.faceFile.files[0]);
        if (f.coteFile.files[0]) coteImg = await fileToDataUrl(f.coteFile.files[0]);
        const entry = {
            name: f.speciesName.value.trim() || key,
            nickname: f.speciesNickname.value.trim(),
            rarity: f.speciesRarity.value,
            personality: f.speciesPersonality.value.trim(),
            story: f.speciesStory.value.trim(),
            accessory: f.speciesAccessory.value.trim(),
            likes: f.speciesLikes.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            dislikes: f.speciesDislikes.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            quote: f.speciesQuote.value.trim(),
            power: f.speciesPower.value.trim(),
            faceImg,
            coteImg,
        };
        const custom = loadCustomSpecies();
        custom[key] = entry;
        localStorage.setItem(CUSTOM_SPECIES_KEY, JSON.stringify(custom));
        f.reset();
        renderDashboard();
        showToast(`Lapin "${entry.name}" ajouté ✅`, "success");
    });

    document.getElementById("addBossForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const f = e.target;
        const key = f.bossKey.value.trim().toLowerCase().replace(/\s+/g, "_");
        if (!key) {
            showToast("Il faut un identifiant unique pour ce boss.", "warn");
            return;
        }
        let img = "./assets/img/boss/placeholder.png";
        if (f.bossFile.files[0]) faceimg = await fileToDataUrl(f.bossFile.files[0]);
        if (f.coteFile.files[0]) coteImg = await fileToDataUrl(f.coteFile.files[0]);
        const entry = {
            name: f.bossName.value.trim() || key,
            power: parseInt(f.bossPower.value, 10) || 1,
            desc: f.bossDesc.value.trim(),
            img,
        };
        const custom = loadCustomBosses();
        custom[key] = entry;
        localStorage.setItem(CUSTOM_BOSSES_KEY, JSON.stringify(custom));
        f.reset();
        renderDashboard();
        showToast(`Boss "${entry.name}" ajouté ✅`, "success");
    });

    // ---- Export/Import du CONTENU (lapins + boss + taux d'œufs) ----
    // Volontairement séparé de la sauvegarde du joueur : ce fichier ne contient
    // AUCUNE donnée de progression, juste le contenu ajouté par l'admin.
    document.getElementById("exportContentBtn").addEventListener("click", () => {
        const bundle = {
            type: "lapinous-content",
            exportedAt: Date.now(),
            customSpecies: loadCustomSpecies(),
            customBosses: loadCustomBosses(),
            eggRates: loadEggRates(),
        };
        const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "lapinous-content.json";
        a.click();
        URL.revokeObjectURL(url);
        showToast("Contenu (lapins + boss + taux) exporté ⬇️", "success");
    });

    document.getElementById("importContentInput").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const bundle = JSON.parse(reader.result);
                if (bundle.customSpecies)
                    localStorage.setItem(CUSTOM_SPECIES_KEY, JSON.stringify(bundle.customSpecies));
                if (bundle.customBosses)
                    localStorage.setItem(CUSTOM_BOSSES_KEY, JSON.stringify(bundle.customBosses));
                if (bundle.eggRates) saveEggRates(bundle.eggRates);
                renderDashboard();
                showToast("Contenu importé avec succès ✨", "success");
            } catch (err) {
                showToast("Fichier de contenu invalide.", "warn");
            }
        };
        reader.readAsText(file);
        e.target.value = "";
    });

    // ---- Sécurité : changer le code du Dashboard ----
    document.getElementById("changeCodeForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const f = e.target;
        const code1 = f.newCode.value.trim();
        const code2 = f.newCode2.value.trim();
        if (code1.length < 4) {
            showToast("Le code doit faire au moins 4 caractères.", "warn");
            return;
        }
        if (code1 !== code2) {
            showToast("Les deux codes ne correspondent pas.", "warn");
            return;
            5;
        }
        await window.LapinousDashboardAccess.changeDashboardCode(code1);
        f.reset();
        showToast("Code du Dashboard mis à jour ✅", "success");
    });

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
