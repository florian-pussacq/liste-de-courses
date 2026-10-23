## MODIFIED Requirements

### Requirement: Progression des courses
Le système SHALL afficher en tête de la liste le nombre d'articles restant à prendre, ainsi qu'une barre de progression des articles pris rapportés au nombre total d'articles, qui annonce aux technologies d'assistance le nombre d'articles pris sur le total. Ce rapport MUST NOT être répété en texte dans l'en-tête. Les articles à vérifier MUST NOT être comptés, ni parmi les articles à prendre ni dans le total.

#### Scenario: Courses en cours
- **WHEN** la liste est en magasin et contient cinq articles dont deux cochés
- **THEN** l'utilisateur voit trois articles restant à prendre, et la barre de progression annonce deux pris sur cinq

#### Scenario: Courses terminées
- **WHEN** tous les articles de la liste sont cochés
- **THEN** l'utilisateur voit qu'il ne reste aucun article à prendre

#### Scenario: Articles à vérifier non comptés
- **WHEN** la liste est en magasin et contient quatre articles certains dont un coché, et deux articles à vérifier
- **THEN** l'utilisateur voit trois articles restant à prendre, et la barre de progression annonce un pris sur quatre

#### Scenario: Rapport non répété en texte
- **WHEN** la liste est en magasin et contient cinq articles dont deux cochés
- **THEN** l'en-tête n'affiche pas « 2 / 5 pris »

## ADDED Requirements

### Requirement: Barre de progression réservée aux courses
Le système SHALL n'afficher la barre de progression que lorsque la liste est en magasin. En préparation, l'en-tête MUST se limiter au nombre d'articles restant à prendre.

#### Scenario: Pas de barre en préparation
- **WHEN** la liste est en préparation et contient « pain » et « lait » à prendre
- **THEN** l'utilisateur voit deux articles restant à prendre, sans barre de progression

#### Scenario: Barre en magasin
- **WHEN** la liste est en préparation et que l'utilisateur coche « pain »
- **THEN** la barre de progression apparaît et annonce un pris sur deux
