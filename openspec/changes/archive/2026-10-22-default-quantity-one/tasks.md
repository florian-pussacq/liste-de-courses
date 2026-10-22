# Tasks

## 1. Domaine

- [x] 1.1 Ajouter `quantityOf`, réécrire en TDD `addQuantities` (nombre écrit ajouté à la quantité lue, ajout sans nombre sans effet) et `stepQuantity` (plancher 1), et vérifier les scénarios de « Addition des quantités »
- [x] 1.2 Faire rapporter au bilan une quantité « avant » toujours numérique, et vérifier « Lait (1 → 3) »
- [x] 1.3 N'écrire dans `listAsText` que les quantités supérieures à 1, et vérifier le scénario « Quantité envoyée »

## 2. Interface

- [x] 2.1 Présenter le compteur sur chaque ligne à prendre et arrêter la diminution à 1 dans les actions, et vérifier en e2e « Commande sur chaque ligne », « Minimum » et « Augmentation depuis les actions »
- [x] 2.2 N'afficher la pastille qu'au-delà de 1, et vérifier en e2e « Quantité de 1 sous-entendue » et l'historique
- [x] 2.3 Vérifier par capture, en clair et en sombre, une liste mêlant quantités 1 et supérieures

## 3. Vérification d'intégration

- [x] 3.1 Lancer `openspec validate --all --strict` et la CI complète sur `main`, et vérifier que tout est vert et que le déploiement a réussi
- [x] 3.2 Sur un téléphone Android réel : ajuster la quantité d'un article sans nombre depuis sa ligne, et vérifier qu'il se coche toujours en touchant son libellé

## Workflow follow-up

- Archiver le change avec `/opsx:archive` après la vérification sur téléphone.
