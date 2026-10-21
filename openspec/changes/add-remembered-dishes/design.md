# Design

## Context

Le découpage (`splitIntoEntries`) produit des entrées `{ label, toCheck }` ; la boîte de réception accumule des `Proposal` sans notion de groupe ni de dédoublonnage ; la base IndexedDB (v3) stocke des documents nommés (`shopping-list`, `inbox`). Les exigences sont dans `specs/dishes` (nouvelle capacité) et `specs/item-capture`.

## Goals / Non-Goals

**Goals:**
- Un plat est une donnée de l'utilisateur, définie une fois et réutilisée à chaque capture, sans écran dédié.
- Le tri reste le seul lieu de décision : un plat n'ajoute jamais rien directement à la liste.

**Non-Goals:**
- Comprendre les dates d'un menu, ni sélectionner automatiquement les jours à venir : l'utilisateur colle les jours voulus.
- Un écran « Mes plats », la suppression ou le renommage d'un plat, les quantités.

## Decisions

### Glossaire
| Spec (fr)       | Code (en)     |
|-----------------|---------------|
| plat            | `Dish`        |
| ingrédient      | `ingredient` (une `Entry`) |
| ligne de menu   | `menuLine`    |

### Domaine : `Dish` est un nom et des entrées
`Dish = { id, name, ingredients: Entry[] }` dans `domain/dish.ts`. `defineDish(name, ingredientsText, newId)` découpe les ingrédients avec `splitIntoEntries`, ce qui donne le « ? » et les virgules gratuitement, et renvoie `Result<Dish, 'empty-name' | 'no-ingredient'>`. `findDish(dishes, label)` compare avec `labelKey`, comme pour les articles. Définir un plat dont le nom existe déjà remplace sa définition : « modifier » et « définir » sont la même opération côté domaine.

### Découpage des lignes de menu
Dans `splitIntoEntries`, chaque ligne est d'abord testée par `/^\s*(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\b/i`. Si elle correspond, tout jusqu'au premier « : » inclus est retiré, puis le reste est découpé sur `[/\-,;]`. Les autres lignes gardent les séparateurs actuels. Le découpage se fait donc ligne par ligne, avant les séparateurs internes. C'est un changement de structure de la fonction, couvert par les tests existants.

### Boîte de réception : groupes et fusion
- `Proposal` gagne `dish?: string`, le nom du plat d'origine. Absent pour un article simple : aucune migration de données.
- Une fonction interne, `mergeProposal`, ajoute une entrée en appliquant la fusion : libellé déjà proposé → rien, sauf si l'existant est à vérifier et le nouveau certain, auquel cas il devient certain. Toutes les additions passent par elle : capture, ajout manuel, expansion d'un plat.
- `captureText(inbox, text, newId, dishes)` : pour chaque entrée, si un plat correspond, ses ingrédients sont ajoutés avec `dish` renseigné, sauf si un groupe de ce plat existe déjà. Sinon, l'entrée est ajoutée seule.
- `expandIntoDish(inbox, proposalId, dish, newId)` remplace une proposition par le groupe, à sa place. `refreshDish(inbox, dish, newId)` remplace un groupe existant par la nouvelle définition, à sa place, en réinitialisant les écarts.
- `toggleDish(inbox, name)` : si tous les ingrédients du groupe sont écartés, il les remet tous ; sinon, il les écarte tous.
- Un ingrédient déjà proposé seul avant l'arrivée du plat reste à sa place d'origine, hors du groupe : la fusion prime sur le regroupement.

### Application et persistance
- Port `DishRepository` (`load(): Promise<Dish[]>`, `save(dishes)`), adaptateur IndexedDB sur un nouveau document `dishes` de la base existante. `load` renvoie `[]` s'il est absent, et le schéma reste en v3.
- Les cas d'usage de capture (`captureText`, `captureShared`, `pasteFromClipboard`) chargent les plats et les passent au domaine.
- Nouveaux cas d'usage : `defineDishFromProposal(proposalId, ingredientsText)`, qui prend le libellé de la proposition comme nom, mémorise le plat et expanse la proposition ; `updateDish(name, ingredientsText)`, qui mémorise le plat et rafraîchit son groupe ; `toggleDish(name)`.

### Interface
- Dans le tri, les propositions consécutives d'un même plat sont rendues dans un bloc : un en-tête (bouton portant le nom du plat ; un appui écarte ou remet le groupe ; un appui long ouvre la modification), puis ses pastilles.
- Le formulaire de correction d'une pastille simple (appui long) gagne « C'est un plat ». Il ouvre une feuille `DishSheet` : le nom en titre, une zone d'ingrédients (un par ligne, « ? » accepté), « Enregistrer ». En modification, la zone est pré-remplie avec les ingrédients actuels, les doutes suffixés de « ? ».
- La feuille du plat s'ouvre par-dessus le tri : deux `<dialog>` modaux s'empilent dans la couche supérieure du navigateur.

## Risks / Trade-offs

- [Une ligne de courses ordinaire commence par un jour (« Mardi gras : crêpes »)] → Elle est traitée comme une ligne de menu. Le cas est rare et visible au tri.
- [Un nom de légume composé avec un tiret dans une ligne de menu (« pak-choï »)] → Il est coupé en deux et se corrige au tri ; la règle reste prévisible.
- [Un ingrédient partagé par deux plats n'apparaît que dans le premier groupe] → Écarter le premier plat entier écarte aussi cet ingrédient pour le second. C'est accepté pour la v2 : le cas est rare, et l'ingrédient reste écartable et remettable à l'unité.
- [Une faute de frappe dans le nom (« risoto »)] → Non reconnu : la pastille apparaît seule, et l'utilisateur la corrige ou définit le plat. Pas de correspondance approximative, par choix de prévisibilité.

## Migration Plan

Aucune migration : nouveau document créé au premier plat défini ; les propositions existantes n'ont pas de plat. Déploiement normal depuis `main`.
