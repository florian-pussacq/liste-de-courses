# Spec Delta

## ADDED Requirements

### Requirement: Recherche dans l'historique
Le système SHALL permettre de rechercher un article dans l'historique dès que le texte cherché compte au moins deux caractères. Un achat correspond lorsque son libellé contient le texte cherché, la casse, les accents, les espaces superflus et la marque du pluriel en fin de mot étant ignorés. Sans texte cherché, l'historique MUST rester présenté par jour.

#### Scenario: Recherche partielle et pluriel
- **WHEN** « tomates cerises » a été acheté et que l'utilisateur cherche « tomate »
- **THEN** l'historique présente une ligne « tomates cerises »

#### Scenario: Aucun résultat
- **WHEN** aucun achat ne correspond au texte cherché « sucre »
- **THEN** l'historique indique qu'aucun achat ne correspond à « sucre »

### Requirement: Résultats par article
Le système SHALL présenter les résultats de recherche à raison d'une ligne par article, deux libellés identiques au sens de l'absence de doublons formant un même article : le libellé de son dernier achat, le nombre d'achats et la date du dernier, les articles achetés le plus récemment en premier.

#### Scenario: Article retrouvé
- **WHEN** « parmesan » a été acheté le jeudi 2 octobre et le mardi 21 octobre, et que l'utilisateur cherche « parm »
- **THEN** l'historique présente une ligne « parmesan » indiquant 2 achats, le dernier le mardi 21 octobre

#### Scenario: Plusieurs articles trouvés
- **WHEN** « parmesan » a été acheté le mardi 21 octobre et « parmesan râpé » le lundi 15 septembre, et que l'utilisateur cherche « parmesan »
- **THEN** l'historique présente « parmesan » puis « parmesan râpé »

### Requirement: Remise dans la liste depuis l'historique
Le système SHALL permettre de remettre dans la liste, depuis un résultat de recherche, un article acheté, avec la quantité de son dernier achat. Lorsque l'article est déjà dans la liste à prendre ou à vérifier, le résultat MUST l'indiquer au lieu de proposer de le remettre.

#### Scenario: Article remis
- **WHEN** le dernier achat de « citrons » était de quantité 3, que « citrons » n'est pas dans la liste, et que l'utilisateur le remet depuis la recherche
- **THEN** la liste contient « citrons » à prendre avec la quantité 3, et le résultat indique qu'il est dans la liste

#### Scenario: Article déjà dans la liste
- **WHEN** « citrons » est déjà à prendre dans la liste et que l'utilisateur le trouve dans l'historique
- **THEN** le résultat indique « Dans la liste » et ne propose pas de le remettre

#### Scenario: Article pris remis
- **WHEN** « citrons » est coché dans la liste et que l'utilisateur le remet depuis la recherche
- **THEN** « citrons » est de nouveau à prendre, avec la quantité de son dernier achat
