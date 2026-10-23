# Proposal

## Why

Les articles à vérifier sont des doutes à lever avant de partir, en regardant ce qu'il reste à la maison. En magasin, on ne peut plus vérifier : la section garde pourtant son titre « À vérifier avant de partir » et sa place en tête, au-dessus des articles à prendre, et repousse vers le bas la tâche du moment.

## What Changes

- **En préparation**, rien ne change : la section « À vérifier avant de partir » reste en tête, avant les articles à prendre.
- **En magasin**, la section passe après les articles à prendre, avant le panier, et s'intitule « Dans le doute ». Ses deux actions, « On en a » et « Il en faut », restent disponibles pour trancher en rayon.

Hors périmètre : replier la section, ou changer les actions de levée du doute.

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `shopping-list` : « Section des articles à vérifier » se limite à la section elle-même ; nouveau requirement « Place des articles à vérifier selon le moment des courses » (place et titre).

## Impact

- Interface : `ShoppingListView` place la section selon le moment des courses.
- Tests e2e : titre en préparation, place et titre en magasin.
- Domaine, données : aucun changement.
