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
Le système MUST NOT créer un second article lorsqu'un article de même libellé figure déjà dans la liste. Deux libellés sont identiques s'ils ne diffèrent que par la casse, les accents ou les espaces superflus.

#### Scenario: Doublon d'un article non coché
- **WHEN** la liste contient « Œufs » non coché et que l'utilisateur ajoute « oeufs »
- **THEN** la liste contient un seul article « Œufs », non coché

#### Scenario: Doublon d'un article déjà coché
- **WHEN** la liste contient « lait » coché et que l'utilisateur ajoute « Lait »
- **THEN** la liste contient un seul article « lait », de nouveau non coché

#### Scenario: Doublons dans une même validation
- **WHEN** la boîte de réception valide « pain » et « Pain » ensemble
- **THEN** la liste contient un seul article « pain »

### Requirement: Modification d'un article
Le système SHALL permettre de modifier le libellé d'un article. Un libellé vide ou identique à celui d'un autre article de la liste MUST être refusé.

#### Scenario: Correction d'un libellé
- **WHEN** l'utilisateur modifie « tomate » en « tomates cerises »
- **THEN** la liste contient « tomates cerises » à la place de « tomate »

#### Scenario: Libellé déjà présent
- **WHEN** la liste contient « riz » et « pâtes » et que l'utilisateur modifie « pâtes » en « Riz »
- **THEN** la modification est refusée et l'utilisateur en est informé

### Requirement: Suppression d'un article
Le système SHALL permettre de supprimer un article de la liste.

#### Scenario: Suppression
- **WHEN** l'utilisateur supprime l'article « sucre »
- **THEN** « sucre » ne figure plus dans la liste

### Requirement: Cochage en magasin
Le système SHALL permettre de cocher et décocher un article en une seule action. Les articles restant à prendre MUST être affichés avant les articles cochés.

#### Scenario: Cocher un article
- **WHEN** l'utilisateur coche « beurre »
- **THEN** « beurre » apparaît comme pris, après tous les articles restant à prendre

#### Scenario: Décocher un article
- **WHEN** l'utilisateur décoche « beurre »
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
