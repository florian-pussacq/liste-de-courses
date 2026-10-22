# Proposal

## Why

Un même article écrit tantôt au singulier, tantôt au pluriel (« petit pois » et « petits pois ») crée aujourd'hui deux articles dans la liste : la règle des doublons ne tient compte que de la casse, des accents et des espaces.

## What Changes

- Deux libellés sont aussi identiques s'ils ne diffèrent que par la marque du pluriel en fin de mot (« s » ou « x »), mot par mot : « petits pois » et « petit pois », « tomates cerises » et « tomate cerise », « choux » et « chou ».
- La règle vaut partout où les doublons sont fusionnés : dans la liste, dans le tri, et pour reconnaître un plat mémorisé.
- Le libellé déjà présent est conservé tel quel.

Hors périmètre : les pluriels irréguliers (« -al » / « -aux »), la fusion rétroactive des doublons déjà présents dans une liste.

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `shopping-list` : absence de doublons étendue au singulier et au pluriel.
- `item-capture` : fusion des doublons dans le tri étendue au singulier et au pluriel.

## Impact

- Domaine : la clé de comparaison des libellés.
- Aucune donnée ni schéma modifiés : la clé est calculée, jamais stockée.
