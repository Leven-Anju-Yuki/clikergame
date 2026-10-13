# Agent Lapinous corrigé

1. Remplacer `tools/agent_lapinous/agent.py` par celui de ce dossier. Sauvegarder l'ancien fichier.
2. Le `.env` reste uniquement à la racine de `clikergame` ; il doit contenir `TRELLO_API_KEY`, `TRELLO_TOKEN`, `TRELLO_BOARD_ID=5VmsAFi7` et les cinq `DISCORD_WEBHOOK_*`.
3. Si `liaisons_trello.json` contient seulement des valeurs `REMPLACER_...`, le remplacer par le JSON vide fourni. Sinon **conserver vos vraies liaisons**.
4. Installer : `py -m pip install requests python-dotenv`.
5. Tester : `py agent.py test-trello` puis `py agent.py listes-trello` et `py agent.py test-discord`.
6. Importer les cartes : `py agent.py initialiser-trello`. Cette commande remplace uniquement une configuration vide ou composée d'exemples. Remplir `chemins` pour chaque carte concernée, ex. `"chemins": ["assets/js/Zone_cuisine/"]`.
7. Simuler : `py agent.py bilan` ; appliquer : `py agent.py bilan --appliquer`.

**Important** : `bilan` met à jour les sections balisées de `A_FAIRE.md` et `readme.md` même en simulation. Les cartes ne sont déplacées qu'avec `--appliquer`. Une tâche cochée `- [x] ... [trello:ID_CARTE]` peut passer dans « À valider en jeu » ; seule une validation manuelle la place dans « Réalisé — code et historique ». Les cartes dans « Bloqué », « Idées à sélectionner » ou « Réalisé » ne sont jamais déplacées automatiquement.

Les changements Git sont ceux du répertoire de travail à l'instant du bilan, **pas nécessairement ceux du jour**. Le script de synchronisation Cloudinary de 20 h reste indépendant. Le bot interactif `bot_discord.py` est facultatif et nécessite un token ; les notifications de cet agent utilisent seulement les webhooks.

Pour la tâche Windows de 21 h, faire exécuter `py agent.py bilan --appliquer` dans `tools/agent_lapinous` (ou configurer son chemin absolu). Ne pas créer de seconde tâche Cloudinary.
