# Proposal

## Why

Modifier, supprimer ou marquer un article à vérifier passe par ses actions, ouvertes par un appui long sur sa ligne. Ce geste n'est indiqué que dans le message de la liste vide : dès qu'une liste est remplie, par exemple en collant un texte reçu, rien ne signale qu'il existe.

## What Changes

- **Rappel en préparation** : sous les articles, un rappel discret indique qu'un appui long sur un article permet de le modifier ou de le supprimer.
- **Absent en magasin** : en rayon, on coche ; le rappel n'y est pas affiché.
- La liste vide garde son message, qui contient déjà cette indication.

Hors périmètre : un bouton d'actions visible sur chaque ligne, une astuce affichée une seule fois.

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `shopping-list` : nouveau requirement « Rappel de l'appui long ».

## Impact

- Interface : `ShoppingListView` affiche le rappel selon le moment des courses.
- Tests e2e : rappel présent en préparation, absent en magasin.
- Domaine, données : aucun changement.
