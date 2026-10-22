# Design

## Context

La boîte de réception garde ses propositions dans l'ordre de réception (`Inbox.proposals`) ; la validation ajoute `keptEntries` dans cet ordre. La feuille du tri est un `<dialog>` dont le contenu défile. Dans la liste, « on en a », la suppression et le retrait des articles pris passent par `removeItem` et `clearChecked`, sans retour possible. Les exigences sont dans `specs/item-capture` et `specs/shopping-list`.

## Goals / Non-Goals

**Goals:**
- Un tri long reste utilisable sans défiler pour valider, et se lit plats d'abord.
- Toute action qui retire des articles de la liste se rattrape d'un geste.

**Non-Goals:**
- Un historique d'annulations (une seule action annulable à la fois).
- Changer l'ordre de stockage des propositions ou de la liste.

## Decisions

### Ordre de présentation : une fonction pure, pas un réordonnancement du stockage
`reviewOrder(inbox): Proposal[]` (domaine) renvoie d'abord les propositions qui appartiennent à un plat ou sont des plats à définir, puis les autres, chaque partie dans l'ordre de réception ; c'est un tri stable sur une seule clé. `keptEntries` s'appuie dessus, si bien que la liste reçoit les articles dans l'ordre vu au tri. Le stockage reste dans l'ordre de réception : les insertions à leur place (`expandIntoDish`, `refreshDish`, `keepDishAsItem`) restent justes sans modification.

Alternative écartée : maintenir l'invariant « plats d'abord » à chaque insertion. Elle demande de modifier toutes les fonctions d'insertion et d'en tester les combinaisons, pour un résultat identique à l'affichage.

### Annulation : un instantané de la liste, rétabli tel quel
L'application est mono-utilisateur et locale : avant un retrait, l'interface garde la liste précédente ; « Annuler » appelle un cas d'usage `restoreList(previous)`, qui l'enregistre telle quelle. Les positions, états et horodatages sont exactement ceux d'avant, sans logique inverse par action. Le bandeau d'annulation (`role="status"`) reste six secondes ; un nouveau retrait remplace l'instantané et relance le délai. Alternative écartée : des opérations inverses par action (réinsérer à un index, recocher…), plus de code et de cas limites pour le même résultat.

### Pied de feuille fixe et rappel repliable
- Le bloc « Annuler / Ajouter N à la liste » de la feuille du tri devient `position: sticky; bottom: 0` dans le conteneur qui défile, avec le fond de la feuille.
- Le rappel des textes reçus devient un `<details>` fermé par défaut, dont le résumé indique « 1 texte reçu » ou « N textes reçus ».
- L'explication « rien ne sera ajouté tant qu'il n'est pas défini » n'est plus répétée dans chaque plat à définir : elle est donnée une fois, au-dessus du premier.

## Risks / Trade-offs

- [Un instantané périmé si la liste change entre le retrait et l'annulation (cochage d'un autre article)] → L'annulation rétablit l'état d'avant le retrait, ce qui annulerait aussi ce cochage. Pour l'éviter, toute autre modification de la liste fait disparaître le bandeau.
- [Un pied fixe masque le bas du contenu] → Un élément `sticky` reste dans le flux : en fin de défilement, il se place après le dernier élément, sans rien recouvrir.

## Migration Plan

Aucune donnée ni schéma modifiés. Déploiement normal depuis `main`.
