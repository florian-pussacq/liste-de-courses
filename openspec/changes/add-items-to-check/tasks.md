# Tasks

## 1. Domaine

- [x] 1.1 Remplacer en TDD `splitIntoLabels` par `splitIntoEntries` (« ? » final retiré et marqué, « ? » au milieu conservé, élément réduit à « ? » ignoré), et vérifier un test par scénario de « Articles proposés à vérifier »
- [x] 1.2 Ajouter en TDD `toCheck` aux articles proposés (capture, `toggleProposalToCheck`, `keptEntries`), et vérifier les scénarios de « Marquage à vérifier dans le tri »
- [x] 1.3 Ajouter en TDD `toCheck` aux articles : matrice de doublons de design.md, `itemsToBuy` sans les articles à vérifier, `itemsToCheck`, `setToCheck` ; vérifier un test par scénario de « Absence de doublons », « Levée du doute » et « Marquage manuel à vérifier »
- [x] 1.4 Faire transmettre l'état à vérifier par la validation de la boîte de réception, et vérifier le scénario « Validation d'un article à vérifier » sur des dépôts en mémoire
- [x] 1.5 Compléter le glossaire du `CLAUDE.md` (`toCheck`, `Entry`), et vérifier sa cohérence avec le code

## 2. Persistance

- [ ] 2.1 Passer le schéma IndexedDB en v3 avec la migration chaînée, et vérifier avec `fake-indexeddb` qu'une base v1 et une base v2 se rouvrent en v3 avec tous leurs articles et propositions certains

## 3. Interface

- [ ] 3.1 Ajouter la section « À vérifier avant de partir » en tête de liste avec « On en a » et « Il en faut », et vérifier en e2e les scénarios de « Section des articles à vérifier » et « Levée du doute »
- [ ] 3.2 Calculer la progression sur les seuls articles certains et adapter l'en-tête quand il n'y a que des articles à vérifier, et vérifier en e2e le scénario « Articles à vérifier non comptés »
- [ ] 3.3 Ajouter « Marquer à vérifier » / « Il en faut » à la feuille d'actions d'un article, et vérifier en e2e le scénario « Marquer un article à vérifier »
- [ ] 3.4 Marquer visuellement les pastilles à vérifier dans le tri et ajouter la bascule dans le formulaire de correction, et vérifier en e2e un partage contenant un « ? » final, la bascule dans les deux sens et la validation
- [ ] 3.5 Vérifier en clair et en sombre, par captures, que la nouvelle section et la marque des pastilles respectent les contrastes de 4,5:1

## 4. Vérification d'intégration

- [ ] 4.1 Lancer `openspec validate --all --strict` et la CI complète sur `main`, et vérifier que tout est vert et que le déploiement a réussi
- [ ] 4.2 Sur un téléphone Android réel : partager une liste contenant des « ? » depuis une application de notes, lever les doutes avant de partir, vérifier la progression ; vérifier que chaque scénario modifié se comporte comme spécifié

## Workflow follow-up

- Archiver le change avec `/opsx:archive` après la vérification sur téléphone.
