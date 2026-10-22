## MODIFIED Requirements

### Requirement: Affichage de la quantité
Le système SHALL afficher la quantité de chaque article à prendre sur sa ligne, 1 compris, lorsque la liste est en préparation. Ailleurs (tri, articles à vérifier, panier, bilan, historique), et sur les lignes à prendre lorsque la liste est en magasin, la quantité MUST n'être indiquée que lorsqu'elle dépasse 1.

#### Scenario: Quantité affichée
- **WHEN** la liste en préparation contient « citrons » à prendre avec la quantité 3
- **THEN** la ligne de « citrons » affiche 3

#### Scenario: Quantité de 1 sous-entendue
- **WHEN** « lait », de quantité 1, est proposé dans le tri
- **THEN** la proposition « lait » s'affiche sans indication de quantité

#### Scenario: Quantité affichée en magasin
- **WHEN** la liste contient « pain » pris, « citrons » à prendre avec la quantité 3 et « lait » à prendre avec la quantité 1
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
- **WHEN** la liste contient « pain » pris et « citrons » à prendre avec la quantité 3
- **THEN** la ligne de « citrons » ne présente pas les commandes pour modifier sa quantité

#### Scenario: Ajustement depuis les actions en magasin
- **WHEN** la liste contient « pain » pris et « citrons » à prendre avec la quantité 3, et que l'utilisateur l'augmente depuis ses actions
- **THEN** « citrons » a la quantité 4

#### Scenario: Quantité d'une proposition
- **WHEN** « citrons » est proposé avec la quantité 3 et que l'utilisateur l'augmente depuis ses actions
- **THEN** « citrons » est proposé avec la quantité 4
