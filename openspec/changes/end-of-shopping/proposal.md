# Proposal

## Why

Le panier n'est vidé qu'à la demande, par « Retirer les articles pris ». Quand on l'oublie, les articles pris lors de courses précédentes restent dans la liste : ils encombrent le panier pendant la préparation suivante et, une fois en magasin, la progression les compte comme pris dans les nouvelles courses.

## What Changes

- **Fin des courses** : lorsque la liste n'est plus en magasin (aucun article pris depuis une heure), les articles pris sont retirés de la liste, sans action de l'utilisateur. Cela se produit à l'ouverture de l'application comme lorsque l'heure s'écoule application ouverte.
- Les articles à prendre et à vérifier ne sont pas touchés ; les achats restent dans l'historique, d'où un article peut être remis dans la liste.
- Un panier enregistré avant ce changement, dont les articles n'ont pas d'heure de prise, est retiré à la première ouverture.
- « Retirer les articles pris » reste disponible pour vider le panier sans attendre.

Hors périmètre : un délai réglable, une annulation du retrait automatique.

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `shopping-list` : nouveau requirement « Fin des courses ».
- `purchase-history` : « Historique indépendant de la liste » couvre aussi la fin des courses.

## Impact

- Domaine : une fonction qui retire les articles pris d'une liste qui n'est plus en magasin.
- Application : une opération qui l'applique et l'enregistre, appelée au démarrage et par l'interface lorsque le moment des courses change.
- Interface : `ShoppingListView` déclenche la fin des courses quand la liste quitte le magasin.
- Données : suppression d'articles pris de la liste ; l'historique des achats est inchangé.
