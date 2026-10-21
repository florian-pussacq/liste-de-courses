# Spec Delta

## Purpose

Mémorise la traduction d'un plat en ingrédients, pour qu'un nom de plat reçu dans un texte devienne directement les articles à acheter, sans avoir à les retrouver de tête.

## ADDED Requirements

### Requirement: Définition d'un plat depuis le tri
Le système SHALL permettre de définir comme plat un article proposé, depuis ses actions ouvertes par un appui long dans une feuille affichée par-dessus le tri, ou un plat à définir, depuis une action visible sur celui-ci : son libellé devient le nom du plat, et l'utilisateur saisit les ingrédients, un par ligne. Un ingrédient qui se termine par « ? » est à vérifier. Un plat sans nom ou sans ingrédient MUST être refusé.

#### Scenario: Définition d'un plat
- **WHEN** l'article proposé « omelette » est défini comme plat avec les ingrédients « œufs », « fromage ? » et « ciboulette »
- **THEN** le plat « omelette » est mémorisé avec « œufs » et « ciboulette » certains et « fromage » à vérifier

#### Scenario: Remplacement immédiat dans le tri
- **WHEN** l'article proposé « omelette » vient d'être défini comme plat
- **THEN** il est remplacé dans le tri par le groupe « omelette » et ses ingrédients

#### Scenario: Plat sans ingrédient
- **WHEN** l'utilisateur tente de définir un plat sans saisir d'ingrédient
- **THEN** le plat n'est pas mémorisé et l'utilisateur en est informé

#### Scenario: Actions visibles quelle que soit la longueur du tri
- **WHEN** le tri propose une vingtaine d'articles et que l'utilisateur fait un appui long sur l'un d'eux
- **THEN** ses actions s'affichent par-dessus le tri, sans avoir à faire défiler

### Requirement: Plat à définir
Le système SHALL présenter un nom de plat inconnu issu d'une ligne de menu comme un plat à définir, distinct d'un article, avec une action visible pour définir ses ingrédients. Un plat à définir MUST NOT être ajouté à la liste à la validation, sauf s'il a été gardé comme article.

#### Scenario: Nom de plat inconnu dans un menu
- **WHEN** aucun plat ne s'appelle « gratin » et que le texte reçu est « Lundi 3 : gratin / carottes »
- **THEN** « gratin » est présenté comme un plat à définir et « carottes » comme un article

#### Scenario: Plat à définir non ajouté
- **WHEN** « gratin » est un plat à définir et que l'utilisateur valide
- **THEN** « gratin » n'est pas ajouté à la liste

#### Scenario: Définition depuis le menu
- **WHEN** l'utilisateur définit le plat à définir « gratin » avec « pommes de terre » et « crème ? »
- **THEN** « gratin » est mémorisé et remplacé dans le tri par son groupe

### Requirement: Plat gardé comme article
Le système SHALL permettre, pour un plat reconnu ou un plat à définir, de le garder comme un simple article pour ce tri seulement : il est remplacé par un article proposé portant son nom, et la définition mémorisée du plat MUST rester inchangée.

#### Scenario: Plat reconnu acheté tel quel
- **WHEN** le plat « risotto » est reconnu dans le tri et que l'utilisateur le garde comme article
- **THEN** le groupe « risotto » est remplacé par l'article proposé « risotto », et un « risotto » reçu plus tard est de nouveau reconnu comme plat

#### Scenario: Plat à définir gardé comme article
- **WHEN** « gratin » est un plat à définir, que l'utilisateur le garde comme article puis valide
- **THEN** « gratin » est ajouté à la liste

### Requirement: Reconnaissance d'un plat connu
Le système SHALL remplacer, dans la boîte de réception, tout article proposé dont le libellé est identique au nom d'un plat mémorisé par les ingrédients de ce plat, regroupés sous son nom, avec leur état certain ou à vérifier. Deux noms sont identiques s'ils ne diffèrent que par la casse, les accents ou les espaces superflus.

#### Scenario: Plat reconnu dans un texte reçu
- **WHEN** le plat « risotto » est mémorisé avec « riz » et « parmesan ? », et que le texte reçu est « Risotto, pain »
- **THEN** la boîte de réception propose le groupe « risotto » contenant « riz » et « parmesan » à vérifier, et l'article « pain »

#### Scenario: Libellé inconnu
- **WHEN** aucun plat ne s'appelle « soupe » et que le texte reçu est « soupe »
- **THEN** « soupe » est proposé comme un article simple

### Requirement: Écart d'un plat entier
Le système SHALL permettre d'écarter en une action tous les ingrédients d'un plat proposé, et de les remettre de la même façon. Chaque ingrédient MUST rester écartable individuellement.

#### Scenario: Écarter le plat entier
- **WHEN** l'utilisateur écarte le groupe « risotto »
- **THEN** « riz » et « parmesan » sont écartés et ne seront pas ajoutés à la liste

#### Scenario: Écarter un seul ingrédient
- **WHEN** l'utilisateur écarte « riz » dans le groupe « risotto » et valide
- **THEN** seul « parmesan » est ajouté à la liste, à vérifier

### Requirement: Modification d'un plat
Le système SHALL permettre, depuis les actions d'un groupe de plat dans le tri, de modifier les ingrédients du plat. La nouvelle définition MUST être utilisée pour ce groupe et pour les reconnaissances suivantes.

#### Scenario: Ajout d'un ingrédient à un plat
- **WHEN** l'utilisateur ajoute « bouillon » aux ingrédients du plat « risotto » depuis son groupe
- **THEN** le groupe propose « riz », « parmesan » et « bouillon », et le prochain « risotto » reçu aussi

### Requirement: Conservation des plats
Le système SHALL conserver les plats mémorisés sur l'appareil entre deux utilisations, et MUST NOT les inclure dans la liste envoyée ou partagée.

#### Scenario: Plat retrouvé après réouverture
- **WHEN** le plat « omelette » a été défini, puis l'application fermée et rouverte
- **THEN** un « omelette » reçu est reconnu comme plat
