# Proposal

## Why

L'en-tête de la liste donne trois fois la même information : « 3 à prendre », « 2 / 5 pris » et la barre de progression. La fraction est la seule des trois qui ne compte pas les articles à vérifier sous les yeux de l'utilisateur, qui voit par exemple sept lignes et lit « sur 5 » : elle fait douter sans rien apprendre de plus que la barre.

## What Changes

- **Fraction retirée** : l'en-tête n'affiche plus « x / y pris ». Restent le nombre d'articles à prendre et la barre de progression.
- **Barre parlante** : la barre annonce aux technologies d'assistance le nombre d'articles pris sur le total (« 2 pris sur 5 »), information que la fraction donnait jusqu'ici en texte.
- Les articles à vérifier restent exclus du décompte, comme aujourd'hui.

Hors périmètre : les titres de l'en-tête (« Liste de courses », « À vérifier d'abord », « Tout est pris »), inchangés.

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `shopping-list` : « Progression des courses » porte la proportion d'articles pris par la barre, sans la répéter en texte.

## Impact

- Interface : en-tête de `ShoppingListView` (suppression du paragraphe de fraction, texte de valeur de la barre).
- Tests e2e : les assertions sur « x / y pris » deviennent des assertions sur la barre.
- Domaine, données : aucun changement.
