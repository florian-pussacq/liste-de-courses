# Spec Delta

## MODIFIED Requirements

### Requirement: Mise à jour de l'application
Le système SHALL appliquer les nouvelles versions de l'application sans perte de données de l'utilisateur. Lorsqu'une nouvelle version est prête, il SHALL proposer de la charger immédiatement ; à défaut, elle MUST être utilisée à l'ouverture suivante de l'application. Le système MUST chercher une nouvelle version au démarrage et lorsque l'application revient au premier plan.

#### Scenario: Nouvelle version disponible
- **WHEN** une nouvelle version est publiée et que l'utilisateur rouvre l'application avec du réseau
- **THEN** un bandeau indique qu'une nouvelle version est disponible et propose de recharger

#### Scenario: Nouvelle version chargée
- **WHEN** le bandeau de mise à jour est affiché et que l'utilisateur choisit de recharger
- **THEN** la nouvelle version est utilisée et la liste est intacte

#### Scenario: Retour au premier plan
- **WHEN** l'application revient au premier plan
- **THEN** elle cherche si une nouvelle version est disponible
