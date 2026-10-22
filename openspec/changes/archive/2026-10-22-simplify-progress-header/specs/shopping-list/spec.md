## MODIFIED Requirements

### Requirement: Progression des courses
Le système SHALL afficher en tête de la liste le nombre d'articles restant à prendre, ainsi qu'une barre de progression des articles pris rapportés au nombre total d'articles, qui annonce aux technologies d'assistance le nombre d'articles pris sur le total. Ce rapport MUST NOT être répété en texte dans l'en-tête. Les articles à vérifier MUST NOT être comptés, ni parmi les articles à prendre ni dans le total.

#### Scenario: Courses en cours
- **WHEN** la liste contient cinq articles dont deux cochés
- **THEN** l'utilisateur voit trois articles restant à prendre, et la barre de progression annonce deux pris sur cinq

#### Scenario: Courses terminées
- **WHEN** tous les articles de la liste sont cochés
- **THEN** l'utilisateur voit qu'il ne reste aucun article à prendre

#### Scenario: Articles à vérifier non comptés
- **WHEN** la liste contient quatre articles certains dont un coché, et deux articles à vérifier
- **THEN** l'utilisateur voit trois articles restant à prendre, et la barre de progression annonce un pris sur quatre

#### Scenario: Rapport non répété en texte
- **WHEN** la liste contient cinq articles dont deux cochés
- **THEN** l'en-tête n'affiche pas « 2 / 5 pris »
