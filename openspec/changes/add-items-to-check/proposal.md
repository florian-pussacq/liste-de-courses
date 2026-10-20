# Proposal

## Why

Une liste de courses contient souvent des articles incertains : on n'est pas sûr qu'il en manque, et on le note avec un point d'interrogation (« compote ? ») en attendant de vérifier dans le placard. Aujourd'hui, l'application garde le « ? » dans le libellé et traite l'article comme n'importe quel autre : le doute n'est jamais levé avant de partir, et le nombre d'articles à prendre est faux.

## What Changes

- **Reconnaissance** : un élément du texte reçu qui se termine par « ? » devient un article proposé à vérifier ; le « ? » est retiré du libellé.
- **Tri** : un article proposé peut être marqué à vérifier, ou rendu certain, avant la validation ; la validation transmet cet état à la liste.
- **Liste** : les articles à vérifier sont regroupés en tête, dans une section « à vérifier avant de partir », avec deux actions : « on en a » (l'article est retiré) et « il en faut » (il devient un article à prendre).
- **Progression** : les articles à vérifier ne comptent ni dans les articles à prendre ni dans le total, tant que le doute n'est pas levé. **BREAKING** (comportement) : la progression ne porte plus sur tous les articles de la liste.
- **Doublons** : un article certain l'emporte sur un article à vérifier de même libellé ; un doute n'efface jamais une certitude, ni un article déjà pris.
- **Action manuelle** : depuis les actions d'un article, le marquer à vérifier ou le rendre certain.

Hors périmètre : point d'interrogation au milieu d'un élément (laissé tel quel), dates et quantités (laissées dans le libellé), rappel ou notification avant de partir.

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `item-capture` : reconnaissance du « ? » final au découpage ; marquage à vérifier d'un article proposé ; transmission de l'état à la validation.
- `shopping-list` : articles à vérifier (section, levée du doute, marquage manuel) ; progression limitée aux articles certains ; règle de doublons entre certain et à vérifier.

## Impact

- Domaine : `Proposal` et `Item` portent un état « à vérifier » ; le découpage renvoie cet état avec chaque libellé ; l'ajout à la liste applique la règle « le certain l'emporte ».
- Persistance : schéma IndexedDB v3, migration des articles et des propositions existants (tous certains).
- Interface : nouvelle section en tête de liste, marque sur les pastilles du tri, nouvelle action dans la feuille d'actions d'un article.
