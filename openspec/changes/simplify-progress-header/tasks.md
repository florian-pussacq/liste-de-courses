# Tasks

## 1. Interface

- [ ] 1.1 Réécrire les tests e2e de la progression (`shopping-list.spec.ts`, `to-check.spec.ts`) pour vérifier « Courses en cours », « Articles à vérifier non comptés » et « Rapport non répété en texte » par le nombre à prendre, l'`aria-valuetext` de la barre (« 2 pris sur 5 », « 1 pris sur 4 ») et l'absence de « x / y pris », et constater qu'ils échouent
- [ ] 1.2 Retirer le paragraphe « x / y pris » de l'en-tête de `ShoppingListView` et donner à la barre `aria-valuetext="{pris} pris sur {total}"`, et vérifier que les tests de 1.1 passent, « Courses terminées » restant vert
- [ ] 1.3 Vérifier par capture, en clair et en sombre, l'en-tête en préparation et en magasin, sur une largeur de téléphone

## 2. Vérification d'intégration

- [ ] 2.1 Lancer `openspec validate --all --strict`, format, lint, typecheck, tests unitaires et e2e, puis la CI complète sur `main`, et vérifier que tout est vert et que le déploiement a réussi

## Workflow follow-up

- Archiver le change avec `/opsx:archive` une fois la CI verte.
