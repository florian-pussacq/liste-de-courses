# Proposal

## Why

Une fois les articles pris retirés de la liste, il ne reste aucune trace de ce qui a été acheté ni quand. Savoir ce que l'on a acheté et à quelle date aide à préparer les courses suivantes, et prépare la recherche dans l'historique (issue #3).

## What Changes

- **Enregistrement des achats** : cocher un article l'enregistre comme acheté, avec son libellé, sa quantité et la date ; le décocher annule cet achat.
- **Historique indépendant de la liste** : retirer les articles pris, vider la liste, supprimer un article ou annuler un retrait ne modifient pas l'historique.
- **Consultation** : un écran d'historique, ouvert depuis l'en-tête de la liste, présente les achats regroupés par jour, du plus récent au plus ancien.

Hors périmètre : remettre un achat ou une journée dans la liste, rechercher dans l'historique (issue #3), supprimer des achats, limiter la durée de conservation.

## Capabilities

### New Capabilities

- `purchase-history` : enregistrement des achats au cochage et consultation de l'historique par jour.

### Modified Capabilities

Aucune : le cochage, le retrait et l'annulation gardent leur comportement ; l'historique les observe sans les changer.

## Impact

- Domaine : un achat (`Purchase`) et l'historique (`PurchaseHistory`), avec l'enregistrement, l'annulation et le regroupement par jour.
- Application : le cochage enregistre ou annule l'achat ; un cas d'usage lit l'historique.
- Infrastructure : un nouveau document local « achats » ; un document absent signifie un historique vide, sans migration de schéma.
- Interface : bouton d'accès dans l'en-tête, feuille d'historique.
