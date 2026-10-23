# Tasks

## 1. Interface

- [x] 1.1 Écrire le test e2e « Information dépassée » (liste copiée, puis un article coché) et constater qu'il échoue, « Information conservée » étant couvert par le test existant de la copie
- [x] 1.2 Rattacher l'information d'envoi à la liste envoyée dans `ShoppingListView`, et vérifier que les tests d'envoi passent

## 2. Vérification d'intégration

- [x] 2.1 Lancer `openspec validate --all --strict`, format, lint, typecheck, tests unitaires et e2e, puis la CI complète sur `main`, et vérifier que tout est vert et que le déploiement a réussi

## Workflow follow-up

- Archiver le change avec `/opsx:archive` une fois la CI verte.
