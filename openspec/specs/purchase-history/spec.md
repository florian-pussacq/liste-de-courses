# purchase-history Specification

## Purpose
Garder une trace datée de ce qui a été acheté : chaque article coché devient un achat, conservé indépendamment de la liste et consultable jour par jour.

## Requirements

### Requirement: Enregistrement d'un achat
Le système SHALL enregistrer un achat chaque fois qu'un article de la liste est coché, avec son libellé, sa quantité, et la date et l'heure du cochage.

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
Le système SHALL permettre de consulter l'historique depuis la liste : les achats y sont regroupés par jour, les jours du plus récent au plus ancien, et chaque jour présente ses achats dans l'ordre où ils ont été cochés, avec leur quantité lorsqu'elle dépasse 1. Deux achats d'un même article le même jour MUST apparaître tous deux.

#### Scenario: Achats regroupés par jour
- **WHEN** l'utilisateur a coché « lait » et « pain » le lundi 20 octobre, puis « citrons » le mardi 21 octobre, et qu'il consulte l'historique
- **THEN** l'historique présente le mardi 21 octobre avec « citrons », puis le lundi 20 octobre avec « lait » et « pain »

#### Scenario: Historique vide
- **WHEN** aucun article n'a encore été coché et que l'utilisateur consulte l'historique
- **THEN** l'historique indique qu'aucun achat n'a encore été enregistré

### Requirement: Effacement de l'historique
Le système SHALL permettre d'effacer tous les achats de l'historique depuis sa consultation. L'effacement MUST être confirmé avant d'avoir lieu, et MUST NOT modifier la liste de courses.

#### Scenario: Historique effacé
- **WHEN** l'utilisateur choisit d'effacer l'historique puis confirme
- **THEN** l'historique indique qu'aucun achat n'a encore été enregistré, et la liste est inchangée

#### Scenario: Effacement abandonné
- **WHEN** l'utilisateur choisit d'effacer l'historique puis renonce
- **THEN** l'historique contient toujours ses achats

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
