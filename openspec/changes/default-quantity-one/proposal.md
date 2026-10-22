# Proposal

## Why

Les boutons « − / + » n'apparaissent que sur les lignes qui ont déjà une quantité : pour ajuster un article sans quantité, il faut passer par ses actions ou retaper son libellé. Une quantité « non précisée » complique aussi la lecture : un article sans nombre est, en pratique, un article à prendre en un exemplaire.

## What Changes

- **Quantité de 1 par défaut** : tout article et toute proposition ont une quantité ; sans nombre écrit, c'est 1. Il n'existe plus de quantité « non précisée ».
- **Addition** : un nombre écrit s'ajoute à la quantité existante (« lait » puis « 2 lait » donnent 3) ; un ajout sans nombre écrit ne change rien (« lait » puis « lait » donnent 1), ce qui protège toujours d'un double collage. Un article pris remis à prendre, ou un doute levé, prend la quantité de l'ajout, 1 sans nombre écrit.
- **« − / + » sur chaque ligne à prendre** ; la diminution s'arrête à 1, sur la ligne comme dans les actions. **BREAKING** : retirer la quantité depuis les actions n'existe plus.
- **1 sous-entendu ailleurs** : seul le compteur des lignes à prendre affiche 1 ; le tri, les articles à vérifier, le panier, le bilan, l'historique et le texte envoyé n'indiquent la quantité qu'au-delà de 1.

Hors périmètre : compter une unité de plus à chaque mention d'un article.

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `item-quantities` : quantité de 1 par défaut, addition avec ce 1, commandes sur chaque ligne à prendre, affichage du 1 réservé au compteur.
- `shopping-list` : le texte envoyé n'écrit la quantité qu'au-delà de 1.
- `purchase-history` : un achat a toujours une quantité, affichée au-delà de 1.

## Impact

- Domaine : addition et ajustement des quantités, bilan, texte envoyé.
- Interface : compteur sur chaque ligne à prendre, pastilles réservées aux quantités supérieures à 1.
- Données : aucune migration ; une quantité absente déjà enregistrée se lit 1.
