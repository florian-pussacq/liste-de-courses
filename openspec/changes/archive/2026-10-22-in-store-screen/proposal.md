# Proposal

## Why

L'écran de la liste sert deux moments, préparer la liste puis faire les courses, sans les distinguer. Les outils de préparation restent au premier plan en magasin : le compteur « − / + » occupe le tiers droit de chaque ligne à prendre, là où tombe le pouce qui veut cocher, et « Coller une liste » est l'élément le plus visible de l'écran alors qu'on ne colle rien en rayon. Le change `default-quantity-one` a mis le compteur sur chaque ligne pour faciliter la préparation ; il n'avait pas évalué la zone du pouce pendant les courses.

## What Changes

- **Moment des courses** : la liste est « en magasin » dès qu'au moins un de ses articles est pris, et revient en préparation quand plus aucun ne l'est (tout décoché, articles pris retirés, liste vidée). Le moment se déduit de la liste : aucun réglage, rien à mémoriser.
- **Compteur réservé à la préparation** : en magasin, les lignes à prendre ne présentent plus « − / + » ; leur quantité s'affiche comme ailleurs, en pastille au-delà de 1. L'ajustement reste possible depuis les actions de l'article. **BREAKING** (comportement) : revient sur « − / + sur chaque ligne à prendre » en magasin.
- **Collage discret en magasin** : l'action « Coller une liste » reste disponible en une action depuis la liste, réduite à son icône à côté du « + ».

Hors périmètre : l'en-tête de progression (nombre à prendre, fraction et barre), traité dans une proposition séparée.

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `shopping-list` : nouveau requirement « Moment des courses », qui définit quand la liste est en magasin.
- `item-quantities` : affichage et ajustement de la quantité sur la ligne d'un article à prendre selon le moment des courses.
- `item-capture` : le collage depuis le presse-papiers est présenté réduit en magasin.

## Impact

- Domaine : une fonction qui dit si une liste est en magasin, à partir des articles pris.
- Interface : `ItemRow` (compteur ou pastille), dock de `ShoppingListView` (collage complet ou réduit).
- Tests e2e : les tests du compteur sur la ligne restent valables en préparation ; ajout des cas en magasin.
- Glossaire de `CLAUDE.md` : « en magasin » → `inStore`.
- Données : aucune.
