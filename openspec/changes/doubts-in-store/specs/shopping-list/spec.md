## MODIFIED Requirements

### Requirement: Section des articles à vérifier
Le système SHALL afficher les articles à vérifier dans une section dédiée, avec le nombre d'articles qu'elle contient. Lorsque la liste est en préparation, la section MUST s'intituler « À vérifier avant de partir » et figurer en tête de la liste, avant les articles à prendre ; lorsque la liste est en magasin, elle MUST s'intituler « Dans le doute » et figurer après les articles à prendre, avant le panier. La section MUST être absente lorsqu'aucun article n'est à vérifier. Un article à vérifier ne se coche pas.

#### Scenario: Articles à vérifier en tête
- **WHEN** la liste est en préparation et contient « riz » à prendre et « compote » à vérifier
- **THEN** « compote » est affiché dans la section « À vérifier avant de partir », au-dessus de « riz »

#### Scenario: Doutes après les articles à prendre en magasin
- **WHEN** la liste est en magasin et contient « riz » à prendre et « compote » à vérifier
- **THEN** « compote » est affiché dans la section « Dans le doute », au-dessous de « riz » et avant le panier

#### Scenario: Aucun article à vérifier
- **WHEN** aucun article de la liste n'est à vérifier
- **THEN** la section des articles à vérifier n'est pas affichée
