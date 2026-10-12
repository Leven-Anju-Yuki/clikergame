# Lapinous — feuille de route

Mise à jour : 8 octobre 2026. Ce fichier remplace les trois anciennes listes « a faire ».
Les originaux sont conservés dans `docs/archives/a-faire/`. Les catalogues de personnages
restent dans `liste de futur création/` : ce sont des idées de contenu, pas une liste de tâches réalisées.

Statuts : **À faire** = prévu ; **À valider** = code présent, résultat à vérifier en jeu ;
**Idée** = nouvelle proposition, pas encore développée. Une présence dans le code ne vaut pas validation visuelle.

## Priorité 1 — fiabiliser la version actuelle

- [ ] **À valider — Placement des lapins et commandes.** Tester Jardin, Cuisine, Chambre et Salle de bain à 1366×768, 1920×1080 et sur mobile. Aucun lapin sous la barre d’amitié, aucun bouton coupé ; vérifier aussi les animations de soin.
- [ ] **À valider — Préparation du combat.** Équipe de 1, 2 et 3 lapins : puissance du boss toujours visible, statistiques lisibles jusqu’à l’ultime, défilement sans masquer les commandes.
- [ ] **À faire — Équilibrage des boss.** Mesurer tours nécessaires et taux de victoire avec niveaux 1, 20, 40, 60, 80 et 100 ; inclure équipe mixte et Azazel. Les boss ont déjà des PV et dégâts renforcés, mais l’équilibre n’est pas démontré.
- [ ] **À faire — Indicateur de difficulté plus fiable.** Actuellement fondé sur le rapport des puissances ; intégrer PV, techniques débloquées, soins et protections avant de promettre qu’un combat est « faisable ».
- [ ] **À valider — Progression.** Vérifier le plafond 100, les œufs aux niveaux 20/40/60/80/100 et les paliers d’Azazel sans récompense répétée après chargement.
- [ ] **À valider — Sauvegardes.** Ancienne partie, export/import, fragments, succès récupérés et progression par lapin doivent être conservés.
- [ ] **À valider — Sons.** Tester les deux sons de game over ensemble, les ambiances saisonnières, volume et coupure. Les fichiers audio sont désormais présents : l’ancien blocage « MP3 manquants » est obsolète.
- [x] **Fait — README et arborescence actualisés.** Mini-jeux, fragments, magasin, apothicaire, médias et restriction administrateur local documentés le 8 octobre 2026.

## Priorité 2 — découverte du jeu et confort

- [ ] **À valider — Ambiance du Nouvel An chinois.** Tunetank (`assets/audio/evenements/nouvel_an_chinois/ambience.mp3`) joue seule à 22 %. Silence final de 5 secondes évité avec un fondu croisé de 1,5 seconde entre fin et début. Écouter et ajuster si nécessaire.
- [x] **Fait — Son de soin de combat.** `assets/audio/combat/soin.mp3` branché sur les soins des techniques et pouvoirs, distinct des sons des besoins.
- [x] **Fait — Son d’impact sur bouclier.** `assets/audio/combat/impact_bouclier.mp3` joué lorsqu’une protection absorbe une attaque.

- [ ] **À faire — SEO.** Suivre `docs/AUDIT_SEO.md` : présentation HTML, titre principal descriptif, URL canonique, exclusion du Dashboard et contrôle de l’indexation.
- [ ] **À faire — Guide de démarrage.** Expliquer les besoins, l’amitié, les fragments et les ultimes en quelques étapes, consultables à nouveau.
- [ ] **À faire — Accessibilité.** Navigation clavier, focus visible, noms accessibles des boutons, contraste des textes et option pour réduire les animations.
- [ ] **À faire — Performance.** Mesurer le chargement sur mobile ; optimiser les décors volumineux et éviter de charger tous les visuels et sons avant qu’ils soient nécessaires.
- [ ] **À valider — Puzzle à coupelle et couturière.** Code livré : placement libre, clic et glisser-déposer, coutures dorées en zigzag, déplacement et félicitations. Vérifier les grandes grilles, le mobile et les animations des pièces hautes/basses.
- [ ] **À faire — Relations des personnages.** Vérifier les relations demandées dans les archives et compléter les données sans contradiction entre fiches.
- [ ] **À valider — Notifications.** Tester durée, fermeture et survol ; réserver les confirmations persistantes aux choix qui le nécessitent.

## Priorité 3 — évolutions de jeu

- [ ] **À faire — Techniques uniques.** Remplacer progressivement les techniques génériques par des effets adaptés à chaque lapin, avec des descriptions précises.
- [ ] **À faire — Nourritures variées.** Boutique avec prix et effets distincts ; afficher clairement les ressources nécessaires.
- [ ] **À faire — Décorations plaçables.** Inventaire, placement par pièce et limites de bonus ; séparer décoration et amélioration fonctionnelle.
- [ ] **À faire — Branches d’amélioration.** Proposer des choix utiles par pièce sans rendre une seule option systématiquement meilleure.
- [ ] **À faire — Records supplémentaires.** Meilleure distance d’agilité, Memory en moins de coups, victoires sans K.O. ; les succès de collection, niveaux, œufs et victoires existent déjà.
- [ ] **À faire — Mode pixel art.** Définir un vrai mode à partir des images de puzzles, avec niveaux et progression distincts.
- [ ] **À faire — Mini-jeux plus variés.** Ajouter des grilles de Lapidoku ; les 30 niveaux de Memory avec lapins et boss sont déjà présents et restent à équilibrer.

## Nouvelles idées à sélectionner

- [ ] **Idée — Équipes favorites.** Enregistrer trois compositions et les rappeler lors du choix du boss.
- [ ] **Idée — Boss à comportements distincts.** Attaque annoncée à l’avance, phases et points faibles pour donner une utilité aux protections et aux soins.
- [ ] **Idée — Défis de combat.** Victoire avec un seul lapin ou sans ultime, récompense unique plutôt que farming illimité.
- [ ] **Idée — Journal de collection.** Recherche et filtres par rareté, événement, niveau et technique ; montrer les objectifs encore accessibles.
- [ ] **Idée — Expéditions courtes.** Envoyer un compagnon chercher des matériaux pendant une durée choisie, sans perte punitive en cas d’absence.
- [ ] **Idée — Albums saisonniers.** Objectifs propres à Halloween, Noël et Pâques avec suivi des récompenses et calendrier visible.
- [ ] **Idée — Sauvegarde de secours.** Conserver une précédente sauvegarde locale et rappeler périodiquement l’export JSON.

## Déjà présent dans le code — ne pas redemander comme nouveauté

- Nouvel An chinois : calendrier variable, fenêtre réglable, fonds jour/nuit, camembert et filtre Dashboard ; six fiches de raretés variées avec lore, relations et techniques. À valider visuellement ; compléter la vue de face de Yuehua et contrôler les dates après 2028.
- Médias : sons saisonniers rangés dans `assets/audio/evenements/` avec leurs sous-dossiers ; images dans les sous-dossiers Halloween, Noel, Paques, Multi_saisons et Nouvel_An_Chinois de `assets/img/lapins_jouables/lapin_evenement/`.
- Encyclopédie : fiches ouvertes en haut et position de liste conservée au retour. À valider visuellement sur ordinateur et mobile.

- Adoption, traits aléatoires, collection et encyclopédie avec choix du compagnon.
- Progression indépendante, soins, niveaux, œufs et doublons convertibles en fragments.
- Combat au tour par tour jusqu’à trois lapins, modes manuel/automatique, techniques et ultime.
- Aperçu des PV, attaques et puissances ; comparaison de la puissance de l’équipe et du boss.
- Puzzle, runner d’agilité, Memory et Lapidoku 4×4.
- Défis quotidiens, grands succès et records avec récompenses récupérables.
- Événements saisonniers, décors et sons ; deux sons simultanés au game over.
- Dashboard de contenu et sauvegardes nommées/exportables.

## Catalogues et historique

- `liste de futur création/futur_lapin.md` : concepts de futurs lapins.
- `liste de futur création/future_boss.md` : concepts de futurs boss.
- `docs/archives/a-faire/` : demandes originales, retours et relations détaillées.
- `docs/AUDIT_SEO.md` : constats et actions SEO, indépendants des évolutions de gameplay.

## Magasin du terrier

- [x] Magasin avec caissier en débord, pose de présentation et pose de remerciement.
- [x] Trois soins achetés en carottes et stockés dans l’inventaire, utilisables sur le lapin actif ; sauvegarde des quantités.
- [x] Extracteur remboursant les fragments de la seule compétence choisie, avec confirmation et conservation des autres améliorations.
- [ ] Valider les prix de départ (15 carottes par soin, 30 pour l’extracteur) et ajouter les prochains articles au catalogue.
- [ ] Définir les packs de carottes et le circuit de paiement réel avant d’activer les achats payants.

- [x] Compétences débloquées selon le niveau du lapin : 1, 10, 20, 30, 40, 50 ; fragments indépendants du déblocage.

## Évolutions livrées et validations — 8 octobre 2026

- [x] **Fait — Panier regroupé.** Images, quantités +/−, retrait, validation complète avant débit et total/paiement hors de la zone défilante.
- [x] **Fait — Rayons séparés.** Consommables illustrés avec détails au survol/focus ; extracteur et liste des lapins côte à côte dans Fragments.
- [x] **Fait — Inventaire indépendant.** Bouton 🌿, meuble de 12 tiroirs, emplacements fixes répartis entre les rangées, produits absents sans image, fiche de détail claire au survol.
- [x] **Fait — Apothicaire.** Sept nouvelles poses et GIF intégrés : accueil, attente, marche gauche/miroir droite, récupération basse/moyenne/haute et remise au retour. Déplacement horizontal et annulation du soin à la fermeture.
- [x] **Fait — Médias rangés.** Accompagnateurs dans `assets/img/accompagnateurs/`, poses centralisées dans `lapinous-shop.json` ; lapins dans `lapins_jouables/sans_evenements/` et `lapins_jouables/lapin_evenement/` ; SVG boss dans `boss/`. Conversion des anciens chemins de portraits du Dashboard.
- [x] **Fait — Memory étendu.** 30 niveaux de 3 à 36 paires avec lapins et boss et animation de collecte.
- [x] **Fait — Fragments d’Azazel.** Un fragment obtenu à chaque niveau gagné ; vérifier absence de doublon de récompense après chargement.
- [ ] **À valider — Boutique et apothicaire en situation réelle.** Ordinateur, mobile, zoom navigateur, longue liste de lapins, survol/clavier/toucher, total visible, pieds au sol, sens du GIF et remise après arrivée. Prix 15/30 à équilibrer.
- [ ] **À valider — Memory.** Déblocage, records et sauvegardes anciennes ; vérifier les 30 niveaux et le confort des grilles de 36 paires.
- [ ] **À valider — Migration des images.** Charger une ancienne partie et des portraits personnalisés du Dashboard après le rangement ; vérifier les chemins et la casse sur l’hébergement Linux.
- [ ] **À faire — Publication.** Garder magasin, inventaire et juridique en administrateur local jusqu’à validation ; terminer les documents, droits des visuels et audio, packs et paiement avant ouverture publique.

## Maintien du suivi

Après chaque changement : actualiser ce fichier, les fonctionnalités et l’arborescence du README, puis les cartes concernées du [Trello](https://trello.com/b/5VmsAFi7/clikergame). Séparer code livré et validation en jeu ; conserver les tâches encore ouvertes. La synchronisation se fait pendant les interventions, sans tâche de fond automatique.

- [x] **Fait — Tests des besoins admin.** Curseurs nourriture/sommeil/propreté du compagnon actif et bouton 25 %, restauration de la partie de test conservée.
- [x] **Fait — Atelier adapté à la hauteur.** Coupelle horizontale, aperçu refermable et cartes Memory dimensionnées selon les rangées.
- [ ] **À valider — Jeux sans défilement.** Tester petites fenêtres, mobile et zoom, puzzles à beaucoup de pièces, Memory 36 paires et Lapidoku ; vérifier lisibilité et commandes accessibles.

### Mise à jour du 8 octobre 2026 — accueil et administration

- [x] Afficher Bonjour pendant la pose d’accueil de l’apothicaire.
- [x] Brancher le son d’activation du bouclier.
- [x] Accéder au Dashboard depuis le panneau Admin et retirer son cadenas de l’encyclopédie.
- [x] Configurer la visibilité des fonctions dans le Dashboard et exporter ces choix avec le contenu.
- [ ] Valider à l’écoute le volume de l’activation du bouclier et vérifier les choix de visibilité sur le site publié après export.

### Puzzles et Memory — 8 octobre 2026

- [x] Déplacer l’aperçu hors du plateau pour laisser toutes les cases accessibles.
- [x] Verrouiller les pièces correctes, y compris contre un remplacement ou un glisser-déposer.
- [x] Réduire la hauteur des cartes et commandes du Memory ; prévisualisation à 1250 × 720.
- [ ] Valider les plus grands niveaux du Memory sur petit écran avec les panneaux du jeu.

### Corrections du 8 octobre 2026 — cartes, tests et sauvegardes

- [x] Empêcher les panneaux de besoins et d’amitié de cacher les cartes pendant les mini-jeux.
- [x] Donner accès à tous les niveaux Memory et puzzles pendant les tests Admin, événements inclus.
- [x] Empêcher l’ancien nom global de contaminer un autre lapin au rechargement.
- [ ] Vérifier en jeu les noms déjà affectés : ne pas réinitialiser automatiquement les noms personnalisés.

### Dashboard et œufs — 8 octobre 2026

- [x] Contenir les curseurs et libellés des besoins dans le panneau Admin.
- [x] Afficher les taux par rareté dans les ouvertures d’un ou dix œufs, avec actualisation après enregistrement Dashboard.
- [x] Remplacer le tableau puzzles par des cartes illustrées et conserver leurs actions.
- [ ] Vérifier visuellement les cartes Dashboard sur mobile et les ouvertures d’œufs avec le son.

### Navigation Dashboard — 8 octobre 2026

- [x] Déplacer l’aperçu des puzzles à gauche en conservant la couturière visible.
- [x] Ajouter le JSON magasin au Dashboard avec validation, essai local et export.
- [x] Regrouper les sections dans des accordéons avec un menu d’accès rapide.
- [ ] Valider l’édition du catalogue et les accordéons sur mobile.

### Présentation Dashboard et œufs — 8 octobre 2026

- [x] Cartes illustrées repliables pour puzzles et produits, filtre puzzles par événement.
- [x] Accompagnateurs séparés dans un tableau éditable.
- [x] Menu dans le header fixe et Dashboard élargi, tables contenues horizontalement.
- [x] Visuels des œufs avant leurs taux et accès aux taux avant ouverture.
- [x] Sélecteur de compétences lisible ; message explicite lorsqu’aucune attaque ne peut être améliorée.
- [x] Arborescence README avec poids des fichiers, des dossiers et total.
- [ ] Valider les cartes et tableaux du Dashboard sur plusieurs tailles d’écran.

### Cuisine et évolutions — 8 octobre 2026

- [x] Cinq étapes par évolution ; déblocages aux niveaux d’amitié 5/10/15/20 puis coûts 25/50/100/200 carottes.
- [x] Marché, aliments plus efficaces, réserve en caisses et recettes à bonus temporaires.
- [x] Préserver les stocks existants et les anciennes améliorations.
- [ ] Fournir le visuel dédié du Chef (visuel cuisine provisoire configuré dans le catalogue).
- [ ] Valider l’équilibrage des prix, ingrédients et bonus sur une partie longue.

### Frigo et Marché — 8 octobre 2026

- [x] Ouvrir la réserve au clic sur le frigo, laisser le fond de cuisine visible.
- [x] Remplacer les aliments du Marché par fruits/légumes/fleurs distincts de la nourriture de base.
- [x] Retirer le panier du Marché et suspendre plats/bonus sans supprimer leurs données.
- [ ] Revoir attaques, défenses et soins avant de reprendre les plats spéciaux.
- [ ] Valider la zone du frigo sur tous les fonds saisonniers et écrans étroits.
