# Tasks

## 1. Domaine

- [x] 1.1 Restructurer en TDD `splitIntoEntries` ligne par ligne et reconnaître les lignes de menu (préfixe de jour retiré jusqu'au premier « : », découpage sur « / » et « - » dans ces seules lignes), et vérifier un test par scénario de « Découpage des lignes de menu » ainsi que tous les tests existants du découpage
- [x] 1.2 Introduire en TDD la fusion des doublons dans la boîte de réception (capture et ajout manuel, le certain l'emporte), et vérifier les scénarios « Article reçu deux fois » et « Le certain l'emporte dans le tri »
- [x] 1.3 Implémenter en TDD `Dish`, `defineDish` et `findDish` (nom vide ou sans ingrédient refusé, « ? » des ingrédients, comparaison normalisée), et vérifier les scénarios « Définition d'un plat » et « Plat sans ingrédient »
- [x] 1.4 Implémenter en TDD la reconnaissance des plats à la capture, `expandIntoDish`, `refreshDish` et `toggleDish`, et vérifier les scénarios de « Reconnaissance d'un plat connu », « Écart d'un plat entier », « Modification d'un plat » et « Plat reçu deux fois »
- [x] 1.5 Compléter le glossaire du `CLAUDE.md` (`Dish`, `ingredient`, `menuLine`), et vérifier sa cohérence avec le code

## 2. Application et persistance

- [x] 2.1 Ajouter le port `DishRepository` et son implémentation en mémoire, faire consulter les plats par les cas d'usage de capture, et ajouter `defineDishFromProposal`, `updateDish` et `toggleDish` ; vérifier un test par cas d'usage sur des dépôts en mémoire
- [x] 2.2 Implémenter l'adaptateur IndexedDB des plats (document `dishes`, liste vide s'il est absent, schéma inchangé), et vérifier avec `fake-indexeddb` le scénario « Plat retrouvé après réouverture »

## 3. Interface

- [x] 3.1 Rendre les groupes de plats dans le tri (en-tête qui écarte ou remet le groupe, pastilles d'ingrédients), et vérifier en e2e les scénarios « Plat reconnu dans un texte reçu », « Écarter le plat entier » et « Écarter un seul ingrédient »
- [x] 3.2 Ajouter « C'est un plat » au formulaire de correction et la feuille de définition d'un plat, et vérifier en e2e les scénarios « Définition d'un plat », « Remplacement immédiat dans le tri » et « Plat sans ingrédient »
- [x] 3.3 Ouvrir la modification d'un plat par appui long sur son en-tête, et vérifier en e2e le scénario « Ajout d'un ingrédient à un plat », y compris la reconnaissance suivante
- [x] 3.4 Vérifier en e2e le collage d'un menu de plusieurs jours (lignes de menu, plat reconnu deux fois, jour vide, doute) et vérifier que les plats ne figurent pas dans le texte envoyé de la liste
- [x] 3.5 Vérifier en clair et en sombre, par captures, que les groupes de plats et la feuille de définition respectent les contrastes de 4,5:1

## 4. Vérification d'intégration

- [x] 4.1 Lancer `openspec validate --all --strict` et la CI complète sur `main`, et vérifier que tout est vert et que le déploiement a réussi
- [ ] 4.2 Sur un téléphone Android réel : définir quelques plats depuis un menu collé, recoller les jours suivants, et vérifier que les plats sont reconnus, que le tri reste lisible et que la liste obtenue est juste

## Workflow follow-up

- Archiver le change avec `/opsx:archive` après la vérification sur téléphone.
