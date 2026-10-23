# Tasks

## 1. Reproduction

- [ ] 1.1 Écrire le test e2e « Panier des courses précédentes » (horloge simulée : un article pris, deux heures passent, la liste retrouve le compteur et le libellé du collage), et constater qu'il échoue

## 2. Domaine

- [ ] 2.1 Poser `checkedAt` quand un article est pris et le retirer quand il est décoché, en TDD, et vérifier par des tests unitaires de `toggleItem`
- [ ] 2.2 Fonder `isInStore(list, now)` sur le dernier `checkedAt` avec un délai d'une heure, en TDD, et vérifier les huit scénarios de « Moment des courses », dont un article pris sans `checkedAt`
- [ ] 2.3 Ajouter « pris le » → `checkedAt` au glossaire de `CLAUDE.md`

## 3. Interface

- [ ] 3.1 Réévaluer le moment chaque minute dans `ShoppingListView`, et vérifier en e2e « Panier des courses précédentes » (1.1) et « Fin des courses avec le temps », les tests existants en magasin restant verts

## 4. Vérification d'intégration

- [ ] 4.1 Lancer `openspec validate --all --strict`, format, lint, typecheck, tests unitaires et e2e, puis la CI complète sur `main`, et vérifier que tout est vert et que le déploiement a réussi

## Workflow follow-up

- Archiver le change avec `/opsx:archive` une fois la CI verte.
