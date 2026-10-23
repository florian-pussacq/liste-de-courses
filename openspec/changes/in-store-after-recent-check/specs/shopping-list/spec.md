## MODIFIED Requirements

### Requirement: Moment des courses
Le système SHALL considérer la liste comme en magasin lorsque son dernier article pris l'a été il y a moins d'une heure, et en préparation sinon, y compris lorsque le panier ne contient que des articles pris lors de courses précédentes. Le moment MUST se déduire des articles de la liste et de l'heure, sans réglage de l'utilisateur, et changer de lui-même une fois l'heure écoulée.

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
- **WHEN** la liste contient « pain », pris il y a cinq minutes et seul article pris, et que l'utilisateur le décoche
- **THEN** la liste est en préparation

#### Scenario: Articles pris retirés
- **WHEN** la liste contient « pain » pris il y a cinq minutes et « sel » à prendre, et que l'utilisateur retire les articles cochés
- **THEN** la liste est en préparation

#### Scenario: Panier des courses précédentes
- **WHEN** la liste contient « pain », pris il y a deux heures, et « lait » à prendre
- **THEN** la liste est en préparation

#### Scenario: Courses en cours
- **WHEN** la liste contient « pain », pris il y a deux heures, et « sel », pris il y a dix minutes
- **THEN** la liste est en magasin

#### Scenario: Fin des courses avec le temps
- **WHEN** la liste est en magasin et qu'une heure passe sans qu'aucun article soit pris
- **THEN** la liste est en préparation, sans action de l'utilisateur
