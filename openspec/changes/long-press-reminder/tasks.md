# Tasks

## 1. Interface

- [ ] 1.1 Écrire les tests e2e « Rappel en préparation » et « Pas de rappel en magasin », et constater que le premier échoue
- [ ] 1.2 Afficher le rappel sous les articles en préparation dans `ShoppingListView`, en texte atténué, et vérifier que les tests de 1.1 passent, le message de la liste vide restant inchangé
- [ ] 1.3 Vérifier par capture, en clair et en sombre, la liste en préparation et en magasin, sur une largeur de téléphone

## 2. Vérification d'intégration

- [ ] 2.1 Lancer `openspec validate --all --strict`, format, lint, typecheck, tests unitaires et e2e, puis la CI complète sur `main`, et vérifier que tout est vert et que le déploiement a réussi

## Workflow follow-up

- Archiver le change avec `/opsx:archive` une fois la CI verte.
