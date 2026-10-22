# Design

## Context

`quantity?: Quantity` existe sur `Entry`, `Proposal`, `Item` et `Purchase` ; absent signifie aujourd'hui « non précisé ». `addQuantities(a?, b?)` n'additionne que les quantités écrites ; `stepQuantity(q?, delta, floor)` sert aux actions (plancher 0, retour à « non précisé ») et aux lignes (plancher 1). `ItemRow` n'affiche le compteur que si l'article a une quantité ; `QuantityBadge` s'affiche dès qu'une quantité existe ; `listAsText` écrit toute quantité ; `listedAgain` peut rapporter un « avant » absent.

## Goals / Non-Goals

**Goals:**
- Une seule notion de quantité, au moins 1, sans migration de données.
- Garder la protection contre le double collage.

**Non-Goals:**
- Compter chaque mention comme une unité.

## Decisions

### Absent se lit 1 ; sur une entrée, il signifie « aucun nombre écrit »
Le champ reste facultatif dans les données : `quantityOf(x) = x.quantity ?? 1` (domaine) le lit partout où une quantité est montrée ou comparée. Sur une `Entry` (texte reçu ou tapé), l'absence garde un sens propre, « aucun nombre écrit », dont dépend l'addition :
- `addQuantities(existing?, written?)` : sans nombre écrit, la quantité existante est gardée ; sinon `quantityOf(existing) + written`, plafonné à 99 ;
- un nouvel article ou une remise à prendre prend `written` tel quel, absent valant 1.

Alternative écartée : migrer toutes les quantités absentes vers 1. Elle ajouterait une version de schéma pour une valeur que `quantityOf` donne déjà, et effacerait la distinction « aucun nombre écrit » dans les propositions en cours.

### `stepQuantity` perd son plancher variable
La diminution s'arrête toujours à 1 : `stepQuantity(q?, delta)` borne `quantityOf(q) + delta` entre 1 et 99. Les commandes des actions et des lignes deviennent identiques.

### Affichage : compteur partout à prendre, pastille au-delà de 1
- `ItemRow` présente le compteur sur toute ligne non cochée ; tout le reste de la ligne, du rond au compteur, reste la cible de cochage.
- La valeur du compteur est un texte simple, pas un `<output>` : ce dernier est une zone d'état annoncée par les lecteurs d'écran, et une liste en aurait une par ligne.
- `QuantityBadge` ne s'affiche que pour `quantityOf(x) > 1` : tri, articles à vérifier, panier, historique, résultats de recherche.
- `listAsText` n'écrit la quantité qu'au-delà de 1.
- `listedAgain` compare `quantityOf(avant)` et `quantityOf(après)` ; « avant » est toujours un nombre, et le bilan affiche « Lait (1 → 3) ».

## Risks / Trade-offs

- [Toutes les lignes à prendre perdent la largeur occupée par le compteur] → Le libellé reste la cible de cochage, et la ligne garde sa hauteur ; vérifié par capture sur un écran de téléphone.
- [« lait » puis « 2 lait » donne désormais 3, contre 2 auparavant] → C'est la conséquence voulue du 1 affiché ; le bilan montre « (1 → 3) ».

## Migration Plan

Aucune migration : les quantités absentes enregistrées se lisent 1. Déploiement normal depuis `main`.
