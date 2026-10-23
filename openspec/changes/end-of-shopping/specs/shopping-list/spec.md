## ADDED Requirements

### Requirement: Fin des courses
Le système SHALL retirer de la liste les articles pris lorsque la liste n'est pas en magasin, à l'ouverture de l'application comme une fois l'heure écoulée, sans action de l'utilisateur. Les articles à prendre et à vérifier MUST rester inchangés.

#### Scenario: Panier des courses précédentes à l'ouverture
- **WHEN** la liste contient « pain », pris il y a deux heures, et « lait » à prendre, et que l'utilisateur ouvre l'application
- **THEN** la liste ne contient plus que « lait »

#### Scenario: Fin des courses application ouverte
- **WHEN** la liste est en magasin, contient « pain » pris et « compote » à vérifier, et qu'une heure passe sans qu'aucun article soit pris
- **THEN** la liste ne contient plus que « compote », à vérifier

#### Scenario: Courses en cours conservées
- **WHEN** la liste contient « pain », pris il y a dix minutes, et que l'utilisateur ouvre l'application
- **THEN** « pain » est toujours pris dans la liste
