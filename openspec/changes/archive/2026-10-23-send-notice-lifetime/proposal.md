# Proposal

## Why

Après un envoi, l'information « Liste copiée : colle-la dans ta messagerie. » (ou l'impossibilité d'envoyer) reste affichée en tête de la liste jusqu'au rechargement de l'application, bien après qu'elle a servi, et décrit une liste qui a changé depuis.

## What Changes

- L'information qui suit un envoi disparaît dès que la liste change, comme le bilan de validation.

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `shopping-list` : nouveau requirement « Information d'envoi passagère ».

## Impact

- Interface : `ShoppingListView` rattache l'information à la liste envoyée.
- Tests e2e : information disparue après un changement de la liste.
