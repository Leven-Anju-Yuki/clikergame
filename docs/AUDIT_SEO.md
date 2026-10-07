# Audit SEO — Lapinous

Date : 5 octobre 2026. Audit du code local (`index.html`, `dashboard.html`, scripts).
L’URL déclarée dans Open Graph est https://leven-anju-yuki.github.io/clikergame/ ;
la tentative de lecture distante a échoué. L’état déployé et l’indexation Google ne sont donc pas vérifiés.
Aucun score Lighthouse ou Core Web Vitals n’a été mesuré.

## Avis

La base est correcte, mais le site n’est pas encore pleinement optimisé pour faire découvrir
le jeu via Google. Les métadonnées sont présentes ; le principal manque est un contenu de
présentation descriptif, accessible sans jouer, avec des liens vers des pages utiles.
Il n’est pas possible de garantir un classement ou une indexation à partir du code seul.

## Points présents

- Langue française déclarée et viewport mobile.
- Titre explicite : « Lapinous - Jeu de collection de lapins virtuels ».
- Meta description décrivant le jeu.
- Favicon et balises Open Graph pour les aperçus de partage.
- Un titre H1 dans le HTML initial, mais « Choisis ton compagnon » décrit surtout une action.

## Actions par priorité

1. **Présentation publique en HTML.** Ajouter un texte utile visible : principe du jeu,
   collection, soins, mini-jeux et combats. Prévoir un H1 incluant Lapinous et des H2
   explicatifs ; ne pas cacher artificiellement du texte aux joueurs.
2. **Pages de découverte.** Un guide pour débutants et une présentation des mécaniques,
   reliés par de vrais liens HTML. Les fiches créées uniquement après interaction dans le
   jeu ne remplacent pas des pages publiques autonomes.
3. **Canonical.** Déclarer l’URL publique préférée après confirmation de l’adresse de
   publication ; ne pas confondre `og:url` et `rel="canonical"`.
4. **Dashboard.** Ajouter `meta name="robots" content="noindex"` à la page administrateur.
   Sa redirection JavaScript vers l’accueil ne constitue pas une consigne explicite de
   non-indexation. Cette action SEO ne remplace pas un contrôle d’accès.
5. **Search Console.** Vérifier la propriété, inspecter l’URL et son rendu, consulter les
   pages indexées. Cette vérification nécessite l’accès du propriétaire.
6. **Performances réelles.** Mesurer mobile/ordinateur avec PageSpeed Insights, puis réduire
   le poids des images, réserver leurs dimensions et revoir le préchargement audio.
7. **Partage.** Prévoir une image de présentation lisible avec texte alternatif Open Graph ;
   les balises de partage améliorent les aperçus sociaux, sans garantir un classement Google.
8. **Sitemap si plusieurs pages publiques.** Il est absent du projet mais facultatif pour
   un petit site. N’inclure que les URL publiques utiles ; pas les archives, sauvegardes ou Dashboard.

## À ne pas surévaluer

- La balise `keywords` ne sert pas au classement Google.
- L’absence de robots.txt n’interdit pas l’indexation. Sur GitHub Pages de projet,
  `/clikergame/robots.txt` n’est pas le robots.txt de la racine du domaine.
- Google peut exécuter JavaScript : le jeu n’est pas automatiquement invisible, mais
  les interactions requises pour ouvrir ses écrans limitent le contenu directement accessible.
- Un sitemap ou des données structurées ne garantissent pas une meilleure position.

## Sources et prochaine vérification

- Guide officiel Google : https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Après publication : inspection Search Console, vérification du canonical et du noindex,
  mesure PageSpeed Insights et contrôle des aperçus sociaux.

Cet audit liste les travaux à réaliser ; il n’applique pas de changement SEO au site.
