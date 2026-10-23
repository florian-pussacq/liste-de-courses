# Tasks

## 1. Domaine

- [ ] 1.1 Ajouter en TDD `endShopping(list, now)` dans `shopping-list.ts`, et vérifier par des tests unitaires : liste en magasin inchangée, panier retiré sinon, articles à prendre et à vérifier conservés, article pris sans heure retiré
- [ ] 1.2 Ajouter « fin des courses » → `endShopping` au glossaire de `CLAUDE.md`

## 2. Application

- [ ] 2.1 Ajouter `app.endShopping()`, qui applique la règle avec l'heure de l'application et n'enregistre que si la liste change, et vérifier par des tests unitaires que l'historique des achats reste inchangé (« Fin des courses » de `purchase-history`)

## 3. Interface

- [ ] 3.1 Écrire les tests e2e « Panier des courses précédentes à l'ouverture » (horloge simulée, rechargement deux heures plus tard), « Fin des courses application ouverte » et « Courses en cours conservées », et constater qu'ils échouent
- [ ] 3.2 Obtenir la liste initiale par `app.endShopping()` dans `main.ts`, et déclencher la fin des courses dans `ShoppingListView` quand la liste quitte le magasin avec un panier non vide, et vérifier que les tests de 3.1 passent, les tests existants restant verts

## 4. Vérification d'intégration

- [ ] 4.1 Lancer `openspec validate --all --strict`, format, lint, typecheck, tests unitaires et e2e, puis la CI complète sur `main`, et vérifier que tout est vert et que le déploiement a réussi

## Workflow follow-up

- Archiver le change avec `/opsx:archive` une fois la CI verte.
