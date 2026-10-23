# item-quantities Specification

## Purpose
Dire combien d'unités prendre de chaque article : reconnaître la quantité dans les libellés tapés ou reçus, additionner les quantités d'un même article, et les afficher, ajuster et envoyer avec la liste.

## Requirements

### Requirement: Quantité d'un article
Le système SHALL permettre d'associer à un article une quantité, nombre entier d'unités compris entre 1 et 99. Un article dont aucune quantité n'est écrite a la quantité 1. Une quantité MUST NOT faire partie du libellé : deux articles qui ne diffèrent que par leur quantité sont le même article.

#### Scenario: Article sans quantité
- **WHEN** l'utilisateur ajoute « lait »
- **THEN** la liste contient « lait » avec la quantité 1

#### Scenario: Article avec quantité
- **WHEN** l'utilisateur ajoute « 3 citrons »
- **THEN** la liste contient « citrons » avec la quantité 3

### Requirement: Reconnaissance de la quantité
Le système SHALL reconnaître une quantité dans tout libellé tapé ou reçu (texte partagé ou collé, ajout direct, correction d'une proposition, modification d'un article, ingrédients d'un plat) lorsqu'il commence par un nombre suivi d'un espace (« 3 citrons ») ou se termine par « x » ou « × » suivi d'un nombre (« citrons x3 », « citrons ×3 »). Un nombre hors de 1 à 99, suivi d'une unité de mesure (g, kg, mg, l, cl, ml, dl, %), ou placé ailleurs dans le libellé MUST rester dans le libellé.

#### Scenario: Nombre en tête
- **WHEN** le texte reçu est « 4 courgettes »
- **THEN** « courgettes » est proposé avec la quantité 4

#### Scenario: Nombre en fin
- **WHEN** le texte reçu est « citrons x3 »
- **THEN** « citrons » est proposé avec la quantité 3

#### Scenario: Poids dans le libellé
- **WHEN** le texte reçu est « 2 kg pommes de terre »
- **THEN** « 2 kg pommes de terre » est proposé, avec la quantité 1

#### Scenario: Nombre dans le libellé
- **WHEN** le texte reçu est « pain 7 céréales »
- **THEN** « pain 7 céréales » est proposé, avec la quantité 1

#### Scenario: Quantité d'un article à vérifier
- **WHEN** le texte reçu est « 3 citrons ? »
- **THEN** « citrons » est proposé à vérifier avec la quantité 3

### Requirement: Quantité tapée lors d'une modification
Le système SHALL, lors de la modification d'un article ou de la correction d'une proposition, remplacer la quantité existante par la quantité tapée, et conserver la quantité existante lorsque le libellé tapé n'en contient pas.

#### Scenario: Quantité tapée en modifiant un article
- **WHEN** l'article « citrons » a la quantité 3 et que l'utilisateur le renomme en « 4 citrons »
- **THEN** « citrons » a la quantité 4

#### Scenario: Libellé modifié sans nombre
- **WHEN** l'article « citrons » a la quantité 3 et que l'utilisateur le renomme en « citrons jaunes »
- **THEN** « citrons jaunes » garde la quantité 3

### Requirement: Addition des quantités
Le système SHALL additionner les quantités lorsqu'un article déjà présent, dans le tri ou dans la liste, est ajouté de nouveau : une quantité écrite s'ajoute à la quantité existante, et un ajout sans quantité écrite ne change pas la quantité existante. Le total MUST être limité à 99. Lorsqu'un article pris est remis à prendre par un ajout, ou qu'un ajout certain lève le doute sur un article à vérifier, sa quantité MUST être celle de l'ajout, 1 lorsqu'aucune n'est écrite.

#### Scenario: Quantités additionnées
- **WHEN** la liste contient « citrons » avec la quantité 3 et que l'utilisateur ajoute « 2 citrons »
- **THEN** la liste contient « citrons » avec la quantité 5

#### Scenario: Quantité ajoutée à un article sans quantité
- **WHEN** la liste contient « citrons », sans quantité écrite donc de quantité 1, et que l'utilisateur ajoute « 2 citrons »
- **THEN** la liste contient « citrons » avec la quantité 3

#### Scenario: Doublon sans quantité écrite
- **WHEN** la liste contient « lait » avec la quantité 1 et que l'utilisateur ajoute « lait »
- **THEN** « lait » garde la quantité 1

#### Scenario: Ajout sans quantité
- **WHEN** la liste contient « citrons » avec la quantité 3 et que l'utilisateur ajoute « citrons »
- **THEN** « citrons » garde la quantité 3

#### Scenario: Quantités additionnées dans le tri
- **WHEN** le texte reçu est « 3 citrons\n2 citrons »
- **THEN** « citrons » n'est proposé qu'une fois, avec la quantité 5

#### Scenario: Article pris remis à prendre
- **WHEN** la liste contient « citrons » coché avec la quantité 3 et que l'utilisateur ajoute « 2 citrons »
- **THEN** « citrons » est de nouveau à prendre avec la quantité 2

#### Scenario: Doute levé avec quantité
- **WHEN** la liste contient « citrons » à vérifier avec la quantité 3 et que l'utilisateur ajoute « 2 citrons » comme article certain
- **THEN** « citrons » est à prendre avec la quantité 2

### Requirement: Quantités des ingrédients d'un plat
Le système SHALL conserver la quantité de chaque ingrédient d'un plat mémorisé et la reporter sur les propositions lorsque le plat est reconnu. Lorsqu'un plat est cité plusieurs fois dans les textes reçus d'un même tri, les quantités de ses ingrédients MUST être multipliées par le nombre de citations.

#### Scenario: Ingrédient avec quantité
- **WHEN** le plat « risotto » est mémorisé avec « 2 courgettes » et « riz », et que le texte reçu est « risotto »
- **THEN** le groupe « risotto » propose « courgettes » avec la quantité 2 et « riz » avec la quantité 1

#### Scenario: Plat cité deux fois
- **WHEN** le plat « risotto » est mémorisé avec « 2 courgettes » et « riz », et que le texte reçu est « Lundi 3 : risotto\nJeudi 6 : risotto »
- **THEN** le groupe « risotto » n'est proposé qu'une fois, avec « courgettes » en quantité 4 et « riz » avec la quantité 1

### Requirement: Affichage de la quantité
Le système SHALL afficher la quantité de chaque article à prendre sur sa ligne, 1 compris, lorsque la liste est en préparation. Ailleurs (tri, articles à vérifier, panier, bilan, historique), et sur les lignes à prendre lorsque la liste est en magasin, la quantité MUST n'être indiquée que lorsqu'elle dépasse 1.

#### Scenario: Quantité affichée
- **WHEN** la liste en préparation contient « citrons » à prendre avec la quantité 3
- **THEN** la ligne de « citrons » affiche 3

#### Scenario: Quantité de 1 sous-entendue
- **WHEN** « lait », de quantité 1, est proposé dans le tri
- **THEN** la proposition « lait » s'affiche sans indication de quantité

#### Scenario: Quantité affichée en magasin
- **WHEN** la liste est en magasin et contient « citrons » à prendre avec la quantité 3 et « lait » à prendre avec la quantité 1
- **THEN** la ligne de « citrons » affiche 3 et celle de « lait » n'indique aucune quantité

### Requirement: Ajustement de la quantité
Le système SHALL permettre d'augmenter ou de diminuer d'une unité la quantité d'un article ou d'une proposition depuis ses actions, et directement sur la ligne de chaque article à prendre lorsque la liste est en préparation. La diminution MUST s'arrêter à 1. Les articles pris, les articles à vérifier et, lorsque la liste est en magasin, les articles à prendre MUST NOT présenter ces commandes sur leur ligne.

#### Scenario: Augmentation depuis les actions
- **WHEN** l'article « lait » a la quantité 1 et que l'utilisateur l'augmente depuis ses actions
- **THEN** « lait » a la quantité 2

#### Scenario: Diminution sur la ligne
- **WHEN** l'article à prendre « citrons » a la quantité 3, que la liste est en préparation et que l'utilisateur la diminue sur sa ligne
- **THEN** « citrons » a la quantité 2

#### Scenario: Minimum
- **WHEN** l'article à prendre « citrons » a la quantité 1
- **THEN** la diminution est indisponible, sur sa ligne comme dans ses actions

#### Scenario: Commande sur chaque ligne
- **WHEN** la liste en préparation contient « lait » à prendre, sans quantité écrite
- **THEN** sa ligne présente la quantité 1 et les commandes pour la modifier, et se coche toujours en touchant son libellé

#### Scenario: Pas de commande sur la ligne en magasin
- **WHEN** la liste est en magasin et contient « citrons » à prendre avec la quantité 3
- **THEN** la ligne de « citrons » ne présente pas les commandes pour modifier sa quantité

#### Scenario: Ajustement depuis les actions en magasin
- **WHEN** la liste est en magasin et contient « citrons » à prendre avec la quantité 3, et que l'utilisateur l'augmente depuis ses actions
- **THEN** « citrons » a la quantité 4

#### Scenario: Quantité d'une proposition
- **WHEN** « citrons » est proposé avec la quantité 3 et que l'utilisateur l'augmente depuis ses actions
- **THEN** « citrons » est proposé avec la quantité 4
