# Spec Delta

## ADDED Requirements

### Requirement: Ordre de présentation du tri
Le système SHALL présenter dans la boîte de réception les plats, reconnus ou à définir, avant les articles simples, chaque catégorie dans l'ordre de réception. Les articles validés MUST être ajoutés à la liste dans ce même ordre.

#### Scenario: Plats en premier
- **WHEN** le plat « risotto » est mémorisé et que le texte reçu est « Lundi 3 : risotto / carottes\nMardi 4 : gratin / brocolis »
- **THEN** le tri présente d'abord le groupe « risotto » et le plat à définir « gratin », puis « carottes » et « brocolis »

#### Scenario: Ordre conservé à la validation
- **WHEN** le tri présente le groupe « risotto » (« riz ») puis l'article « carottes », et que l'utilisateur valide
- **THEN** « riz » est ajouté à la liste avant « carottes »

### Requirement: Validation toujours accessible
Le système SHALL garder l'action de validation et l'abandon du tri visibles en bas de l'écran, quelle que soit la longueur du tri.

#### Scenario: Tri long
- **WHEN** le tri propose une vingtaine d'articles
- **THEN** l'action de validation est visible sans avoir à faire défiler

## MODIFIED Requirements

### Requirement: Rappel du texte reçu
Le système SHALL permettre de consulter dans la boîte de réception le ou les textes reçus depuis la dernière validation ou le dernier abandon, afin que l'utilisateur vérifie qu'aucun article n'a été oublié. Ces textes MUST être repliés par défaut, derrière une action qui indique leur nombre.

#### Scenario: Texte reçu rappelé
- **WHEN** le texte « pense à prendre du lait stp » a été reçu et que l'utilisateur déplie le rappel
- **THEN** la boîte de réception affiche ce texte

#### Scenario: Rappel replié par défaut
- **WHEN** un texte a été reçu
- **THEN** le rappel est replié et indique qu'un texte a été reçu, sans en afficher le contenu

#### Scenario: Plusieurs textes reçus
- **WHEN** les textes « pain » puis « beurre » ont été reçus sans validation entre les deux, et que l'utilisateur déplie le rappel
- **THEN** la boîte de réception rappelle les deux textes, dans leur ordre de réception
