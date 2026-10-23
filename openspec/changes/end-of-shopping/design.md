# Design

## Context

`isInStore(list, now)` dit si le dernier article pris l'a été il y a moins d'une heure ; `clearChecked(list)` retire les articles pris. `ShoppingListView` relit l'heure chaque minute. La liste est chargée une fois au démarrage (`app.shoppingList()` dans `main.ts`). L'historique des achats est enregistré au cochage et ne dépend pas de la liste. Voir proposal.md pour la motivation.

## Goals / Non-Goals

**Goals:**
- Une règle unique, dans le domaine : une liste qui n'est pas en magasin ne garde pas d'articles pris.
- Le même résultat que l'application soit rouverte ou restée ouverte.

**Non-Goals:**
- Annuler le retrait automatique : il n'est pas un geste de l'utilisateur, et l'historique permet de remettre un article.

## Decisions

### `endShopping(list, now)` dans le domaine
`endShopping(list, now)` renvoie la liste inchangée lorsqu'elle est en magasin, et `clearChecked(list)` sinon. Elle réutilise le critère du moment des courses : le panier n'est vidé que lorsque les courses sont terminées, pas article par article (un article pris il y a plus d'une heure reste dans le panier tant que d'autres articles sont pris pendant les mêmes courses).

Alternative écartée : retirer chaque article pris depuis plus d'une heure. Pendant de longues courses, les premiers articles disparaîtraient du panier avant la fin.

### Application : appliquer et enregistrer
`app.endShopping()` charge la liste, applique `endShopping` avec l'heure de l'application, et n'enregistre que si la liste a changé. `main.ts` l'appelle à la place de `shoppingList()` pour obtenir la liste initiale ; la vue l'appelle lorsque `inStore` passe à faux alors que le panier n'est pas vide.

Alternative écartée : faire le tri à la lecture (`shoppingList()`). Une lecture qui écrit surprend, et ne couvre pas l'application restée ouverte.

### Déclenchement dans la vue
Un effet observe `inStore` et le panier : en préparation avec un panier non vide, il appelle `app.endShopping()` et remplace la liste. En préparation, un panier non vide ne peut venir que de courses terminées : cocher un article fait aussitôt passer la liste en magasin.

## Risks / Trade-offs

- [Revoir son panier une fois rentré, plus d'une heure après] → Les achats restent dans l'historique, consultable et d'où un article se remet dans la liste.
- [Un panier enregistré avant ce changement disparaît à la première ouverture] → C'est le panier de courses précédentes que ce changement vise ; ses achats sont dans l'historique.
- [Horloge du téléphone avancée par erreur] → Le panier peut être vidé trop tôt ; l'historique conserve les achats.

## Migration Plan

Aucune migration de schéma. Au premier démarrage, les articles pris sans heure de prise sont retirés de la liste.
