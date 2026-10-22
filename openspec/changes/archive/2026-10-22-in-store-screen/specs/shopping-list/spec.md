## ADDED Requirements

### Requirement: Moment des courses
Le système SHALL considérer la liste comme en magasin dès qu'au moins un de ses articles est pris, et en préparation sinon. Le moment MUST se déduire des articles de la liste, sans réglage de l'utilisateur, et changer dès qu'un article est pris ou que plus aucun ne l'est.

#### Scenario: Liste en préparation
- **WHEN** la liste contient « pain » et « lait » à prendre, et aucun article pris
- **THEN** la liste est en préparation

#### Scenario: Premier article pris
- **WHEN** la liste est en préparation et que l'utilisateur coche « pain »
- **THEN** la liste est en magasin

#### Scenario: Article à vérifier
- **WHEN** la liste contient « compote » à vérifier et « pain » à prendre, et aucun article pris
- **THEN** la liste est en préparation

#### Scenario: Dernier article décoché
- **WHEN** la liste contient « pain » pris, seul article pris, et que l'utilisateur le décoche
- **THEN** la liste est en préparation

#### Scenario: Articles pris retirés
- **WHEN** la liste contient « pain » pris et « sel » à prendre, et que l'utilisateur retire les articles cochés
- **THEN** la liste est en préparation
