# Lapinous — feuille de route

Mise à jour : 5 octobre 2026. Ce fichier remplace les trois anciennes listes « a faire ».
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
- [ ] **À faire — Corriger le README.** Memory et Lapidoku existent ; les fragments améliorent les techniques de 0 à 5, pas simplement « +1 puissance ». Vérifier aussi le texte sur les pénalités de combat.

## Priorité 2 — découverte du jeu et confort

- [ ] **À valider — Ambiance du Nouvel An chinois.** Tunetank (`assets/audio/evenements/nouvel_an_chinois/ambience.mp3`) joue seule à 22 %. Silence final de 5 secondes évité avec un fondu croisé de 1,5 seconde entre fin et début. Écouter et ajuster si nécessaire.
- [x] **Fait — Son de soin de combat.** `assets/audio/combat/soin.mp3` branché sur les soins des techniques et pouvoirs, distinct des sons des besoins.
- [x] **Fait — Son d’impact sur bouclier.** `assets/audio/combat/impact_bouclier.mp3` joué lorsqu’une protection absorbe une attaque.

- [ ] **À faire — SEO.** Suivre `docs/AUDIT_SEO.md` : présentation HTML, titre principal descriptif, URL canonique, exclusion du Dashboard et contrôle de l’indexation.
- [ ] **À faire — Guide de démarrage.** Expliquer les besoins, l’amitié, les fragments et les ultimes en quelques étapes, consultables à nouveau.
- [ ] **À faire — Accessibilité.** Navigation clavier, focus visible, noms accessibles des boutons, contraste des textes et option pour réduire les animations.
- [ ] **À faire — Performance.** Mesurer le chargement sur mobile ; optimiser les décors volumineux et éviter de charger tous les visuels et sons avant qu’ils soient nécessaires.
- [ ] **À faire — Puzzle à réserve de pièces.** Prévoir une zone centrale vide et des pièces à placer depuis une réserve ; conserver l’accès au clic en plus du glisser-déposer.
- [ ] **À faire — Relations des personnages.** Vérifier les relations demandées dans les archives et compléter les données sans contradiction entre fiches.
- [ ] **À valider — Notifications.** Tester durée, fermeture et survol ; réserver les confirmations persistantes aux choix qui le nécessitent.

## Priorité 3 — évolutions de jeu

- [ ] **À faire — Techniques uniques.** Remplacer progressivement les techniques génériques par des effets adaptés à chaque lapin, avec des descriptions précises.
- [ ] **À faire — Nourritures variées.** Boutique avec prix et effets distincts ; afficher clairement les ressources nécessaires.
- [ ] **À faire — Décorations plaçables.** Inventaire, placement par pièce et limites de bonus ; séparer décoration et amélioration fonctionnelle.
- [ ] **À faire — Branches d’amélioration.** Proposer des choix utiles par pièce sans rendre une seule option systématiquement meilleure.
- [ ] **À faire — Records supplémentaires.** Meilleure distance d’agilité, Memory en moins de coups, victoires sans K.O. ; les succès de collection, niveaux, œufs et victoires existent déjà.
- [ ] **À faire — Mode pixel art.** Définir un vrai mode à partir des images de puzzles, avec niveaux et progression distincts.
- [ ] **À faire — Mini-jeux plus variés.** Plusieurs grilles de Lapidoku et niveaux de Memory ; éviter les solutions identiques à chaque partie.

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
- Médias : sons saisonniers rangés dans `assets/audio/evenements/` avec leurs sous-dossiers ; images dans les sous-dossiers Halloween, Noel, Paques, Multi_saisons et Nouvel_An_Chinois de `assets/img/lapin_evenement/`.
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
- [x] Trois articles remplissant les barres du lapin choisi, paiement en carottes et sauvegarde.
- [x] Extracteur remboursant les fragments de la seule compétence choisie, avec confirmation et conservation des autres améliorations.
- [ ] Valider les prix de départ (15 carottes par soin, 30 pour l’extracteur) et ajouter les prochains articles au catalogue.
- [ ] Définir les packs de carottes et le circuit de paiement réel avant d’activer les achats payants.

- [x] Compétences débloquées selon le niveau du lapin : 1, 10, 20, 30, 40, 50 ; fragments indépendants du déblocage.
