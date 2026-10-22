# Proposal

## Why

Dans la boîte de réception, la ligne repliable « Coller ou écrire une liste à la main » occupe de la place sans servir : quand des articles sont à trier, on ne colle plus de texte ici, et quand il n'y en a pas, la zone de saisie est de toute façon dépliée. Le bouton « Ajouter » placé à côté d'un champ « Ajouter un article » répète ce que le champ dit déjà.

## What Changes

- **Saisie manuelle au bon moment** : la zone pour coller ou écrire un texte n'apparaît que lorsqu'il n'y a rien à trier ou que le presse-papiers n'a pas pu être lu, directement ouverte, sans ligne repliable. Quand des articles sont à trier, elle n'apparaît plus ; un nouveau texte se colle depuis la liste, comme d'habitude, et s'ajoute au tri en cours.
- **Bouton d'ajout sans texte** : à côté des champs « Ajouter un article » (tri et feuille d'ajout), le bouton devient un « + », de même nom pour les lecteurs d'écran.

Hors périmètre : le reste de la feuille du tri.

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `item-capture` : saisie manuelle proposée seulement quand il n'y a rien à trier ou que le presse-papiers n'a pas pu être lu.

## Impact

- Interface uniquement : feuille du tri et feuille d'ajout.
- Aucune donnée ni schéma modifiés.
