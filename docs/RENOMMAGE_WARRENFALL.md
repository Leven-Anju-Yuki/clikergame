# Renommage vers Warrenfall — inventaire préalable

Identité : **Warrenfall : Les Chroniques de Garenne**, nom court **Warrenfall**.

## Fichiers à examiner avant modification

- `AGENTS.md`
- `A_FAIRE.md`
- `Lapinous_documents_juridiques/00_LIRE_AVANT_PUBLICATION.md`
- `Lapinous_documents_juridiques/01_CGU.html`
- `Lapinous_documents_juridiques/02_CGV_carottes.html`
- `Lapinous_documents_juridiques/03_confidentialite.html`
- `Lapinous_documents_juridiques/04_mentions_legales.html`
- `Lapinous_documents_juridiques/05_credits_IA_licences.html`
- `Lapinous_documents_juridiques/06_retractation_remboursement.html`
- `Lapinous_documents_juridiques/07_suppression_donnees.html`
- `assets/js/installer.js`
- `assets/js/local-files.js`
- `assets/js/script.js`
- `dashboard.html`
- `docs/AUDIT_SEO.md`
- `docs/AUDIT_VISUELS_GOOGLE_PLAY.md`
- `docs/MAGASIN.md`
- `docs/PUZZLES.md`
- `index.html`
- `lapinous-quiz.json`
- `liste de futur création/futur_lapin.md`
- `manifest.json`
- `readme.md`
- `tools/agent_lapinous/INSTALLATION.md`
- `tools/agent_lapinous/README_INSTALLATION.md`
- `tools/agent_lapinous/agent.py`
- `tools/agent_lapinous/bot_discord.py`
- `tools/agent_lapinous/installer_batterie.ps1`
- `tools/agent_lapinous/surveillance_batterie.py`
- `tools/cloudinary-corbeille.mjs`

## Dépendances conservées

Clés localStorage/IndexedDB `lapinous_*`, API JavaScript `Lapinous…`, catalogues `lapinous-*.json`, chemins Cloudinary/public_id, manifeste de ressources, noms des tâches Windows, dossiers physiques et sauvegardes. Aucun rapport historique ni PDF archivé réécrit. Les HTML juridiques restent les documents courants, leurs PDF historiques conservent leur nom et leur contenu.

## GitHub

Dépôt initial : `https://github.com/Leven-Anju-Yuki/clikergame.git`. Aucun push prévu. Statut du renommage distant à vérifier après les contrôles locaux.

## Résultat du renommage

Les titres officiels sont Warrenfall : Les Chroniques de Garenne ; les libellés courts sont Warrenfall. Les anciennes appellations Lapinous et Cliker Games/Clicker Games ont été recherchées ; les références techniques et historiques identifiées restent conservées.

Le dépôt était déjà `Leven-Anju-Yuki/warrenfall` lors du contrôle API GitHub. Aucun renommage distant n’a été exécuté par cette intervention. `origin` pointe maintenant vers `https://github.com/Leven-Anju-Yuki/warrenfall.git`. La lecture de main est confirmée. GitHub Pages annonce le site construit à `https://leven-anju-yuki.github.io/warrenfall/`. Aucun push, commit ou lancement d’automatisation réelle effectué.

Les futurs bilans et alertes portent le nouveau nom. Les webhooks, le fichier .env, les seuils batterie 30/25/20/15 %, les tâches 20 h et ancienne 21 h désactivée, le mode APPLICATION Trello, la quarantaine de sept jours et les sauvegardes permanentes sont inchangés.

### Fichiers modifiés par cette mission

- `.gitignore` (seul le nouveau compte rendu est rendu publiable ; les autres documents non suivis restent ignorés).

- `AGENTS.md`
- `A_FAIRE.md`
- `Lapinous_documents_juridiques/00_LIRE_AVANT_PUBLICATION.md`
- `Lapinous_documents_juridiques/01_CGU.html`
- `Lapinous_documents_juridiques/02_CGV_carottes.html`
- `Lapinous_documents_juridiques/03_confidentialite.html`
- `Lapinous_documents_juridiques/04_mentions_legales.html`
- `Lapinous_documents_juridiques/05_credits_IA_licences.html`
- `Lapinous_documents_juridiques/06_retractation_remboursement.html`
- `Lapinous_documents_juridiques/07_suppression_donnees.html`
- `assets/js/installer.js`
- `assets/js/local-files.js`
- `assets/js/script.js`
- `dashboard.html`
- `docs/AUDIT_SEO.md`
- `docs/AUDIT_VISUELS_GOOGLE_PLAY.md`
- `docs/MAGASIN.md`
- `docs/PUZZLES.md`
- `docs/RENOMMAGE_WARRENFALL.md`
- `index.html`
- `lapinous-quiz.json`
- `liste de futur création/futur_lapin.md`
- `manifest.json`
- `readme.md`
- `tools/agent_lapinous/INSTALLATION.md`
- `tools/agent_lapinous/README_INSTALLATION.md`
- `tools/agent_lapinous/agent.py`
- `tools/agent_lapinous/bot_discord.py`
- `tools/agent_lapinous/installer_batterie.ps1`
- `tools/agent_lapinous/liaisons_trello.json`
- `tools/agent_lapinous/surveillance_batterie.py`
- `tools/test-landscape-game.mjs`
- `tools/test-pwa.mjs`
- `tools/update-readme-sizes.mjs`

### Compatibilité volontaire

- Catalogues `lapinous-content.json`, `lapinous-shop.json`, `lapinous-puzzles.json`, `lapinous-quiz.json`.
- Clés localStorage/IndexedDB, noms des bases et poignées File System Access, dossiers `Lapinous_Sauvegardes` et anciens alias.
- API globales JavaScript `Lapinous…`, classes et fonctions techniques de l’agent, marqueurs de rapports et commentaires déjà utilisés.
- Préfixes du service worker et icônes `lapinous-192.png`/`lapinous-512.png` ; id/scope/start_url du manifest conservés.
- Manifeste d’images, ressources, public_id et URLs Cloudinary inchangés. L’image sociale réutilise une URL Cloudinary déjà présente dans le favicon.
- Noms et chemins physiques Windows conservés, ainsi que les noms des tâches planifiées.
- Historiques intégrés aux documents, dossiers d’archives et PDF d’origine conservés comme archives. Les versions courantes à lire sont les HTML et Markdown renommés dans leur contenu.

### Étapes restantes

Publier les fichiers locaux par le processus habituel, sans push automatique de l’agent. Vérifier ensuite l’identité sur le site et dans la PWA installée, puis les prochains rapports réels. Aucun changement manuel du remote n’est nécessaire. Aucun secret n’a été copié dans ce document.

Les anciens raccourcis PWA qui pointent vers `/clikergame/` sont à contrôler après publication. Ouvrir la nouvelle adresse dans le même navigateur pour retrouver la progression ; exporter la partie avant toute réinstallation ou suppression d’un ancien raccourci. Aucune désinstallation automatique n’est réalisée.

## Résultats des vérifications

- 30 tests Python réussis avec Trello/Discord simulés.
- 7 scénarios de chaîne et 5 scénarios d’installateur Windows réussis, via doublures : aucune tâche réelle modifiée ou lancée.
- Syntaxe JavaScript/MJS et PowerShell modifiés vérifiée ; AST Python identique à l’original après normalisation des seuls libellés.
- Empreintes du manifeste d’images, du validateur de sauvegarde, du service worker, de la configuration Trello, de la chaîne et de la corbeille Cloudinary inchangées.
- Tests PWA, grilles Sudoku, limite d’erreurs, succès, exports JSON et résolveur d’images réussis.
- Parcours Chrome 568×280 réussi : titre officiel, ancienne sauvegarde via `lapinous_autosave`, surnom « Ancienne sauvegarde », trois favoris, cuisine, chambre, quiz terminé, magasin, table, atelier, fragments, inventaire et garde-manger. Installation simulée masquée après confirmation et rechargement.
- L’ancien test `tools/tests-archives/test-quiz.mjs` a expiré après 45 secondes. Il n’est pas déclaré réussi ; le même parcours d’ouverture et de fin du quiz passe dans `tools/test-landscape-game.mjs --brand --polish --family --quick --ui-only`.
- GitHub et Pages vérifiés par API en lecture seule ; `git ls-remote --heads origin` confirme main. Aucun envoi GitHub, Cloudinary, Trello ou Discord.
- `.env` et les états de vérification restent ignorés ; aucun jeton ni webhook dans ce compte rendu.

Les vérifications ne constituent pas une publication. Le site distant et les applications déjà installées pourront encore montrer l’ancienne identité jusqu’à la mise à jour et au renouvellement des caches correspondants.
