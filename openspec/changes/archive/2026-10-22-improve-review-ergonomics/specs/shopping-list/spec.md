# Spec Delta

## ADDED Requirements

### Requirement: Annulation d'un retrait
Le système SHALL proposer, pendant au moins cinq secondes après qu'un ou plusieurs articles ont été retirés de la liste (« on en a », suppression d'un article, retrait des articles pris), une action « Annuler » qui rétablit la liste exactement telle qu'elle était avant le retrait. Seul le dernier retrait est annulable.

#### Scenario: Suppression annulée
- **WHEN** l'utilisateur supprime « sucre » puis choisit « Annuler »
- **THEN** « sucre » figure de nouveau dans la liste, à sa place, dans son état

#### Scenario: Retrait des articles pris annulé
- **WHEN** l'utilisateur retire les articles pris « pain » et « lait » puis choisit « Annuler »
- **THEN** « pain » et « lait » figurent de nouveau dans le panier

#### Scenario: Doute levé par erreur
- **WHEN** l'utilisateur indique qu'il a déjà de la « compote » puis choisit « Annuler »
- **THEN** « compote » figure de nouveau parmi les articles à vérifier

#### Scenario: Annulation expirée
- **WHEN** l'utilisateur supprime « sucre » et ne choisit pas « Annuler »
- **THEN** l'action « Annuler » disparaît après quelques secondes et « sucre » reste supprimé
