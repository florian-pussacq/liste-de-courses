# Tasks

## 1. Domaine

- [x] 1.1 Ajouter en TDD `isInStore(list)` dans `shopping-list.ts`, et vérifier par des tests unitaires les cinq scénarios de « Moment des courses »
- [x] 1.2 Ajouter « en magasin » → `inStore` au glossaire de `CLAUDE.md`, et vérifier que le nom utilisé dans le code est le même

## 2. Interface

- [x] 2.1 Passer `adjustable` à `ItemRow` depuis la vue (`!inStore` à prendre, `false` au panier), et vérifier en e2e « Pas de commande sur la ligne en magasin », « Quantité affichée en magasin » et « Ajustement depuis les actions en magasin », les tests existants du compteur restant verts en préparation
- [x] 2.2 Réduire en magasin le bouton de collage à son icône, libellé non rendu et nom gardé, aligné à droite avec le « + », et vérifier en e2e « Collage en préparation », « Collage en magasin » et « Coller en magasin »
- [x] 2.3 Vérifier par capture, en clair et en sombre, la liste en préparation puis en magasin (lignes à prendre et dock), sur une largeur de téléphone

## 3. Vérification d'intégration

- [x] 3.1 Lancer `openspec validate --all --strict`, lint, typecheck, tests unitaires et e2e, puis la CI complète sur `main`, et vérifier que tout est vert et que le déploiement a réussi
- [x] 3.2 Sur un téléphone Android réel : cocher un premier article d'une main, et vérifier que les compteurs disparaissent, que le collage se réduit, et que décocher ramène la préparation

## Workflow follow-up

- Archiver le change avec `/opsx:archive` après la vérification sur téléphone.
- Proposer séparément la simplification de l'en-tête de progression.
