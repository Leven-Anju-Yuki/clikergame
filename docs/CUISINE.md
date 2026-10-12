# Cuisine et frigo

La cuisine affiche le Chef (visuel provisoire), la portion de base et les évolutions. La réserve reste fermée : cliquer sur le frigo du fond ouvre un dialogue de provisions, avec fermeture explicite. Les achats utilisent toujours le panier et `game.inventory` ; consommer une unité nourrit le lapin actif et diminue son stock.

## Marché

Fraises du jardin : 12 carottes, +20 nourriture. Poire dorée : 18 carottes, +30. Courgette tendre : 22 carottes, +40. Fleurs du pré : 15 carottes, +25. Les visuels SVG sont dans `assets/img/magasin/aliments/`. Le panier gourmand reste un soin de la boutique, pas un aliment du Marché. Carottes, pommes et assortiment initial sont classés `legacy_food` et ne sont plus proposés ; les anciens stocks ne sont pas supprimés.

## Plats spéciaux en attente

`recipesEnabled: false` désactive la préparation et tous les effets des repas sur combat, résistance, expérience et vitesse. Les recettes, plats et éventuels anciens stocks sont conservés dans les données pour la future refonte des attaques, défenses et soins. Ils ne sont pas proposés dans la réserve ou le Marché.

## Évolutions

Cinq étapes : premier déblocage pour 20 points d’amitié aux niveaux 5/10/15/20 selon la pièce, puis 25/50/100/200 carottes. La portion de base rend 2 à 7 points de nourriture selon la cuisine. Les anciennes évolutions acquises sont conservées.

## Chef

`companions.chef.idle` dans le catalogue configure son image. Le visuel dédié reste à fournir ; le lapin cuisine est provisoire.
