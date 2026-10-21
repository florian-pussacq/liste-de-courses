# Design

## Context

Toutes les comparaisons de libellés (liste, tri, plats) passent par `labelKey`, qui ignore la casse, les accents, les ligatures et les espaces superflus. La clé n'est jamais stockée.

## Goals / Non-Goals

**Goals:**
- Fusionner les variantes singulier / pluriel courantes d'un même article.

**Non-Goals:**
- Une lemmatisation du français (pluriels irréguliers, conjugaisons).
- Corriger les doublons déjà enregistrés.

## Decisions

### Retirer un « s » ou un « x » final à chaque mot de la clé
`labelKey` retire, après la normalisation actuelle, un « s » ou un « x » final à chaque mot de plus de deux lettres. La règle est appliquée des deux côtés de la comparaison : « ananas » devient « anana » dans les deux cas et reste égal à lui-même. Les mots de deux lettres ou moins (« os », « de ») sont laissés tels quels.

Alternative écartée : une liste de pluriels connus. Elle ne couvre que ce qu'on y met, alors que les libellés sont libres.

### Le libellé existant est conservé
Les fonctions de fusion gardent déjà l'article ou la proposition déjà présent : rien ne change hors de `labelKey`.

## Risks / Trade-offs

- [Deux articles réellement différents qui ne diffèrent que par un « s » final, comme « pâte » et « pâtes »] → Ils sont fusionnés. Le cas est rare dans une liste de courses, et l'utilisateur peut renommer l'article pour les distinguer (« pâte brisée »).
- [Les doublons déjà présents restent] → La prochaine saisie d'une variante est fusionnée avec le premier d'entre eux ; l'utilisateur supprime l'autre.

## Migration Plan

Aucune : la clé est calculée à chaque comparaison.
