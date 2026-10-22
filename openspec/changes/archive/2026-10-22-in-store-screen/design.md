# Design

## Context

`ItemRow` décide seul de présenter le compteur : `adjustable = !item.checked`, et la pastille `QuantityBadge` s'affiche quand la ligne n'est pas ajustable. Le dock de `ShoppingListView` présente toujours « Coller une liste » en pleine largeur, fond encre, icône en `--accent`, à côté du « + » carré de 60 px. Le domaine expose déjà `checkedItems(list)`. Voir proposal.md pour la motivation, et les specs pour les comportements attendus.

## Goals / Non-Goals

**Goals:**
- Un seul critère, calculé dans le domaine, pour décider du moment des courses.
- Garder le nom accessible « Coller une liste » et les noms des commandes de quantité, dont dépendent les tests e2e.

**Non-Goals:**
- L'en-tête de progression (proposition séparée).
- Le contraste de l'icône de collage en préparation et en mode sombre : correctif visuel indépendant, en `fix(ui)`.
- Toute animation de passage d'un moment à l'autre.

## Decisions

### Le moment des courses est une fonction du domaine
`isInStore(list) = list.items.some((item) => item.checked)`, dans `shopping-list.ts`, à côté de `checkedItems`. C'est une règle du domaine (spécifiée dans `shopping-list`), pas une présentation : la placer dans la vue la rendrait invisible aux tests unitaires et la dupliquerait entre la ligne et le dock.

Alternatives écartées :
- Un mode choisi par l'utilisateur (« Je pars ») : un état de plus à persister et à oublier, source d'erreurs de mode.
- Un seuil de progression (par exemple 10 % pris) : arbitraire, et plus difficile à expliquer qu'« un article pris ».

### `ItemRow` reçoit `adjustable` de la vue
La vue calcule `inStore` une fois et passe `adjustable={!inStore}` aux lignes à prendre, `adjustable={false}` à celles du panier : chaque liste sait déjà si ses articles sont pris. `ItemRow` garde sa logique existante : compteur si ajustable, pastille sinon (pastille qui ne s'affiche qu'au-delà de 1). On évite ainsi que la ligne connaisse la liste entière.

Alternative écartée : passer `inStore` à `ItemRow`, qui recombinerait avec `item.checked`. La ligne aurait alors deux raisons de cacher le compteur au lieu d'une.

### Collage réduit : même bouton, libellé masqué visuellement
Le bouton de collage reste un seul élément, nommé par `aria-label="Coller une liste"` ; son libellé visible n'est rendu qu'en préparation. Le nom accessible ne change donc jamais, les sélecteurs e2e `getByRole('button', { name: 'Coller une liste' })` restent valables, et l'absence de texte visible en magasin se vérifie directement. En magasin, le bouton prend la taille du « + » (60 × 60), le style secondaire des actions d'en-tête (bordure et icône `--ink`, fond `--ground`), et les deux boutons s'alignent à droite, dans la zone du pouce.

Alternative écartée : masquer le libellé visuellement (`.visually-hidden`). Le texte resterait dans le DOM, et un test ne pourrait distinguer « affiché » de « masqué » qu'en mesurant le rendu.

Alternative écartée : deux boutons distincts selon le moment. Elle dupliquerait le gestionnaire et ferait sauter le focus au changement de moment.

## Risks / Trade-offs

- [Un article coché à la maison fait passer la liste en magasin avant le départ] → L'ajustement reste dans les actions de l'article, et décocher ramène la préparation.
- [Au premier article coché, toutes les lignes à prendre gagnent la largeur du compteur et se recomposent d'un coup] → Changement unique, déclenché par le geste de l'utilisateur, en même temps que l'apparition du panier qui l'explique ; vérifié par capture.
- [Le compteur disparaît sans explication] → Le panier, qui apparaît au même moment, rend le changement de moment visible ; à confirmer sur téléphone réel.

## Migration Plan

Aucune donnée touchée. Déploiement normal depuis `main` ; retour arrière par revert du commit d'interface.
