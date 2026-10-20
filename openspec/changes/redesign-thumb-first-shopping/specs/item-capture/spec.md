# Spec Delta

## ADDED Requirements

### Requirement: Collage depuis le presse-papiers
Le système SHALL permettre, en une seule action depuis la liste, de lire le texte du presse-papiers et de l'envoyer dans la boîte de réception, traité comme un texte partagé. Lorsque le presse-papiers est vide, illisible ou que sa lecture est refusée, le système MUST ouvrir la boîte de réception avec la saisie manuelle et en informer l'utilisateur.

#### Scenario: Presse-papiers contenant une liste
- **WHEN** le presse-papiers contient « pain, beurre » et que l'utilisateur choisit de coller une liste
- **THEN** la boîte de réception s'ouvre et propose « pain » et « beurre »

#### Scenario: Lecture refusée
- **WHEN** la lecture du presse-papiers est refusée et que l'utilisateur choisit de coller une liste
- **THEN** la boîte de réception s'ouvre avec la saisie manuelle et indique que le presse-papiers n'a pas pu être lu

#### Scenario: Presse-papiers vide
- **WHEN** le presse-papiers ne contient aucun texte et que l'utilisateur choisit de coller une liste
- **THEN** la boîte de réception s'ouvre avec la saisie manuelle et indique que le presse-papiers est vide

### Requirement: Rappel du texte reçu
Le système SHALL afficher dans la boîte de réception le ou les textes reçus depuis la dernière validation ou le dernier abandon, afin que l'utilisateur vérifie qu'aucun article n'a été oublié.

#### Scenario: Texte reçu rappelé
- **WHEN** le texte « pense à prendre du lait stp » a été reçu
- **THEN** la boîte de réception affiche ce texte au-dessus des articles proposés

#### Scenario: Plusieurs textes reçus
- **WHEN** les textes « pain » puis « beurre » ont été reçus sans validation entre les deux
- **THEN** la boîte de réception rappelle les deux textes, dans leur ordre de réception

## MODIFIED Requirements

### Requirement: Correction des articles proposés
Le système SHALL permettre, avant validation, d'écarter un article proposé puis de le remettre, de modifier le libellé d'un article proposé, ou d'en ajouter un. Écarter et remettre MUST se faire en une seule action sur l'article proposé ; la modification du libellé MUST être accessible par un appui long.

#### Scenario: Correction d'un libellé issu de texte libre
- **WHEN** l'utilisateur remplace le libellé proposé « pense à prendre du lait stp » par « lait »
- **THEN** l'article proposé devient « lait »

#### Scenario: Écarter un article proposé
- **WHEN** l'utilisateur écarte l'article proposé « stp »
- **THEN** « stp » est affiché comme écarté et ne sera pas ajouté à la liste

#### Scenario: Remettre un article écarté
- **WHEN** l'utilisateur remet l'article écarté « confiture »
- **THEN** « confiture » est de nouveau proposé et sera ajouté à la liste à la validation

#### Scenario: Ajout d'un article à la main
- **WHEN** l'utilisateur ajoute « farine » dans la boîte de réception
- **THEN** « farine » est proposé à la suite des autres articles

### Requirement: Validation vers la liste
Le système SHALL ajouter à la liste de courses les articles proposés qui ne sont pas écartés lorsque l'utilisateur valide, puis SHALL vider la boîte de réception et afficher la liste. Le nombre d'articles qui seront ajoutés MUST être indiqué avant la validation.

#### Scenario: Validation des articles proposés
- **WHEN** la boîte de réception propose « pain » et « beurre » et que l'utilisateur valide
- **THEN** « pain » et « beurre » figurent dans la liste et la boîte de réception est vide

#### Scenario: Validation avec un article écarté
- **WHEN** la boîte de réception propose « pain » et « stp », que « stp » est écarté et que l'utilisateur valide
- **THEN** seul « pain » est ajouté à la liste

#### Scenario: Nombre d'articles annoncé
- **WHEN** trois articles sont proposés dont un écarté
- **THEN** l'action de validation annonce l'ajout de deux articles

#### Scenario: Abandon de la capture
- **WHEN** l'utilisateur abandonne explicitement la capture en cours
- **THEN** la boîte de réception est vidée et la liste de courses reste inchangée
