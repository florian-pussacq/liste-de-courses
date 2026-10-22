# Spec Delta

## MODIFIED Requirements

### Requirement: Saisie et collage manuels
Le système SHALL permettre à l'utilisateur de saisir ou coller du texte libre dans la boîte de réception, traité de la même façon qu'un texte partagé, lorsqu'aucun article n'est à trier ou que le presse-papiers n'a pas pu être lu. Lorsque des articles sont à trier, cette saisie MUST NOT être affichée.

#### Scenario: Collage d'une liste
- **WHEN** aucun article n'est à trier et que l'utilisateur colle un texte de plusieurs lignes dans la boîte de réception et le soumet
- **THEN** le système propose un article par ligne non vide

#### Scenario: Saisie masquée pendant le tri
- **WHEN** des articles sont à trier
- **THEN** la boîte de réception n'affiche pas de zone pour coller ou écrire un texte
