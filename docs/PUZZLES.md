# Atelier de puzzles

Les pièces peuvent être posées sur toute case, déplacées ou échangées. Une pièce remplacée par une pièce de la coupelle y retourne. Cliquer sur le titre de la coupelle ou y glisser une pièce permet de la retirer du plateau. Seules deux voisines à leurs emplacements corrects sont cousues en zigzag. La création d’une liaison anime le couturier et révèle le fil pendant une seconde. La victoire attend la dernière couture ; quitter ou recommencer annule cette validation différée. Les records et récompenses restent inchangés.

Visuel : `assets/img/puzzles/couturier.png`, PNG transparent créé avec l’outil intégré imagegen le 7 octobre 2026. Original conservé dans le dossier de génération.

Prompt : Use case: stylized-concept. Asset type: original transparent game character sprite for Warrenfall cozy fantasy rabbit puzzle workshop. One exquisite fluffy silver-gray and cream lop rabbit tailor, full body three-quarter looking LEFT, seated beside three small polished wooden spools wound with sage green, ivory and golden thread. Wearing a beautifully textured plum linen waistcoat and a tiny brass thimble charm, kind amber eyes. Both front paws lifted toward the left holding a delicate sewing needle and a loop of golden thread as if stitching a puzzle. Silky fur, luxurious detailed painterly 3D storybook rendering matching premium cozy collectible game items, warm golden rim light, appealing original character, refined handcrafted textiles. Entire ears feet and spools visible with generous margins, centered square composition. Genuine transparent background. No text, no watermark, no logos, no scene, no border, no other characters.

Validation : `node tests/puzzle-placement.test.cjs`, placement erroné, déplacement, échanges, retour en coupelle, coutures correctes et victoire unique. Aperçu du plateau inspecté sur ordinateur.

## Poses de la couturière fournies

Visuels fournis dans `assets/img/accompagnateurs/couturiere/`, centralisés dans `companions.tailor` de `lapinous-shop.json` : repos, marche, tabouret, couture et félicitations.

## Essai du déplacement sur le plateau

La version précédente est conservée dans `docs/archives/puzzle-couturiere-sur-le-cote/`. La couturière se déplace maintenant depuis son emplacement vers la pièce concernée, coud pendant 1,2 seconde, puis revient pendant 0,6 seconde. Le trajet vers une pièce haute utilise le GIF du tabouret. Le déplacement utilise les coordonnées réelles du plateau et reste à l’intérieur de celui-ci ; les interactions avec les pièces restent possibles pendant l’animation. Les animations appartiennent au plateau affiché et disparaissent lorsqu’il est quitté.


## Ajustement à l’écran — 8 octobre 2026

La coupelle utilise la largeur sous le plateau pour limiter les piles verticales. Le plateau garde son ratio et adapte sa taille à la hauteur disponible. Les commandes restent sous l’atelier. L’aperçu de la pièce sélectionnée est flottant et se ferme au clic ou au clavier ; cliquer à nouveau sur la même pièce annule aussi la sélection. Vérifier petites fenêtres, zoom, grandes grilles et animations avant validation définitive.

### Ajustements du 8 octobre 2026

L’aperçu d’une pièce sélectionnée reste dans la zone de droite et ne recouvre plus le plateau. Cliquer dessus ferme l’aperçu. Toute pièce à sa bonne place devient immédiatement fixe : elle ne peut plus être sélectionnée, glissée, remise dans la coupelle ou remplacée. Les pièces mal placées restent déplaçables ; seules les bonnes voisines déclenchent les coutures.

### Test des derniers niveaux en Admin

Sur localhost, ouvrir Admin (code requis), puis **Tester tous les niveaux des jeux**. Pendant cette session, tous les puzzles et leurs niveaux sont accessibles, même hors événement, ainsi que les 30 niveaux du Memory. Les besoins ne bloquent pas le lancement des puzzles. Aucun niveau n’est marqué terminé par ce déverrouillage ; jouer conserve les effets habituels. Le bouton **Restaurer la partie avant les tests** restitue la sauvegarde capturée au début. Lapidoku dispose actuellement d’une seule grille. Les panneaux de besoins et d’amitié sont masqués pendant les mini-jeux pour ne pas recouvrir leurs éléments.

### Catalogue du Dashboard

Les puzzles se gèrent désormais dans des cartes avec une illustration complète, puis les champs titre, identifiant, chemin, événements et lapins liés. Les boutons Enregistrer et Supprimer conservent leur fonctionnement.

L’aperçu de la pièce sélectionnée occupe désormais une zone dédiée à gauche du plateau. La couturière reste visible dans sa zone à droite.

Le catalogue Dashboard affiche des cartes repliées : clique sur un puzzle pour éditer son titre, identifiant, image, événements et lapins liés. Le filtre Événement permet de sélectionner un événement ou les puzzles de base.
