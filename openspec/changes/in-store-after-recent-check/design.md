# Design

## Context

`isInStore(list)` vaut `list.items.some((item) => item.checked)`. `Item` porte `addedAt` et `updatedAt`, mais aucune trace de l'heure à laquelle il a été pris. La liste est enregistrée telle quelle dans un document IndexedDB ; un champ facultatif ajouté ne demande pas de migration. Voir proposal.md pour la motivation.

## Goals / Non-Goals

**Goals:**
- Un critère fondé sur l'heure du dernier article pris, calculé dans le domaine à partir d'une heure fournie.
- Un panier déjà enregistré avant ce changement lu comme celui de courses précédentes.

**Non-Goals:**
- Vider ou archiver automatiquement le panier.
- Rendre le délai réglable.

## Decisions

### `checkedAt` facultatif, posé quand l'article est pris
`toggleItem` pose `checkedAt: now` quand l'article devient pris et le retire quand il est décoché. `isInStore(list, now)` cherche le plus récent `checkedAt` des articles pris et le compare à `now` avec un délai d'une heure. Un article pris sans `checkedAt` (enregistré avant ce changement) ne rend pas la liste en magasin.

Alternative écartée : réutiliser `updatedAt`. Il change aussi quand un article du panier est renommé ou change de quantité : la liste repasserait en magasin pour une modification qui n'est pas un achat, contrairement à la spec.

### Délai d'une heure, relancé par chaque article pris
Le délai court depuis le dernier article pris, pas depuis le premier : des courses longues restent en magasin tant que l'on coche régulièrement. Les erreurs ne coûtent pas la même chose : un délai trop court rend le compteur en rayon (l'écran d'avant `in-store-screen`), un délai trop long le retire pendant la préparation (le défaut corrigé ici). Une heure entre deux articles pris couvre un changement de rayon ou de magasin sans retenir la liste en magasin une fois rentré.

### Réévaluation par une horloge de la vue
`ShoppingListView` tient une heure courante rafraîchie chaque minute et calcule `isInStore(list, now)`. Le minuteur couvre aussi le retour au premier plan : un navigateur suspend les minuteurs d'un onglet caché et les relance à son retour. La précision d'une minute suffit à un délai d'une heure.

Alternative écartée : écouter `visibilitychange`. Elle ne couvre pas une application restée ouverte au premier plan pendant plus d'une heure.

## Risks / Trade-offs

- [Courses avec une pause de plus d'une heure sans rien prendre] → Le compteur revient jusqu'au prochain article pris ; c'est l'écran de préparation, pas une perte.
- [Horloge du téléphone modifiée] → Le moment peut être faux jusqu'au prochain article pris ; sans gravité.

## Migration Plan

Aucune : `checkedAt` absent se lit « pris il y a longtemps ». Déploiement normal depuis `main`.
