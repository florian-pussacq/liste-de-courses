# Spec Delta

## MODIFIED Requirements

### Requirement: Absence de doublons
Le système MUST NOT créer un second article lorsqu'un article de même libellé figure déjà dans la liste. Deux libellés sont identiques s'ils ne diffèrent que par la casse, les accents, les espaces superflus ou la marque du pluriel (« s » ou « x ») en fin de mot. Lorsqu'un article certain est ajouté alors qu'un article de même libellé est à vérifier, l'article existant MUST devenir certain ; l'ajout d'un article à vérifier MUST NOT modifier un article existant certain ou déjà pris.

#### Scenario: Doublon d'un article non coché
- **WHEN** la liste contient « Œufs » non coché et que l'utilisateur ajoute « oeufs »
- **THEN** la liste contient un seul article « Œufs », non coché

#### Scenario: Doublon au singulier et au pluriel
- **WHEN** la liste contient « petits pois » et que l'utilisateur ajoute « petit pois »
- **THEN** la liste contient un seul article « petits pois »

#### Scenario: Doublon d'un article déjà coché
- **WHEN** la liste contient « lait » coché et que l'utilisateur ajoute « Lait »
- **THEN** la liste contient un seul article « lait », de nouveau non coché

#### Scenario: Doublons dans une même validation
- **WHEN** la boîte de réception valide « pain » et « Pain » ensemble
- **THEN** la liste contient un seul article « pain »

#### Scenario: Le certain l'emporte sur le doute
- **WHEN** la liste contient « compote » à vérifier et que l'utilisateur ajoute « compote » comme article certain
- **THEN** la liste contient un seul article « compote », à prendre

#### Scenario: Un doute n'efface pas une certitude
- **WHEN** la liste contient « riz » à prendre et que l'utilisateur ajoute « riz » à vérifier
- **THEN** « riz » reste à prendre

#### Scenario: Un doute ne touche pas un article pris
- **WHEN** la liste contient « lait » coché et que l'utilisateur ajoute « lait » à vérifier
- **THEN** « lait » reste coché
