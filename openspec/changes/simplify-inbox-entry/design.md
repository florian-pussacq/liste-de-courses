# Design

## Context

La feuille du tri contient un `<details>` « Coller ou écrire une liste à la main », ouvert d'office quand le tri est vide ou après un échec de lecture du presse-papiers (`typingOpen`), replié sinon. Les champs « Ajouter un article » du tri et de la feuille d'ajout sont suivis d'un bouton texte « Ajouter ».

## Goals / Non-Goals

**Goals:**
- Ne montrer la saisie d'un texte que lorsqu'elle est le chemin attendu.
- Alléger le bouton d'ajout sans perdre son nom accessible.

**Non-Goals:**
- Changer le découpage du texte ou la saisie d'un article isolé.

## Decisions

### La condition d'ouverture devient une condition d'affichage
La condition qui dépliait le `<details>` (`typingOpen` : rien à trier, ou notice d'échec du presse-papiers une fois la lecture terminée) décide désormais si la zone est affichée. Le `<details>` et son résumé disparaissent. Un second texte pendant un tri passe par « Coller une liste » depuis la liste : la capture s'ajoute déjà au tri en cours, rien n'est perdu.

Alternative écartée : garder la zone en permanence, dépliée. Elle pousserait les propositions vers le bas pour un usage rare.

### « + » visible, « Ajouter » pour les lecteurs d'écran
Le bouton affiche l'icône « + » du dock (même tracé SVG, `aria-hidden`) et garde `aria-label="Ajouter"`. Un nom accessible stable évite de dérouter un lecteur d'écran et laisse les tests inchangés.

## Risks / Trade-offs

- [Coller un second texte sans quitter le tri n'est plus possible] → Fermer le tri ne perd rien : il est conservé et le collage suivant s'y ajoute.

## Migration Plan

Aucune donnée ni schéma modifiés. Déploiement normal depuis `main`.
