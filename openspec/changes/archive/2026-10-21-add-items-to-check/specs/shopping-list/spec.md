# Spec Delta

## ADDED Requirements

### Requirement: Section des articles à vérifier
Le système SHALL afficher les articles à vérifier dans une section dédiée, en tête de la liste, avant les articles à prendre, avec le nombre d'articles qu'elle contient. La section MUST être absente lorsqu'aucun article n'est à vérifier. Un article à vérifier ne se coche pas.

#### Scenario: Articles à vérifier en tête
- **WHEN** la liste contient « riz » à prendre et « compote » à vérifier
- **THEN** « compote » est affiché dans la section des articles à vérifier, au-dessus de « riz »

#### Scenario: Aucun article à vérifier
- **WHEN** aucun article de la liste n'est à vérifier
- **THEN** la section des articles à vérifier n'est pas affichée

### Requirement: Levée du doute
Le système SHALL proposer, pour chaque article à vérifier, deux actions : constater qu'on en a déjà, ce qui retire l'article de la liste, ou constater qu'il en faut, ce qui en fait un article à prendre.

#### Scenario: On en a déjà
- **WHEN** l'utilisateur indique qu'il a déjà de la « compote »
- **THEN** « compote » ne figure plus dans la liste

#### Scenario: Il en faut
- **WHEN** l'utilisateur indique qu'il faut de la « compote »
- **THEN** « compote » devient un article à prendre, à sa place dans l'ordre d'ajout

### Requirement: Marquage manuel à vérifier
Le système SHALL permettre, depuis les actions d'un article à prendre, de le marquer à vérifier, et depuis les actions d'un article à vérifier, de le rendre certain.

#### Scenario: Marquer un article à vérifier
- **WHEN** l'utilisateur ouvre les actions de « farine » à prendre et le marque à vérifier
- **THEN** « farine » apparaît dans la section des articles à vérifier

## MODIFIED Requirements

### Requirement: Absence de doublons
Le système MUST NOT créer un second article lorsqu'un article de même libellé figure déjà dans la liste. Deux libellés sont identiques s'ils ne diffèrent que par la casse, les accents ou les espaces superflus. Lorsqu'un article certain est ajouté alors qu'un article de même libellé est à vérifier, l'article existant MUST devenir certain ; l'ajout d'un article à vérifier MUST NOT modifier un article existant certain ou déjà pris.

#### Scenario: Doublon d'un article non coché
- **WHEN** la liste contient « Œufs » non coché et que l'utilisateur ajoute « oeufs »
- **THEN** la liste contient un seul article « Œufs », non coché

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

### Requirement: Progression des courses
Le système SHALL afficher en tête de la liste le nombre d'articles restant à prendre, ainsi que le nombre d'articles pris rapporté au nombre total d'articles. Les articles à vérifier MUST NOT être comptés, ni parmi les articles à prendre ni dans le total.

#### Scenario: Courses en cours
- **WHEN** la liste contient cinq articles dont deux cochés
- **THEN** l'utilisateur voit trois articles restant à prendre et deux pris sur cinq

#### Scenario: Courses terminées
- **WHEN** tous les articles de la liste sont cochés
- **THEN** l'utilisateur voit qu'il ne reste aucun article à prendre

#### Scenario: Articles à vérifier non comptés
- **WHEN** la liste contient quatre articles certains dont un coché, et deux articles à vérifier
- **THEN** l'utilisateur voit trois articles restant à prendre et un pris sur quatre
