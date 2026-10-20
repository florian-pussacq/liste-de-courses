# Proposal

## Why

La v1 fonctionne mais son interface est un formulaire générique : des bordures partout, des actions secondaires (modifier, supprimer) sur chaque ligne qui concurrencent le libellé, des actions principales hors de portée du pouce, et une capture qui impose encore de passer par une zone de texte. En magasin, l'application s'utilise d'une main, en marchant, d'un coup d'œil : cette version adapte l'expérience à ce contexte et donne une identité visuelle à l'application.

## What Changes

- **Liste en magasin** : la ligne entière d'un article coche et décoche. Les articles cochés se replient dans un « panier » fermé par défaut, qu'un appui déplie. Une progression (articles restant à prendre, pris sur total) est affichée en tête.
- **Actions secondaires** : modifier et supprimer un article ne sont plus affichés sur chaque ligne ; un appui long sur un article ouvre une feuille d'actions (modifier, supprimer).
- **Capture en un appui** : un bouton lit le presse-papiers et envoie son texte dans la boîte de réception. La saisie ou le collage manuel reste disponible quand le presse-papiers est vide, inaccessible ou refusé.
- **Tri par pastilles** : un appui sur un article proposé l'écarte, un nouvel appui le remet ; un appui long permet de corriger son libellé. Le texte reçu est rappelé au-dessus des articles proposés. **BREAKING** (comportement) : écarter un article proposé devient réversible jusqu'à la validation.
- **Ajout direct** : un bouton toujours accessible en bas de l'écran ouvre la saisie d'un article.
- **Identité visuelle** : nouvelle typographie embarquée dans l'application, palette contrastée pensée pour un éclairage de magasin, mode sombre suivant le réglage du téléphone.

Hors périmètre : glisser pour supprimer, suggestions d'articles, retour haptique, quantités.

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `item-capture` : collage depuis le presse-papiers ; écart réversible et correction des articles proposés ; validation limitée aux articles conservés ; rappel du texte reçu.
- `shopping-list` : cochage par la ligne entière et panier repliable ; progression des courses ; modification et suppression accessibles par appui long.

## Impact

- Interface : réécriture des vues `ui/` (liste, tri, feuille d'actions) et de la feuille de style ; les tests de bout en bout sont adaptés aux nouveaux gestes.
- Domaine : la boîte de réception distingue les articles conservés des articles écartés et garde le texte reçu ; la persistance suit (version de schéma IndexedDB incrémentée, avec migration).
- Police auto-hébergée et précachée : aucune requête vers un service de polices tiers, la politique de sécurité reste inchangée.
- Lecture du presse-papiers : soumise à l'autorisation du navigateur.
