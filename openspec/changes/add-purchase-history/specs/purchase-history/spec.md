# Spec Delta

## ADDED Requirements

### Requirement: Enregistrement d'un achat
Le système SHALL enregistrer un achat chaque fois qu'un article de la liste est coché, avec son libellé, sa quantité éventuelle, et la date et l'heure du cochage.

#### Scenario: Article coché
- **WHEN** l'utilisateur coche « citrons », de quantité 3, le mardi 21 octobre
- **THEN** l'historique contient un achat de 3 « citrons » le mardi 21 octobre

#### Scenario: Article racheté
- **WHEN** l'utilisateur a coché « lait » le lundi, que « lait » est de nouveau à prendre, et qu'il le coche le jeudi
- **THEN** l'historique contient un achat de « lait » le lundi et un autre le jeudi

### Requirement: Achat annulé par un décochage
Le système SHALL retirer de l'historique l'achat d'un article lorsque l'utilisateur décoche cet article.

#### Scenario: Cochage par erreur
- **WHEN** l'utilisateur coche « beurre » puis le décoche
- **THEN** l'historique ne contient aucun achat de « beurre » pour ce cochage

### Requirement: Historique indépendant de la liste
Le système MUST conserver les achats enregistrés lorsque les articles pris sont retirés de la liste, que la liste est vidée, qu'un article pris est supprimé ou qu'un retrait est annulé.

#### Scenario: Articles pris retirés
- **WHEN** l'utilisateur a coché « pain » puis retire les articles pris
- **THEN** l'historique contient toujours l'achat de « pain »

#### Scenario: Liste vidée
- **WHEN** l'utilisateur a coché « pain » puis vide la liste
- **THEN** l'historique contient toujours l'achat de « pain »

### Requirement: Consultation de l'historique
Le système SHALL permettre de consulter l'historique depuis la liste : les achats y sont regroupés par jour, les jours du plus récent au plus ancien, et chaque jour présente ses achats dans l'ordre où ils ont été cochés, avec leur quantité éventuelle. Deux achats d'un même article le même jour MUST apparaître tous deux.

#### Scenario: Achats regroupés par jour
- **WHEN** l'utilisateur a coché « lait » et « pain » le lundi 20 octobre, puis « citrons » le mardi 21 octobre, et qu'il consulte l'historique
- **THEN** l'historique présente le mardi 21 octobre avec « citrons », puis le lundi 20 octobre avec « lait » et « pain »

#### Scenario: Historique vide
- **WHEN** aucun article n'a encore été coché et que l'utilisateur consulte l'historique
- **THEN** l'historique indique qu'aucun achat n'a encore été enregistré
