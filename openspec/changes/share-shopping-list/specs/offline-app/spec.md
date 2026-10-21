# Spec Delta

## MODIFIED Requirements

### Requirement: Confidentialité des données
Le système MUST NOT transmettre de lui-même, à un tiers ni à un serveur, le texte reçu, les articles ou la liste. Les seuls échanges réseau autorisés sont le téléchargement de l'application elle-même et de ses mises à jour. Seul un envoi explicitement déclenché par l'utilisateur, vers une autre application qu'il choisit dans le menu de partage du téléphone, peut faire sortir la liste de l'application.

#### Scenario: Capture d'un texte
- **WHEN** l'utilisateur partage un texte vers l'application et valide les articles
- **THEN** aucune requête réseau contenant ce texte ou ces articles n'est émise

#### Scenario: Envoi de la liste par l'utilisateur
- **WHEN** l'utilisateur envoie la liste vers une autre application
- **THEN** la liste est remise au menu de partage du téléphone et l'application n'émet elle-même aucune requête réseau
