# Tasks

## 1. Domaine : boîte de réception réversible

- [x] 1.1 Remplacer en TDD `discardProposal` par `toggleProposal` (écarter puis remettre) et ajouter `keptLabels`, et vérifier un test par scénario de « Correction des articles proposés »
- [x] 1.2 Ajouter en TDD `capturedTexts` à `Inbox` (textes non vides, dans l'ordre de réception, vidés avec la boîte), et vérifier les scénarios de « Rappel du texte reçu »
- [x] 1.3 Faire valider uniquement les articles conservés dans le cas d'usage `validateInbox`, et vérifier les scénarios « Validation avec un article écarté » et « Validation des articles proposés »
- [ ] 1.4 Compléter le glossaire du `CLAUDE.md` avec les concepts de design.md, et vérifier qu'il reste cohérent avec le code

## 2. Persistance et presse-papiers

- [ ] 2.1 Passer le schéma IndexedDB en v2 avec la migration de la boîte de réception, et vérifier avec `fake-indexeddb` qu'une base v1 remplie à la main se rouvre en v2 avec ses propositions conservées et `capturedTexts` vide
- [ ] 2.2 Implémenter en TDD l'adaptateur `readClipboard` (texte, vide, indisponible, refus, erreur), et vérifier qu'aucun cas ne lève d'exception
- [ ] 2.3 Ajouter le cas d'usage de collage depuis le presse-papiers, qui capture le texte lu ou signale le cas vide ou indisponible, et vérifier ses trois issues sur des dépôts en mémoire

## 3. Identité visuelle

- [ ] 3.1 Installer `@fontsource-variable/bricolage-grotesque`, l'importer dans la feuille de style et ajouter `woff2` au précache, et vérifier en e2e que la police est servie depuis l'origine de l'application et qu'aucune violation de CSP n'apparaît
- [ ] 3.2 Réécrire `app.css` autour des jetons de design.md (clair et sombre, cibles de 48 px, `prefers-reduced-motion`), et vérifier les contrastes du texte à 4,5:1 au moins dans les deux modes

## 4. Écran de courses

- [ ] 4.1 Afficher la progression en tête de liste, et vérifier en e2e les scénarios de « Progression des courses »
- [ ] 4.2 Rendre toute la ligne d'un article cochable et regrouper les articles cochés dans le panier repliable (replié par défaut, compteur, retrait des articles pris depuis le panier déplié), et vérifier en e2e les scénarios de « Cochage en magasin », « Panier repliable » et « Retrait des articles cochés »
- [ ] 4.3 Ouvrir la feuille d'actions d'un article sur `contextmenu` (modifier, supprimer) sans le cocher, et vérifier en e2e par clic droit les scénarios de « Modification d'un article » et « Suppression d'un article »
- [ ] 4.4 Ajouter la barre du bas : « Coller une liste » et le bouton d'ajout qui ouvre la feuille de saisie, et vérifier en e2e l'ajout direct, le refus d'un libellé vide et la conservation de la saisie pendant l'enregistrement (test de composant existant adapté)
- [ ] 4.5 Mettre à jour le message de liste vide pour expliquer coller, ajouter et l'appui long, et vérifier en e2e le scénario « Affichage d'une liste vide »

## 5. Tri d'un partage

- [ ] 5.1 Construire la boîte de réception en feuille : rappel des textes reçus, pastilles (appui pour écarter ou remettre, appui long pour corriger), ajout à la main, « Ajouter N à la liste » et « Annuler » ; vérifier en e2e les scénarios de « Correction des articles proposés », « Validation vers la liste » et « Rappel du texte reçu »
- [ ] 5.2 Brancher « Coller une liste » sur le presse-papiers, et vérifier en e2e un presse-papiers rempli (autorisation accordée), un refus et un presse-papiers vide
- [ ] 5.3 Vérifier que le partage Android, le hors ligne, la persistance après rechargement, la confidentialité et la mise à jour passent toujours : adapter leurs tests e2e aux nouveaux libellés sans en retirer de scénario

## 6. Vérification d'intégration

- [ ] 6.1 Lancer `openspec validate --all --strict` et la CI complète sur `main`, et vérifier que tout est vert et que le déploiement a réussi
- [ ] 6.2 Sur un téléphone Android réel : appui long sur un article (pas de bulle de sélection parasite), collage depuis le presse-papiers après copie dans une messagerie, tri par pastilles, mode sombre ; vérifier que chaque scénario modifié se comporte comme spécifié

## Workflow follow-up

- Archiver le change avec `/opsx:archive` après la vérification sur téléphone.
