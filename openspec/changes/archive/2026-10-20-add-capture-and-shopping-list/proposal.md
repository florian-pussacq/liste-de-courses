# Proposal

## Why

Les articles à acheter arrivent par plusieurs canaux (messages, notes, mémoire) et doivent aujourd'hui être recherchés, copiés, collés et réécrits à la main dans une liste improvisée. Ce travail manuel est lent et fait oublier des articles. Cette première version vise à réduire l'ajout d'un article à un seul geste depuis n'importe quelle application, et à offrir une liste utilisable en magasin.

## What Changes

- Création de l'application : une application web progressive (PWA) installable sur Android, utilisable hors ligne.
- Réception de texte partagé depuis d'autres applications via le menu « Partager » d'Android, et saisie ou collage manuel de texte.
- Une boîte de réception qui découpe le texte reçu en articles proposés, que l'utilisateur corrige puis valide avant leur ajout à la liste.
- Une liste de courses unique : ajout, modification, suppression, cochage pendant les courses, retrait des articles cochés en fin de courses.
- Les articles déjà présents dans la liste ne sont pas dupliqués.
- Toutes les données restent sur l'appareil : aucun envoi réseau du contenu capturé.

Hors périmètre de cette version : plats mémorisés, tri automatique selon le parcours en magasin, partage de liste et synchronisation entre appareils, analyse du texte libre par un modèle de langage.

## Capabilities

### New Capabilities

- `item-capture` : réception de texte depuis l'extérieur (partage, collage, saisie), découpage en articles proposés, correction et validation vers la liste.
- `shopping-list` : gestion de la liste de courses et de son usage en magasin (ajout, modification, suppression, cochage, dédoublonnage, nettoyage).
- `offline-app` : installation de l'application, fonctionnement hors ligne, persistance locale et confidentialité des données.

### Modified Capabilities

Aucune.

## Impact

- Projet vierge : mise en place complète de l'outillage (build, tests, lint, CI) et du code applicatif.
- Hébergement statique en HTTPS requis pour l'installation PWA et la réception de partages.
- Aucune dépendance à un service externe ou à un backend.
