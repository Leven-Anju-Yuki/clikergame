# Lapinous - suivi des travaux et validations

Mise a jour : 15 octobre 2026.

- [x] Correspondances des fichiers renseignees pour les cartes existantes qui ont du code.
- [x] Reperes `[trello:ID]` ajoutes aux taches ci-dessous.
- [ ] Validation humaine des resultats en jeu : une case technique cochee ne prouve pas le rendu visuel.

Les cases principales des cartes restent ouvertes tant que leur validation ou leur travail est incomplet. L’agent peut proposer En cours ou A valider en jeu ; la liste Realise reste sous validation humaine. Pas de nouvelle carte creee ici.


## Correctifs téléphone et installation — 15 octobre 2026

Les précédents tests avec images de contrôle vérifiaient les débordements des panneaux ; ils ne validaient pas le placement des personnages ni la lisibilité. Les captures téléphone ont révélé ces régressions.

- [x] Manifeste installable, orientation paysage, icônes locales et bouton Installer dans l'accueil et les sauvegardes. [trello:6ac39db1a134b35f03b17940:code:installation-pwa]
- [x] Écran de rotation en portrait tactile ; demande de plein écran et verrouillage paysage lorsque le navigateur l'autorise. [trello:6ac39d846f4f8d11b7da6ab0:code:orientation-paysage]
- [x] Scènes du magasin dimensionnées dans la hauteur disponible ; caissière recalée sur le décor, meuble et accompagnatrice visibles en petite hauteur. [trello:6ac75d423df6f3af4d7dffa3:code:paysage-scenes]
- [x] Cache hors connexion limité aux fichiers publics du jeu et à 120 images consultées ; caches des autres applications préservés. [trello:6ac39db1a134b35f03b17940:code:cache-pwa]
- [x] Contrôles automatisés : 72 parcours sans erreur JavaScript ni débordement horizontal des panneaux ; captures avec les vrais médias sur trois formats paysage (844×390, 844×280, 740×320), rotation portrait et rechargement hors connexion vérifiés dans Chrome. Ces contrôles ne remplacent pas le test sur appareil réel. [trello:6ac39d846f4f8d11b7da6ab0:code:tests-paysage]
- [ ] Vérifier sur téléphone Android réel : rotation, lancement depuis l'icône installée, navigation, achats tactiles, animations, fermeture et réouverture. [trello:6ac75d423df6f3af4d7dffa3:manuel:telephone-paysage]
- [ ] Vérifier Safari/iOS : installation via Partager, rotation manuelle et sauvegardes conservées après relancement. [trello:6ac39db1a134b35f03b17940:manuel:installation-ios]
- [ ] Revalider tous les mini-jeux et le combat en paysage sur téléphone ; les captures des scènes ne suffisent pas. [trello:6ac75fbda79c4c777508987e:manuel:jeux-paysage]

L'installation sera disponible sur le site après publication de ces fichiers en HTTPS. Aucun APK n'est produit. L'automatisation du bilan de 21 h reste suspendue.

## Travaux recents : code livre et points a verifier

- [x] Cloudinary : chemins locaux resolus par le manifeste, transfert des images utilisees et sauvegarde permanente des originaux.
- [x] Synchronisation : absence de nouvelles images sans transfert ; conservation des dossiers et remplacement des originaux homonymes dans la sauvegarde.
- [x] Exports Dashboard : quatre catalogues dans le projet, autorisations, dossier memorise, copie avant remplacement et retention des copies de 7 jours au prochain export.
- [x] Sauvegardes des parties : noms dates uniques, import controle, dossier memorise et actions Charger / Ecraser / Supprimer avec confirmations.
- [x] Cuisine : frigo cliquable, ingredients et plats separes, consommation interdite a barre pleine, recettes centralisees dans lapinous-shop.json.
- [x] Chef : recuperation des ingredients, decoupe pour les salades, wok pour les autres plats et depot sur l’etagere des plats prepares.
- [x] Magasin : fonds par rayon, quatre evolutions sur l’etabli, paliers d’amitie de 5 et ameliorations payantes croissantes.
- [x] Fragments : paiement direct, remboursement de la seule competence choisie, GIFs de marche et assemblage raccordes.
- [x] Dashboard : cartes retournables, recherche, accompagnateurs en accordeons, choix d’images et securite en dernier.
- [x] Salon : compagnon actif et favoris independants selectionnes par etoiles dans l’encyclopedie.
- [x] Mini-jeux : placard illustre et quiz des lapins issu du document alimentation, questions supplementaires et editeur Dashboard.
- [x] Visibilite : magasin, Marche, evolutions, fragments, apothicaire et cuisine publics ; Carottes reserve a l’admin local.
- [ ] Verifier les trajets complets, tailles, sens de marche et poses finales de la caissiere, du forgeron, du specialiste des fragments et de l’apothicaire.
- [ ] Verifier les etageres, objets sur les tables et meubles au parquet sur ordinateur, mobile, petite hauteur et zoom.
- [ ] Tester les exports avec permission refusee, reconnexion, ancien dossier, nouvelle sauvegarde, chargement, ecrasement et suppression.
- [ ] Verifier stocks, achats, recettes, favoris, fragments et noms des lapins apres export/import d’une ancienne et d’une nouvelle partie.
- [ ] Equilibrer les prix actuels, la nourriture de base, les ingredients et les plats ; revoir attaques, defenses et soins avant les bonus speciaux.
- [ ] Verifier le resultat Cloudinary de 20 h et le bilan de 21 h, sans doublon de tache Windows ni purge des images sauvegardees.
- [ ] Verifier les mises a jour de cartes Trello en simulation avant application ; ne pas valider automatiquement Realise.
- [ ] Valider le quiz sur mobile, les sources des reponses et la lisibilite des boites des mini-jeux.

## Priorites et travaux ouverts

- [ ] Améliorations de soin — ancienne piste à réévaluer [trello:6661a537b3df7e377ba31643] - [Carte](https://trello.com/c/6661a537b3df7e377ba31643)
  Fichiers : `assets/js/shop.js`, `assets/css/shop.css`, `lapinous-shop.json`
- [ ] P3 — Techniques uniques [trello:6ac39dc1946e5c8a5488c49b] - [Carte](https://trello.com/c/6ac39dc1946e5c8a5488c49b)
  Fichiers : idee ou travail futur sans correspondance de code ; aucun deplacement automatique.
- [ ] P3 — Nouveaux consommables et équilibre des prix [trello:6ac39dc482f20ad66d405a8b] - [Carte](https://trello.com/c/6ac39dc482f20ad66d405a8b)
  Fichiers : `assets/js/shop.js`, `assets/css/shop.css`, `lapinous-shop.json`
- [ ] P3 — Décorations plaçables [trello:6ac39e052e962c5a09b17704] - [Carte](https://trello.com/c/6ac39e052e962c5a09b17704)
  Fichiers : idee ou travail futur sans correspondance de code ; aucun deplacement automatique.
- [ ] P3 — Branches d’amélioration [trello:6ac39e08cece9041c78cab09] - [Carte](https://trello.com/c/6ac39e08cece9041c78cab09)
  Fichiers : idee ou travail futur sans correspondance de code ; aucun deplacement automatique.
- [ ] P3 — Records supplémentaires [trello:6ac39e0b9caa6864a646e480] - [Carte](https://trello.com/c/6ac39e0b9caa6864a646e480)
  Fichiers : `assets/js/achievements.js`
- [ ] P3 — Mode pixel art [trello:6ac39e0ec39e56083669ea25] - [Carte](https://trello.com/c/6ac39e0ec39e56083669ea25)
  Fichiers : idee ou travail futur sans correspondance de code ; aucun deplacement automatique.
- [ ] P3 — Nouvelles grilles de Lapidoku [trello:6ac39e11e324891dfc4c501a] - [Carte](https://trello.com/c/6ac39e11e324891dfc4c501a)
  Fichiers : idee ou travail futur sans correspondance de code ; aucun deplacement automatique.
- [ ] Publication — juridique, droits et paiement [trello:6ac75d44734881469f896152] - [Carte](https://trello.com/c/6ac75d44734881469f896152)
  Fichiers : `Lapinous_documents_juridiques/`, `docs/INSTALLATION_ET_SECURITE.md`, `INSTALLATION_ET_SECURITE.md`
- [ ] P1 — Progression et déblocage des équipements [trello:6661a5d73e3f5fce205eae72] - [Carte](https://trello.com/c/6661a5d73e3f5fce205eae72)
  Fichiers : `assets/js/shop.js`, `assets/css/shop.css`, `lapinous-shop.json`, `assets/js/pantry.js`, `assets/js/script.js`
- [ ] P1 — Placement des lapins et commandes [trello:6ac39d846f4f8d11b7da6ab0] - [Carte](https://trello.com/c/6ac39d846f4f8d11b7da6ab0)
  Fichiers : `assets/js/script.js`, `assets/css/style.css`, `index.html`, `assets/css/mobile.css`, `tools/test-mobile-game.mjs`
- [ ] P1 — Préparation du combat [trello:6ac39d8793f1039486b67a20] - [Carte](https://trello.com/c/6ac39d8793f1039486b67a20)
  Fichiers : `assets/js/script.js`, `assets/css/style.css`, `index.html`, `assets/css/mobile.css`, `tools/test-mobile-game.mjs`
- [ ] P1 — Sauvegardes [trello:6ac39d911abc6a7d2a71273e] - [Carte](https://trello.com/c/6ac39d911abc6a7d2a71273e)
  Fichiers : `assets/js/script.js`, `assets/js/save-validation.js`, `assets/js/local-files.js`, `index.html`, `assets/css/mobile.css`, `tools/test-mobile-game.mjs`
- [ ] P1 — Sons [trello:6ac39d93be4e45379ca8247f] - [Carte](https://trello.com/c/6ac39d93be4e45379ca8247f)
  Fichiers : `assets/js/script.js`, `assets/audio/`
- [ ] P2 — Notifications [trello:6ac39dbef4faf8125adc099b] - [Carte](https://trello.com/c/6ac39dbef4faf8125adc099b)
  Fichiers : `assets/js/script.js`
- [ ] Équipes favorites [trello:6ac39e147db15f1edab9c326] - [Carte](https://trello.com/c/6ac39e147db15f1edab9c326)
  Fichiers : idee ou travail futur sans correspondance de code ; aucun deplacement automatique.
- [ ] P1 — Équilibrage des boss [trello:6ac39d8a40c2a66ada563abc] - [Carte](https://trello.com/c/6ac39d8a40c2a66ada563abc)
  Fichiers : `assets/js/script.js`, `assets/css/style.css`, `index.html`
- [ ] P1 — Indicateur de difficulté plus fiable [trello:6ac39d8ef2a33d8d5e748be8] - [Carte](https://trello.com/c/6ac39d8ef2a33d8d5e748be8)
  Fichiers : `assets/js/script.js`, `assets/css/style.css`, `index.html`
- [ ] P2 — SEO [trello:6ac39d99f4eb044b2a42d449] - [Carte](https://trello.com/c/6ac39d99f4eb044b2a42d449)
  Fichiers : `index.html`, `docs/AUDIT_SEO.md`
- [ ] P2 — Guide de démarrage [trello:6ac39daf6e132da85a61925d] - [Carte](https://trello.com/c/6ac39daf6e132da85a61925d)
  Fichiers : `index.html`
- [ ] P2 — Accessibilité [trello:6ac39db1a134b35f03b17940] - [Carte](https://trello.com/c/6ac39db1a134b35f03b17940)
  Fichiers : `assets/css/style.css`, `index.html`, `assets/js/dashboard.js`, `assets/js/dashboard-ui.js`, `dashboard.html`, `assets/css/mobile.css`
- [ ] P2 — Performance [trello:6ac39db49bd7456ac00b5038] - [Carte](https://trello.com/c/6ac39db49bd7456ac00b5038)
  Fichiers : `assets/css/style.css`, `index.html`, `assets/js/dashboard.js`, `assets/js/dashboard-ui.js`, `dashboard.html`, `assets/js/scene-preload.js`, `assets/js/script.js`
- [ ] P2 — Relations des personnages [trello:6ac39dbb2c736f2180aee1ec] - [Carte](https://trello.com/c/6ac39dbb2c736f2180aee1ec)
  Fichiers : `assets/js/species-data.js`, `lapinous-content.json`, `assets/js/script.js`

## Fonctionnalites existantes : validations

- [ ] faire une modal qui souvre avec un bouton image livre pour afficher les regles du jeu [trello:6661a8eefa746159ea2700da] - [Carte](https://trello.com/c/6661a8eefa746159ea2700da)
  Fichiers : `index.html`
- [ ] faire le clicker pour lui donner a manger le brosser [trello:6661a4b7b41cd821c331d689] - [Carte](https://trello.com/c/6661a4b7b41cd821c331d689)
  Fichiers : `assets/js/script.js`, `assets/css/style.css`, `index.html`
- [ ] Barres de besoins et niveau d’amitié [trello:6661a5ec1e0c59351bd18a52] - [Carte](https://trello.com/c/6661a5ec1e0c59351bd18a52)
  Fichiers : `assets/js/script.js`, `assets/css/style.css`, `index.html`
- [ ] trouver un gif de lapin heureux [trello:6661a91283b1bf3c205e457c] - [Carte](https://trello.com/c/6661a91283b1bf3c205e457c)
  Fichiers : `assets/js/image-manifest.js`, `assets/js/image-assets.js`, `tools/update-images.mjs`, `tools/cloudinary-sync.mjs`, `tools/backup-transferred-images.mjs`
- [ ] Retour au Salon et informations du lapin [trello:6669758ceb6d2b877ef431fa] - [Carte](https://trello.com/c/6669758ceb6d2b877ef431fa)
  Fichiers : `assets/js/script.js`, `assets/css/style.css`, `index.html`
- [ ] trouver les images [trello:6661b309ac71b719ebc63fd7] - [Carte](https://trello.com/c/6661b309ac71b719ebc63fd7)
  Fichiers : `assets/js/image-manifest.js`, `assets/js/image-assets.js`, `tools/update-images.mjs`, `tools/cloudinary-sync.mjs`, `tools/backup-transferred-images.mjs`
- [ ] faire une zone soin alimentation sommeil et jeu avec des fond différent [trello:6661a6149952d95e5c048f9a] - [Carte](https://trello.com/c/6661a6149952d95e5c048f9a)
  Fichiers : `assets/js/species-data.js`, `lapinous-content.json`, `assets/css/style.css`, `index.html`, `assets/js/script.js`
- [ ] thème sur les lapins [trello:6661a423f3b0f23f486d3590] - [Carte](https://trello.com/c/6661a423f3b0f23f486d3590)
  Fichiers : `assets/js/species-data.js`, `lapinous-content.json`, `assets/css/style.css`, `index.html`
- [x] faire un salon avec des bouton de base  pour les diffèrent lieu et une fleche pour revenir en arriere [trello:6661b4124754141925b73499] - [Carte](https://trello.com/c/6661b4124754141925b73499)
  Fichiers : `assets/js/script.js`, `assets/css/style.css`, `index.html`, `assets/css/mobile.css`
- [x] Adoption, traits, collection et encyclopédie [trello:6ac39e3c28d335cd92c8cc95] - [Carte](https://trello.com/c/6ac39e3c28d335cd92c8cc95)
  Fichiers : `assets/js/species-data.js`, `lapinous-content.json`, `assets/js/script.js`
- [x] Progression indépendante par lapin [trello:6ac39e3f09478ebeda38c92d] - [Carte](https://trello.com/c/6ac39e3f09478ebeda38c92d)
  Fichiers : `assets/js/script.js`, `assets/css/style.css`, `index.html`
- [x] Combat tactique — équipe, mode manuel et automatique [trello:6ac39e4258234f0f6df5def5] - [Carte](https://trello.com/c/6ac39e4258234f0f6df5def5)
  Fichiers : `assets/js/script.js`, `assets/css/style.css`, `index.html`, `assets/css/mobile.css`
- [x] Ultimes et barres de charge — lapins et boss [trello:6ac39e452732a48b7581df6e] - [Carte](https://trello.com/c/6ac39e452732a48b7581df6e)
  Fichiers : `assets/js/script.js`, `assets/css/style.css`, `index.html`
- [x] Listes de 1 à 6 attaques selon la rareté [trello:6ac39e5cff0d2d466b27ecbb] - [Carte](https://trello.com/c/6ac39e5cff0d2d466b27ecbb)
  Fichiers : `assets/js/script.js`, `assets/css/style.css`, `index.html`, `lapinous-content.json`
- [x] Fragments — amélioration de la technique choisie [trello:6ac39e5fd921b05e95245ff0] - [Carte](https://trello.com/c/6ac39e5fd921b05e95245ff0)
  Fichiers : `assets/js/shop.js`, `assets/css/shop.css`, `lapinous-shop.json`, `assets/js/script.js`
- [x] Œufs illustrés — ouverture individuelle et par 10 [trello:6ac39e61cbe7415819b24df8] - [Carte](https://trello.com/c/6ac39e61cbe7415819b24df8)
  Fichiers : `assets/js/script.js`, `assets/js/dashboard.js`, `assets/js/dashboard-ui.js`, `dashboard.html`
- [x] Décors de saisons jour/nuit et événements prioritaires [trello:6ac39efb4988b40cec255170] - [Carte](https://trello.com/c/6ac39efb4988b40cec255170)
  Fichiers : `assets/js/species-data.js`, `lapinous-content.json`, `assets/css/style.css`, `index.html`, `assets/js/script.js`
- [x] Admin local — tests rapides et Dashboard [trello:6ac39efeb8e60614e640ad49] - [Carte](https://trello.com/c/6ac39efeb8e60614e640ad49)
  Fichiers : `assets/js/dashboard.js`, `assets/js/dashboard-ui.js`, `dashboard.html`, `assets/js/species-data.js`, `lapinous-content.json`
- [x] Dashboard — graphiques de rareté harmonisés [trello:6ac39f0129a42ce3c535a196] - [Carte](https://trello.com/c/6ac39f0129a42ce3c535a196)
  Fichiers : `assets/js/dashboard.js`, `assets/js/dashboard-ui.js`, `dashboard.html`, `assets/js/species-data.js`, `lapinous-content.json`
- [x] Sauvegardes nommées, datées et remplacement confirmé [trello:6ac39f0465d01dcee2c8411d] - [Carte](https://trello.com/c/6ac39f0465d01dcee2c8411d)
  Fichiers : `assets/js/script.js`, `assets/js/save-validation.js`, `assets/js/local-files.js`, `index.html`
- [x] Mini-jeux — Memory 30 niveaux et puzzles cousus [trello:6ac39f1ffd16599635e62ae9] - [Carte](https://trello.com/c/6ac39f1ffd16599635e62ae9)
  Fichiers : `assets/js/puzzle-data.js`, `lapinous-puzzles.json`, `assets/js/script.js`, `assets/js/quiz.js`, `assets/js/quiz-dashboard.js`, `lapinous-quiz.json`, `assets/css/mobile.css`, `tools/test-mobile-game.mjs`
- [x] Défis quotidiens, succès et récompenses [trello:6ac39f233ae89c6d7a24fb0c] - [Carte](https://trello.com/c/6ac39f233ae89c6d7a24fb0c)
  Fichiers : `assets/js/achievements.js`
- [x] Audio — soins courts, volumes et défaite [trello:6ac39f2681968bcd0d9b086d] - [Carte](https://trello.com/c/6ac39f2681968bcd0d9b086d)
  Fichiers : `assets/js/script.js`, `assets/audio/`
- [x] Audio original livré — ambiance et sommeil [trello:6ac39f295fcf0100cf51e1cd] - [Carte](https://trello.com/c/6ac39f295fcf0100cf51e1cd)
  Fichiers : `assets/js/script.js`, `assets/audio/`
- [x] Notifications et combat lisible — corrections livrées [trello:6ac39f2b43bb87374c9f2e22] - [Carte](https://trello.com/c/6ac39f2b43bb87374c9f2e22)
  Fichiers : `assets/js/script.js`, `assets/css/style.css`, `index.html`
- [x] Salon — compagnons ensemble et placement corrigé [trello:6ac39f2fa02c69b499e17ea8] - [Carte](https://trello.com/c/6ac39f2fa02c69b499e17ea8)
  Fichiers : `assets/js/script.js`, `assets/css/style.css`, `index.html`
- [ ] Repères — feuille de route du 08-10-2026 [trello:6ac39f30bfe4848ec3eca940] - [Carte](https://trello.com/c/6ac39f30bfe4848ec3eca940)
  Fichiers : `readme.md`, `A_FAIRE.md`, `tools/agent_lapinous/agent.py`, `tools/agent_lapinous/suivi_trello.py`, `tools/agent_lapinous/installer_taches.ps1`, `tools/run-image-schedule.ps1`, `tools/agent_lapinous/chaine_20h.ps1`, `tools/agent_lapinous/installer_chaine_20h.ps1`

## Tests manuels a effectuer

- [x] À valider — Puzzle à coupelle et couturière [trello:6ac39db7ff0d2d466b26fe7b] - [Carte](https://trello.com/c/6ac39db7ff0d2d466b26fe7b)
  Fichiers : `assets/js/puzzle-data.js`, `lapinous-puzzles.json`, `assets/js/script.js`, `assets/css/mobile.css`
- [ ] À valider — Boutique et apothicaire [trello:6ac75d423df6f3af4d7dffa3] - [Carte](https://trello.com/c/6ac75d423df6f3af4d7dffa3)
  Fichiers : `assets/js/shop.js`, `assets/css/shop.css`, `lapinous-shop.json`, `assets/css/mobile.css`, `tools/test-mobile-game.mjs`
- [x] À valider — Memory 30 niveaux [trello:6ac75d4306880ab48923dd1c] - [Carte](https://trello.com/c/6ac75d4306880ab48923dd1c)
  Fichiers : `assets/js/puzzle-data.js`, `lapinous-puzzles.json`, `assets/js/script.js`, `assets/css/mobile.css`
- [ ] À valider — Besoins admin et jeux adaptés à l’écran [trello:6ac75fbda79c4c777508987e] - [Carte](https://trello.com/c/6ac75fbda79c4c777508987e)
  Fichiers : `assets/js/dashboard.js`, `assets/js/dashboard-ui.js`, `dashboard.html`, `assets/js/species-data.js`, `lapinous-content.json`, `assets/css/mobile.css`, `tools/test-mobile-game.mjs`
- [x] Valider accueil apothicaire, bouclier et visibilité du Dashboard [trello:6ac761f58b664d27cb2e9cd5] - [Carte](https://trello.com/c/6ac761f58b664d27cb2e9cd5)
  Fichiers : `assets/js/dashboard.js`, `assets/js/dashboard-ui.js`, `dashboard.html`, `assets/js/species-data.js`, `lapinous-content.json`, `assets/js/shop.js`, `assets/js/script.js`
- [x] Valider puzzles verrouillés et Memory compact [trello:6ac763f9346a0a7e6149d7fb] - [Carte](https://trello.com/c/6ac763f9346a0a7e6149d7fb)
  Fichiers : `assets/js/puzzle-data.js`, `lapinous-puzzles.json`, `assets/js/script.js`, `assets/css/mobile.css`
- [x] Valider accès Admin aux derniers niveaux et noms après rechargement [trello:6ac7652bc8ce084387e31ecc] - [Carte](https://trello.com/c/6ac7652bc8ce084387e31ecc)
  Fichiers : `assets/js/dashboard.js`, `assets/js/dashboard-ui.js`, `dashboard.html`, `assets/js/species-data.js`, `lapinous-content.json`, `assets/js/script.js`
- [x] Valider cartes puzzles Dashboard et taux des œufs [trello:6ac76646894f17c16d8646d1] - [Carte](https://trello.com/c/6ac76646894f17c16d8646d1)
  Fichiers : `assets/js/dashboard.js`, `assets/js/dashboard-ui.js`, `dashboard.html`, `assets/js/species-data.js`, `lapinous-content.json`
- [x] Valider Dashboard en accordéons et catalogue magasin [trello:6ac76741ba45b4cc22e9893c] - [Carte](https://trello.com/c/6ac76741ba45b4cc22e9893c)
  Fichiers : `assets/js/dashboard.js`, `assets/js/dashboard-ui.js`, `dashboard.html`, `assets/js/species-data.js`, `lapinous-content.json`, `assets/css/mobile.css`, `tools/test-mobile-game.mjs`, `assets/js/local-files.js`
- [x] Valider Dashboard visuel, taux des œufs et poids README [trello:6ac76ac51940e93ee2c2d397] - [Carte](https://trello.com/c/6ac76ac51940e93ee2c2d397)
  Fichiers : `assets/js/dashboard.js`, `assets/js/dashboard-ui.js`, `dashboard.html`, `assets/js/species-data.js`, `lapinous-content.json`, `readme.md`
- [ ] Valider cuisine, Marché et évolutions progressives [trello:6ac775a5d9cc9195c78cfc47] - [Carte](https://trello.com/c/6ac775a5d9cc9195c78cfc47)
  Fichiers : `assets/js/shop.js`, `assets/css/shop.css`, `lapinous-shop.json`, `assets/js/pantry.js`, `assets/js/script.js`, `assets/css/mobile.css`, `tools/test-mobile-game.mjs`
- [x] Valider frigo cliquable et nouveaux aliments du Marché [trello:6ac7808c657c947629f42e6e] - [Carte](https://trello.com/c/6ac7808c657c947629f42e6e)
  Fichiers : `assets/js/pantry.js`, `assets/js/shop.js`, `assets/css/shop.css`, `lapinous-shop.json`, `assets/css/mobile.css`, `tools/test-mobile-game.mjs`, `assets/js/script.js`

## Idees conservees

- [ ] Boss à comportements distincts [trello:6ac39e1702dcc73d8bd079c2] - [Carte](https://trello.com/c/6ac39e1702dcc73d8bd079c2)
  Fichiers : idee ou travail futur sans correspondance de code ; aucun deplacement automatique.
- [ ] Défis de combat [trello:6ac39e1aaf413db2ee993e59] - [Carte](https://trello.com/c/6ac39e1aaf413db2ee993e59)
  Fichiers : idee ou travail futur sans correspondance de code ; aucun deplacement automatique.
- [ ] Journal de collection [trello:6ac39e2f7f2924d04ff78274] - [Carte](https://trello.com/c/6ac39e2f7f2924d04ff78274)
  Fichiers : `assets/js/species-data.js`, `lapinous-content.json`, `assets/js/script.js`
- [ ] Expéditions courtes [trello:6ac39e33093ac1a6041de63f] - [Carte](https://trello.com/c/6ac39e33093ac1a6041de63f)
  Fichiers : idee ou travail futur sans correspondance de code ; aucun deplacement automatique.
- [ ] Albums saisonniers [trello:6ac39e3688258482918621e0] - [Carte](https://trello.com/c/6ac39e3688258482918621e0)
  Fichiers : idee ou travail futur sans correspondance de code ; aucun deplacement automatique.
- [ ] Sauvegarde de secours [trello:6ac39e3935def311b21d9772] - [Carte](https://trello.com/c/6ac39e3935def311b21d9772)
  Fichiers : `assets/js/script.js`, `assets/js/save-validation.js`, `assets/js/local-files.js`, `index.html`

## Suivi historique et code livre

- [x] README et arborescence — actualisés le 08-10-2026 [trello:6ac39d96335bf1dad3b0d2f2] - [Carte](https://trello.com/c/6ac39d96335bf1dad3b0d2f2)
  Fichiers : `readme.md`, `A_FAIRE.md`, `tools/agent_lapinous/agent.py`, `tools/agent_lapinous/installer_taches.ps1`, `tools/agent_lapinous/liaisons_trello.json`, `tools/agent_lapinous/suivi_trello.py`
- [x] Magasin et inventaire — code livré [trello:6ac75d3f821f8ecfbfefd1b3] - [Carte](https://trello.com/c/6ac75d3f821f8ecfbfefd1b3)
  Fichiers : `assets/js/shop.js`, `assets/css/shop.css`, `lapinous-shop.json`
- [x] Accompagnateurs et lapins — médias centralisés [trello:6ac75d402925f959a3e9afbc] - [Carte](https://trello.com/c/6ac75d402925f959a3e9afbc)
  Fichiers : `assets/js/image-manifest.js`, `assets/js/image-assets.js`, `tools/update-images.mjs`, `tools/cloudinary-sync.mjs`, `tools/backup-transferred-images.mjs`, `tools/cloudinary-corbeille.mjs`, `tools/run-image-schedule.ps1`

## Criteres de validation conserves

- [x] Combats : equipes de 1/2/3, niveaux 1/20/40/60/80/100, puissance lisible, ultimes, soins, protections et difficulte reelle.
- [x] Progression : plafond 100, oeufs 20/40/60/80/100 et fragments d’Azazel sans recompense repetee au chargement.
- [x] Memory : 30 niveaux, 36 paires, records et anciennes sauvegardes ; puzzles : verrouillage, evenements, clavier/toucher et couturiere.
- [x] Audio : game over double, bouclier, soins courts, volumes et sons saisonniers sans superposition incorrecte.
- [x] Evenements : dates du Nouvel An chinois apres 2028, vue de face de Yuehua, calendrier et filtres Dashboard.
- [ ] Publication : droits des images et musiques, documents juridiques, confidentialite et paiement avant ouverture des packs Carottes.
- [ ] Randonneur : nouvelles images a integrer si confirmees dans une fonctionnalite ; ne pas supprimer les creations futures.


## Adaptation telephone - 14 octobre 2026

- [x] Feuille responsive commune `assets/css/mobile.css` chargee par le jeu et le Dashboard ; champs a 16 px, boutons principaux tactiles, marges et deplacements compatibles avec les petits ecrans.
- [x] Fenetres et sauvegardes : hauteur bornee au viewport, contenu defilant, commandes qui se replient ; carte [Sauvegardes](https://trello.com/c/6ac39d911abc6a7d2a71273e).
- [x] Cuisine : trois provisions par etagere sur telephone, six sur ordinateur ; etageres et plats separables et recettes defilantes ; carte [Cuisine / Marche / evolutions](https://trello.com/c/6ac775a5d9cc9195c78cfc47).
- [x] Fragments et magasin : commandes tactiles plus grandes, liste des lapins sur deux colonnes, dialogues defilants en paysage ; carte [Boutique et apothicaire](https://trello.com/c/6ac75d423df6f3af4d7dffa3).
- [x] Combat : preparation et commandes empilees en portrait, liste equipe defilante et terrain compact ; carte [Preparation du combat](https://trello.com/c/6ac39d8793f1039486b67a20).
- [x] Mini-jeux : panneaux contenus dans le viewport et defilement conserve en petite hauteur ; carte [Memory et puzzles](https://trello.com/c/6ac39f1ffd16599635e62ae9).
- [x] Test de la page reelle avec profils Chrome isoles et emulation tactile : `tools/test-mobile-game.mjs`. Les images sont remplacees par une image de controle : ce test mesure les panneaux et les erreurs JavaScript, pas la qualite des illustrations.
- [x] Emulation Chrome : 24 etats ouverts dans chacun des formats 390 x 844, 360 x 640 et 844 x 390 ; aucun debordement horizontal des panneaux controles ni erreur JavaScript. Ne valide pas une partie complete ni le rendu avec les vraies illustrations.
- [ ] Sur un vrai Android Chrome et un iPhone Safari, valider le toucher, le clavier virtuel, les textes longs, les encoches et la rotation pendant une partie ; carte [Placement et commandes](https://trello.com/c/6ac39d846f4f8d11b7da6ab0).
- [ ] Tester tous les niveaux des puzzles et du Memory, y compris 36 paires, puis Lapidoku, quiz et agilite sur appareil reel ; carte [Jeux adaptes a l ecran](https://trello.com/c/6ac75fbda79c4c777508987e).
- [x] Jouer un combat complet en manuel et automatique avec 1/2/3 lapins et verifier attaques, logs, fin de combat et recompenses ; carte [Preparation du combat](https://trello.com/c/6ac39d8793f1039486b67a20).
- [ ] Verifier la consommation et la preparation de chaque recette, les animations des accompagnateurs et les informations au toucher ; carte [Frigo et Marche](https://trello.com/c/6ac7808c657c947629f42e6e).
- [ ] Valider le telechargement/import JSON de secours sur les navigateurs mobiles sans acces aux dossiers ; carte [Sauvegardes](https://trello.com/c/6ac39d911abc6a7d2a71273e).
- [ ] Tester les accordeons, les cartes retournees et tous les champs du Dashboard sur telephone ; carte [Dashboard et catalogue](https://trello.com/c/6ac76741ba45b4cc22e9893c).

## Bilan quotidien

- [x] Horaires de reference : Cloudinary a 20 h et bilan global a 21 h Europe/Paris.
- [ ] Au bilan : Git, README et poids, A_FAIRE, correspondances Trello, Discord et resultat Cloudinary ; aucun push automatique.

<!-- LAPINOUS_AGENT_DEBUT -->
### Suivi automatique du projet

_Dernier bilan : 14/10/2026 13:39_

Fichiers modifiés ou non suivis par Git : **7**

- `assets/css/shop.css`
- `assets/js/shop.js`
- `dashboard.html`
- `index.html`
- `tools/run-image-schedule.ps1`
- `tools/test-cashier-route.mjs`
- `tools/test-market-layout.mjs`
<!-- LAPINOUS_AGENT_FIN -->

## Audit Trello et agent - 15 octobre 2026

L'automatisation du bilan de 21 h est suspendue. L'horaire reste une configuration pour une reprise explicitement autorisee. Aucun deplacement Trello ni message Discord reel pendant les tests.

- [x] Simulation sans ecriture de fichiers, rapports ou point de reprise, et sans notification. [trello:6ac39f30bfe4848ec3eca940:code:simulation-agent]
- [x] Preuves ciblees dans les lignes modifiees ; un fichier partage ne suffit plus. [trello:6ac39f30bfe4848ec3eca940:code:preuves-agent]
- [x] Git au format NUL, accents et renommages, commits depuis un point de reprise et contenus deja traites non rejoues. [trello:6ac39f30bfe4848ec3eca940:code:git-agent]
- [x] Sous-taches code et manuel comptees separement ; parent jamais coche automatiquement. [trello:6ac39f30bfe4848ec3eca940:code:sous-taches-agent]
- [x] Installateur en simulation par defaut, reutilisation des noms existants et maintien du bilan desactive. [trello:6ac39f30bfe4848ec3eca940:code:planification-agent]
- [x] Notifications independantes : une erreur ne bloque pas les autres canaux. [trello:6ac39f30bfe4848ec3eca940:code:discord-agent]
- [ ] Examiner humainement le rapport de simulation avant toute application Trello. [trello:6ac39f30bfe4848ec3eca940:manuel:accord-agent]
- [ ] Choisir une reference Git explicite si des commits anterieurs au premier point de reprise doivent etre attribues. [trello:6ac39f30bfe4848ec3eca940:manuel:baseline-agent]
- [ ] Toute reactivation future de 21 h exige une nouvelle demande explicite ; ne pas l'activer actuellement. [trello:6ac39f30bfe4848ec3eca940:manuel:reprise-agent]

### Tests de l audit agent

- [x] Tests Python de surete, Git, sous-taches et transitions avec faux services ; tests PowerShell sans commande reelle du Planificateur.
- [x] Simulation complete en lecture seule : 71 cartes analysees, aucun deplacement propose, aucune notification et aucun point de reprise cree.
- [x] Tache Windows de 21 h conservee desactivee ; Cloudinary 20 h laisse inchange.

- [x] Enchainement cache identifie dans le lanceur actif de 20 h : bilan desormais optionnel et desactive par defaut, Cloudinary conserve.
