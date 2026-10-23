## ADDED Requirements

### Requirement: Rappel de l'appui long
Le système SHALL rappeler, sous les articles d'une liste non vide en préparation, qu'un appui long sur un article permet de le modifier ou de le supprimer. Le rappel MUST être absent lorsque la liste est en magasin.

#### Scenario: Rappel en préparation
- **WHEN** la liste est en préparation et contient « pain »
- **THEN** l'utilisateur voit, sous les articles, qu'un appui long sur un article permet de le modifier ou de le supprimer

#### Scenario: Pas de rappel en magasin
- **WHEN** la liste est en magasin
- **THEN** le rappel de l'appui long n'est pas affiché
