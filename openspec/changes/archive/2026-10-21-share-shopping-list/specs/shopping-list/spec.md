# Spec Delta

## ADDED Requirements

### Requirement: Envoi de la liste
Le système SHALL permettre d'envoyer la liste vers une autre application choisie par l'utilisateur, sous forme de texte : un article par ligne, les articles à vérifier suivis de « ? », les articles à prendre puis les articles à vérifier, chacun dans leur ordre d'ajout. Les articles pris MUST être exclus. L'action MUST être indisponible lorsqu'il n'y a ni article à prendre ni article à vérifier.

#### Scenario: Liste envoyée
- **WHEN** la liste contient « pain » et « lait » à prendre, « compote » à vérifier et « sel » coché, et que l'utilisateur envoie la liste
- **THEN** le texte envoyé est « pain », « lait », puis « compote ? », un par ligne, sans « sel »

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
