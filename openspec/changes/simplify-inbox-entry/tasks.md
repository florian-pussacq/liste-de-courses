# Tasks

## 1. Interface

- [ ] 1.1 Afficher la zone de saisie d'un texte, sans ligne repliable, seulement quand rien n'est à trier ou que le presse-papiers n'a pas pu être lu, et vérifier en e2e les scénarios « Collage d'une liste » et « Saisie masquée pendant le tri »
- [ ] 1.2 Remplacer le texte des boutons « Ajouter » par l'icône « + » en gardant leur nom accessible, et vérifier par capture le rendu du tri et de la feuille d'ajout en clair et en sombre

## 2. Vérification d'intégration

- [ ] 2.1 Lancer `openspec validate --all --strict` et la CI complète sur `main`, et vérifier que tout est vert et que le déploiement a réussi
- [ ] 2.2 Sur un téléphone Android réel : coller une liste, vérifier l'absence de la ligne « Coller ou écrire une liste à la main » et le bouton « + »

## Workflow follow-up

- Archiver le change avec `/opsx:archive` après la vérification sur téléphone.
