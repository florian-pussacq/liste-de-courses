# Tasks

## 1. Domaine et application

- [x] 1.1 Ajouter en TDD `searchPurchases` (seuil de deux caractères, correspondance par `labelKey`, regroupement par article, dernier libellé et dernière quantité, tri par dernier achat), et vérifier les scénarios « Recherche partielle et pluriel », « Aucun résultat », « Article retrouvé » et « Plusieurs articles trouvés »
- [ ] 1.2 Ajouter le cas d'usage `buyAgain`, et vérifier sur des dépôts en mémoire les scénarios « Article remis » et « Article pris remis »

## 2. Interface

- [ ] 2.1 Ajouter le champ de recherche et les résultats à la feuille d'historique, et vérifier en e2e la recherche, l'absence de résultat et le retour à la vue par jour quand le champ est vidé
- [ ] 2.2 Ajouter « Remettre » et « Dans la liste », et vérifier en e2e « Article remis » et « Article déjà dans la liste »
- [ ] 2.3 Vérifier par capture, en clair et en sombre, des résultats de recherche

## 3. Vérification d'intégration

- [ ] 3.1 Lancer `openspec validate --all --strict` et la CI complète sur `main`, et vérifier que tout est vert et que le déploiement a réussi
- [ ] 3.2 Sur un téléphone Android réel : rechercher un article acheté, le remettre dans la liste, et vérifier « Dans la liste »

## Workflow follow-up

- Archiver le change avec `/opsx:archive` après la vérification sur téléphone.
