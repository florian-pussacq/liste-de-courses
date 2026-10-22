# Tasks

## 1. Domaine et application

- [x] 1.1 Implémenter en TDD `reviewOrder` (plats reconnus et à définir d'abord, puis articles simples, chacun dans l'ordre de réception) et faire suivre cet ordre à `keptEntries`, et vérifier les scénarios « Plats en premier » et « Ordre conservé à la validation »
- [x] 1.2 Ajouter le cas d'usage `restoreList`, et vérifier sur des dépôts en mémoire qu'une liste rétablie est identique à l'instantané

## 2. Interface du tri

- [x] 2.1 Présenter le tri dans l'ordre `reviewOrder`, et vérifier en e2e le scénario « Plats en premier »
- [x] 2.2 Fixer le pied de la feuille du tri, et vérifier en e2e, avec un tri d'une vingtaine de propositions, que « Ajouter N à la liste » est visible sans défiler
- [x] 2.3 Replier le rappel des textes reçus avec leur nombre, et vérifier en e2e les scénarios de « Rappel du texte reçu »
- [x] 2.4 Ne donner qu'une fois l'explication des plats à définir, et vérifier par capture la lisibilité d'un menu de plusieurs jours en clair et en sombre

## 3. Annulation dans la liste

- [x] 3.1 Afficher le bandeau « Annuler » après « on en a », une suppression ou le retrait des articles pris, le masquer à toute autre modification ou après six secondes, et vérifier en e2e les quatre scénarios de « Annulation d'un retrait » (horloge simulée pour l'expiration)

## 4. Vérification d'intégration

- [x] 4.1 Lancer `openspec validate --all --strict` et la CI complète sur `main`, et vérifier que tout est vert et que le déploiement a réussi
- [x] 4.2 Sur un téléphone Android réel : coller un menu de plusieurs jours, valider sans défiler, annuler une suppression ; vérifier que chaque scénario se comporte comme spécifié

## Workflow follow-up

- Archiver le change avec `/opsx:archive` après la vérification sur téléphone.
