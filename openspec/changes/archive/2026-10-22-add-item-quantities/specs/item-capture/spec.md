# Spec Delta

## MODIFIED Requirements

### Requirement: Fusion des doublons dans le tri
Le système MUST NOT proposer deux fois le même article ni le même plat dans la boîte de réception ; un plat cité plusieurs fois voit les quantités de ses ingrédients multipliées d'autant. Lorsqu'un article certain arrive alors que le même article est proposé à vérifier, la proposition existante MUST devenir certaine. Deux libellés sont identiques s'ils ne diffèrent que par la casse, les accents, les espaces superflus ou la marque du pluriel (« s » ou « x ») en fin de mot.

#### Scenario: Article reçu deux fois
- **WHEN** le texte reçu est « carottes\nCarottes »
- **THEN** « carottes » n'est proposé qu'une fois

#### Scenario: Article reçu au singulier et au pluriel
- **WHEN** le texte reçu est « tomates cerises\ntomate cerise »
- **THEN** « tomates cerises » n'est proposé qu'une fois

#### Scenario: Plat reçu deux fois
- **WHEN** le plat « risotto » est mémorisé et que le texte reçu est « Lundi 3 : risotto\nMardi 4 : risotto »
- **THEN** le groupe « risotto » n'est proposé qu'une fois, ses ingrédients avec quantité comptés deux fois

#### Scenario: Le certain l'emporte dans le tri
- **WHEN** « parmesan » est proposé à vérifier et que le texte reçu ensuite contient « parmesan »
- **THEN** « parmesan » n'est proposé qu'une fois, comme article certain

### Requirement: Bilan de la validation
Le système SHALL indiquer, après la validation du tri, les articles réellement ajoutés à la liste et ceux qui y figuraient déjà, avec, pour ces derniers, l'évolution de leur quantité lorsqu'elle a changé. Ce bilan MUST rester affiché jusqu'à ce que l'utilisateur le ferme ou modifie la liste.

#### Scenario: Articles ajoutés et déjà présents
- **WHEN** la liste contient « petits pois » et que l'utilisateur valide « petit pois » et « lait »
- **THEN** le bilan indique que « lait » a été ajouté et que « petits pois » était déjà dans la liste

#### Scenario: Quantité d'un article déjà présent
- **WHEN** la liste contient « citrons » avec la quantité 3 et que l'utilisateur valide « 2 citrons »
- **THEN** le bilan indique que « citrons » était déjà dans la liste et que sa quantité est passée de 3 à 5

#### Scenario: Article pris ajouté de nouveau
- **WHEN** la liste contient « lait » coché et que l'utilisateur valide « lait »
- **THEN** le bilan indique que « lait » a été ajouté, et « lait » est de nouveau à prendre

#### Scenario: Bilan fermé
- **WHEN** le bilan est affiché et que l'utilisateur le ferme
- **THEN** le bilan disparaît

#### Scenario: Bilan dépassé
- **WHEN** le bilan est affiché et que l'utilisateur coche un article
- **THEN** le bilan disparaît
