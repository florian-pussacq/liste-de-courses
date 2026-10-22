# Design

## Context

L'historique (`PurchaseHistory`) garde les achats dans l'ordre du cochage : libellé, quantité éventuelle, heure, et l'identifiant de l'article. La feuille d'historique les présente par jour (`purchasesByDay`). `labelKey` porte la règle des doublons (casse, accents, ligatures, espaces, pluriel en fin de mot) ; `addItems` ajoute une entrée à la liste en appliquant fusion et addition des quantités. La feuille d'historique ne reçoit aujourd'hui que `app` ; la liste vit dans `App`.

## Goals / Non-Goals

**Goals:**
- Répondre à « quand ai-je acheté cet article pour la dernière fois ? » sans défiler.
- Racheter un article d'un geste, sans addition de quantité par mégarde.

**Non-Goals:**
- Un index ou un moteur de recherche : quelques milliers d'achats au plus, parcourus à chaque frappe.
- La recherche dans la liste courante.

## Decisions

### `searchPurchases` : une fonction pure qui regroupe par article
`searchPurchases(history, query): PurchasedArticle[]` (domaine, `purchase-history.ts`), avec `PurchasedArticle { label, purchaseCount, lastTakenAt, lastQuantity? }` :
- la clé de recherche est `labelKey(query)` ; moins de deux caractères donne une liste vide ;
- un achat correspond si `labelKey(achat.label)` contient cette clé (« tomate » dans « tomate cerise ») ;
- les achats sont regroupés par `labelKey` du libellé ; le libellé et la quantité retenus sont ceux du dernier achat ;
- tri par `lastTakenAt` décroissant.

Réutiliser `labelKey` garde un seul sens à « même article » dans toute l'application.

### Remettre : `addItems` avec la quantité du dernier achat
Cas d'usage `buyAgain(article)` : `addItems(list, [{ label, toCheck: false, quantity: lastQuantity }])`. Les règles existantes s'appliquent telles quelles : un article pris est remis à prendre avec cette quantité ; un article absent est ajouté. L'interface empêche le seul cas indésirable, l'addition à un article déjà à prendre ou à vérifier, en affichant « Dans la liste » à la place du bouton.

### « Dans la liste » calculé dans la feuille
`App` passe la liste courante à `HistorySheet` et reçoit la nouvelle liste après une remise. La feuille décide pour chaque résultat s'il est dans la liste (même `labelKey`, non coché) : c'est une question de présentation, sans nouvelle règle de domaine.

### Interface
Un champ « Rechercher un article » en haut de la feuille, au-dessus des jours. Dès deux caractères, les jours laissent la place aux résultats : libellé (pastille de quantité du dernier achat), « N achats · dernier : mardi 21 octobre », puis « Remettre » ou « Dans la liste ». Le champ ne prend pas le focus à l'ouverture, comme le tri, pour ne pas ouvrir le clavier.

## Risks / Trade-offs

- [Un texte très court trouve beaucoup d'articles] → Seuil à deux caractères ; la liste reste lisible car regroupée par article.
- [Le libellé du dernier achat masque d'anciennes variantes, comme « Parmesan » et « parmesan »] → Elles sont le même article au sens des doublons ; seule la casse diffère.

## Migration Plan

Aucune donnée ni schéma modifiés. Déploiement normal depuis `main`.
