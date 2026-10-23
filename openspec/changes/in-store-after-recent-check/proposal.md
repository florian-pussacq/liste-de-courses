# Proposal

## Why

Le moment des courses (`in-store-screen`) considère la liste en magasin dès qu'un article est pris. Or le panier n'est vidé que par « Retirer les articles pris » : quand des articles pris lors de courses précédentes y restent, la liste se croit en magasin pendant toute la préparation suivante, et les lignes à prendre perdent leur compteur « − / + » au moment où il sert.

## What Changes

- **En magasin = article pris récemment** : la liste est en magasin lorsque son dernier article pris l'a été il y a moins d'une heure. Chaque article pris relance ce délai ; un panier laissé par des courses précédentes ne fait plus passer la liste en magasin. **BREAKING** (comportement) : remplace « au moins un article pris ».
- **Réévaluation au fil du temps** : le moment change de lui-même une fois le délai écoulé, sans action de l'utilisateur, y compris quand l'application revient au premier plan.
- Les scénarios du compteur et du collage décrivent désormais leur contexte par le moment des courses (« la liste est en magasin »), et non plus par la seule présence d'un article pris.

Hors périmètre : vider automatiquement le panier des courses précédentes.

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `shopping-list` : « Moment des courses » se fonde sur l'heure du dernier article pris.
- `item-quantities` : scénarios d'« Affichage de la quantité » et d'« Ajustement de la quantité » exprimés par le moment des courses.
- `item-capture` : scénarios de « Collage réduit en magasin » exprimés par le moment des courses.

## Impact

- Domaine : un article pris retient l'heure à laquelle il l'a été ; `isInStore` reçoit l'heure courante.
- Interface : `ShoppingListView` réévalue le moment chaque minute.
- Données : champ facultatif ; un article pris enregistré avant ce changement, sans heure, est lu comme pris il y a longtemps. Aucune migration.
- Tests : unitaires du moment, e2e avec horloge simulée.
