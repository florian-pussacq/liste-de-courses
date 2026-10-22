# Design

## Context

L'identité d'un article est son libellé : la fusion des doublons compare `labelKey(label)` dans le tri (`mergeInto`) comme dans la liste (`addItem`). Tout libellé passe par `cleanLabel` ; le texte reçu est découpé en `Entry` par `splitIntoEntries`, qui retire déjà un marqueur de liste numérotée (« 1. », « 2) ») et le « ? » final. Les ingrédients d'un plat sont des `Entry`. Un plat reconnu une seconde fois dans le même tri est aujourd'hui ignoré (`captureText`). Les documents IndexedDB sont typés `unknown` et migrés par version ; un champ facultatif ajouté n'exige pas de migration.

## Goals / Non-Goals

**Goals:**
- Séparer la quantité du libellé dès qu'un libellé entre dans le domaine, pour que la fusion reste fondée sur le seul libellé.
- Une seule règle de lecture de la quantité, partagée par toutes les entrées.
- Une seule règle d'addition, partagée par le tri et la liste.

**Non-Goals:**
- Unités de mesure, prise partielle, migration des libellés déjà enregistrés avec un nombre en tête.

## Decisions

### Une quantité facultative sur `Entry`, `Proposal` et `Item`
`quantity?: number` (entier de 1 à 99) ; absent signifie « non précisé ». Pas de type valeur dédié : un nombre borné et deux fonctions pures suffisent (`addQuantities(a?, b?)`, plafonné à 99, une absence n'ajoutant rien ; `stepQuantity(q?, delta, floor)` pour « − / + »). Absent plutôt que 0 ou 1 : « non précisé » est un état à part entière, et un document existant sans le champ est déjà valide.

### `readQuantity` lit la quantité d'un libellé tapé, partout
`readQuantity(raw): { label, quantity? }` (domaine) reconnaît « N libellé » et « libellé xN / ×N » (1 à 99) et laisse intact un nombre suivi d'une unité (g, kg, mg, l, cl, ml, dl, %) ou placé ailleurs. Elle est appelée :
- par `splitIntoEntries`, après le retrait du marqueur de liste et du « ? » : « 1. 3 citrons ? » donne `citrons`, 3, à vérifier ; les ingrédients d'un plat en profitent puisqu'ils sont découpés de la même façon ;
- par `addItem`, `addProposal` (saisie directe) ;
- par `renameItem` et `editProposal`, où une quantité lue remplace l'existante et son absence la conserve.

« 1. citrons » reste un marqueur de liste (point ou parenthèse), « 3 citrons » une quantité : les deux formes ne se confondent pas.

### Addition dans les fusions existantes
`mergeInto` (tri) et `addItem` (liste) additionnent la quantité entrante à celle de l'élément fusionné, sauf dans les deux cas où l'ajout remplace : un article pris remis à prendre, et un doute levé par un ajout certain. Un ajout à vérifier sur un article certain ou pris ne change rien, quantité comprise, comme aujourd'hui.

### Un plat cité de nouveau est fusionné de nouveau
`captureText` n'ignore plus un plat dont le groupe existe : il refusionne ses ingrédients, ce qui additionne les quantités précisées et laisse les autres inchangés. La multiplication par le nombre de citations découle de l'addition, sans compteur à stocker.

Limite acceptée : `refreshDish` (modification d'un plat pendant le tri) et `expandIntoDish` (définition d'un plat à définir) reconstruisent le groupe pour une seule citation. Le bilan et les boutons « − / + » permettent de corriger ; un compteur de citations est écarté tant que ce cas n'est pas constaté à l'usage.

### Bilan : l'évolution de la quantité des articles déjà présents
`BatchAddition.alreadyListed` devient une liste de `{ label, quantity?: { before, after } }`, renseignée seulement quand la quantité a changé. L'interface affiche « Citrons (3 → 5) ». `added` garde des libellés.

### Commandes « − / + »
- Cas d'usage `setItemQuantity(id, quantity?)` et `setProposalQuantity(id, quantity?)` ; l'interface calcule la nouvelle valeur avec `stepQuantity`.
- Un composant `QuantityStepper` (« − », valeur, « + », noms accessibles « Diminuer citrons » / « Augmenter citrons ») sert aux actions d'un article, aux actions d'une proposition (plancher 0 : sous 1, la quantité disparaît) et aux lignes à prendre (plancher 1).
- La ligne `ItemRow` cesse d'être un unique bouton-case à cocher : la case et les boutons deviennent des éléments frères (un bouton ne peut en contenir un autre), la zone de cochage gardant toute la largeur restante. Sans quantité, la ligne reste identique à aujourd'hui.

### Envoi et relecture
`listAsText` écrit « 3 citrons » (« 3 citrons ? » pour un doute). La relecture passe par `splitIntoEntries`, donc par `readQuantity` : aller-retour à l'identique.

### Données
Aucune version de schéma : le champ est facultatif dans les documents `shopping-list`, `inbox` et `dishes`. Un libellé déjà enregistré qui commence par un nombre n'est pas relu : il reste tel quel.

## Risks / Trade-offs

- [Coller deux fois le même texte double les quantités] → Visible dans le bilan (« 3 → 6 ») et corrigeable par « − » ; une protection contre les textes déjà reçus pourra venir si le cas se présente.
- [Un nombre en tête qui n'est pas une quantité, comme « 4 quarts »] → Pris pour une quantité ; la correction dans le tri le montre avant validation. Le plafond à 99 et l'exclusion des unités couvrent les cas courants (« 500 g », « 2 kg »).
- [Libellés anciens avec un nombre en tête] → Restent distincts de leurs équivalents avec quantité ; l'utilisateur les renomme une fois.
- [La ligne d'un article avec quantité perd de la largeur cochable] → Les boutons sont regroupés à droite, séparés de la zone de cochage ; sans quantité, rien ne change.

## Migration Plan

Aucune migration de données. Déploiement normal depuis `main`.
