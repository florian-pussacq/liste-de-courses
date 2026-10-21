# Proposal

## Why

La liste construite dans l'application ne peut aujourd'hui en sortir que par une recopie à la main. Pour la confier à quelqu'un qui fait les courses, ou se l'envoyer dans une messagerie, il faut pouvoir l'envoyer en un geste vers une autre application du téléphone.

## What Changes

- Une action « Envoyer la liste » ouvre le menu de partage du téléphone avec la liste sous forme de texte : un article par ligne, les articles à vérifier suivis de « ? », les articles déjà pris exclus.
- Ce texte est relu tel quel par l'application : une liste reçue d'une autre personne qui l'utilise redonne les mêmes articles, doutes compris.
- Quand le téléphone n'offre pas de menu de partage, la liste est copiée dans le presse-papiers et l'utilisateur en est informé.
- L'exigence de confidentialité est précisée : l'application n'envoie jamais rien d'elle-même ; un envoi explicitement déclenché par l'utilisateur vers une autre application de son choix est autorisé.

Hors périmètre : partage en temps réel d'une liste entre plusieurs personnes, envoi des plats, mise en forme par rayon.

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `shopping-list` : envoi de la liste vers une autre application.
- `offline-app` : confidentialité des données, qui distingue l'envoi décidé par l'utilisateur de toute transmission automatique.

## Impact

- Domaine : une fonction pure qui met la liste en texte.
- Infrastructure : un adaptateur autour de l'API de partage du navigateur (Web Share), avec repli sur le presse-papiers.
- Interface : une action dans l'en-tête de la liste.
- Aucune nouvelle requête réseau : la politique de sécurité du contenu reste inchangée.
