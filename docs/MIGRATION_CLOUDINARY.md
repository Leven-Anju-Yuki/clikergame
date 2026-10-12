# Images et synchronisation Cloudinary

Document actualisé le **9 octobre 2026**. Cloud : `dgrszi9wf`, racine distante : `lapinous/`.

## Ajouter une image

1. Déposer l’image dans son dossier habituel sous `assets/img/`.
2. Référencer son chemin dans le jeu ou dans `lapinous-content.json`, `lapinous-puzzles.json` ou `lapinous-shop.json`.
3. Laisser le PC allumé, éveillé et la session ouverte à **20 h, Europe/Paris**.
4. Après synchronisation, faire ton commit et ton push habituels pour publier les fichiers modifiés du jeu.

Les JSON conservent leurs chemins locaux. Le résolveur utilise les URL Cloudinary pour afficher les images. Les images inutilisées et les futures créations ne sont pas envoyées. Les visuels d’événements configurés restent pris en compte hors saison.

## Lancement automatique avec Windows

La tâche **« Lapinous - Images Cloudinary 20h »** est enregistrée dans le **Planificateur de tâches Windows** pour le compte utilisateur courant. L’ancienne tâche de 23 h a été retirée. Aucune fenêtre de script ne doit rester ouverte.

Elle exécute `tools/run-image-schedule.ps1`, qui lance :

```powershell
node tools/update-images.mjs --backup-local
```

Le script compare les empreintes SHA-256 et n’envoie que les images nouvelles ou modifiées. **Sans nouvelle image utilisée présente dans le projet, aucun appel Cloudinary n’est effectué.** Une copie locale déjà transférée peut être déplacée sans nouvel envoi.

Si le PC est éteint, en veille ou la session fermée à 20 h, l’exécution ne se fait pas. Il n’y a pas de rattrapage automatique au démarrage : lancer manuellement si nécessaire. Le journal du dernier lancement est `.cloudinary-local/nightly-images.log`.

Pour réinstaller la tâche sur ce poste :

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools/install-image-schedule.ps1
```

## Lancer immédiatement

Double-cliquer sur **`Synchroniser les images.cmd`**, ou exécuter la commande de synchronisation ci-dessus depuis la racine du projet. Le lancement est ponctuel.

Pour inspecter l’inventaire sans transfert ni déplacement :

```powershell
node tools/cloudinary-sync.mjs dry-run
```

Les variables `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` et `CLOUDINARY_API_SECRET` doivent être renseignées dans `.env`. Ne pas publier ce fichier ni partager les clés.

## Destination des images locales

Après transfert vérifié, les fichiers vont dans **`C:\Users\flori\Desktop\clikergame_avec_image`**, en gardant les mêmes sous-dossiers :

```text
Avant : clikergame\assets\img\magasin\aliments\fraise.png
Après : clikergame_avec_image\assets\img\magasin\aliments\fraise.png
```

**Si le même fichier existe déjà à destination, il est remplacé.** La copie est vérifiée par empreinte avant de supprimer la source. Les transferts échoués ou les fichiers modifiés depuis le transfert restent dans le projet. Les dossiers d’accueil sont conservés pour les prochaines images.

Cette copie est extérieure au projet publié. Les prochaines images ne vont plus dans l’ancien dossier `secours-images/`. La copie externe n’est pas automatiquement servie par le serveur web du projet principal : le jeu publié charge Cloudinary. Les sauvegardes de code dans `.cloudinary-local/backups/` sont distinctes des copies d’images.

Les 245 originaux de la migration initiale ont été supprimés du projet et restent sur Cloudinary. Le script ne les retélécharge pas pour reconstruire une sauvegarde. Un original absent n’a plus de secours local dans le projet principal.

## Cloudinary et GitHub : deux étapes

**Cloudinary stocke les images.** Le script actualise les fichiers locaux qui associent les chemins aux URL, notamment `assets/js/image-manifest.js` (manifeste unique utilisé par le navigateur et les outils) et les références nécessaires dans les pages et les styles.

**Ton push GitHub publie les fichiers modifiés du jeu.** Inclure les manifestes publics, les catalogues modifiés et les suppressions d’originaux. Le script ne fait aucun commit, push ni déploiement. Une image peut donc être sur Cloudinary sans que le site publié connaisse encore sa nouvelle URL.

## Quota et reprise

Le quota gratuit est vérifié avant les nouveaux envois. Le script refuse un compte payant ou un quota insuffisant/non vérifiable et ne déclenche aucun achat. Les statistiques Cloudinary peuvent être différées.

Les envois sont séquentiels, avec trois tentatives maximum et un état enregistré après chaque image. Les identifiants incorporent le chemin, le format et l’empreinte. Une version modifiée reçoit un nouvel identifiant distant : `overwrite=false` protège l’ancienne version Cloudinary. Le fichier dans la copie locale est, lui, remplacé. Les transferts déjà vérifiés sont réutilisés.

Aucune conversion n’est appliquée : PNG transparents, SVG et GIF restent dans leur format d’origine. Les URL HTTPS retournées par Cloudinary sont vérifiées par HEAD. Les secrets et états privés sont ignorés par Git ; les manifestes publics ne contiennent que des chemins et des URL.

## Fichiers techniques

- `tools/update-images.mjs` : commande unique et détection des changements.
- `tools/cloudinary-sync.mjs` : inventaire, quota, pilote et transferts.
- `tools/cloudinary-activate.mjs` : raccordement au jeu et au Dashboard.
- `tools/backup-transferred-images.mjs` : copie vérifiée vers `clikergame_avec_image`, puis retrait de la source.
- `assets/js/image-assets.js` : résolution des images, templates, poses, préchargements et fonds.
- `.cloudinary-local/inventory.json`, `manifest.json`, `quota.json` : états locaux privés.

Conserver les commentaires CSS `lapinous-local`, qui permettent de retrouver les chemins aux synchronisations suivantes.

## Vérifications

Migration initiale : **245 images sur 371**, **385 296 766 octets**, 126 exclues. Les 245 URL ont été vérifiées. La seconde synchronisation a réutilisé les 245 images sans nouvel envoi.

Les anciennes références absentes sont corrigées : `agilite.png` remplace `agilite.webp`, et `page.jpg` remplace `paper_dashboard_bg.jpg`.

```powershell
node tools/test-image-assets.mjs
node tools/test-image-browser.mjs
node tools/test-image-backup.mjs
```

Les tests couvrent le résolveur, les templates, les découpes de puzzle, les chargements PNG/GIF/SVG dans Chrome et le remplacement vérifié des sauvegardes. Le test de sauvegarde utilise une copie temporaire isolée. Chrome doit être installé à son emplacement Windows standard. Ces tests ne remplacent pas un contrôle manuel de tous les parcours du jeu.

Références API : [Upload](https://cloudinary.com/documentation/image_upload_api_reference), [API d’administration](https://cloudinary.com/documentation/admin_api).
