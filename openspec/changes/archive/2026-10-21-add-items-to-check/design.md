# Design

## Context

Le découpage (`domain/captured-text.ts`) renvoie des libellés seuls ; `Proposal` et `Item` n'ont aucun état de doute ; la base IndexedDB est en version 2 ; la liste distingue `itemsToBuy` et `checkedItems`. Les exigences sont dans `specs/item-capture` et `specs/shopping-list`.

## Goals / Non-Goals

**Goals:**
- Un seul nouvel état, « à vérifier », porté de bout en bout : du texte reçu à la liste.
- Des règles de doublons explicites et testées entre article certain, article à vérifier et article pris.

**Non-Goals:**
- Interpréter un « ? » au milieu d'un élément, des dates ou des quantités.
- Rappeler à l'utilisateur de vérifier avant de partir (notification, horaire).

## Decisions

### Glossaire
| Spec (fr)     | Code (en)  |
|---------------|------------|
| à vérifier    | `toCheck`  |
| certain       | `toCheck === false` (pas de terme dédié) |
| entrée (libellé + état issus du découpage) | `Entry` |

« On en a » réutilise la suppression d'un article ; « il en faut » et le marquage manuel passent par une seule opération, `setToCheck(list, id, toCheck, now)`. Pas de nouveau verbe pour un même effet.

### Découpage : des entrées plutôt que des libellés
`splitIntoLabels` devient `splitIntoEntries(text): Entry[]` avec `Entry = { label, toCheck }`. Le « ? » final est détecté sur l'élément nettoyé (`/\s*\?$/`), retiré, puis l'élément est ignoré s'il est vide. Un seul « ? » final est retiré : « quoi ?? » donne « quoi ? » à vérifier, cas marginal accepté. Les règles existantes (séparateurs, puces, numérotation) sont inchangées et s'appliquent avant.

### État dans le domaine
- `Proposal` et `Item` gagnent `toCheck: boolean`.
- `addItem(list, label, context, toCheck = false)` applique la matrice suivante quand le libellé existe déjà ; l'état est un paramètre optionnel pour ne pas toucher les appelants d'un ajout certain. `addItems` reçoit des `Entry` :

| Existant \ Ajouté | certain | à vérifier |
|---|---|---|
| à prendre | inchangé | inchangé |
| à vérifier | devient certain | inchangé |
| pris | décoché (règle actuelle) | inchangé |

- `itemsToBuy` exclut les articles à vérifier ; nouveau `itemsToCheck`. `toggleItem` reste générique : l'interface n'offre pas de cochage sur un article à vérifier, conformément à la spec.
- Inbox : `keptEntries` remplace `keptLabels` ; `toggleProposalToCheck(inbox, id)`.

### Persistance : schéma v3
`SCHEMA_VERSION` passe à 3. Les migrations restent chaînées dans `upgrade` (`oldVersion < 2`, puis `oldVersion < 3`) : une base v1 passe par v2 puis v3. La v3 ajoute `toCheck: false` à chaque article et à chaque proposition. Même principe que la v2 : la connaissance des anciennes formes reste confinée aux migrations.

### Interface
- **Liste** : section « À vérifier avant de partir (N) » au-dessus des articles à prendre. Chaque ligne affiche le libellé et deux boutons, « On en a » et « Il en faut », dont les noms accessibles incluent le libellé. La ligne n'est pas cochable : ce n'est pas un `role="checkbox"`.
- **Progression** : calculée sur les seuls articles certains (`itemsToBuy` + `checkedItems`). Quand la liste ne contient que des articles à vérifier, l'en-tête n'affiche pas de progression et le titre invite à vérifier.
- **Actions d'un article** : un bouton « Marquer à vérifier » ou « Il en faut », selon l'état.
- **Tri** : la pastille d'un article à vérifier porte un « ? » visible et son nom accessible le mentionne ; le formulaire de correction ouvert par appui long gagne un bouton pour basculer l'état.

## Risks / Trade-offs

- [Un « ? » final qui n'exprime pas un doute (« qui en veut ? »)] → L'article arrive à vérifier, un appui long le rend certain ; le texte libre demandait déjà une correction.
- [L'utilisateur part sans avoir levé les doutes] → La section reste en tête en magasin : la décision se prend en rayon, rien n'est perdu.
- [Une troisième migration] → Testée depuis une base v1 et depuis une base v2.

## Migration Plan

Déploiement normal depuis `main`. À la première ouverture, la base passe en v3 ; tous les articles existants deviennent certains, comportement identique à la v1.1. Comme pour la v2, pas de retour arrière vers une version antérieure une fois la base migrée : on corrige vers l'avant.
