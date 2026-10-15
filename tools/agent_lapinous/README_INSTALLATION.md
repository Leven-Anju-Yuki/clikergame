# Agent Lapinous - simulation et suivi explicite

Le bilan automatique de 21 h est actuellement suspendu. Ne pas reactiver la tache Windows sans demande explicite. Cloudinary reste prevu a 20 h Europe/Paris.

## Simulation sans effets secondaires

Depuis la racine : `py -B tools/agent_lapinous/agent.py bilan`.

Cette commande lit Git, A_FAIRE, les correspondances et Trello. Le rapport reste dans le terminal : aucun fichier, rapport ou point de reprise ecrit, aucune notification Discord, aucune modification Trello. Une erreur de simulation n'envoie rien non plus.

Le seul `.env` reste a la racine ; il n'est jamais reecrit et les secrets sont masques dans les erreurs.

## Correspondances

`liaisons_trello.json` contient les identifiants des cartes existantes. `chemins` sert au classement, sans constituer une preuve de travail. `automatique: true` et `preuves` sont necessaires pour analyser une carte automatiquement.

Chaque preuve indique un fichier exact et des `motifs` recherches seulement dans ses lignes ajoutees ou retirees. `dedie: true` autorise un fichier entier uniquement s'il est reserve a la fonctionnalite. Sans preuve precise, aucun deplacement. Les pistes manuelles ne sont pas attribuees automatiquement.

## Cases et sous-taches

Une seule case principale par carte, hors section automatique :

```markdown
- [ ] Sauvegardes [trello:IDENTIFIANT_REEL]
  - [x] Export implemente [trello:IDENTIFIANT_REEL:code:export]
  - [ ] Essai telephone [trello:IDENTIFIANT_REEL:manuel:mobile]
```

Les sous-taches affichent l'avancement ; elles ne cochent jamais le parent. Une preuve technique permet de proposer En cours. Le parent explicitement coche, sans sous-tache de code ouverte, permet de proposer A valider en jeu. Cela ne constitue jamais une validation finale. Les cartes Realise, Bloque, Idees et deja A valider restent protegees. Des marqueurs ambigus ou dupliques bloquent l'analyse.

## Git et point de reprise

Les chemins Git sont lus au format NUL, accents et renommages inclus. Les sources de l'agent ne sont plus exclues globalement.

Apres un bilan applique sans erreur Trello, `.cloudinary-local/trello-state.json` conserve les empreintes et textes necessaires aux preuves. Ce dossier est ignore par Git. Les commits suivants sont inclus et un meme contenu n'est pas retraite lors de son commit ulterieur. Une erreur Discord ne rejoue pas les transitions deja traitees.

Au premier passage, l'historique ancien n'est pas arbitrairement attribue. Pour inclure des commits anterieurs, choisir explicitement une reference :

`py -B tools/agent_lapinous/agent.py bilan --depuis-commit REFERENCE_GIT`

La simulation ne cree pas de point de reprise. Une reference de depart ne peut pas ecraser un point existant. Un etat invalide bloque l'analyse sans suppression ni reinitialisation.

## Application future : accord necessaire

`bilan --appliquer` autorise les ecritures locales, transitions permises et notifications. Cette commande n'a pas ete executee sur les services reels pendant les tests. Ne pas l'utiliser avant validation du rapport.

Chaque notification est traitee separement. Les erreurs sont ajoutees au rapport applique ; une panne ne bloque pas les autres canaux. `test-discord` et `initialiser-trello` exigent aussi `--appliquer` pour produire un effet.

Aucun appel ne cree de carte ni ne deplace une carte dans Realise.

## Installateur Windows

`powershell -NoProfile -ExecutionPolicy Bypass -File tools/agent_lapinous/installer_taches.ps1`

Sans `-Appliquer`, lecture seule et affichage du plan. Les taches existantes sont reconnues par leur nom et leurs actions ; leur nom et leur chemin Windows sont reutilises. Les doublons existants sont refuses, sans suppression.

Une nouvelle tache de 21 h est desactivee par defaut ; une tache desactivee le reste. L'option `-ActiverBilan` est reservee a une demande ulterieure explicite. Cloudinary ne change que si `-InstallerCloudinary` est demande. Les horaires restent 20 h / 21 h sur un Windows configure dans le fuseau de Paris.

## Tests isoles

```powershell
py -B tools/agent_lapinous/test_suivi_trello.py
powershell -NoProfile -ExecutionPolicy Bypass -File tools/agent_lapinous/test_installateur.ps1
```

Faux Trello et Discord uniquement. Les tests Git utilisent `.cloudinary-local/tests-agent` et conservent leurs fichiers. Les commandes d'ecriture du Planificateur sont remplacees par des doublures dans le test PowerShell.

## Lanceurs de 20 h

`tools/run-image-schedule.ps1` et `chaine_20h.ps1` ne lancent plus le bilan par defaut. Le transfert Cloudinary reste operationnel. L option `-InclureBilan` exige une demande explicite future et n est pas ajoutee aux taches Windows existantes. Aucun lanceur n a ete execute en reel pendant cet audit.
