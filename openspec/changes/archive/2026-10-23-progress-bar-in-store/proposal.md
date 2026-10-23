# Proposal

## Why

Pendant la préparation, la barre de progression est vide : elle n'ajoute rien au nombre d'articles à prendre affiché juste au-dessus. Pire, lorsque le panier contient encore des articles pris lors de courses précédentes, elle annonce une progression qui ne concerne pas les courses à venir.

## What Changes

- **Barre réservée aux courses** : la barre de progression n'est affichée que lorsque la liste est en magasin. En préparation, l'en-tête se limite au nombre d'articles à prendre.
- Les scénarios de la progression précisent qu'ils décrivent une liste en magasin.

Hors périmètre : le calcul de la progression, et le nombre d'articles à prendre, inchangés.

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `shopping-list` : scénarios de « Progression des courses » exprimés en magasin ; nouveau requirement « Barre de progression réservée aux courses ».

## Impact

- Interface : en-tête de `ShoppingListView`.
- Tests e2e : barre absente en préparation.
- Domaine, données : aucun changement.
