# Tasks

## 1. Squelette déployable

- [x] 1.1 Initialiser le projet Vite + Svelte 5 + TypeScript strict, avec npm et Node 22 (`.nvmrc`), et vérifier que `npm run build` produit `dist/`
- [x] 1.2 Configurer ESLint, Prettier, `svelte-check`, et les scripts `lint`, `format:check` et `typecheck`, et vérifier qu'ils passent sur le squelette
- [x] 1.3 Configurer Vitest et un premier test trivial du domaine, et vérifier que `npm test` passe
- [x] 1.4 Configurer Playwright (Chromium) avec un test qui ouvre l'application et vérifie le titre, et vérifier que `npm run test:e2e` passe
- [x] 1.5 Créer l'arborescence `src/domain`, `src/application`, `src/infrastructure` et `src/ui`, et ajouter une règle ESLint interdisant à `domain/` d'importer les autres couches ; vérifier qu'un import interdit fait échouer le lint
- [ ] 1.6 Créer le workflow GitHub Actions (validation OpenSpec stricte, lint, format, types, tests unitaires, e2e, build, déploiement GitHub Pages sur `main`) et vérifier que la page d'accueil est servie en HTTPS
- [x] 1.7 Ajouter au `CLAUDE.md` la règle « code en anglais, specs et interface en français » et le glossaire de design.md, et vérifier qu'il reste cohérent avec le reste du fichier

## 2. Domaine : liste de courses

- [x] 2.1 Implémenter en TDD la normalisation des libellés (casse, ligatures, accents, espaces), et vérifier que les tests couvrent « Œufs »/« oeufs » et les espaces superflus
- [x] 2.2 Implémenter en TDD `ShoppingList` : ajout avec refus du libellé vide, et dédoublonnage (un doublon non coché ne change rien, un doublon coché est décoché) ; vérifier un test par scénario de la spec `shopping-list`
- [x] 2.3 Implémenter en TDD la modification (refus d'un libellé vide ou déjà présent), la suppression, le cochage et le décochage, et vérifier un test par scénario
- [x] 2.4 Implémenter en TDD l'ordre d'affichage (non cochés par ordre d'ajout, puis cochés) et le retrait des articles cochés, et vérifier un test par scénario

## 3. Domaine : capture

- [x] 3.1 Implémenter en TDD le découpage du texte reçu (lignes, virgules, points-virgules, puces, numérotation, éléments vides), et vérifier un test par scénario de « Découpage du texte en articles proposés »
- [x] 3.2 Implémenter en TDD la combinaison du titre et du texte d'un partage (titre en premier, texte vide ignoré), et vérifier les scénarios de « Réception de texte partagé »
- [x] 3.3 Implémenter en TDD `Inbox` : ajout de texte cumulatif, correction d'un libellé, écart et ajout d'un article proposé, vidage ; vérifier un test par scénario

## 4. Cas d'usage et persistance

- [x] 4.1 Définir les ports de dépôt de la liste et de la boîte de réception, ainsi que des implémentations en mémoire pour les tests, et vérifier que le typecheck passe
- [x] 4.2 Implémenter en TDD les cas d'usage (capturer du texte, valider la boîte de réception vers la liste en dédoublonnant, abandonner, ajouter, modifier, supprimer, cocher, retirer les cochés) sur les dépôts en mémoire, et vérifier un test par cas d'usage
- [x] 4.3 Implémenter les adaptateurs IndexedDB avec `idb` (schéma versionné, UUID, `addedAt` et `updatedAt`), et vérifier avec `fake-indexeddb` que les données survivent à une réouverture de la base
- [x] 4.4 Demander le stockage persistant (`navigator.storage.persist()`) au démarrage, et vérifier qu'un refus ou une absence de l'API ne bloque pas l'application

## 5. Interface

- [x] 5.1 Construire la vue liste (articles à prendre puis pris, cochage en un geste, message de liste vide, ajout direct), et vérifier en e2e les scénarios d'ajout, de cochage et de liste vide
- [x] 5.2 Ajouter la modification, la suppression et le retrait des articles cochés, et vérifier en e2e les scénarios correspondants, y compris le refus d'un libellé déjà présent
- [x] 5.3 Construire la vue boîte de réception (zone de collage, articles proposés modifiables, écarter, ajouter, valider, abandonner, état vide), et vérifier en e2e le collage d'une liste, la correction, la validation et l'abandon
- [x] 5.4 Vérifier en e2e la conservation de la capture : rechargement de la page avec des articles proposés non validés

## 6. PWA, partage et confidentialité

- [ ] 6.1 Configurer `vite-plugin-pwa` (manifeste, icônes provisoires, précache, `autoUpdate`), et vérifier que Lighthouse ou les DevTools reconnaissent l'application comme installable
- [ ] 6.2 Déclarer le `share_target` en GET sur `./` et lire les paramètres `title` et `text` au démarrage, puis nettoyer l'URL ; vérifier en e2e qu'ouvrir `./?title=…&text=…` alimente la boîte de réception et que l'URL est nettoyée
- [ ] 6.3 Vérifier en e2e le fonctionnement hors ligne (`context.setOffline(true)` après un premier chargement) : affichage de la liste, cochage, et partage par URL
- [ ] 6.4 Ajouter la Content Security Policy (`connect-src 'self'`, aucun script ni style tiers), et vérifier en e2e qu'aucune requête n'est émise vers une autre origine pendant une capture complète
- [ ] 6.5 Vérifier en e2e qu'une nouvelle version du service worker conserve la liste existante

## 7. Vérification d'intégration

- [ ] 7.1 Sur un téléphone Android réel : installer l'application depuis GitHub Pages, partager un message depuis une messagerie, valider, cocher en mode avion, et vérifier que chaque scénario de `offline-app` et de « Réception de texte partagé » se comporte comme spécifié
- [ ] 7.2 Lancer `openspec validate --all --strict` et la CI complète sur `main`, et vérifier que tout est vert

## Workflow follow-up

- Archiver le change avec `/opsx:archive` une fois la vérification sur téléphone faite, pour reporter les specs dans `openspec/specs/`.
