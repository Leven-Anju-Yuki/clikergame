# Agent Lapinous — Trello, A_FAIRE, README, Discord

## Installation

Décompresser **agent_lapinous** dans `clickergame/tools/`.
Le script lit **uniquement** `clickergame/.env`, et ne le modifie jamais.

```powershell
cd tools/agent_lapinous
py -m pip install -r requirements.txt
py agent.py test-discord
py agent.py test-trello
py agent.py bilan
```

Dans `clickergame/.env`, conserver les clés Cloudinary et ajouter :

```dotenv
DISCORD_WEBHOOK_BILAN=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_TRELLO=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_ALERTES=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_CLOUDINARY=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_GENERAL=https://discord.com/api/webhooks/...
TRELLO_API_KEY=...
TRELLO_TOKEN=...
```

**Ne jamais partager ni committer `.env`.** Les Webhooks Discord suffisent pour l'envoi de messages, sans token de bot Discord. Aucun bot interactif n'est démarré.

## Lier les tâches aux cartes Trello

Dans `liaisons_trello.json`, remplacer les valeurs d'exemple par de vrais identifiants :
- `card_id` : ID de la carte existante Trello.
- `chemins` : préfixes des chemins de fichiers Git liés à la fonctionnalité.
- `liste_en_cours` et `liste_termine` : IDs des listes Trello correspondantes.

Dans `A_FAIRE.md`, associer la carte à une case à cocher explicite :

```markdown
- [ ] Cuisine : préparer les nouvelles recettes [trello:ID_DE_LA_CARTE]
- [x] Cuisine : préparer les nouvelles recettes [trello:ID_DE_LA_CARTE]
```

La première ligne signifie **non terminée** ; la seconde autorise le déplacement vers **Terminé**. L'agent ne déduit jamais « terminé » d'une simple modification de fichier. Ne placer ces lignes **ni** dans la section automatique, **ni** en double.

Les modifications Git des chemins configurés entraînent le déplacement vers « En cours » et l'ajout d'un commentaire, **si la carte n'est pas cochée terminée**. L'agent vérifie les commentaires récents pour éviter de répéter un commentaire identique. Il n'invente pas de progression chiffrée.

## Test et activation

```powershell
# Simulation Trello, mais README et A_FAIRE sont réellement mis à jour
py agent.py bilan

# Appliquer les modifications Trello + notifications Discord
py agent.py bilan --appliquer

# Installer / remplacer la tâche Windows de 21 h
.\installer_taches.ps1
```

**Attention** : `bilan` met à jour les sections délimitées du README et de A_FAIRE, même en simulation. Faire une sauvegarde ou un commit avant le premier essai. Le script ne modifie jamais les autres parties de ces fichiers.

La tâche Windows de **20 h Cloudinary n'est pas modifiée**. Cet agent ne téléverse ni ne supprime aucune image, ne lance pas la synchronisation et ne fait aucun push Git.

## Limites importantes

- Git `status` montre les modifications **encore visibles dans l'arbre de travail** : les changements déjà commités ne sont pas analysés. Pour un suivi fiable après commit, une comparaison Git avec le dernier bilan sera nécessaire.
- Les commentaires Trello décrivent les fichiers modifiés, pas une preuve de fonctionnalité achevée.
- Les noms de dossiers et IDs de cartes ne sont **pas** devinés : configurer les liaisons.
- Le rapport Discord ne remplace pas une vérification humaine. Les erreurs Trello sont rapportées sans arrêter les mises à jour des autres cartes.
- L'agent n'écrit pas automatiquement de tâches éditoriales dans A_FAIRE : il ajoute une section de suivi Git et conserve les cases de tâches saisies manuellement.
