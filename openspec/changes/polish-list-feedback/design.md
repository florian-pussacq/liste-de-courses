# Design

## Context

La validation du tri appelle `addItems(list, entries, ctx)`, qui fusionne les doublons sans dire lesquels. L'interface affiche les libellés tels qu'enregistrés. Le bandeau « Annuler » apparaît déjà pour tout changement qui retire des articles de la liste (comparaison avant / après dans `App.svelte`).

## Goals / Non-Goals

**Goals:**
- Dire après chaque validation ce qui a été ajouté et ce qui était déjà là.
- Une présentation soignée des libellés sans toucher aux données.
- Repartir d'une liste vide en un geste, sans risque.

**Non-Goals:**
- Corriger l'orthographe ou la casse des libellés enregistrés.
- Demander une confirmation avant de vider : l'annulation la remplace.

## Decisions

### Le bilan est calculé par le domaine, au moment de l'ajout
`addItems` renvoie, en plus de la liste, les libellés ajoutés et les libellés déjà présents (dans l'ordre de validation). Un doublon interne à la validation (« pain » et « Pain ») ne compte qu'une fois, comme ajouté. Le domaine est le seul à savoir quelle entrée a été fusionnée : recalculer le bilan dans l'interface en comparant deux listes dupliquerait la règle des doublons.

`validateInbox` renvoie `{ list, added, alreadyListed }`. Un article déjà présent mais pris, remis à prendre par la validation, compte comme ajouté : il revient parmi les articles à prendre, ce qui est bien un ajout du point de vue des courses (il avait pu être coché par erreur). Un article à vérifier rendu certain compte comme déjà présent.

### Le bilan reste jusqu'à ce qu'on le ferme ou qu'on change la liste
Une liste de noms se lit en plus de six secondes : pas de délai d'expiration. Le bandeau (`role="status"`) se ferme d'un bouton, et disparaît à toute autre modification de la liste, comme celui de l'annulation, pour ne jamais décrire un état dépassé. Il occupe la place du bandeau d'annulation, au-dessus du dock : les deux ne coexistent pas, puisque une validation n'est pas un retrait.

### L'initiale est une affaire de présentation
- À l'écran : `::first-letter { text-transform: uppercase }` sur les libellés. Le texte du DOM et les noms accessibles restent ceux enregistrés ; aucune donnée n'est modifiée, aucune migration.
- À l'envoi : `listAsText` met l'initiale en majuscule, puisque le texte quitte l'application. La relecture par l'application reste identique, la casse étant ignorée dans les comparaisons.

Alternative écartée : mettre la majuscule à l'enregistrement. Elle changerait les données existantes et la casse que l'utilisateur a choisie (« iPhone », « pH »), pour un gain de présentation seulement. Avec `::first-letter`, « iPhone » s'affiche « IPhone » : c'est accepté, la présentation restant uniforme.

### Vider la liste réutilise l'annulation existante
`clearList` (domaine) renvoie une liste sans article ; le cas d'usage l'enregistre. Comme tout retrait, il déclenche le bandeau « Annuler » sans code supplémentaire. L'action « Vider la liste » se place en fin de liste, loin du dock, et n'apparaît que si la liste contient au moins un article.

## Risks / Trade-offs

- [`::first-letter` ne s'applique qu'à un bloc] → Les libellés concernés sont affichés en `inline-block` ou `block`.
- [Un vidage par erreur après six secondes est définitif] → Même règle que les autres retraits ; l'action est placée hors de portée du pouce qui tient le téléphone.

## Migration Plan

Aucune donnée ni schéma modifiés. Déploiement normal depuis `main`.
