# item-capture Specification

## Purpose

Permet de faire entrer des articles dans l'application en un geste, quelle que soit leur provenance, en transformant un texte reçu en articles que l'utilisateur valide avant leur ajout à la liste.

## Requirements

### Requirement: Réception de texte partagé
Le système SHALL apparaître comme destination dans le menu de partage du système d'exploitation une fois installé, et SHALL ouvrir la boîte de réception avec le texte partagé.

#### Scenario: Partage d'un message depuis une autre application
- **WHEN** l'utilisateur partage le texte « lait, œufs » depuis une autre application vers l'application installée
- **THEN** la boîte de réception s'ouvre et propose les articles « lait » et « œufs »

#### Scenario: Partage contenant un titre et un texte
- **WHEN** le partage fournit à la fois un titre et un texte
- **THEN** le titre et le texte sont tous deux pris en compte comme texte reçu, le titre en premier

#### Scenario: Partage sans texte exploitable
- **WHEN** le partage ne contient que des espaces ou aucun texte
- **THEN** la boîte de réception s'ouvre sans article proposé et l'indique à l'utilisateur

### Requirement: Saisie et collage manuels
Le système SHALL permettre à l'utilisateur de saisir ou coller du texte libre dans la boîte de réception, traité de la même façon qu'un texte partagé.

#### Scenario: Collage d'une liste
- **WHEN** l'utilisateur colle un texte de plusieurs lignes dans la boîte de réception et le soumet
- **THEN** le système propose un article par ligne non vide

### Requirement: Découpage du texte en articles proposés
Le système SHALL découper le texte reçu en articles proposés en séparant sur les retours à la ligne, les virgules et les points-virgules, en retirant les puces et numérotations en début d'élément, les espaces superflus et les éléments vides.

#### Scenario: Liste à puces
- **WHEN** le texte reçu est « - pain\n* beurre\n• confiture »
- **THEN** les articles proposés sont « pain », « beurre » et « confiture »

#### Scenario: Liste numérotée
- **WHEN** le texte reçu est « 1. riz\n2) tomates »
- **THEN** les articles proposés sont « riz » et « tomates »

#### Scenario: Séparateurs mélangés et éléments vides
- **WHEN** le texte reçu est « lait,, œufs ;\n\n  farine  »
- **THEN** les articles proposés sont « lait », « œufs » et « farine »

#### Scenario: Texte libre
- **WHEN** le texte reçu est « pense à prendre du lait stp »
- **THEN** le système propose l'élément tel quel, « pense à prendre du lait stp », pour que l'utilisateur le corrige

### Requirement: Correction des articles proposés
Le système SHALL permettre, avant validation, de modifier le libellé d'un article proposé, d'en écarter un, ou d'en ajouter un.

#### Scenario: Correction d'un libellé issu de texte libre
- **WHEN** l'utilisateur remplace le libellé proposé « pense à prendre du lait stp » par « lait »
- **THEN** l'article proposé devient « lait »

#### Scenario: Écarter un article proposé
- **WHEN** l'utilisateur écarte l'article proposé « stp »
- **THEN** cet élément n'est plus proposé et ne sera pas ajouté à la liste

### Requirement: Validation vers la liste
Le système SHALL ajouter à la liste de courses tous les articles proposés restants lorsque l'utilisateur valide, puis SHALL vider la boîte de réception et afficher la liste.

#### Scenario: Validation des articles proposés
- **WHEN** la boîte de réception propose « pain » et « beurre » et que l'utilisateur valide
- **THEN** « pain » et « beurre » figurent dans la liste et la boîte de réception est vide

#### Scenario: Abandon de la capture
- **WHEN** l'utilisateur abandonne explicitement la capture en cours
- **THEN** la boîte de réception est vidée et la liste de courses reste inchangée

### Requirement: Conservation de la capture en cours
Le système SHALL conserver le contenu de la boîte de réception non validé si l'application est fermée, jusqu'à validation ou abandon explicite.

#### Scenario: Reprise après fermeture
- **WHEN** l'utilisateur ferme l'application avec des articles proposés non validés puis la rouvre
- **THEN** la boîte de réception affiche toujours ces articles proposés

#### Scenario: Nouveau partage pendant une capture en cours
- **WHEN** la boîte de réception contient des articles non validés et qu'un nouveau texte est partagé
- **THEN** les articles issus du nouveau texte s'ajoutent à ceux déjà proposés
