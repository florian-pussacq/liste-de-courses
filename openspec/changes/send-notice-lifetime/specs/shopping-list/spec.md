## ADDED Requirements

### Requirement: Information d'envoi passagère
Le système SHALL retirer l'information affichée après un envoi de la liste (liste copiée dans le presse-papiers, ou envoi impossible) dès que la liste change.

#### Scenario: Information dépassée
- **WHEN** l'utilisateur est informé que la liste a été copiée, puis coche un article
- **THEN** l'information n'est plus affichée

#### Scenario: Information conservée
- **WHEN** l'utilisateur est informé que la liste a été copiée, et que la liste ne change pas
- **THEN** l'information reste affichée
