# Tasks

## 1. Domaine

- [x] 1.1 Ajouter en TDD `Purchase`, `recordPurchase` et `cancelPurchase`, et vérifier les scénarios « Article coché », « Article racheté » et « Cochage par erreur »
- [x] 1.2 Ajouter en TDD `purchasesByDay`, et vérifier le scénario « Achats regroupés par jour », y compris deux achats d'un même article le même jour

## 2. Application et stockage

- [x] 2.1 Ajouter le port `PurchaseHistoryRepository`, son implémentation en mémoire et le document IndexedDB `purchases`, et vérifier qu'un historique enregistré se relit à l'identique et qu'un document absent vaut un historique vide
- [x] 2.2 Faire enregistrer ou annuler l'achat par `toggleItem` et ajouter le cas d'usage de lecture de l'historique, et vérifier sur des dépôts en mémoire les scénarios « Articles pris retirés » et « Liste vidée »

## 3. Interface

- [x] 3.1 Ajouter le bouton « Historique des achats » et la feuille d'historique, et vérifier en e2e « Achats regroupés par jour » (horloge simulée) et « Historique vide »
- [x] 3.2 Vérifier en e2e qu'un achat reste dans l'historique après le retrait des articles pris et après un rechargement de l'application
- [x] 3.3 Vérifier par capture, en clair et en sombre, un historique de plusieurs jours
- [ ] 3.4 Ajouter le cas d'usage `clearPurchaseHistory` et l'effacement confirmé dans la feuille d'historique, et vérifier les scénarios « Historique effacé » et « Effacement abandonné »

## 4. Vérification d'intégration

- [x] 4.1 Ajouter « achat → `Purchase` » et « historique des achats → `PurchaseHistory` » au glossaire de `CLAUDE.md`
- [ ] 4.2 Lancer `openspec validate --all --strict` et la CI complète sur `main`, et vérifier que tout est vert et que le déploiement a réussi
- [ ] 4.3 Sur un téléphone Android réel : cocher des articles, retirer les articles pris, et retrouver les achats du jour dans l'historique

## Workflow follow-up

- Archiver le change avec `/opsx:archive` après la vérification sur téléphone.
