# Tasks

## 1. Interface

- [ ] 1.1 Écrire les tests e2e « Articles à vérifier en tête » (titre « À vérifier avant de partir », au-dessus des articles à prendre) et « Doutes après les articles à prendre en magasin » (titre « Dans le doute », entre les articles à prendre et le panier), et constater que le second échoue
- [ ] 1.2 Placer et intituler la section selon le moment des courses dans `ShoppingListView`, sans dupliquer son balisage, et vérifier que les tests de 1.1 passent, les tests existants des articles à vérifier restant verts
- [ ] 1.3 Vérifier par capture, en clair et en sombre, la liste en préparation et en magasin avec des articles à vérifier, sur une largeur de téléphone

## 2. Vérification d'intégration

- [ ] 2.1 Lancer `openspec validate --all --strict`, format, lint, typecheck, tests unitaires et e2e, puis la CI complète sur `main`, et vérifier que tout est vert et que le déploiement a réussi

## Workflow follow-up

- Archiver le change avec `/opsx:archive` une fois la CI verte.
