# Spec Delta

## ADDED Requirements

### Requirement: Découpage des lignes de menu
Le système SHALL reconnaître comme ligne de menu toute ligne du texte reçu qui commence par un jour de la semaine, quelle que soit la casse. Il MUST retirer de cette ligne tout ce qui précède le premier « : » inclus, puis découper le reste aussi sur « / » et « - ». Ces deux caractères MUST NOT être des séparateurs dans les autres lignes.

#### Scenario: Ligne de menu
- **WHEN** le texte reçu est « Lundi 3 : omelette / carottes-brocolis »
- **THEN** les articles proposés sont « omelette », « carottes » et « brocolis »

#### Scenario: Jour sans repas
- **WHEN** le texte reçu est « Mardi 4 :\nMercredi 5 : risotto »
- **THEN** le seul article proposé est « risotto »

#### Scenario: Ligne ordinaire avec barre oblique ou tiret
- **WHEN** le texte reçu est « sel/poivre\npâte brisée - pur beurre »
- **THEN** les articles proposés sont « sel/poivre » et « pâte brisée - pur beurre »

#### Scenario: Ligne de menu avec un doute
- **WHEN** le texte reçu est « Samedi 8 : restaurant ? / purée »
- **THEN** « restaurant » est proposé à vérifier et « purée » comme article certain

### Requirement: Fusion des doublons dans le tri
Le système MUST NOT proposer deux fois le même article ni le même plat dans la boîte de réception. Lorsqu'un article certain arrive alors que le même article est proposé à vérifier, la proposition existante MUST devenir certaine. Deux libellés sont identiques s'ils ne diffèrent que par la casse, les accents ou les espaces superflus.

#### Scenario: Article reçu deux fois
- **WHEN** le texte reçu est « carottes\nCarottes »
- **THEN** « carottes » n'est proposé qu'une fois

#### Scenario: Plat reçu deux fois
- **WHEN** le plat « risotto » est mémorisé et que le texte reçu est « Lundi 3 : risotto\nMardi 4 : risotto »
- **THEN** le groupe « risotto » n'est proposé qu'une fois

#### Scenario: Le certain l'emporte dans le tri
- **WHEN** « parmesan » est proposé à vérifier et que le texte reçu ensuite contient « parmesan »
- **THEN** « parmesan » n'est proposé qu'une fois, comme article certain
