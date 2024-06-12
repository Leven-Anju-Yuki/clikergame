document.addEventListener("DOMContentLoaded", () => {
    const gameArea = document.getElementById("gameArea");
    const body = document.body;
    const rabbitImage = document.getElementById("rabbitImage");

    // Status bars
    const foodBar = document.getElementById("foodBar");
    const energyBar = document.getElementById("energyBar");
    const cleanlinessBar = document.getElementById("cleanlinessBar");
    const friendshipBar = document.getElementById("friendshipBar");

    // Initial status values
    let status = {
        food: 25,
        energy: 25,
        cleanliness: 25,
        friendship: 0,
    };

    let currentLevel = 1;
    // Fonction pour créer et afficher des boutons d'alimentation supplémentaires en fonction du niveau actuel
    // Fonction pour créer et afficher des boutons d'alimentation supplémentaires en fonction du niveau actuel
    function displayAdditionalFeedButtons() {
        const feedButtons = document.getElementById("feedButtons");

        // Clear any existing buttons
        feedButtons.innerHTML = "";

        // Create and append buttons based on current level
        if (currentLevel >= 1 && currentLevel < 2) {
            const foodButton = document.createElement("button");
            foodButton.textContent = "Nourrir le lapin (Nourriture)";
            foodButton.onclick = feedRabbitFood;
            feedButtons.appendChild(foodButton);
        }
        if (currentLevel >= 2 && currentLevel < 3) {
            const cleanlinessButton = document.createElement("button");
            cleanlinessButton.textContent = "Nourrir le lapin (Propreté)";
            cleanlinessButton.onclick = feedRabbitCleanliness;
            feedButtons.appendChild(cleanlinessButton);
        }
        if (currentLevel >= 3 && currentLevel < 4) {
            const energyButton = document.createElement("button");
            energyButton.textContent = "Nourrir le lapin (Énergie)";
            energyButton.onclick = feedRabbitEnergy;
            feedButtons.appendChild(energyButton);
        }
        if (currentLevel >= 4) {
            const friendshipButton = document.createElement("button");
            friendshipButton.textContent = "Nourrir le lapin (Amitié)";
            friendshipButton.onclick = feedRabbitGarden;
            feedButtons.appendChild(friendshipButton);
        }
    }

    // Fonction pour créer un bouton avec une image
    function createButtonWithImage(imageSrc, buttonText, onClickFunction) {
        const button = document.createElement("button");
        const image = document.createElement("img");
        image.src = imageSrc;
        image.alt = buttonText; // Utilisez le texte du bouton comme alternative d'image
        button.appendChild(image);
        const text = document.createTextNode(buttonText);
        button.appendChild(text);
        button.onclick = onClickFunction;
        return button;
    }

    // Fonction pour gérer l'alimentation du lapin pour chaque statut
    function feedRabbitFood() {
        // Votre logique pour nourrir le lapin pour le statut de nourriture
    }
    function feedRabbitCleanliness() {
        // Votre logique pour nourrir le lapin pour le statut de propreté
    }
    function feedRabbitEnergy() {
        // Votre logique pour nourrir le lapin pour le statut d'énergie
    }
    function feedRabbitGarden() {
        // Votre logique pour nourrir le lapin pour le statut de jardin
    }

    // Appelez cette fonction chaque fois que les barres de statut sont mises à jour
    updateStatusBars();

    // Zones content
    const zones = {
        cuisine: {
            image: "./assets/img/heureux 2.gif",
            //            <h2>Cuisine</h2>
            // <p>Bienvenue dans la cuisine. Ici, le lapin aime manger des carottes.</p>
            content: `
                <button class="boutonavecimg"onclick="feedRabbit()">
                    <img class="imgdansbtn" src="./assets/img/nourriture/carotte.png" alt="Nourrir le lapin">
                </button>
            `,
        },
        chambre: {
            image: "./assets/img/dodo.gif",
            //            <h2>Chambre</h2>
            // <p>Bienvenue dans la chambre. Ici, le lapin aime dormir.</p>
            content: `
                <button class="boutonavecimg"onclick="putRabbitToSleep()">
                    <img class="imgdansbtn"src="./assets/img/dodo/panier.png" alt="Mettre le lapin au lit">
                </button>
            `,
        },
        sdb: {
            image: "./assets/img/lave.gif",
            //             <h2>Salle de Bain</h2>
            // <p>Bienvenue dans la salle de bain. Ici, le lapin aime se nettoyer.</p>
            content: `
                <button class="boutonavecimg"onclick="cleanRabbit()">
                    <img class="imgdansbtn"src="./assets/img/soin/brosse.png" alt="Nettoyer le lapin">
                </button>
            `,
        },
        jardin: {
            image: "./assets/img/entrenement.gif",
            //           <h2>Jardin</h2>
            // <p>Bienvenue dans le jardin. Ici, le lapin aime courir et jouer.</p>
            content: `
                <button class="boutonavecimg"onclick="playWithRabbit()">
                    <img class="imgdansbtn"src="./assets/img/jardin/dressage.png" alt="Jouer avec le lapin">
                </button>
            `,
        },
    };

    // Function to update the game area and body class
    function updateGameArea(zone) {
        gameArea.innerHTML = zones[zone].content;
        body.className = ""; // Clear all classes
        body.classList.add(zone);
        rabbitImage.src = zones[zone].image;
        gameArea.appendChild(rabbitImage);
    }

    // Function to update the status bars
    function updateStatusBars() {
        foodBar.style.width = status.food + "%";
        energyBar.style.width = status.energy + "%";
        cleanlinessBar.style.width = status.cleanliness + "%";
        friendshipBar.style.width = status.friendship + "%";
    }

    // Function to check status values and force actions if necessary
    function checkStatus() {
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

    // Function to check for level up
    function checkLevelUp() {
        if (status.friendship >= 25 && currentLevel === 1) {
            currentLevel = 2;
            status.food = Math.min(status.food + 25, currentLevel * 25); // Augmente la nourriture
            status.energy = Math.min(status.energy + 25, currentLevel * 25); // Augmente l'énergie
            status.cleanliness = Math.min(status.cleanliness + 25, currentLevel * 25); // Augmente la propreté
            document.getElementById("level").innerText = currentLevel; // Met à jour le niveau affiché
            alert(
                `Niveau ${currentLevel} atteint ! Les statuts augmentent à ${currentLevel * 25}%.`
            );
            updateStatusBars();
        } else if (status.friendship >= 50 && currentLevel === 2) {
            currentLevel = 3;
            status.food = Math.min(status.food + 25, currentLevel * 25); // Augmente la nourriture
            status.energy = Math.min(status.energy + 25, currentLevel * 25); // Augmente l'énergie
            status.cleanliness = Math.min(status.cleanliness + 25, currentLevel * 25); // Augmente la propreté
            document.getElementById("level").innerText = currentLevel; // Met à jour le niveau affiché
            alert(
                `Niveau ${currentLevel} atteint ! Les statuts augmentent à ${currentLevel * 25}%.`
            );
            updateStatusBars();
        } else if (status.friendship >= 75 && currentLevel === 3) {
            currentLevel = 4;
            status.food = Math.min(status.food + 25, currentLevel * 25); // Augmente la nourriture
            status.energy = Math.min(status.energy + 25, currentLevel * 25); // Augmente l'énergie
            status.cleanliness = Math.min(status.cleanliness + 25, currentLevel * 25); // Augmente la propreté
            document.getElementById("level").innerText = currentLevel; // Met à jour le niveau affiché
            alert(
                `Niveau ${currentLevel} atteint ! Les statuts augmentent à ${currentLevel * 25}%.`
            );
            updateStatusBars();
        }
    }

    // Button event listeners
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

    // Actions for the rabbit
    window.feedRabbit = function () {
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

    // Initialize status bars
    updateStatusBars();
});
