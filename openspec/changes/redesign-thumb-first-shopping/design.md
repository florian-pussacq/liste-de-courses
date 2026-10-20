# Design

## Context

La v1 est en production : domaine pur (`src/domain`), cas d'usage derrière des ports (`src/application`), persistance IndexedDB en documents (schéma v1), interface Svelte 5 en trois composants avec une feuille de style globale, CSP stricte (`connect-src 'self'`, `style-src 'self'`, polices comprises). Les exigences modifiées sont dans `specs/item-capture` et `specs/shopping-list` ; la direction visuelle de référence est la maquette « En magasin / Tri d'un partage / Mode sombre » validée hors dépôt.

## Goals / Non-Goals

**Goals:**
- Un écran de courses utilisable d'une main : grandes cibles, actions principales en bas, actions rares hors de l'écran.
- Des gestes cohérents dans toute l'application : un appui agit, un appui long ouvre les actions.
- Une identité visuelle propre, sans aucune ressource chargée chez un tiers.

**Non-Goals:**
- Glisser pour supprimer, animations élaborées, retour haptique.
- Un système de thèmes configurable : le mode sombre suit le réglage du téléphone.

## Decisions

### Glossaire : nouveaux concepts
| Spec (fr)            | Code (en)         |
|----------------------|-------------------|
| écarté               | `discarded`       |
| panier               | `basket` (UI seulement : les articles cochés) |
| progression          | `progress`        |
| actions d'un article | `ItemActions`     |
| presse-papiers       | `clipboard`       |

Le panier n'est pas un concept du domaine : c'est la présentation de `checkedItems`. Il n'apparaît que dans `ui/`.

### Domaine : la boîte de réception garde les textes reçus et les articles écartés
- `Proposal` gagne `discarded: boolean`. `discardProposal` devient `toggleProposal` : écarter est réversible jusqu'à la validation.
- `Inbox` gagne `capturedTexts: readonly string[]`, alimenté par `captureText` (texte non vide uniquement) et vidé avec la boîte.
- `keptLabels(inbox)` remplace `proposedLabels` pour la validation ; `validateInbox` n'ajoute que les articles conservés.

Alternative écartée : supprimer l'article écarté et garder une pile d'annulation. Plus complexe, et l'état « écarté » visible est justement ce que la maquette montre.

### Persistance : schéma IndexedDB v2 avec migration explicite
`SCHEMA_VERSION` passe à 2. Dans `upgrade(db, oldVersion, _, transaction)`, si `oldVersion === 1`, le document `inbox` est réécrit : chaque proposition reçoit `discarded: false`, et `capturedTexts` vaut `[]`. La liste n'a pas changé de forme. Alternative écartée : normaliser à la lecture, qui disperse la connaissance des anciennes formes dans le code courant au lieu de la confiner à la migration.

### Presse-papiers : un adaptateur qui ne lève jamais
`readClipboard(clipboard = navigator.clipboard)` dans `infrastructure/` renvoie `{ kind: 'text', text } | { kind: 'empty' } | { kind: 'unavailable' }`. Absence d'API, refus d'autorisation et erreur deviennent `unavailable`, texte blanc devient `empty`. L'interface affiche le message correspondant et ouvre la saisie manuelle. La lecture se fait dans le gestionnaire du clic : Chrome exige un geste de l'utilisateur et demande l'autorisation la première fois.

### Appui long : l'événement `contextmenu`
Sur Chrome Android, un appui long sur un élément émet `contextmenu` ; à la souris, c'est le clic droit ; au clavier, la touche menu. Écouter `contextmenu` (avec `preventDefault`) donne donc l'appui long, gratuitement accessible, sans minuterie ni gestion de pointeurs. Les lignes portent `user-select: none` et `-webkit-touch-callout: none` pour éviter la sélection de texte. Alternative écartée : une action Svelte à base de `pointerdown` et minuterie, plus de code et plus de cas limites (défilement, double déclenchement avec le clic). Si l'appareil réel montre un défaut, la minuterie reste un repli.

### Feuilles : `<dialog>` natif
Feuille d'actions d'un article, saisie d'un article et boîte de réception sont des `<dialog>` ouverts avec `showModal()`, ancrés en bas de l'écran. Le navigateur gère le piège de focus, la touche Échap et l'inertie de l'arrière-plan. Pas de bibliothèque de composants.

### Structure de l'interface
```
App.svelte                 état (liste, boîte de réception), feuille ouverte
  ShoppingListView.svelte  progression, articles à prendre, panier repliable, barre du bas
    ItemRow.svelte         ligne entière cliquable, contextmenu -> actions
  ItemActionsSheet.svelte  modifier (formulaire) / supprimer
  AddItemSheet.svelte      saisie d'un article
  InboxSheet.svelte        rappel des textes, pastilles, ajout, valider / annuler
```

### Identité visuelle : jetons CSS, police embarquée
- Jetons dans `:root` : fond `#F2F3EE`, surface `#FFFFFF`, encre `#111210`, texte secondaire `#565951`, accent `#C8F13A`, réécrits sous `@media (prefers-color-scheme: dark)` (fond `#0B0C0A`, surface `#1A1B18`, encre `#F2F3EE`). Contrastes vérifiés à 4,5:1 au moins pour le texte.
- Police : Bricolage Grotesque (licence OFL) via `@fontsource-variable/bricolage-grotesque`, importée par la feuille de style ; Vite l'émet comme fichier du site et le service worker la précache (`woff2` ajouté aux motifs). La CSP n'est pas modifiée : la police vient de la même origine.
- Cibles tactiles de 48 px minimum, lignes d'articles de 60 px. `prefers-reduced-motion` respecté pour les transitions.

### Tests
- Domaine : TDD sur `toggleProposal`, `keptLabels`, `capturedTexts`.
- Persistance : test de migration avec `fake-indexeddb` (base v1 remplie à la main, ouverture en v2, lecture).
- Presse-papiers : tests unitaires de l'adaptateur avec des doubles ; en bout en bout, autorisation accordée et presse-papiers rempli par `navigator.clipboard.writeText`, puis contexte sans autorisation pour le refus.
- Appui long : en bout en bout, `click({ button: 'right' })` émet `contextmenu`.
- Les tests de bout en bout existants sont réécrits sur les nouveaux rôles et libellés ; chaque scénario modifié garde au moins un test.

## Risks / Trade-offs

- [L'appui long est peu découvrable] → Le message de liste vide l'explique ; la vérification sur téléphone dira s'il faut plus.
- [Chrome Android peut afficher sa propre bulle de sélection sur un appui long] → `user-select: none`, `-webkit-touch-callout: none` et `preventDefault` sur `contextmenu` ; vérification sur appareil réel inscrite dans les tâches.
- [La lecture du presse-papiers est refusée ou demandée à chaque fois] → Repli systématique sur la saisie manuelle, avec un message explicite.
- [La migration IndexedDB échoue chez l'utilisateur] → Testée sur une base v1 réelle ; en cas d'erreur au démarrage, le message d'erreur existant s'affiche et les données v1 restent intactes (IndexedDB annule une montée de version échouée).
- [La police alourdit le premier chargement] → Un seul fichier variable woff2, précaché ; `font-display: swap` évite un écran vide.

## Migration Plan

Déploiement normal depuis `main`. À la première ouverture de la nouvelle version, IndexedDB passe en v2 et migre la boîte de réception. Retour arrière : un `git revert` redéploie la v1, mais une base déjà migrée en v2 ne peut pas être rouverte par la v1 (version inférieure). C'est assumé : la v1 n'est pas redéployée une fois la v2 en service, on corrige vers l'avant.
