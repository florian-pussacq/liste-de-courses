# shopping-list Specification

## Purpose

Tient la liste unique des articles à acheter et accompagne son usage en magasin : savoir ce qu'il reste à prendre, cocher ce qui est pris, repartir d'une liste propre.

## Requirements

### Requirement: Ajout direct d'un article
Le système SHALL permettre d'ajouter un article à la liste en saisissant son libellé. Un libellé vide ou composé uniquement d'espaces MUST être refusé.

#### Scenario: Ajout d'un article
- **WHEN** l'utilisateur ajoute l'article « café »
- **THEN** « café » figure dans la liste, non coché

#### Scenario: Libellé vide
- **WHEN** l'utilisateur tente d'ajouter un article dont le libellé ne contient que des espaces
- **THEN** aucun article n'est ajouté

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

### Requirement: Modification d'un article
Le système SHALL permettre de modifier le libellé d'un article depuis les actions de l'article, ouvertes par un appui long sur sa ligne. Un libellé vide ou identique à celui d'un autre article de la liste MUST être refusé.

#### Scenario: Correction d'un libellé
- **WHEN** l'utilisateur ouvre les actions de « tomate » et le modifie en « tomates cerises »
- **THEN** la liste contient « tomates cerises » à la place de « tomate »

#### Scenario: Libellé déjà présent
- **WHEN** la liste contient « riz » et « pâtes » et que l'utilisateur modifie « pâtes » en « Riz »
- **THEN** la modification est refusée et l'utilisateur en est informé

#### Scenario: Appui long sans cochage
- **WHEN** l'utilisateur fait un appui long sur « tomate » non coché
- **THEN** les actions de « tomate » s'ouvrent et « tomate » reste non coché

### Requirement: Suppression d'un article
Le système SHALL permettre de supprimer un article de la liste depuis les actions de l'article, ouvertes par un appui long sur sa ligne.

#### Scenario: Suppression
- **WHEN** l'utilisateur ouvre les actions de « sucre » et choisit de le supprimer
- **THEN** « sucre » ne figure plus dans la liste

### Requirement: Cochage en magasin
Le système SHALL permettre de cocher et décocher un article en une seule action portant sur toute la ligne de l'article, pas seulement sur une case. Les articles restant à prendre MUST être affichés avant les articles cochés.

#### Scenario: Cocher un article
- **WHEN** l'utilisateur touche la ligne de « beurre »
- **THEN** « beurre » apparaît comme pris, dans le panier, après tous les articles restant à prendre

#### Scenario: Décocher un article
- **WHEN** l'utilisateur touche « beurre » dans le panier déplié
- **THEN** « beurre » réapparaît parmi les articles restant à prendre

### Requirement: Ordre des articles restant à prendre
Le système SHALL afficher les articles restant à prendre dans leur ordre d'ajout à la liste.

#### Scenario: Ordre d'ajout
- **WHEN** l'utilisateur ajoute « pain » puis « lait »
- **THEN** « pain » est affiché avant « lait »

### Requirement: Retrait des articles cochés
Le système SHALL permettre de retirer en une action tous les articles cochés, et MUST conserver les articles non cochés.

#### Scenario: Fin de courses
- **WHEN** la liste contient « pain » coché et « sel » non coché, et que l'utilisateur retire les articles cochés
- **THEN** la liste ne contient plus que « sel »

### Requirement: Liste vide
Le système SHALL indiquer explicitement que la liste est vide lorsqu'elle ne contient aucun article.

#### Scenario: Affichage d'une liste vide
- **WHEN** la liste ne contient aucun article
- **THEN** l'utilisateur voit un message indiquant que la liste est vide et comment ajouter des articles

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

### Requirement: Panier repliable
Le système SHALL regrouper les articles cochés dans un panier affiché après les articles restant à prendre, replié par défaut et indiquant le nombre d'articles qu'il contient. Une action SHALL déplier et replier le panier.

#### Scenario: Panier replié
- **WHEN** la liste contient « beurre » coché et que le panier est replié
- **THEN** l'utilisateur voit que le panier contient un article, sans voir « beurre »

#### Scenario: Panier déplié
- **WHEN** l'utilisateur déplie le panier
- **THEN** les articles cochés sont affichés et peuvent être décochés

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
