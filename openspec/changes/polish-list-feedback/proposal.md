# Proposal

## Why

Après une validation, rien n'indique ce qui a réellement rejoint la liste : les doublons fusionnés disparaissent sans un mot, et l'on se demande si un article a été oublié. Les libellés s'affichent tels qu'ils ont été tapés, souvent en minuscules, ce qui rend la liste moins agréable à lire. Enfin, repartir d'une liste vierge impose de supprimer les articles un à un.

## What Changes

- **Bilan de validation** : après la validation du tri, un bandeau indique les articles ajoutés et ceux qui figuraient déjà dans la liste, jusqu'à ce que l'utilisateur le ferme ou modifie la liste.
- **Initiale en majuscule** : tout libellé (article, proposition, plat, ingrédient) s'affiche et s'envoie avec une initiale en majuscule. Le libellé enregistré n'est pas modifié.
- **Vider la liste** : une action retire d'un coup tous les articles de la liste, annulable comme les autres retraits.

Hors périmètre : vider la boîte de réception (l'abandon du tri existe déjà), oublier les plats mémorisés.

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `item-capture` : bilan affiché après la validation ; initiale en majuscule dans le tri.
- `shopping-list` : initiale en majuscule à l'affichage et à l'envoi ; action pour vider la liste ; annulation étendue au vidage.

## Impact

- Domaine : le résultat d'un ajout groupé distingue les articles ajoutés de ceux déjà présents ; vidage de la liste ; mise en forme des libellés à l'envoi.
- Application : la validation renvoie son bilan ; nouveau cas d'usage pour vider la liste.
- Interface : bandeau de bilan, initiale en majuscule, action « Vider la liste ».
- Aucune donnée ni schéma modifiés.
