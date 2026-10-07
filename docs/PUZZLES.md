# Atelier de puzzles

Les pièces peuvent être posées sur toute case, déplacées ou échangées. Une pièce remplacée par une pièce de la coupelle y retourne. Cliquer sur le titre de la coupelle ou y glisser une pièce permet de la retirer du plateau. Seules deux voisines à leurs emplacements corrects sont cousues en zigzag. La création d’une liaison anime le couturier et révèle le fil pendant une seconde. La victoire attend la dernière couture ; quitter ou recommencer annule cette validation différée. Les records et récompenses restent inchangés.

Visuel : `assets/img/puzzles/couturier.png`, PNG transparent créé avec l’outil intégré imagegen le 7 octobre 2026. Original conservé dans le dossier de génération.

Prompt : Use case: stylized-concept. Asset type: original transparent game character sprite for Lapinous cozy fantasy rabbit puzzle workshop. One exquisite fluffy silver-gray and cream lop rabbit tailor, full body three-quarter looking LEFT, seated beside three small polished wooden spools wound with sage green, ivory and golden thread. Wearing a beautifully textured plum linen waistcoat and a tiny brass thimble charm, kind amber eyes. Both front paws lifted toward the left holding a delicate sewing needle and a loop of golden thread as if stitching a puzzle. Silky fur, luxurious detailed painterly 3D storybook rendering matching premium cozy collectible game items, warm golden rim light, appealing original character, refined handcrafted textiles. Entire ears feet and spools visible with generous margins, centered square composition. Genuine transparent background. No text, no watermark, no logos, no scene, no border, no other characters.

Validation : `node tests/puzzle-placement.test.cjs`, placement erroné, déplacement, échanges, retour en coupelle, coutures correctes et victoire unique. Aperçu du plateau inspecté sur ordinateur.

## Poses de la couturière fournies

Visuels dans `assets/img/puzzle/` : `couturiere.png` au repos, `deplace_tabouret.gif` pendant 1,08 seconde pour préparer une couture haute, `cout_les_pieces.gif` pendant 1,2 seconde pour coudre, puis retour au repos. Pour les pièces du bas, la pose au repos se déplace pendant 0,6 seconde avant la couture ; aucun fichier distinct de marche n’est présent. `couturiere_felicitation.png` apparaît à la victoire. Une séquence ancienne ne remplace pas un nouveau puzzle ni une couture plus récente.

## Essai du déplacement sur le plateau

La version précédente est conservée dans `docs/archives/puzzle-couturiere-sur-le-cote/`. La couturière se déplace maintenant depuis son emplacement vers la pièce concernée, coud pendant 1,2 seconde, puis revient pendant 0,6 seconde. Le trajet vers une pièce haute utilise le GIF du tabouret. Le déplacement utilise les coordonnées réelles du plateau et reste à l’intérieur de celui-ci ; les interactions avec les pièces restent possibles pendant l’animation. Les animations appartiennent au plateau affiché et disparaissent lorsqu’il est quitté.
