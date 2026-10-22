# Proposal

## Why

L'historique présente les achats jour par jour : savoir quand un article a été acheté pour la dernière fois demande de faire défiler les jours. Et pour racheter un article, il faut le retaper.

## What Changes

- **Recherche** : un champ en haut de l'historique trouve les achats dont le libellé contient le texte cherché, selon les mêmes règles que les doublons (casse, accents, pluriel). Les résultats présentent une ligne par article : son libellé, le nombre d'achats et la date du dernier.
- **Remettre dans la liste** : chaque résultat propose de remettre l'article dans la liste, avec la quantité de son dernier achat. Un article déjà à prendre ou à vérifier est signalé « Dans la liste » à la place, pour ne pas additionner les quantités par mégarde.
- Le champ vide laisse l'historique par jour inchangé.

Hors périmètre : la recherche dans la liste courante, la remise d'une journée entière, l'auto-complétion lors de la saisie d'un article.

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `purchase-history` : recherche d'un article dans l'historique et remise dans la liste.

## Impact

- Domaine : recherche des articles achetés à partir de l'historique.
- Application : cas d'usage pour remettre un article acheté dans la liste.
- Interface : champ de recherche et résultats dans la feuille d'historique.
- Aucune donnée ni schéma modifiés.
