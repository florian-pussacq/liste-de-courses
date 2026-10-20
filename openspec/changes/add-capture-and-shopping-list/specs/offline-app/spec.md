# Spec Delta

## Purpose

Garantit que l'application s'installe comme une application du téléphone, fonctionne sans réseau, conserve ses données sur l'appareil et ne les transmet à aucun tiers.

## ADDED Requirements

### Requirement: Installation sur l'appareil
Le système SHALL être installable depuis le navigateur sur un téléphone Android et SHALL se lancer ensuite comme une application autonome, sans interface de navigateur.

#### Scenario: Installation
- **WHEN** l'utilisateur installe l'application depuis le navigateur
- **THEN** une icône de l'application apparaît sur l'appareil et l'ouvre en plein écran

### Requirement: Fonctionnement hors ligne
Le système SHALL offrir toutes ses fonctionnalités sans connexion réseau une fois l'application chargée au moins une fois.

#### Scenario: Utilisation en magasin sans réseau
- **WHEN** l'appareil n'a aucune connexion et que l'utilisateur ouvre l'application
- **THEN** la liste s'affiche et l'utilisateur peut ajouter, cocher et supprimer des articles

#### Scenario: Partage sans réseau
- **WHEN** l'appareil n'a aucune connexion et que l'utilisateur partage un texte vers l'application
- **THEN** la boîte de réception s'ouvre et propose les articles

### Requirement: Persistance locale
Le système SHALL conserver la liste et la boîte de réception sur l'appareil entre deux utilisations, y compris après fermeture de l'application ou redémarrage de l'appareil.

#### Scenario: Réouverture
- **WHEN** l'utilisateur coche « pain », ferme l'application puis la rouvre
- **THEN** la liste est identique et « pain » est toujours coché

### Requirement: Confidentialité des données
Le système MUST NOT transmettre à un tiers ni à un serveur le texte reçu, les articles ou la liste. Les seuls échanges réseau autorisés sont le téléchargement de l'application elle-même et de ses mises à jour.

#### Scenario: Capture d'un texte
- **WHEN** l'utilisateur partage un texte vers l'application et valide les articles
- **THEN** aucune requête réseau contenant ce texte ou ces articles n'est émise

### Requirement: Mise à jour de l'application
Le système SHALL appliquer les nouvelles versions de l'application sans perte de données de l'utilisateur.

#### Scenario: Nouvelle version disponible
- **WHEN** une nouvelle version est publiée et que l'utilisateur rouvre l'application avec du réseau
- **THEN** la nouvelle version est utilisée au plus tard à l'ouverture suivante et la liste est intacte
