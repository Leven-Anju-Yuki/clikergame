document.addEventListener("DOMContentLoaded", () => {
    const gameArea = document.getElementById("gameArea");
    const body = document.body;
    const rabbitImage = document.getElementById("rabbitImage");

    // Barres de statut
    const foodBar = document.getElementById("foodBar");
    const energyBar = document.getElementById("energyBar");
    const cleanlinessBar = document.getElementById("cleanlinessBar");
    const friendshipBar = document.getElementById("friendshipBar");

    // Valeurs initiales des statuts
    let status = {
        food: 25,
        energy: 25,
        cleanliness: 25,
        friendship: 0,
    };

    let currentLevel = 1;

    // Fonction pour créer et afficher des boutons d'alimentation supplémentaires en fonction du niveau actuel
    function displayAdditionalFeedButtons() {
        console.log("displayAdditionalFeedButtons appelée");
        console.log("Niveau actuel :", currentLevel);

        const feedButtons = document.getElementById("feedButtons");
        feedButtons.innerHTML = ""; // Effacer les boutons existants

        if (currentLevel >= 1) {
            const foodButton = createButtonWithImage(
                "./assets/img/nourriture/pomme.png",
                // "Nourrir le lapin (Nourriture)",
                feedRabbitFood
            );
            feedButtons.appendChild(foodButton);
        }
        if (currentLevel >= 2) {
            const cleanlinessButton = createButtonWithImage(
                "./assets/img/soin/pommeau.png",
                // "Laver le lapin (Propreté)",
                feedRabbitCleanliness
            );
            feedButtons.appendChild(cleanlinessButton);
        }
        if (currentLevel >= 3) {
            const energyButton = createButtonWithImage(
                "./assets/img/dodo/lit.png",
                // "Coucher le lapin (Énergie)",
                feedRabbitEnergy
            );
            feedButtons.appendChild(energyButton);
        }
        if (currentLevel >= 4) {
            const friendshipButton = createButtonWithImage(
                "./assets/img/jardin/agilité.webp",
                // "Jouer avec le lapin (Amitié)",
                feedRabbitSport
            );
            feedButtons.appendChild(friendshipButton);
        }
    }

    // Fonction pour créer un bouton avec une image
    function createButtonWithImage(imgSrc, buttonText, onClickHandler) {
        const button = document.createElement("button");
        const img = document.createElement("img");
        img.src = imgSrc;
        img.alt = buttonText;
        img.classList.add("imgdansbtn");

        button.appendChild(img);
        button.appendChild(document.createTextNode(buttonText));
        button.classList.add("boutonavecimg");
        button.onclick = onClickHandler;

        return button;
    }

    // Fonction pour gérer l'alimentation du lapin pour chaque statut
    function feedRabbitFood() {
        console.log("feedRabbitFood appelée");
        // Logique pour nourrir le lapin pour le statut de nourriture
    }

    function feedRabbitCleanliness() {
        console.log("feedRabbitCleanliness appelée");
        // Logique pour nourrir le lapin pour le statut de propreté
    }

    function feedRabbitEnergy() {
        console.log("feedRabbitEnergy appelée");
        // Logique pour nourrir le lapin pour le statut d'énergie
    }

    function feedRabbitSport() {
        console.log("feedRabbitSport appelée");
        // Logique pour nourrir le lapin pour le statut d'amitié
    }

    // Fonction pour mettre à jour les barres de statut
    function updateStatusBars() {
        console.log("updateStatusBars appelée");
        foodBar.style.width = status.food + "%";
        energyBar.style.width = status.energy + "%";
        cleanlinessBar.style.width = status.cleanliness + "%";
        friendshipBar.style.width = status.friendship + "%";
    }

    // Contenu des zones
    const zones = {
        cuisine: {
            image: "./assets/img/heureux 2.gif",
            content: `
                <button class="boutonavecimg" onclick="feedRabbit()">
                    <img class="imgdansbtn" src="./assets/img/nourriture/carotte.png" alt="Nourrir le lapin">
                </button>
            `,
        },
        chambre: {
            image: "./assets/img/dodo.gif",
            content: `
                <button class="boutonavecimg" onclick="putRabbitToSleep()">
                    <img class="imgdansbtn" src="./assets/img/dodo/panier.png" alt="Mettre le lapin au lit">
                </button>
            `,
        },
        sdb: {
            image: "./assets/img/lave.gif",
            content: `
                <button class="boutonavecimg" onclick="cleanRabbit()">
                    <img class="imgdansbtn" src="./assets/img/soin/brosse.png" alt="Nettoyer le lapin">
                </button>
            `,
        },
        jardin: {
            image: "./assets/img/entrenement.gif",
            content: `
                <button class="boutonavecimg" onclick="playWithRabbit()">
                    <img class="imgdansbtn" src="./assets/img/jardin/dressage.png" alt="Jouer avec le lapin">
                </button>
            `,
        },
    };

    // Fonction pour mettre à jour la zone de jeu et la classe du body
    function updateGameArea(zone) {
        console.log("updateGameArea appelée avec zone:", zone);
        gameArea.innerHTML = zones[zone].content;
        body.className = ""; // Effacer toutes les classes
        body.classList.add(zone);
        rabbitImage.src = zones[zone].image;
        gameArea.appendChild(rabbitImage);
    }

    // Fonction pour vérifier les valeurs de statut et forcer des actions si nécessaire
    function checkStatus() {
        console.log("checkStatus appelée");
        if (status.food <= 10) {
            alert("Vous devez nourrir votre lapin!");
        }
        if (status.energy <= 10) {
            alert("Vous devez mettre votre lapin au lit!");
        }
        if (status.cleanliness <= 10) {
            alert("Vous devez laver votre lapin!");
        }
    }

    // Fonction pour vérifier la montée en niveau
    function checkLevelUp() {
        console.log("checkLevelUp appelée");
        if (status.friendship >= 25 && currentLevel === 1) {
            currentLevel = 2;
            status.food = Math.min(status.food + 25, currentLevel * 25); // Augmente la nourriture
            status.energy = Math.min(status.energy + 25, currentLevel * 25); // Augmente l'énergie
            status.cleanliness = Math.min(status.cleanliness + 25, currentLevel * 25); // Augmente la propreté
            document.getElementById("level").innerText = currentLevel; // Met à jour le niveau affiché
            alert(`Niveau ${currentLevel} atteint ! Les statuts augmentent à ${currentLevel * 25}%.`);
            displayAdditionalFeedButtons();
            updateStatusBars();
        } else if (status.friendship >= 50 && currentLevel === 2) {
            currentLevel = 3;
            status.food = Math.min(status.food + 25, currentLevel * 25); // Augmente la nourriture
            status.energy = Math.min(status.energy + 25, currentLevel * 25); // Augmente l'énergie
            status.cleanliness = Math.min(status.cleanliness + 25, currentLevel * 25); // Augmente la propreté
            document.getElementById("level").innerText = currentLevel; // Met à jour le niveau affiché
            alert(`Niveau ${currentLevel} atteint ! Les statuts augmentent à ${currentLevel * 25}%.`);
            displayAdditionalFeedButtons();
            updateStatusBars();
        } else if (status.friendship >= 75 && currentLevel === 3) {
            currentLevel = 4;
            status.food = Math.min(status.food + 25, currentLevel * 25); // Augmente la nourriture
            status.energy = Math.min(status.energy + 25, currentLevel * 25); // Augmente l'énergie
            status.cleanliness = Math.min(status.cleanliness + 25, currentLevel * 25); // Augmente la propreté
            document.getElementById("level").innerText = currentLevel; // Met à jour le niveau affiché
            alert(`Niveau ${currentLevel} atteint ! Les statuts augmentent à ${currentLevel * 25}%.`);
            displayAdditionalFeedButtons();
            updateStatusBars();
        }
    }

    // Écouteurs d'événements pour les boutons
    document.getElementById("cuisineBtn").addEventListener("click", () => {
        updateGameArea("cuisine");
    });
    document.getElementById("chambreBtn").addEventListener("click", () => {
        updateGameArea("chambre");
    });
    document.getElementById("jardinBtn").addEventListener("click", () => {
        updateGameArea("jardin");
    });
    document.getElementById("sdbBtn").addEventListener("click", () => {
        updateGameArea("sdb");
    });

    // Actions pour le lapin
    window.feedRabbit = function () {
        console.log("feedRabbit appelée");
        if (status.food >= currentLevel * 25) {
            alert("Le lapin est déjà rassasié!");
        } else {
            // alert("Le lapin mange une carotte!");
            status.food = Math.min(status.food + 5, currentLevel * 25);
            status.friendship = Math.min(status.friendship + 5, 75);
            checkLevelUp();
        }
        updateStatusBars();
        checkStatus();
    };

    window.putRabbitToSleep = function () {
        console.log("putRabbitToSleep appelée");
        if (status.energy >= currentLevel * 25) {
            alert("Le lapin est déjà reposé!");
        } else {
            // alert("Le lapin s'endort paisiblement.");
            status.energy = Math.min(status.energy + 5, currentLevel * 25);
        }
        updateStatusBars();
        checkStatus();
    };

    window.playWithRabbit = function () {
        console.log("playWithRabbit appelée");
        if (status.food <= 5) {
            alert("Votre lapin a trop faim pour jouer!");
        } else if (status.energy <= 5) {
            alert("Votre lapin est trop fatigué pour jouer!");
        } else if (status.cleanliness <= 5) {
            alert("Votre lapin est trop sale pour jouer!");
        } else {
            // alert("Votre lapin joue joyeusement.");
            status.friendship = Math.min(status.friendship + 5, 75);
            status.food = Math.max(status.food - 5, 0);
            status.energy = Math.max(status.energy - 5, 0);
            status.cleanliness = Math.max(status.cleanliness - 5, 0);
            checkLevelUp();
        }
        updateStatusBars();
        checkStatus();
    };

    window.cleanRabbit = function () {
        console.log("cleanRabbit appelée");
        if (status.cleanliness >= currentLevel * 25) {
            alert("Le lapin est déjà propre!");
        } else {
            // alert("Le lapin est maintenant propre.");
            status.cleanliness = Math.min(status.cleanliness + 5, currentLevel * 25);
            status.friendship = Math.min(status.friendship + 5, 75);
            checkLevelUp();
        }
        updateStatusBars();
        checkStatus();
    };

    // Initialiser les barres de statut
    updateStatusBars();
    displayAdditionalFeedButtons();
});
