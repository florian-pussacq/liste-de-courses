# Tasks

## 1. Domaine

- [x] 1.1 Ajouter en TDD `readQuantity` (nombre en tête, « xN » et « ×N » en fin, 1 à 99, unités et nombres ailleurs laissés dans le libellé), et vérifier les scénarios de « Reconnaissance de la quantité »
- [x] 1.2 Ajouter `addQuantities` et `stepQuantity` en TDD (absence n'ajoutant rien, plafond à 99, plancher 0 ou 1)
- [x] 1.3 Faire porter une quantité facultative à `Entry` et l'extraire dans `splitIntoEntries`, et vérifier qu'un marqueur « 1. » n'est pas pris pour une quantité et que « 3 citrons ? » donne une quantité à vérifier
- [x] 1.4 Additionner les quantités dans `addItem` et `addItems` (remplacement pour un article pris remis à prendre et pour un doute levé), lire la quantité dans `addItem` et `renameItem`, et vérifier les scénarios de « Addition des quantités » (liste), « Article avec quantité » et « Quantité tapée lors d'une modification »
- [x] 1.5 Additionner les quantités dans `mergeInto`, lire la quantité dans `addProposal` et `editProposal`, refusionner un plat cité de nouveau dans `captureText`, et vérifier les scénarios « Quantités additionnées dans le tri », « Ingrédient avec quantité » et « Plat cité deux fois »
- [x] 1.6 Enrichir `alreadyListed` de l'évolution de la quantité, et vérifier le scénario « Quantité d'un article déjà présent »
- [x] 1.7 Écrire la quantité dans `listAsText`, et vérifier « Quantité envoyée » et la relecture à l'identique

## 2. Application

- [x] 2.1 Ajouter les cas d'usage `setItemQuantity` et `setProposalQuantity`, et les vérifier sur des dépôts en mémoire

## 3. Interface

- [ ] 3.1 Afficher la pastille de quantité dans la liste et le tri, et vérifier en e2e « Quantité affichée »
- [ ] 3.2 Ajouter `QuantityStepper` aux actions d'un article et d'une proposition, et vérifier en e2e « Augmentation depuis les actions », « Quantité retirée depuis les actions » et « Quantité d'une proposition »
- [ ] 3.3 Séparer la case à cocher et les boutons « − / + » sur les lignes à prendre qui ont une quantité, et vérifier en e2e « Diminution sur la ligne », « Minimum sur la ligne » et « Pas de commande sans quantité »
- [ ] 3.4 Afficher l'évolution de la quantité dans le bilan, et vérifier en e2e « Quantité d'un article déjà présent »
- [ ] 3.5 Vérifier par capture, en clair et en sombre, une liste mêlant articles avec et sans quantité, et les actions d'un article

## 4. Vérification d'intégration

- [ ] 4.1 Ajouter « quantité → `quantity` » au glossaire de `CLAUDE.md`
- [ ] 4.2 Lancer `openspec validate --all --strict` et la CI complète sur `main`, et vérifier que tout est vert et que le déploiement a réussi
- [ ] 4.3 Sur un téléphone Android réel : coller un menu où un plat revient deux fois, vérifier les quantités dans le tri et le bilan, puis ajuster une quantité sur une ligne

## Workflow follow-up

- Archiver le change avec `/opsx:archive` après la vérification sur téléphone.
