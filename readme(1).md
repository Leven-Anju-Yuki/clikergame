# 🐰 Lapinous

Lapinous est un jeu de collection et de gestion de lapins virtuels. Le joueur adopte un compagnon, s'occupe de ses besoins, développe son amitié, collectionne de nouveaux lapins grâce aux œufs, joue à des mini-jeux et affronte les boss légumes du jardin.

Le projet fonctionne comme un petit jeu web responsive, avec un univers visuel composé de plusieurs pièces, une encyclopédie, des événements saisonniers et un Dashboard permettant de gérer le contenu sans modifier directement tout le code.

## ✨ Fonctionnalités

- **Adoption** : choisis un lapin commun au démarrage ou découvre certains compagnons particuliers.
- **Progression indépendante par lapin** : nourriture, sommeil, propreté, amitié, niveau, améliorations et progression dans les mini-jeux sont propres à chaque compagnon.
- **Salon vivant** : les lapins possédés apparaissent directement dans la pièce et peuvent devenir le compagnon actif.
- **5 pièces principales** : Salon, Cuisine, Chambre, Salle de bain et Jardin.
- **Besoins du lapin** : nourriture, sommeil, propreté et amitié.
- **Améliorations des pièces** : certaines actions peuvent être améliorées grâce à l'amitié.
- **Mini-jeu d'agilité** : disponible dans le Jardin.
- **Coin jeux dans le Salon** : accès aux mini-jeux depuis un plateau de jeux intégré au décor.
- **Puzzles** : plusieurs images sont proposées avec différents nombres de pièces. Les puzzles et leurs liens avec les lapins sont gérés dans un JSON séparé.
- **Progression des puzzles** : il faut terminer un niveau pour accéder au suivant, et terminer un puzzle pour débloquer le suivant.
- **Mini-jeux prévus** : Memory avec les personnages et Lapidoku.
- **Aventures & combats** : combats contre les boss légumes avec PV, animations d'attaque et jauges de pouvoir critique.
- **Fatigue de combat** : une défaite, ou une fin de combat dans un état critique, peut faire tomber la nourriture, le sommeil et la propreté à 0.
- **Pouvoirs** : le champ `power` du contenu décrit le pouvoir spécial / critique du lapin ou du boss.
- **Œufs et collection** : les carottes permettent d'acheter des œufs et d'obtenir de nouveaux compagnons.
- **Doublons** : un doublon peut servir à renforcer l'attaque du lapin ou être converti en carottes. Une fois le renforcement maximal atteint, les doublons donnent uniquement des carottes.
- **Événements saisonniers** : Halloween, Noël et Pâques, avec lapins spécifiques et périodes configurables.
- **Encyclopédie** : fiches des lapins et boss découverts, informations, pouvoirs, progression d'attaque et puzzles liés.
- **Sauvegardes** : sauvegardes nommées et exportables en JSON.
- **Dashboard administrateur** : gestion des lapins, boss, événements, taux d'œufs, puzzles, statistiques et contrôle des visuels.

## 🎮 Mini-jeux

### Puzzle

Les puzzles sont définis dans `lapinous-puzzles.json` afin de pouvoir en ajouter facilement sans modifier la logique principale du jeu.

Chaque puzzle peut notamment contenir :

- un identifiant ;
- un titre ;
- le chemin de son image ;
- les lapins auxquels il est lié ;
- plusieurs niveaux de difficulté / nombres de pièces.

La progression est sauvegardée séparément pour chaque lapin.

### À venir

- **Memory** : jeu de mémoire utilisant les nombreux personnages du jeu.
- **Lapidoku** : variante de Sudoku utilisant les lapins comme symboles.

## ⚔️ Combats

Les combats se déroulent directement sur un décor dédié.

Chaque combattant possède :

- des points de vie ;
- une jauge de pouvoir / critique ;
- un pouvoir défini dans le contenu ;
- une difficulté ou puissance ;
- des animations d'attaque et de réaction aux coups.

Les boss utilisent leur propre visuel mystère dans l'Encyclopédie tant qu'ils n'ont pas été rencontrés.

## 🥚 Doublons et renforcement

Lorsqu'un lapin déjà possédé ressort d'un œuf :

- le joueur peut récupérer des carottes ;
- ou utiliser le doublon pour renforcer son attaque ;
- **1 fragment = +1 puissance** ;
- une fois la barre de renforcement terminée, les doublons suivants sont automatiquement convertis en carottes.

## 🎃 Événements

Le jeu prévoit des contenus saisonniers, notamment :

- 🎃 Halloween ;
- 🎄 Noël ;
- 🐣 Pâques ;
- des personnages pouvant appartenir à plusieurs saisons.

Le Dashboard permet de rechercher et filtrer les lapins par événement.

## 🗂️ Structure du projet

L'arborescence ci-dessous reprend l'organisation actuelle du projet. Les dossiers contenant de très nombreux personnages sont volontairement résumés pour garder le README lisible.

```text
Lapinous/
├── index.html                         # Jeu principal
├── dashboard.html                     # Dashboard administrateur
├── lapinous-content.json              # Lapins, boss, taux d'œufs, événements...
├── lapinous-puzzles.json              # Catalogue et configuration des puzzles
├── readme.md
├── a faire.txt
├── arborescence.txt
│
├── .vscode/
│   └── settings.json
│
├── assets/
│   ├── css/
│   │   ├── bootstrap.min.css
│   │   └── style.css                  # Styles du jeu, responsive, pièces, combats...
│   │
│   ├── js/
│   │   ├── bootstrap.min.js
│   │   ├── jquery-3.6.1.min.js
│   │   ├── script.js                  # Logique principale du jeu
│   │   ├── species-data.js            # Chargement et fonctions partagées du contenu
│   │   ├── puzzle-data.js             # Chargement des puzzles
│   │   ├── dashboard.js               # Gestion du Dashboard
│   │   └── dashboard-access.js        # Protection par code du Dashboard
│   │
│   └── img/
│       ├── page.jpg                    # Texture papier historique
│       ├── regle.png
│       ├── lapin_soin.gif
│       │
│       ├── fond/                       # Décors principaux du jeu
│       │   ├── salon.png
│       │   ├── cuisine.png
│       │   ├── chambre.png
│       │   ├── salle_de_bain.png
│       │   ├── jardin.png
│       │   └── combat.png
│       │
│       ├── ui/
│       │   └── paper_dashboard_bg.jpg # Fond papier Dashboard / Encyclopédie
│       │
│       ├── species/                    # Lapins principaux
│       │   ├── mystery.svg
│       │   ├── azazel_face.png
│       │   ├── azazel_cote.png
│       │   └── ...
│       │
│       ├── az/                         # Visuels historiques / spécifiques d'Azazel
│       │   └── ...
│       │
│       ├── lapin_evenement/            # Lapins Halloween / Noël / Pâques...
│       │   └── ...
│       │
│       ├── boss/                       # Visuels des boss légumes
│       │   ├── carotte_face.png
│       │   ├── carotte_cote.png
│       │   ├── mais_face.png
│       │   └── ...
│       │
│       ├── bosses/
│       │   └── mystery_boss.svg        # Visuel mystère réservé aux boss
│       │
│       ├── breeds/                     # Icônes des traits / profils
│       │   ├── normal.svg
│       │   ├── glouton.svg
│       │   ├── grand_sportif.svg
│       │   ├── gros_dormeur.svg
│       │   ├── petit_dormeur.svg
│       │   ├── petit_mangeur.svg
│       │   └── maladroit.svg
│       │
│       ├── puzzle/                     # Images utilisées par les puzzles
│       │   ├── les_communs.png
│       │   ├── les_aventuriers.png
│       │   ├── les_scientifiques.png
│       │   ├── voie_lactee.png
│       │   └── ...
│       │
│       ├── Zone_cuisine/
│       │   ├── lapin_cuisine.png
│       │   ├── carotte.png
│       │   └── pomme.png
│       │
│       ├── Zone_Chambre/
│       │   ├── dodo.png
│       │   ├── panier.png
│       │   └── lit.png
│       │
│       ├── Zone_SdB/
│       │   ├── lapin_SdB.png
│       │   ├── brosse.png
│       │   └── pommeau.png
│       │
│       ├── Zone_jardin/
│       │   ├── entrenement.png
│       │   ├── dressage.png
│       │   └── agilite.webp
│       │
│       └── images des futur création/  # Assets préparés pour de futurs contenus
│           ├── boss/
│           └── lapin/
│               ├── commun/
│               ├── elements/
│               ├── haloween_2027/
│               └── saison/
│
├── liste de futur création/
│   ├── future_boss.md
│   └── futur_lapin.md
│
├── sauvegarde/
│   └── *.json
│
└── _a_verifier_avant_suppression/      # Anciens fichiers à contrôler avant suppression
    └── ...
```

### Remarque sur les anciens GIF

Les dossiers des pièces contiennent encore certains anciens `.gif`, mais le jeu utilise désormais les nouveaux visuels `.png` pour la Cuisine, la Chambre, la Salle de bain et le Jardin. Ils peuvent être conservés provisoirement avant nettoyage définitif.

## 🧩 Ajouter un puzzle

Le plus simple est de passer par le Dashboard, mais le fichier peut aussi être édité directement dans `lapinous-puzzles.json`.

Exemple :

```json
{
  "id": "mon_puzzle",
  "title": "Mon puzzle",
  "image": "./assets/img/puzzle/mon_puzzle.png",
  "linkedSpecies": ["azur", "caramel"]
}
```

Les lapins liés servent à préparer les futures interactions entre les mini-jeux, la progression et les fiches de personnages.

## 🛠️ Dashboard

Le Dashboard permet notamment de :

- ajouter et modifier les lapins ;
- ajouter et modifier les boss ;
- rechercher les personnages ;
- filtrer les lapins par événement ;
- configurer les taux d'œufs ;
- régler la durée des événements ;
- gérer les puzzles et leurs lapins liés ;
- vérifier les visuels manquants ;
- consulter les graphiques de rareté et de difficulté ;
- exporter / importer les JSON de contenu.

## 🚀 Lancer le projet en local

Le jeu charge ses données avec `fetch()`. Il faut donc utiliser un petit serveur local plutôt que d'ouvrir directement `index.html` par double-clic.

### Avec Python

Depuis la racine du projet :

```bash
python -m http.server 8000
```

Puis ouvrir :

```text
http://localhost:8000/
```

## 🌐 Mise en ligne

Le projet peut être hébergé comme site statique, par exemple sur GitHub Pages.

Attention : sur un hébergement Linux, **les majuscules/minuscules dans les chemins de fichiers sont importantes**. Les noms utilisés dans le code doivent correspondre exactement aux dossiers présents, notamment :

```text
Zone_cuisine
Zone_Chambre
Zone_SdB
Zone_jardin
```

Les décors principaux sont désormais en `.png` dans `assets/img/fond/`.

## 💾 Sauvegardes

Les sauvegardes conservent notamment :

- le lapin actif ;
- les lapins possédés ;
- les besoins ;
- le niveau et l'amitié ;
- les carottes et les œufs ;
- les améliorations ;
- les doublons et renforcements ;
- la progression dans les mini-jeux ;
- les boss rencontrés.

## 🔮 Développements prévus

Le projet continue d'évoluer. Parmi les pistes déjà prévues :

- Memory avec les personnages ;
- Lapidoku ;
- nouveaux puzzles ;
- nouvelles compétences de combat ;
- nouveaux boss ;
- nouveaux lapins communs et événementiels ;
- événements saisonniers supplémentaires ;
- sons et ambiances propres aux événements.

## 👩‍💻 Autrice

- [Florie](https://github.com/Leven-Anju-Yuki) — développeuse principale

## 📄 Licence

Ce projet est sous licence [MIT](https://opensource.org/licenses/MIT). Voir le fichier `LICENSE` pour plus de détails.
