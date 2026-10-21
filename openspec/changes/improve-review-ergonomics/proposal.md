# Proposal

## Why

À l'usage, le tri d'un menu de plusieurs jours devient long : il faut défiler pour valider, le rappel des textes reçus occupe l'écran, et les plats se mélangent aux articles simples dans l'ordre de réception. Dans la liste, plusieurs gestes effacent des articles sans retour possible, alors qu'un appui malheureux est fréquent quand on tient un panier d'une main.

## What Changes

- **Validation toujours accessible** : l'action de validation et l'abandon du tri restent visibles en bas de l'écran, quelle que soit la longueur du tri.
- **Rappel replié** : les textes reçus restent consultables, mais repliés par défaut derrière une action qui indique leur nombre.
- **Ordre du tri** : les plats (reconnus ou à définir) sont présentés d'abord, puis les articles simples, chacun dans l'ordre de réception ; la liste reçoit les articles validés dans ce même ordre.
- **Annulation** : après « on en a », la suppression d'un article ou le retrait des articles pris, une action « Annuler » reste proposée quelques secondes et rétablit la liste telle qu'elle était.
- **Allègement visuel** : l'explication des plats à définir n'est donnée qu'une fois pour tout le tri.

Hors périmètre : annulation dans le tri (écarter est déjà réversible), annulation de l'abandon du tri, historique d'annulations multiples.

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `item-capture` : rappel du texte reçu replié par défaut ; ordre de présentation du tri ; validation toujours accessible.
- `shopping-list` : annulation des actions qui retirent des articles.

## Impact

- Domaine : une fonction pure d'ordre de présentation du tri, également utilisée pour l'ordre de validation.
- Application : rétablissement de la liste à un état antérieur.
- Interface : pied de feuille fixe, rappel repliable, bandeau d'annulation dans la liste.
- Aucune donnée ni schéma modifiés.
