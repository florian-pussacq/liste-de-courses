## MODIFIED Requirements

### Requirement: Collage réduit en magasin
Le système SHALL présenter l'action de collage depuis le presse-papiers avec son libellé « Coller une liste » lorsque la liste est en préparation, et réduite à son icône lorsque la liste est en magasin. Réduite, l'action MUST rester disponible depuis la liste, en une seule action, et garder son nom pour les technologies d'assistance.

#### Scenario: Collage en préparation
- **WHEN** la liste est en préparation
- **THEN** l'action de collage affiche le libellé « Coller une liste »

#### Scenario: Collage en magasin
- **WHEN** la liste est en magasin
- **THEN** l'action de collage n'affiche que son icône, et reste nommée « Coller une liste »

#### Scenario: Coller en magasin
- **WHEN** la liste est en magasin, que le presse-papiers contient « beurre » et que l'utilisateur choisit de coller une liste
- **THEN** la boîte de réception s'ouvre et propose « beurre »
