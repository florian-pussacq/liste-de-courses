# Spec Delta

## MODIFIED Requirements

### Requirement: Validation vers la liste
Le système SHALL ajouter à la liste de courses les articles proposés qui ne sont pas écartés lorsque l'utilisateur valide, en conservant pour chacun son état certain ou à vérifier, puis SHALL vider la boîte de réception et afficher la liste. Le nombre d'articles qui seront ajoutés MUST être indiqué avant la validation par le titre du tri ; l'action de validation s'intitule « Mettre dans la liste ».

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
- **THEN** le titre du tri annonce deux articles et l'action « Mettre dans la liste » est disponible

#### Scenario: Abandon de la capture
- **WHEN** l'utilisateur abandonne explicitement la capture en cours
- **THEN** la boîte de réception est vidée et la liste de courses reste inchangée
