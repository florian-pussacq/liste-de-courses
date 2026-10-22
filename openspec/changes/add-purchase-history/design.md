# Design

## Context

La liste est un document unique (`shopping-list`) réécrit à chaque modification ; un article coché garde `updatedAt` à l'heure du cochage, mais disparaît du stockage dès qu'il est retiré. Le cochage passe par le cas d'usage `toggleItem`. Les plats ont été ajoutés comme un document IndexedDB séparé (`dishes`), sans version de schéma : un document absent vaut une collection vide. L'annulation d'un retrait rétablit un instantané de la liste seule.

## Goals / Non-Goals

**Goals:**
- Garder une trace datée de chaque achat, indépendante du cycle de vie de la liste.
- Présenter les achats par jour.

**Non-Goals:**
- Réutiliser un achat, rechercher (issue #3), supprimer ou purger l'historique.
- Synchroniser l'historique entre appareils : il reste local, comme le reste des données.

## Decisions

### L'achat est un fait enregistré au cochage, pas une copie de la liste
`Purchase { itemId, label, quantity?, takenAt }` et `PurchaseHistory { purchases }` (domaine, `purchase-history.ts`) :
- `recordPurchase(history, item, takenAt)` ajoute un achat ;
- `cancelPurchase(history, itemId)` retire le dernier achat de cet article, celui que le décochage annule ;
- `purchasesByDay(history)` regroupe par jour local (clé `AAAA-MM-JJ` tirée de `takenAt`), jours décroissants, achats dans l'ordre de cochage.

Le libellé et la quantité sont copiés : renommer, supprimer ou retirer l'article ensuite ne réécrit pas le passé. `itemId` ne sert qu'à retrouver l'achat qu'un décochage annule.

Alternative écartée : enregistrer au retrait des articles pris. Un article pris puis remis à prendre par une validation ne serait jamais retiré, et son achat serait perdu ; l'annulation d'un retrait devrait aussi défaire l'historique.

### `toggleItem` écrit la liste, puis l'historique
Le cas d'usage bascule l'article, enregistre la liste, puis enregistre ou annule l'achat selon le nouvel état. Les deux écritures ne sont pas atomiques : si la seconde échoue, l'erreur remonte comme toute erreur de stockage et seul l'historique manque un achat, la liste restant juste. Le retrait, le vidage, la suppression et `restoreList` ne touchent pas à l'historique, ce qui suffit à satisfaire « Historique indépendant de la liste ».

### Stockage : un document `purchases`
Un `PurchaseHistoryRepository` (port) avec une implémentation en mémoire pour les tests et un document IndexedDB `purchases`, absent tant qu'aucun achat n'a été enregistré : pas de nouvelle version de schéma. Ordre de grandeur mesuré a priori : une cinquantaine d'achats par semaine, soit quelques centaines de Ko par an ; un seul document suffit tant qu'aucune lenteur n'est mesurée.

### Interface : une feuille ouverte depuis l'en-tête
Un bouton « Historique des achats » à côté de « Envoyer la liste » ouvre une feuille (`HistorySheet`) : un titre par jour (« Mardi 21 octobre », l'année ajoutée hors de l'année en cours, formaté par `Intl.DateTimeFormat('fr-FR')` dans l'interface), puis les achats avec la pastille de quantité existante. Le format de date reste dans l'interface ; le domaine ne connaît que la clé de jour.

## Risks / Trade-offs

- [Un article coché sans être acheté compte comme un achat] → « On en a » et « Supprimer » restent les gestes pour sortir un article sans l'acheter ; le décochage annule un cochage par erreur.
- [Fuseau horaire : un achat à 23 h 30 en voyage peut changer de jour] → Le jour est celui de l'appareil au moment de la consultation ; accepté.
- [Écritures non atomiques entre liste et historique] → Rare, sans effet sur la liste, et l'erreur n'est pas avalée.

## Migration Plan

Aucune migration : le document `purchases` apparaît au premier achat. Les articles déjà pris avant le déploiement ne sont pas reportés dans l'historique.
