# Magasin et apothicaire

Mise à jour : 8 octobre 2026. Boutique, inventaire et documents juridiques restent réservés à l’administrateur local pendant les travaux.

## Boutique et panier

Le bouton 🛍️ ouvre Articles, Fragments, Panier et Carottes. Les onglets sont au niveau du titre. Les soins montrent leurs images ; détails et bouton d’achat apparaissent au survol, au focus ou au toucher. Fragments occupe la largeur avec l’extracteur à gauche et les lapins à droite. Le panier regroupe les quantités avec +/− et retrait ; le total et la confirmation restent hors de la zone qui défile. Le panier est conservé après fermeture, pas après rechargement ou changement de partie.

Les soins coûtent 15 carottes : infusion (énergie), bain (propreté), panier gourmand (nourriture). Ils sont stockés dans un inventaire partagé ; l’utilisation restaure à 100 % la barre du lapin actif. Une barre pleine ne consomme rien. L’extracteur coûte 30 carottes : il rend les fragments d’une seule compétence au même lapin et la remet à 0/5, sans toucher aux autres. Le déblocage des techniques dépend du niveau 1/10/20/30/40/50 selon la rareté. Le paiement complet est validé sur copies avant tout débit. Pas d’achat ni d’utilisation pendant un combat.

Les achats de carottes avec de l’argent réel ne sont pas implémentés ; changer carrotPurchasesEnabled ne crée pas de paiement.

## Inventaire indépendant et apothicaire

Le bouton 🌿 ouvre l’apothicairerie, indépendamment de la boutique. Le meuble comporte 12 tiroirs (4 colonnes, 3 rangées). Les produits ont des emplacements fixes répartis entre les rangées, conservés à chaque ouverture ; les tiroirs vides n’affichent ni image ni « stock épuisé ». Les détails apparaissent dans une fiche claire au survol/focus, sans infobulle native.

La lapine reste à côté, pieds alignés sur ceux du meuble. Elle marche horizontalement vers le tiroir choisi, prend la pose adaptée à la hauteur, marche en miroir au retour puis remet le produit seulement une fois arrivée. Fermer la fenêtre annule le soin ; partie, compagnon actif et combat sont contrôlés avant consommation.

## Poses centralisées

Dans lapinous-shop.json : cashier pour la vendeuse ; apothecary pour l’apothicaire ; companions.tailor pour la couturière. Ajouter les futurs accompagnateurs dans ce catalogue, avec un dossier par rôle sous assets/img/accompagnateurs/.

| Pose de l’apothicaire | Fichier dans assets/img/accompagnateurs/Apothicaire/ |
|---|---|
| Accroupie, tiroirs bas | 01_accroupie.png |
| Bras levé, tiroirs hauts | 02_attraper_haut.png |
| Récupération intermédiaire | 03_attraper_hauteur.png |
| Bonjour à l’ouverture | 04_bonjour.png |
| Attente | 05_attente_droite.png |
| Remise après retour | 06_remise_produit.png |
| Marche à gauche, miroir à droite | 07_marche.gif |

Vendeuse : accompagnateurs/caissier/. Couturière : accompagnateurs/couturiere/. Les lapins jouables sont sous lapins_jouables/sans_evenements/ et lapins_jouables/lapin_evenement/. Les anciens chemins de portraits du Dashboard sont convertis à la lecture.

## Tests administrateur

Le bouton Admin sauvegarde la partie avant les tests. Trois curseurs permettent de régler nourriture, sommeil et propreté du compagnon actif de 0 à 100 %. « Les trois à 25 % » prépare les essais de soins. « Restaurer la partie avant les tests » revient à la sauvegarde initiale. Les besoins modifiés sont sauvegardés selon le système de tests existant.

## Ajouter un article et valider

Modifier lapinous-shop.json : id unique, nom, description, emoji, prix entier positif, image et effet restore avec stat food/energy/cleanliness, ou reset. Un nouvel effet nécessite du code dans shop.js. Vérifier prix, quantités, paiement, anciens exports, clavier/toucher, zoom et petites fenêtres. Les aperçus isolés et contrôles de logique ne remplacent pas une validation complète en jeu.

## Historique des prompts de génération

Ces prompts décrivent les anciens visuels générés et les produits, pas les nouvelles poses fournies de l’apothicaire.

**Présentation (stylized-concept)** : Create one finished game sprite for Lapinous, a warm cozy fantasy game of collectible rabbits, carrots, care and vegetable adventures. An ORIGINAL friendly rabbit shopkeeper cashier: small fluffy chestnut-and-cream lop rabbit, expressive brown eyes, upright sitting stance, simple olive-green linen shop apron with two little pockets and a small carrot-shaped wooden clasp, cream linen neckerchief. Render as polished soft painterly 3D fantasy collectible character, detailed silky fur and gentle warm lighting, not photoreal human, not cartoon franchise. Full body including ears and feet with comfortable transparent margin. Three-quarter view looking toward the LEFT, one forepaw extended toward the left in a welcoming presentation gesture as if showing shop articles. He will be placed outside the RIGHT edge of a shop modal pointing left toward products. Only this rabbit character, no counter, no scene, no text, no watermark, no extra characters. Genuine transparent background. Save for use as an in-game portrait.

**Remerciement (identity-preserve)** : The attached image is the edit target: the ORIGINAL Lapinous rabbit shopkeeper. Create his SECOND pose sprite, a warm thank-you after purchasing. Preserve exactly the same rabbit’s chestnut and cream fur patterns, lop ears, brown eyes, face proportions, cream linen neckerchief, olive linen apron with pockets and carrot clasp, polished softly lit painterly 3D rendering style. Change only pose and friendly expression: fully visible body facing viewer slightly three-quarter, paws brought together near chest in a grateful greeting, a gentle small bow and joyful closed-eye smile as if saying thank you. No other objects or people. Same full-body proportions and framing with transparent margins, ears and feet fully visible. Actual transparent background, no text, no logo, no border, no scene.

**infusion_douce** : Use case: stylized-concept. Asset type: premium item sprite for Lapinous cozy rabbit fantasy game store. Create one exquisite original collectible product illustration, polished painterly 3D storybook rendering, luxurious handcrafted textures, luminous soft golden rim lighting, exceptionally beautiful miniature fantasy object with strong readable silhouette at 180px. Centered three-quarter view, entire object visible, square composition with comfortable margins. Genuine transparent background. No text, no logos, no watermark, no characters, no scene, no border. Subject: Infusion douce, a charming ivory ceramic teacup with small sculpted rabbit-ear handle, warm amber herbal tea, delicate curling glowing steam and tiny chamomile blossoms, resting on a leaf-shaped sage ceramic saucer. Refined gold edging and subtle floral glaze, restful magical glow.

**bain_petales** : Use case: stylized-concept. Asset type: premium item sprite for Lapinous cozy rabbit fantasy game store. Create one exquisite original collectible product illustration, polished painterly 3D storybook rendering, luxurious handcrafted textures, luminous soft golden rim lighting, exceptionally beautiful miniature fantasy object with strong readable silhouette at 180px. Centered three-quarter view, entire object visible, square composition with comfortable margins. Genuine transparent background. No text, no logos, no watermark, no characters, no scene, no border. Subject: Bain de pétales, a tiny gorgeous oval carved wooden bathing tub with copper hoops filled with shimmering turquoise water, soft pearly soap bubbles and pink rose petals, folded cream linen towel draped over edge and one delicate flower. Fresh luminous aqua reflections, warm wood grain, whimsical spa luxury.

**panier_gourmand** : Use case: stylized-concept. Asset type: premium item sprite for Lapinous cozy rabbit fantasy game store. Create one exquisite original collectible product illustration, polished painterly 3D storybook rendering, luxurious handcrafted textures, luminous soft golden rim lighting, exceptionally beautiful miniature fantasy object with strong readable silhouette at 180px. Centered three-quarter view, entire object visible, square composition with comfortable margins. Genuine transparent background. No text, no logos, no watermark, no characters, no scene, no border. Subject: Panier gourmand, a generous exquisite woven willow picnic basket with rounded handle and cream gingham liner, overflowing with glossy vibrant orange carrots with lush leaves, fresh lettuce and little golden hay biscuits. Handwoven realistic fibers and warm harvest lighting, appetizing cozy abundance.

**extracteur_fragments** : Use case: stylized-concept. Asset type: premium item sprite for Lapinous cozy rabbit fantasy game store. Create one exquisite original collectible product illustration, polished painterly 3D storybook rendering, luxurious handcrafted textures, luminous soft golden rim lighting, exceptionally beautiful miniature fantasy object with strong readable silhouette at 180px. Centered three-quarter view, entire object visible, square composition with comfortable margins. Genuine transparent background. No text, no logos, no watermark, no characters, no scene, no border. Subject: Extracteur de fragments, a beautiful original fantasy artisan precision tool: compact brass and walnut handheld claw extractor with three curved delicate prongs cradling one glowing violet crystal fragment; sage leather wrapped handle, finely engraved leaf motifs, tiny magical violet sparkles confined near crystal. Looks useful, gentle, enchanted rather than a weapon.

Prompt face : Use case: stylized-concept. Asset type: original transparent character sprite for Lapinous cozy fantasy game inventory apothecary. Full body adorable fluffy cream and warm tawny rabbit herbalist, upright sitting facing viewer, gentle welcoming expression, emerald eyes, sage green linen apron with finely embroidered chamomile and small leather herb pouch, rolled cream sleeves, little dried lavender tucked behind one lop ear. One front paw invitingly extended, other near chest. Exquisite polished painterly 3D storybook rendering, silky detailed fur, warm luminous gold rim light, handcrafted cloth textures, coherent with premium fantasy rabbit shop assets. Entire ears paws feet visible, centered with generous transparent margins. No text, no lettering, no watermark, no scene, no furniture, no extra characters. Genuine transparent background.

Prompt dos (édition conservant l’identité du personnage) : Use case: identity-preserve. Edit target: attached original Lapinous rabbit herbalist. Create the SECOND pose of this exact same cream and tawny lop rabbit. Preserve fur colors, proportions, sage green linen apron with chamomile embroidery, cream rolled sleeves, brass buckles, brown leather herb pouch and lavender behind the ear, silky painterly 3D storybook style and warm gold light. Change pose only: FULL BACK VIEW, head and body turned away from viewer toward the left, one front paw reaching out toward an offscreen cabinet to retrieve a remedy. Show apron straps and tied back bow clearly, full ears body fluffy tail feet visible. No cabinet, no products, no scene, no text, no logos, no watermark. Genuine transparent background, same framing scale and margins as original.

Prompt accroupie : Use case: identity-preserve. Edit target: the provided Lapinous herbalist rabbit. Preserve exactly the tawny cream lop rabbit, sage chamomile embroidered apron, crossed straps, cream sleeves, brown herb pouch, lavender behind ear, polished painterly storybook 3D fur. Create one full body rear three-quarter pose facing left, crouching low with bent knees, reaching one paw forward and down to retrieve a remedy from a low drawer. Entire ears, feet and paw visible. No furniture, no scene, no text. Genuine transparent background. Same character, only change pose.

Prompt bras levé : Use case: identity-preserve. Edit target: provided Lapinous herbalist rabbit. Preserve exact cream tawny lop rabbit, sage chamomile embroidered apron with crossed straps, cream sleeves, brown herb pouch and lavender behind ear, silky polished painterly storybook 3D style. Full body rear three-quarter view facing left, standing and stretching one arm clearly upward diagonally left above head to retrieve a remedy from a high drawer. Feet on ground, entire ears feet and raised paw visible with generous margins. No furniture, no text, no scene. Genuine transparent background. Change pose only.

## Accueil et visibilité — 8 octobre 2026

La pose d’accueil de l’apothicaire affiche « Bonjour, [nom du lapin] ! », puis la phrase d’attente. Admin → Ouvrir le Dashboard permet de régler le magasin et l’apothicairerie : visibles pour tous, admin local uniquement ou masqués. Par défaut, les deux restent réservés au local.

### Catalogue dans le Dashboard — 8 octobre 2026

La section **Catalogue magasin** présente le JSON complet : articles, prix, caissier, apothicaire et couturière. **Enregistrer localement** valide le catalogue puis le conserve pour les essais sur localhost ; recharge le jeu pour appliquer les changements. **Exporter lapinous-shop.json** prépare le fichier à remplacer à la racine pour publication. **Recharger le fichier du projet** efface la version locale et relit le catalogue du projet. Les achats de carottes en argent réel ne sont pas implémentés par cet éditeur.

### Édition visuelle du catalogue

Le Dashboard présente les articles en cartes illustrées. Clique sur une carte pour ouvrir les champs et modifier prix, effet, image et description. Les accompagnateurs disposent d’un tableau séparé pour leurs noms et poses. L’enregistrement local et l’export conservent le catalogue complet.

### Marché et cuisine — 8 octobre 2026

Le nouvel onglet **Marché** propose des aliments consommables conservés dans la réserve cuisine. Les soins restent dans Articles/apothicairerie ; les plats préparés se fabriquent en cuisine et ne sont pas vendus au Marché. Voir [CUISINE.md](CUISINE.md) pour les paliers et bonus. Le Chef est centralisé dans `companions.chef` ; son image est provisoire en attente du visuel dédié.

Le Marché contient désormais des fraises, poires, courgettes et fleurs. La réserve s’ouvre au clic sur le frigo. Les plats spéciaux et leurs bonus sont mis en attente (`recipesEnabled: false`), jusqu’à la révision des attaques, défenses et soins.
