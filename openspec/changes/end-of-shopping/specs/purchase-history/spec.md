## MODIFIED Requirements

### Requirement: Historique indépendant de la liste
Le système MUST conserver les achats enregistrés lorsque les articles pris sont retirés de la liste, à la demande ou à la fin des courses, que la liste est vidée, qu'un article pris est supprimé ou qu'un retrait est annulé.

#### Scenario: Articles pris retirés
- **WHEN** l'utilisateur a coché « pain » puis retire les articles pris
- **THEN** l'historique contient toujours l'achat de « pain »

#### Scenario: Liste vidée
- **WHEN** l'utilisateur a coché « pain » puis vide la liste
- **THEN** l'historique contient toujours l'achat de « pain »

#### Scenario: Fin des courses
- **WHEN** l'utilisateur a coché « pain » et que les courses se terminent
- **THEN** « pain » n'est plus dans la liste et l'historique contient toujours son achat
