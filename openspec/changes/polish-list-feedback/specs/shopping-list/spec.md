# Spec Delta

## ADDED Requirements

### Requirement: Initiale en majuscule dans la liste
Le système SHALL afficher chaque article de la liste avec une initiale en majuscule, sans modifier le libellé enregistré.

#### Scenario: Article en minuscules
- **WHEN** l'utilisateur ajoute « lait »
- **THEN** l'article s'affiche « Lait » et reste reconnu comme « lait » lors d'un ajout suivant

### Requirement: Vidage de la liste
Le système SHALL permettre de retirer d'un seul geste tous les articles de la liste, qu'ils soient à prendre, à vérifier ou pris. La boîte de réception et les plats mémorisés MUST rester inchangés. L'action MUST être indisponible lorsque la liste est vide ou que tous ses articles sont pris, le retrait des articles pris faisant alors la même chose.

#### Scenario: Liste vidée
- **WHEN** la liste contient « pain » à prendre, « compote » à vérifier et « lait » pris, et que l'utilisateur vide la liste
- **THEN** la liste est vide

#### Scenario: Tri préservé
- **WHEN** la boîte de réception propose « beurre » et que l'utilisateur vide la liste
- **THEN** « beurre » est toujours proposé dans la boîte de réception

#### Scenario: Rien à vider
- **WHEN** la liste est vide
- **THEN** l'action pour vider la liste n'est pas proposée

#### Scenario: Tout est pris
- **WHEN** tous les articles de la liste sont pris
- **THEN** seul le retrait des articles pris est proposé, pas le vidage de la liste

## MODIFIED Requirements

### Requirement: Envoi de la liste
Le système SHALL permettre d'envoyer la liste vers une autre application choisie par l'utilisateur, sous forme de texte : un article par ligne, avec une initiale en majuscule, les articles à vérifier suivis de « ? », les articles à prendre puis les articles à vérifier, chacun dans leur ordre d'ajout. Les articles pris MUST être exclus. L'action MUST être indisponible lorsqu'il n'y a ni article à prendre ni article à vérifier.

#### Scenario: Liste envoyée
- **WHEN** la liste contient « pain » et « lait » à prendre, « compote » à vérifier et « sel » coché, et que l'utilisateur envoie la liste
- **THEN** le texte envoyé est « Pain », « Lait », puis « Compote ? », un par ligne, sans « sel »

#### Scenario: Liste relue par l'application
- **WHEN** le texte d'une liste envoyée est reçu par l'application
- **THEN** les articles proposés sont les mêmes, avec le même état certain ou à vérifier

#### Scenario: Rien à envoyer
- **WHEN** tous les articles de la liste sont cochés
- **THEN** l'action d'envoi de la liste est indisponible

#### Scenario: Pas de menu de partage
- **WHEN** le téléphone n'offre pas de menu de partage et que l'utilisateur envoie la liste
- **THEN** le texte de la liste est copié dans le presse-papiers et l'utilisateur en est informé

#### Scenario: Envoi annulé
- **WHEN** l'utilisateur ferme le menu de partage sans choisir d'application
- **THEN** la liste reste inchangée et aucun message d'erreur n'est affiché

### Requirement: Annulation d'un retrait
Le système SHALL proposer, pendant au moins cinq secondes après qu'un ou plusieurs articles ont été retirés de la liste (« on en a », suppression d'un article, retrait des articles pris, vidage de la liste), une action « Annuler » qui rétablit la liste exactement telle qu'elle était avant le retrait. Seul le dernier retrait est annulable.

#### Scenario: Suppression annulée
- **WHEN** l'utilisateur supprime « sucre » puis choisit « Annuler »
- **THEN** « sucre » figure de nouveau dans la liste, à sa place, dans son état

#### Scenario: Retrait des articles pris annulé
- **WHEN** l'utilisateur retire les articles pris « pain » et « lait » puis choisit « Annuler »
- **THEN** « pain » et « lait » figurent de nouveau dans le panier

#### Scenario: Doute levé par erreur
- **WHEN** l'utilisateur indique qu'il a déjà de la « compote » puis choisit « Annuler »
- **THEN** « compote » figure de nouveau parmi les articles à vérifier

#### Scenario: Vidage annulé
- **WHEN** l'utilisateur vide la liste puis choisit « Annuler »
- **THEN** la liste retrouve tous ses articles, dans leur état

#### Scenario: Annulation expirée
- **WHEN** l'utilisateur supprime « sucre » et ne choisit pas « Annuler »
- **THEN** l'action « Annuler » disparaît après quelques secondes et « sucre » reste supprimé
