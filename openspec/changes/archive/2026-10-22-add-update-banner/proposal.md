# Proposal

## Why

Une nouvelle version de l'application n'est utilisée qu'à l'ouverture suivante, sans que rien ne le signale : après un déploiement, on ne sait pas si l'on a la dernière version, et une application installée restée en arrière-plan ne cherche même pas de mise à jour.

## What Changes

- Lorsqu'une nouvelle version est prête, un bandeau « Nouvelle version disponible » propose de la charger d'un geste ; le rechargement conserve toutes les données.
- Si le bandeau est ignoré, la nouvelle version est utilisée à l'ouverture suivante de l'application, comme aujourd'hui.
- L'application cherche une nouvelle version aussi quand elle revient au premier plan.

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `offline-app` : mise à jour proposée par un bandeau et recherchée au retour au premier plan.

## Impact

- Infrastructure : enregistrement du service worker par l'application, en mode « à la demande » plutôt qu'automatique.
- Interface : bandeau de mise à jour.
- Aucune donnée ni schéma modifiés.
