# Tasks

## 1. Interface

- [x] 1.1 Écrire les tests e2e « Pas de barre en préparation » et « Barre en magasin », et constater que le premier échoue
- [x] 1.2 N'afficher la barre de progression qu'en magasin dans `ShoppingListView`, et vérifier que les tests de 1.1 passent, les tests existants de la progression restant verts
- [x] 1.3 Vérifier par capture, en clair et en sombre, l'en-tête en préparation et en magasin, sur une largeur de téléphone

## 2. Vérification d'intégration

- [ ] 2.1 Lancer `openspec validate --all --strict`, format, lint, typecheck, tests unitaires et e2e, puis la CI complète sur `main`, et vérifier que tout est vert et que le déploiement a réussi

## Workflow follow-up

- Archiver le change avec `/opsx:archive` une fois la CI verte.
