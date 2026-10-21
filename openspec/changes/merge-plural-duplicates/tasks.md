# Tasks

## 1. Domaine

- [x] 1.1 Étendre en TDD `labelKey` au singulier et au pluriel (« s » ou « x » final par mot de plus de deux lettres), et vérifier que « pain » et « pains » deviennent identiques et que « os » reste intact
- [x] 1.2 Vérifier les scénarios « Doublon au singulier et au pluriel » (liste) et « Article reçu au singulier et au pluriel » (tri) par des tests du domaine

## 2. Interface

- [x] 2.1 Vérifier en e2e qu'ajouter « petit pois » à une liste contenant « petits pois » ne crée pas de second article

## 3. Vérification d'intégration

- [x] 3.1 Lancer `openspec validate --all --strict` et la CI complète sur `main`, et vérifier que tout est vert et que le déploiement a réussi
- [ ] 3.2 Sur un téléphone Android réel : coller une liste contenant « petit pois » alors que « petits pois » est dans la liste, et vérifier qu'un seul article reste

## Workflow follow-up

- Archiver le change avec `/opsx:archive` après la vérification sur téléphone.
