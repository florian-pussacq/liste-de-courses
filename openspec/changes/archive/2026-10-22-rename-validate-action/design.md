# Design

## Context

Le titre de la feuille du tri annonce déjà « N article(s) trouvé(s) », N comptant les propositions qui seront ajoutées (ni écartées, ni plats à définir). Le bouton « Ajouter N à la liste » répète ce nombre.

## Decisions

### Le titre porte le nombre, le bouton porte l'action
Le bouton devient « Mettre dans la liste », toujours désactivé quand rien ne serait ajouté. Le titre, déjà calculé sur les mêmes propositions, reste la seule annonce du nombre : une seule source, pas de divergence possible entre les deux.

## Risks / Trade-offs

- [Le nombre n'est plus sous le pouce au moment de valider] → Le titre reste visible en haut de la feuille ; le bilan affiché après la validation dit de toute façon ce qui a été ajouté.

## Migration Plan

Aucune donnée ni schéma modifiés.
