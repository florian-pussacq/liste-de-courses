# Proposal

## Why

Les repas prévus sont souvent notés sous forme de noms de plats, jour par jour, et reviennent d'une semaine à l'autre. Traduire chaque plat en ingrédients se fait de tête au moment de faire la liste, à chaque fois, et c'est là que des ingrédients sont oubliés. L'application peut mémoriser cette traduction une fois pour toutes et la refaire à chaque collage d'un menu.

## What Changes

- **Plats mémorisés** : un plat est un nom et une liste d'ingrédients, certains éventuellement à vérifier. Il est défini une fois, depuis le tri, sur un article proposé que l'application ne connaît pas encore.
- **Reconnaissance au tri** : un article proposé qui porte le nom d'un plat connu est remplacé par ses ingrédients, regroupés sous le nom du plat. Les ingrédients s'écartent un par un, ou le plat entier d'un seul geste.
- **Modification d'un plat** depuis son groupe dans le tri ; la définition est mise à jour pour les fois suivantes.
- **Lignes de menu** : une ligne qui commence par un jour de la semaine voit ce préfixe retiré jusqu'au premier « : », puis elle est découpée aussi sur « / » et « - ».
- **Doublons fusionnés dès le tri** : un article ou un plat déjà proposé ne l'est pas une seconde fois ; un article certain l'emporte sur un article à vérifier.

Hors périmètre : interprétation des dates, écran de gestion des plats, quantités, partage des plats.

## Capabilities

### New Capabilities

- `dishes` : définition, reconnaissance, modification et conservation des plats mémorisés, et leur présentation en groupes dans le tri.

### Modified Capabilities

- `item-capture` : découpage des lignes de menu ; fusion des doublons parmi les articles proposés.

## Impact

- Domaine : nouveau concept `Dish` ; le découpage reconnaît les lignes de menu ; la capture dans la boîte de réception consulte les plats connus et fusionne les doublons ; les articles proposés peuvent appartenir à un plat.
- Persistance : nouveau document des plats dans la base existante ; aucune migration, l'appartenance d'une proposition à un plat étant facultative.
- Interface : groupes de plats dans le tri, feuille de définition d'un plat.
