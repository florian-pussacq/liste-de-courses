# Tasks

## 1. Domaine et application

- [ ] 1.1 Faire renvoyer en TDD à `addItems` les libellés ajoutés et déjà présents (doublons internes comptés une fois, article pris remis à prendre compté comme ajouté), et vérifier les scénarios « Articles ajoutés et déjà présents » et « Article pris ajouté de nouveau »
- [ ] 1.2 Faire renvoyer son bilan à `validateInbox`, et le vérifier sur des dépôts en mémoire
- [ ] 1.3 Ajouter en TDD `clearList` et le cas d'usage correspondant, et vérifier les scénarios « Liste vidée » et « Tri préservé »
- [ ] 1.4 Mettre l'initiale en majuscule dans `listAsText`, et vérifier le scénario « Liste envoyée » et la relecture par l'application

## 2. Interface

- [ ] 2.1 Afficher le bandeau de bilan après la validation, fermable, masqué à toute modification de la liste, et vérifier en e2e les scénarios de « Bilan de la validation »
- [ ] 2.2 Afficher les libellés de la liste et du tri avec une initiale en majuscule, et vérifier en e2e les scénarios « Article en minuscules » et « Proposition en minuscules »
- [ ] 2.3 Ajouter l'action « Vider la liste » en fin de liste, et vérifier en e2e les scénarios « Liste vidée », « Rien à vider » et « Vidage annulé »

## 3. Vérification d'intégration

- [ ] 3.1 Lancer `openspec validate --all --strict` et la CI complète sur `main`, et vérifier que tout est vert et que le déploiement a réussi
- [ ] 3.2 Sur un téléphone Android réel : valider un tri contenant un doublon et lire le bilan, vérifier les majuscules, vider la liste puis annuler

## Workflow follow-up

- Archiver le change avec `/opsx:archive` après la vérification sur téléphone.
