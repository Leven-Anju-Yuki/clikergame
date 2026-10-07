# Magasin du terrier

Les soins achetés sont stockés dans un inventaire partagé, sauvegardé avec la partie. Ils n’ont pas de destinataire à l’achat : tu peux acheter plusieurs exemplaires et utiliser une unité depuis l’onglet Inventaire sur le lapin actif de ton choix. Une barre pleine ne consomme rien. Seul l’extracteur demande de choisir un lapin et une compétence, et agit au paiement. Le panier affiche les images des produits, leurs emojis et le total avant confirmation. Le panier reste en fermant le magasin, mais pas après rechargement ou changement de partie.

## Articles et prix de départ

- Infusion douce : énergie/sommeil à 100 %, 15 carottes.
- Bain de pétales : propreté à 100 %, 15 carottes.
- Panier gourmand : nourriture à 100 %, 15 carottes.
- Extracteur de fragments : 30 carottes. Seule la compétence choisie revient à 0/5 ; ses fragments sont rendus au même lapin. Les autres améliorations restent intactes. Le déblocage dépend uniquement du niveau : 1, 10, 20, 30, 40 et 50 selon le nombre de compétences de sa rareté. Le panier affiche la compétence et le montant récupéré avant paiement.

Les soins peuvent être achetés avec une barre pleine pour être conservés. Aucun article n’est consommé sur une barre pleine. Aucun achat n’est validé si le solde est insuffisant ou si un extracteur ne peut pas récupérer de fragments. Le magasin n’est pas accessible pendant un combat. Le remboursement de fragments ne les transfère pas entre lapins.

## Ajouter ou ajuster un article

Catalogue : `lapinous-shop.json`. Chaque article possède un `id` unique, un nom, une description, un emoji, un prix entier positif et un effet : `restore` avec `stat` (`food`, `energy` ou `cleanliness`), ou `reset`. Les nouveaux effets nécessitent une implémentation dans `assets/js/shop.js` ; aucune exécution de code provenant du JSON n’est prévue.

Le rayon Carottes est préparé, mais aucun achat avec de l’argent réel n’est disponible. Mettre `carrotPurchasesEnabled` à `true` ne suffit pas à activer un paiement : aucune facturation ni attribution payante n’est implémentée. Le prestataire, les packs, le serveur de validation et les conditions doivent être définis pour une intégration future.

## Caissier et poses

Les deux images originales sont intégrées dans le catalogue :

- `assets/img/magasin/caissier_presentation.png` : trois-quarts vers la gauche, patte tendue vers les articles.
- `assets/img/magasin/caissier_merci.png` : sourire et pattes réunies pour remercier après l’achat ; retour à la présentation après quatre secondes.

Sur ordinateur, le caissier déborde à droite de la fenêtre. Sur mobile, il déborde du haut afin de laisser les articles accessibles. Les images sont préchargées, avec transparence PNG conservée. Le nom et les chemins sont configurables dans `cashier`. Le caissier n’est pas ajouté à la collection de lapins jouables.

Création : outil intégré imagegen, le 7 octobre 2026. Original de présentation puis modification de pose à partir de cet original. Cela documente la création, sans constituer une certification juridique. Les originaux sont conservés dans le dossier de génération ; les copies utilisées sont dans le projet.

### Prompts utilisés

**Présentation (stylized-concept)** : Create one finished game sprite for Lapinous, a warm cozy fantasy game of collectible rabbits, carrots, care and vegetable adventures. An ORIGINAL friendly rabbit shopkeeper cashier: small fluffy chestnut-and-cream lop rabbit, expressive brown eyes, upright sitting stance, simple olive-green linen shop apron with two little pockets and a small carrot-shaped wooden clasp, cream linen neckerchief. Render as polished soft painterly 3D fantasy collectible character, detailed silky fur and gentle warm lighting, not photoreal human, not cartoon franchise. Full body including ears and feet with comfortable transparent margin. Three-quarter view looking toward the LEFT, one forepaw extended toward the left in a welcoming presentation gesture as if showing shop articles. He will be placed outside the RIGHT edge of a shop modal pointing left toward products. Only this rabbit character, no counter, no scene, no text, no watermark, no extra characters. Genuine transparent background. Save for use as an in-game portrait.

**Remerciement (identity-preserve)** : The attached image is the edit target: the ORIGINAL Lapinous rabbit shopkeeper. Create his SECOND pose sprite, a warm thank-you after purchasing. Preserve exactly the same rabbit’s chestnut and cream fur patterns, lop ears, brown eyes, face proportions, cream linen neckerchief, olive linen apron with pockets and carrot clasp, polished softly lit painterly 3D rendering style. Change only pose and friendly expression: fully visible body facing viewer slightly three-quarter, paws brought together near chest in a grateful greeting, a gentle small bow and joyful closed-eye smile as if saying thank you. No other objects or people. Same full-body proportions and framing with transparent margins, ears and feet fully visible. Actual transparent background, no text, no logo, no border, no scene.

## Vérifications

`node tests/shop.test.cjs` : barres, paiement, solde insuffisant, conservation des fragments, conservation des autres compétences, compatibilité de l’ancienne progression et validation des articles. Syntaxe de `shop.js` et `script.js` vérifiée. Interface regardée sur ordinateur (1365 × 900) et mobile (390 × 844) avec une partie fictive isolée : confirmation, limites de la fenêtre et changement de pose après achat.

Panier : portraits des lapins dans la sélection et les lignes d’achat, plusieurs destinataires, retrait d’articles et total avant paiement. Validation de tout le panier sur des copies avant toute dépense : un refus ne produit aucun achat partiel. Tests de paiement groupé et interface vérifiés avec une partie fictive sur ordinateur et mobile ; achat de deux articles pour deux lapins, 30 carottes débitées, aucune erreur JavaScript.

## Visuels des produits

Quatre PNG transparents créés avec l’outil intégré imagegen le 7 octobre 2026, dans `assets/img/magasin/produits/`. Les chemins sont définis par le champ `image` de chaque article dans `lapinous-shop.json`. Les emojis restent affichés à côté des noms dans le panier. Les originaux de génération sont conservés.

### Prompts des produits

**infusion_douce** : Use case: stylized-concept. Asset type: premium item sprite for Lapinous cozy rabbit fantasy game store. Create one exquisite original collectible product illustration, polished painterly 3D storybook rendering, luxurious handcrafted textures, luminous soft golden rim lighting, exceptionally beautiful miniature fantasy object with strong readable silhouette at 180px. Centered three-quarter view, entire object visible, square composition with comfortable margins. Genuine transparent background. No text, no logos, no watermark, no characters, no scene, no border. Subject: Infusion douce, a charming ivory ceramic teacup with small sculpted rabbit-ear handle, warm amber herbal tea, delicate curling glowing steam and tiny chamomile blossoms, resting on a leaf-shaped sage ceramic saucer. Refined gold edging and subtle floral glaze, restful magical glow.

**bain_petales** : Use case: stylized-concept. Asset type: premium item sprite for Lapinous cozy rabbit fantasy game store. Create one exquisite original collectible product illustration, polished painterly 3D storybook rendering, luxurious handcrafted textures, luminous soft golden rim lighting, exceptionally beautiful miniature fantasy object with strong readable silhouette at 180px. Centered three-quarter view, entire object visible, square composition with comfortable margins. Genuine transparent background. No text, no logos, no watermark, no characters, no scene, no border. Subject: Bain de pétales, a tiny gorgeous oval carved wooden bathing tub with copper hoops filled with shimmering turquoise water, soft pearly soap bubbles and pink rose petals, folded cream linen towel draped over edge and one delicate flower. Fresh luminous aqua reflections, warm wood grain, whimsical spa luxury.

**panier_gourmand** : Use case: stylized-concept. Asset type: premium item sprite for Lapinous cozy rabbit fantasy game store. Create one exquisite original collectible product illustration, polished painterly 3D storybook rendering, luxurious handcrafted textures, luminous soft golden rim lighting, exceptionally beautiful miniature fantasy object with strong readable silhouette at 180px. Centered three-quarter view, entire object visible, square composition with comfortable margins. Genuine transparent background. No text, no logos, no watermark, no characters, no scene, no border. Subject: Panier gourmand, a generous exquisite woven willow picnic basket with rounded handle and cream gingham liner, overflowing with glossy vibrant orange carrots with lush leaves, fresh lettuce and little golden hay biscuits. Handwoven realistic fibers and warm harvest lighting, appetizing cozy abundance.

**extracteur_fragments** : Use case: stylized-concept. Asset type: premium item sprite for Lapinous cozy rabbit fantasy game store. Create one exquisite original collectible product illustration, polished painterly 3D storybook rendering, luxurious handcrafted textures, luminous soft golden rim lighting, exceptionally beautiful miniature fantasy object with strong readable silhouette at 180px. Centered three-quarter view, entire object visible, square composition with comfortable margins. Genuine transparent background. No text, no logos, no watermark, no characters, no scene, no border. Subject: Extracteur de fragments, a beautiful original fantasy artisan precision tool: compact brass and walnut handheld claw extractor with three curved delicate prongs cradling one glowing violet crystal fragment; sage leather wrapped handle, finely engraved leaf motifs, tiny magical violet sparkles confined near crystal. Looks useful, gentle, enchanted rather than a weapon.
