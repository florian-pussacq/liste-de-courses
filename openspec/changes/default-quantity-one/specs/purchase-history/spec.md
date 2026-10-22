# Spec Delta

## MODIFIED Requirements

### Requirement: Enregistrement d'un achat
Le système SHALL enregistrer un achat chaque fois qu'un article de la liste est coché, avec son libellé, sa quantité, et la date et l'heure du cochage.

#### Scenario: Article coché
- **WHEN** l'utilisateur coche « citrons », de quantité 3, le mardi 21 octobre
- **THEN** l'historique contient un achat de 3 « citrons » le mardi 21 octobre

#### Scenario: Article racheté
- **WHEN** l'utilisateur a coché « lait » le lundi, que « lait » est de nouveau à prendre, et qu'il le coche le jeudi
- **THEN** l'historique contient un achat de « lait » le lundi et un autre le jeudi

### Requirement: Consultation de l'historique
Le système SHALL permettre de consulter l'historique depuis la liste : les achats y sont regroupés par jour, les jours du plus récent au plus ancien, et chaque jour présente ses achats dans l'ordre où ils ont été cochés, avec leur quantité lorsqu'elle dépasse 1. Deux achats d'un même article le même jour MUST apparaître tous deux.

#### Scenario: Achats regroupés par jour
- **WHEN** l'utilisateur a coché « lait » et « pain » le lundi 20 octobre, puis « citrons » le mardi 21 octobre, et qu'il consulte l'historique
- **THEN** l'historique présente le mardi 21 octobre avec « citrons », puis le lundi 20 octobre avec « lait » et « pain »

#### Scenario: Historique vide
- **WHEN** aucun article n'a encore été coché et que l'utilisateur consulte l'historique
- **THEN** l'historique indique qu'aucun achat n'a encore été enregistré
