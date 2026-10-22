# Spec Delta

## ADDED Requirements

### Requirement: Bilan de la validation
Le système SHALL indiquer, après la validation du tri, les articles réellement ajoutés à la liste et ceux qui y figuraient déjà. Ce bilan MUST rester affiché jusqu'à ce que l'utilisateur le ferme ou modifie la liste.

#### Scenario: Articles ajoutés et déjà présents
- **WHEN** la liste contient « petits pois » et que l'utilisateur valide « petit pois » et « lait »
- **THEN** le bilan indique que « lait » a été ajouté et que « petits pois » était déjà dans la liste

#### Scenario: Article pris ajouté de nouveau
- **WHEN** la liste contient « lait » coché et que l'utilisateur valide « lait »
- **THEN** le bilan indique que « lait » a été ajouté, et « lait » est de nouveau à prendre

#### Scenario: Bilan fermé
- **WHEN** le bilan est affiché et que l'utilisateur le ferme
- **THEN** le bilan disparaît

#### Scenario: Bilan dépassé
- **WHEN** le bilan est affiché et que l'utilisateur coche un article
- **THEN** le bilan disparaît

### Requirement: Ouverture du tri sans clavier
Le système MUST NOT placer le curseur dans un champ de saisie à l'ouverture de la boîte de réception : le clavier ne s'ouvre que si l'utilisateur touche un champ.

#### Scenario: Liste collée
- **WHEN** l'utilisateur colle une liste depuis le presse-papiers
- **THEN** la boîte de réception s'ouvre sans qu'aucun champ de saisie ne soit actif

### Requirement: Initiale en majuscule dans le tri
Le système SHALL afficher dans la boîte de réception chaque proposition, plat et ingrédient avec une initiale en majuscule, sans modifier le libellé enregistré.

#### Scenario: Proposition en minuscules
- **WHEN** le texte reçu est « carottes »
- **THEN** la proposition s'affiche « Carottes »
