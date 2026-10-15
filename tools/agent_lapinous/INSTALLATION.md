# Installation de l’agent Lapinous

Voir [README_INSTALLATION.md](README_INSTALLATION.md) pour la procédure actuelle et les tests.

Une seule tâche existante à 20 h Europe/Paris : synchronisation Cloudinary, puis bilan immédiat même en cas d’échec, puis rapport Discord. Aucun bilan indépendant. Ne créer aucune tâche et ne remettre la chaîne en service qu’après validation humaine des simulations.

Le `.env` reste à la racine. La simulation `python -B tools/agent_lapinous/agent.py bilan` est strictement en lecture seule : pas de rapport écrit, pas de notification, pas de modification Trello ni de point de reprise. Les correspondances existantes sont conservées ; Réalisé reste sous validation humaine.
