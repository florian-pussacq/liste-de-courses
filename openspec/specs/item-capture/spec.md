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
Le système SHALL permettre à l'utilisateur de saisir ou coller du texte libre dans la boîte de réception, traité de la même façon qu'un texte partagé, lorsqu'aucun article n'est à trier ou que le presse-papiers n'a pas pu être lu. Lorsque des articles sont à trier, cette saisie MUST NOT être affichée.

#### Scenario: Collage d'une liste
- **WHEN** aucun article n'est à trier et que l'utilisateur colle un texte de plusieurs lignes dans la boîte de réception et le soumet
- **THEN** le système propose un article par ligne non vide

#### Scenario: Saisie masquée pendant le tri
- **WHEN** des articles sont à trier
- **THEN** la boîte de réception n'affiche pas de zone pour coller ou écrire un texte

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
Le système SHALL permettre, avant validation, d'écarter un article proposé puis de le remettre, de modifier le libellé d'un article proposé, ou d'en ajouter un. Écarter et remettre MUST se faire en une seule action sur l'article proposé ; la modification du libellé MUST être accessible par un appui long.

#### Scenario: Correction d'un libellé issu de texte libre
- **WHEN** l'utilisateur remplace le libellé proposé « pense à prendre du lait stp » par « lait »
- **THEN** l'article proposé devient « lait »

#### Scenario: Écarter un article proposé
- **WHEN** l'utilisateur écarte l'article proposé « stp »
- **THEN** « stp » est affiché comme écarté et ne sera pas ajouté à la liste

#### Scenario: Remettre un article écarté
- **WHEN** l'utilisateur remet l'article écarté « confiture »
- **THEN** « confiture » est de nouveau proposé et sera ajouté à la liste à la validation

#### Scenario: Ajout d'un article à la main
- **WHEN** l'utilisateur ajoute « farine » dans la boîte de réception
- **THEN** « farine » est proposé à la suite des autres articles

### Requirement: Validation vers la liste
Le système SHALL ajouter à la liste de courses les articles proposés qui ne sont pas écartés lorsque l'utilisateur valide, en conservant pour chacun son état certain ou à vérifier, puis SHALL vider la boîte de réception et afficher la liste. Le nombre d'articles qui seront ajoutés MUST être indiqué avant la validation par le titre du tri ; l'action de validation s'intitule « Mettre dans la liste ».

#### Scenario: Validation des articles proposés
- **WHEN** la boîte de réception propose « pain » et « beurre » et que l'utilisateur valide
- **THEN** « pain » et « beurre » figurent dans la liste et la boîte de réception est vide

#### Scenario: Validation avec un article écarté
- **WHEN** la boîte de réception propose « pain » et « stp », que « stp » est écarté et que l'utilisateur valide
- **THEN** seul « pain » est ajouté à la liste

#### Scenario: Validation d'un article à vérifier
- **WHEN** la boîte de réception propose « compote » à vérifier et que l'utilisateur valide
- **THEN** « compote » figure dans la liste comme article à vérifier

#### Scenario: Nombre d'articles annoncé
- **WHEN** trois articles sont proposés dont un écarté
- **THEN** le titre du tri annonce deux articles et l'action « Mettre dans la liste » est disponible

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

### Requirement: Collage depuis le presse-papiers
Le système SHALL permettre, en une seule action depuis la liste, de lire le texte du presse-papiers et de l'envoyer dans la boîte de réception, traité comme un texte partagé. Lorsque le presse-papiers est vide, illisible ou que sa lecture est refusée, le système MUST ouvrir la boîte de réception avec la saisie manuelle et en informer l'utilisateur.

#### Scenario: Presse-papiers contenant une liste
- **WHEN** le presse-papiers contient « pain, beurre » et que l'utilisateur choisit de coller une liste
- **THEN** la boîte de réception s'ouvre et propose « pain » et « beurre »

#### Scenario: Lecture refusée
- **WHEN** la lecture du presse-papiers est refusée et que l'utilisateur choisit de coller une liste
- **THEN** la boîte de réception s'ouvre avec la saisie manuelle et indique que le presse-papiers n'a pas pu être lu

#### Scenario: Presse-papiers vide
- **WHEN** le presse-papiers ne contient aucun texte et que l'utilisateur choisit de coller une liste
- **THEN** la boîte de réception s'ouvre avec la saisie manuelle et indique que le presse-papiers est vide

### Requirement: Collage réduit en magasin
Le système SHALL présenter l'action de collage depuis le presse-papiers avec son libellé « Coller une liste » lorsque la liste est en préparation, et réduite à son icône lorsque la liste est en magasin. Réduite, l'action MUST rester disponible depuis la liste, en une seule action, et garder son nom pour les technologies d'assistance.

#### Scenario: Collage en préparation
- **WHEN** la liste ne contient aucun article pris
- **THEN** l'action de collage affiche le libellé « Coller une liste »

#### Scenario: Collage en magasin
- **WHEN** la liste contient « pain » pris
- **THEN** l'action de collage n'affiche que son icône, et reste nommée « Coller une liste »

#### Scenario: Coller en magasin
- **WHEN** la liste contient « pain » pris, que le presse-papiers contient « beurre » et que l'utilisateur choisit de coller une liste
- **THEN** la boîte de réception s'ouvre et propose « beurre »

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

### Requirement: Articles proposés à vérifier
Le système SHALL proposer comme article à vérifier tout élément du texte reçu qui se termine par un point d'interrogation, en retirant ce point d'interrogation et les espaces qui le précèdent du libellé. Un point d'interrogation situé ailleurs dans l'élément MUST être conservé tel quel.

#### Scenario: Point d'interrogation final
- **WHEN** le texte reçu est « riz\ncompote ? »
- **THEN** « riz » est proposé comme article certain et « compote » comme article à vérifier

#### Scenario: Point d'interrogation collé au mot
- **WHEN** le texte reçu est « confiture? »
- **THEN** « confiture » est proposé comme article à vérifier

#### Scenario: Point d'interrogation au milieu
- **WHEN** le texte reçu est « thé ? ou café »
- **THEN** « thé ? ou café » est proposé comme article certain, libellé inchangé

#### Scenario: Élément réduit à un point d'interrogation
- **WHEN** le texte reçu est « pain\n? »
- **THEN** seul « pain » est proposé

### Requirement: Marquage à vérifier dans le tri
Le système SHALL permettre, avant validation, de marquer un article proposé à vérifier ou de le rendre certain, depuis ses actions ouvertes par un appui long. Un article proposé à vérifier MUST être distingué visuellement d'un article certain.

#### Scenario: Rendre certain un article proposé à vérifier
- **WHEN** « compote » est proposé à vérifier et que l'utilisateur le rend certain
- **THEN** « compote » est proposé comme article certain

#### Scenario: Marquer à vérifier un article proposé
- **WHEN** « farine » est proposé comme article certain et que l'utilisateur le marque à vérifier
- **THEN** « farine » est proposé comme article à vérifier

### Requirement: Découpage des lignes de menu
Le système SHALL reconnaître comme ligne de menu toute ligne du texte reçu qui commence par un jour de la semaine, quelle que soit la casse. Il MUST retirer de cette ligne tout ce qui précède le premier « : » inclus. La partie avant le premier « / » est un nom de plat, découpée seulement sur les virgules et points-virgules ; le reste est découpé aussi sur « / » et « - ». Ces deux caractères MUST NOT être des séparateurs dans les autres lignes.

#### Scenario: Ligne de menu
- **WHEN** le texte reçu est « Lundi 3 : omelette / carottes-brocolis »
- **THEN** « omelette » est proposé comme plat, « carottes » et « brocolis » comme articles

#### Scenario: Nom de plat contenant un tiret
- **WHEN** le texte reçu est « Jeudi 6 : chou-fleur gratiné / purée »
- **THEN** « chou-fleur gratiné » est proposé comme plat, sans être découpé

#### Scenario: Jour sans repas
- **WHEN** le texte reçu est « Mardi 4 :\nMercredi 5 : risotto »
- **THEN** la seule proposition est le plat « risotto »

#### Scenario: Ligne ordinaire avec barre oblique ou tiret
- **WHEN** le texte reçu est « sel/poivre\npâte brisée - pur beurre »
- **THEN** les articles proposés sont « sel/poivre » et « pâte brisée - pur beurre »

#### Scenario: Ligne de menu avec un doute
- **WHEN** le texte reçu est « Samedi 8 : restaurant ? / purée »
- **THEN** « restaurant » est proposé comme plat à vérifier et « purée » comme article certain

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

### Requirement: Ouverture du tri sans clavier
Le système MUST NOT placer le curseur dans un champ de saisie à l'ouverture de la boîte de réception : le clavier ne s'ouvre que si l'utilisateur touche un champ.

#### Scenario: Liste collée
- **WHEN** l'utilisateur colle une liste depuis le presse-papiers
- **THEN** la boîte de réception s'ouvre sans qu'aucun champ de saisie ne soit actif

### Requirement: Initiale en majuscule dans le tri
Le système SHALL afficher dans la boîte de réception chaque proposition, plat et ingrédient avec une initiale en majuscule, sans modifier le libellé enregistré.

#### Scenario: Proposition en minuscules
- **WHEN** le texte reçu est « carottes »
- **THEN** la proposition s'affiche « Carottes »
