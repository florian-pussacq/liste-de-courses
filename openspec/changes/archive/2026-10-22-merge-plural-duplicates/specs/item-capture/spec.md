# Spec Delta

## MODIFIED Requirements

### Requirement: Fusion des doublons dans le tri
Le système MUST NOT proposer deux fois le même article ni le même plat dans la boîte de réception. Lorsqu'un article certain arrive alors que le même article est proposé à vérifier, la proposition existante MUST devenir certaine. Deux libellés sont identiques s'ils ne diffèrent que par la casse, les accents, les espaces superflus ou la marque du pluriel (« s » ou « x ») en fin de mot.

#### Scenario: Article reçu deux fois
- **WHEN** le texte reçu est « carottes\nCarottes »
- **THEN** « carottes » n'est proposé qu'une fois

#### Scenario: Article reçu au singulier et au pluriel
- **WHEN** le texte reçu est « tomates cerises\ntomate cerise »
- **THEN** « tomates cerises » n'est proposé qu'une fois

#### Scenario: Plat reçu deux fois
- **WHEN** le plat « risotto » est mémorisé et que le texte reçu est « Lundi 3 : risotto\nMardi 4 : risotto »
- **THEN** le groupe « risotto » n'est proposé qu'une fois

#### Scenario: Le certain l'emporte dans le tri
- **WHEN** « parmesan » est proposé à vérifier et que le texte reçu ensuite contient « parmesan »
- **THEN** « parmesan » n'est proposé qu'une fois, comme article certain
