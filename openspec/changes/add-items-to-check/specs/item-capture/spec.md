# Spec Delta

## ADDED Requirements

### Requirement: Articles proposés à vérifier
Le système SHALL proposer comme article à vérifier tout élément du texte reçu qui se termine par un point d'interrogation, en retirant ce point d'interrogation et les espaces qui le précèdent du libellé. Un point d'interrogation situé ailleurs dans l'élément MUST être conservé tel quel.

#### Scenario: Point d'interrogation final
- **WHEN** le texte reçu est « riz\ncompote ? »
- **THEN** « riz » est proposé comme article certain et « compote » comme article à vérifier

#### Scenario: Point d'interrogation collé au mot
- **WHEN** le texte reçu est « confiture? »
- **THEN** « confiture » est proposé comme article à vérifier

#### Scenario: Point d'interrogation au milieu
- **WHEN** le texte reçu est « thé ? ou café »
- **THEN** « thé ? ou café » est proposé comme article certain, libellé inchangé

#### Scenario: Élément réduit à un point d'interrogation
- **WHEN** le texte reçu est « pain\n? »
- **THEN** seul « pain » est proposé

### Requirement: Marquage à vérifier dans le tri
Le système SHALL permettre, avant validation, de marquer un article proposé à vérifier ou de le rendre certain, depuis ses actions ouvertes par un appui long. Un article proposé à vérifier MUST être distingué visuellement d'un article certain.

#### Scenario: Rendre certain un article proposé à vérifier
- **WHEN** « compote » est proposé à vérifier et que l'utilisateur le rend certain
- **THEN** « compote » est proposé comme article certain

#### Scenario: Marquer à vérifier un article proposé
- **WHEN** « farine » est proposé comme article certain et que l'utilisateur le marque à vérifier
- **THEN** « farine » est proposé comme article à vérifier

## MODIFIED Requirements

### Requirement: Validation vers la liste
Le système SHALL ajouter à la liste de courses les articles proposés qui ne sont pas écartés lorsque l'utilisateur valide, en conservant pour chacun son état certain ou à vérifier, puis SHALL vider la boîte de réception et afficher la liste. Le nombre d'articles qui seront ajoutés MUST être indiqué avant la validation.

#### Scenario: Validation des articles proposés
- **WHEN** la boîte de réception propose « pain » et « beurre » et que l'utilisateur valide
- **THEN** « pain » et « beurre » figurent dans la liste et la boîte de réception est vide

#### Scenario: Validation avec un article écarté
- **WHEN** la boîte de réception propose « pain » et « stp », que « stp » est écarté et que l'utilisateur valide
- **THEN** seul « pain » est ajouté à la liste

#### Scenario: Validation d'un article à vérifier
- **WHEN** la boîte de réception propose « compote » à vérifier et que l'utilisateur valide
- **THEN** « compote » figure dans la liste comme article à vérifier

#### Scenario: Nombre d'articles annoncé
- **WHEN** trois articles sont proposés dont un écarté
- **THEN** l'action de validation annonce l'ajout de deux articles

#### Scenario: Abandon de la capture
- **WHEN** l'utilisateur abandonne explicitement la capture en cours
- **THEN** la boîte de réception est vidée et la liste de courses reste inchangée
