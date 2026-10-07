# Ajouter les lapins du Nouvel An chinois

L’événement utilise la clé `nouvel_an_chinois`. Sa date est calculée chaque année
avec le calendrier chinois du navigateur, et non une date fixe en février.
Les dates officielles 2026–2028 sont prioritaires pour éviter un décalage observé
dans certaines versions du calendrier du navigateur. Les années suivantes utilisent
le calcul du navigateur et devront être contrôlées avant leur publication.
Par défaut : 10 jours avant et 10 jours après, jours limites inclus.
La durée se règle dans le Dashboard ; une ancienne sauvegarde de paramètres
reçoit automatiquement la valeur par défaut du nouvel événement.

## Fonds déjà branchés

Les sous-dossiers `assets/img/fond/Nouvel_An_Chinois/jour/` et `nuit/` contiennent :
`Salon_Nouvel_An_Chinois.png`, `Cuisine_Nouvel_An_Chinois.png`,
`Chambre_Nouvel_An_Chinois.png`, `salle_de_bain_Nouvel_An_Chinois.png`,
`Jardin_Nouvel_An_Chinois.png` et `Combat_Nouvel_An_Chinois.png`.
Le jeu choisit la nuit de 20 h à 7 h selon l’heure de l’appareil.

## Ajouter chaque lapin

Six fiches sont désormais présentes dans `lapinous-content.json` : Jinfu (chance),
Longyun (dragon), Huangdi (empereur), Yuehua (impératrice), Denghua (lanternes)
et Wushi (tigre). Jinfu est rare ; Denghua et Wushi sont épiques ; Huangdi et
Yuehua sont légendaires ; Longyun est mythique. Le nombre de techniques accessibles
dépend de leur rareté et de leur progression.
Yuehua utilise temporairement `imperatrice_cote.png` pour les deux vues.
Les instructions suivantes servent à ajouter d'autres personnages.

1. Déposer ses deux images séparées dans `assets/img/lapin_evenement/Nouvel_An_Chinois/`.
2. Dans le Dashboard, créer le lapin et choisir « Nouvel An chinois uniquement ».
3. Indiquer sa rareté, son nom, ses pouvoirs et les chemins des deux images.
4. Exporter le contenu du Dashboard puis remplacer `lapinous-content.json` pour partager
   les nouveaux lapins avec tous les joueurs ; les modifications locales seules ne sont pas publiées.

Champs à utiliser dans l’entrée du JSON (exemple à adapter, pas un personnage déjà ajouté) :

```json
{
  "name": "Nom du lapin",
  "rarity": "mythique",
  "event": "nouvel_an_chinois",
  "faceImg": "./assets/img/lapin_evenement/Nouvel_An_Chinois/nom_face.png",
  "coteImg": "./assets/img/lapin_evenement/Nouvel_An_Chinois/nom_cote.png"
}
```

Le dossier seul n’ajoute pas de personnage : il faut une entrée dans le contenu.
La planche « Huit poses, quatre lapins mythiques.png » est conservée ; elle doit être
séparée en visuels individuels avant de servir d’image de face ou de côté.
Les lapins marqués avec cet événement deviennent disponibles dans les œufs pendant
la période ; les compagnons déjà obtenus restent dans la collection après la fête.

## Tester

Sur localhost, activer les tests administrateur et choisir « Nouvel An chinois »
dans Événement, puis Jour/Nuit pour vérifier les deux décors.
Revenir ensuite à « Calendrier normal ».

Tests de calendrier : `node --test tests/chinese-new-year.test.cjs`.
