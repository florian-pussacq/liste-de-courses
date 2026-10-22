# Proposal

## Why

La liste dit quoi acheter, pas combien. Pour un menu de plusieurs jours, il faut savoir combien d'unités prendre d'un article (3 citrons, 4 courgettes), et ce nombre doit se cumuler quand le même article revient (2 citrons de plus font 5 citrons).

## What Changes

- **Quantité d'un article** : un nombre entier d'unités, de 1 à 99, facultatif. Sans nombre, la quantité est « non précisée ». Pas d'unité : un poids ou un volume (« 2 kg », « 50 cl ») reste dans le libellé.
- **Saisie dans le libellé** : partout où un libellé est tapé ou reçu (texte collé ou partagé, ajout direct, correction dans le tri, modification d'un article, ingrédients d'un plat), « 3 citrons », « citrons x3 » et « citrons ×3 » donnent l'article « citrons » avec la quantité 3.
- **Addition** : quand un même article revient, les quantités écrites s'additionnent ; une quantité non précisée n'ajoute rien. Un article pris remis à prendre repart de la seule quantité ajoutée ; un doute levé par un ajout certain prend la quantité de l'ajout.
- **Plats** : les ingrédients d'un plat peuvent porter une quantité ; un plat cité plusieurs fois dans un même tri voit ses quantités multipliées d'autant. **BREAKING** pour la règle actuelle : un plat reçu deux fois n'était proposé qu'une fois, sans autre effet.
- **Bilan** : le bilan de validation montre l'évolution de la quantité d'un article déjà présent (« Citrons (3 → 5) »).
- **Modification** : boutons « − / + » dans les actions d'un article et d'une proposition (« − » à 1 retire la quantité), et sur les lignes des articles à prendre qui ont une quantité (« − » s'y arrête à 1).
- **Affichage et envoi** : une pastille montre la quantité dans la liste et le tri ; le texte envoyé écrit « 3 citrons » et se relit à l'identique.

Hors périmètre : la prise partielle d'un article (2 sur 3), les unités de mesure, la fusion des libellés déjà enregistrés avec un nombre en tête.

## Capabilities

### New Capabilities

- `item-quantities` : reconnaissance, addition, modification, affichage et envoi de la quantité d'un article.

### Modified Capabilities

- `item-capture` : un plat reçu plusieurs fois multiplie ses quantités ; le bilan de validation montre l'évolution des quantités.
- `shopping-list` : le texte envoyé porte les quantités.

## Impact

- Domaine : `Entry`, `Proposal` et `Item` gagnent une quantité facultative ; découpage du texte, fusion dans le tri, ajout à la liste, plats, texte envoyé.
- Application : cas d'usage pour changer la quantité d'un article et d'une proposition ; bilan enrichi.
- Interface : pastille, boutons « − / + » dans les actions et sur les lignes à prendre, bilan.
- Données : champ facultatif ajouté aux documents existants ; absent signifie « non précisé », aucune migration de schéma.
