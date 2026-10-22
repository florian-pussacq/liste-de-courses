# Tasks

## 1. Infrastructure

- [ ] 1.1 Passer `vite-plugin-pwa` en mode « prompt » sans script injecté, et ajouter `watchForUpdates` (attente d'une version, application, recherche au retour au premier plan)

## 2. Interface

- [ ] 2.1 Afficher le bandeau de mise à jour dans `App` et le brancher dans `main.ts`, et vérifier en e2e les scénarios « Nouvelle version disponible » et « Nouvelle version chargée »
- [ ] 2.2 Vérifier en e2e le scénario « Retour au premier plan »

## 3. Vérification d'intégration

- [ ] 3.1 Lancer `openspec validate --all --strict` et la CI complète sur `main`, et vérifier que tout est vert et que le déploiement a réussi
- [ ] 3.2 Sur un téléphone Android réel : après un déploiement, rouvrir l'application installée et recharger depuis le bandeau

## Workflow follow-up

- Archiver le change avec `/opsx:archive` après la vérification sur téléphone.
