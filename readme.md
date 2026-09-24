# 🐰 Lapinous

Lapinous est un jeu de collection de lapins virtuels : adopte un compagnon, occupe-toi de lui (nourriture, sommeil, propreté, amitié), fais-le progresser, débloque des œufs pour agrandir ta collection avec des lapins rares, épiques, légendaires, mythiques — voire divins — et pars combattre les boss légumes du jardin.

## Fonctionnalités

- **Adoption** : choisis un lapin commun au démarrage, ou devine le nom du lapin secret...
- **Chaque lapin est indépendant** : faim, énergie, propreté, amitié et niveau sont propres à chaque compagnon. Change de lapin actif directement depuis le Salon.
- **5 pièces** : Salon (boutique à œufs, changement de compagnon), Cuisine, Chambre, Salle de bain, Jardin.
- **Améliorations de pièces** : chaque pièce peut être améliorée avec l'amitié gagnée (une seule amélioration active à la fois).
- **Mini-jeu d'agilité** dans le jardin : saute au bon moment pour gagner de l'amitié.
- **Aventures & combats** : affronte les boss légumes du jardin pour gagner des carottes.
- **Système d'œufs** : achète des œufs avec tes carottes et ouvre-les pour tenter d'obtenir un nouveau lapin (Commun → Rare → Épique → Légendaire → Mythique → Divin).
- **Événements saisonniers** : certains lapins n'apparaissent que pendant Halloween, Noël ou Pâques (dates réelles, fenêtre réglable).
- **Encyclopédie** : fiche complète (personnalité, histoire, pouvoir...) de chaque lapin et boss découvert.
- **Sauvegardes** : illimitées, nommées et datées, exportables en JSON, ou directement dans un vrai dossier sur ton disque (Chrome/Edge).
- **Dashboard administrateur** (protégé par code) : ajoute/modifie lapins et boss dans un tableau éditable avec recherche, règle les taux d'apparition des œufs et la durée des événements, suis des statistiques (camemberts par rareté, par difficulté, complétion des visuels).

## Structure du projet

```
index.html                     → le jeu
dashboard.html                 → l'espace administrateur (protégé par code)
lapinous-content.json          → tout le contenu (lapins, boss, taux d'œufs) : modifiable à la main ou via le Dashboard
assets/
  css/style.css                → tous les styles
  js/
    script.js                  → logique du jeu
    dashboard.js                → logique du Dashboard
    species-data.js            → chargement du contenu, fonctions partagées
    dashboard-access.js        → verrou du Dashboard (code à 4 chiffres, hashé)
  img/                          → images (lapins, boss, décors, icônes)
```

## Comment utiliser

1. Clone ce dépôt :
   ```bash
   git clone https://github.com/Leven-Anju-Yuki/clikergame.git
   ```
2. **Important** : ouvre le projet via un petit serveur local plutôt qu'en double-cliquant sur `index.html` (le chargement de `lapinous-content.json` a besoin d'un vrai serveur, même local) :
   ```bash
   python -m http.server 8000
   ```
   puis va sur `http://localhost:8000/`.
3. Adopte ton premier lapin, prends-en soin, et pars à l'aventure !
4. Pour gérer le contenu (ajouter des lapins/boss, régler les événements...), ouvre `dashboard.html` — code par défaut : `0000`, à changer dès que possible dans la section Sécurité.

## Contribution

Les contributions sont les bienvenues ! Pour proposer une modification :

1. Clone le dépôt sur ta machine locale.
2. Crée une nouvelle branche : `git checkout -b feature/nom-de-la-fonctionnalité`.
3. Fais tes modifications et teste-les attentivement (en particulier via le Dashboard si tu modifies du contenu).
4. Valide tes modifications : `git add . && git commit -m "Description de tes modifications"`.
5. Pousse ta branche : `git push origin feature/nom-de-la-fonctionnalité`.
6. Ouvre une pull request en expliquant les changements apportés.

## Auteurs

- [Florie](https://github.com/Leven-Anju-Yuki) - Développeuse principale

## Licence

Ce projet est sous licence [MIT](https://opensource.org/licenses/MIT) - voir le fichier [LICENSE](LICENSE) pour plus de détails.
