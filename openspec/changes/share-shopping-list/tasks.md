# Tasks

## 1. Domaine et application

- [x] 1.1 Implémenter en TDD `listAsText` (articles à prendre puis à vérifier suffixés de « ? », articles pris exclus), et vérifier le scénario « Liste envoyée » et la relecture sans perte par `splitIntoEntries`
- [x] 1.2 Ajouter le port `sendText` et le cas d'usage `sendList`, et vérifier sur des doubles qu'il transmet le texte de la liste et qu'il ne transmet rien quand il n'y a rien à envoyer

## 2. Infrastructure

- [x] 2.1 Implémenter en TDD l'adaptateur `sendText` (partagé, copié, annulé, indisponible), et vérifier qu'aucun cas ne lève d'exception

## 3. Interface

- [ ] 3.1 Ajouter « Envoyer la liste » dans l'en-tête, désactivé sans rien à envoyer, avec les messages de copie et d'échec, et vérifier en e2e (Web Share simulé) les scénarios « Liste envoyée », « Rien à envoyer », « Pas de menu de partage » et « Envoi annulé »
- [ ] 3.2 Vérifier en e2e qu'aucune requête vers une autre origine n'est émise pendant un envoi (scénario « Envoi de la liste par l'utilisateur »)

## 4. Vérification d'intégration

- [ ] 4.1 Lancer `openspec validate --all --strict` et la CI complète sur `main`, et vérifier que tout est vert et que le déploiement a réussi
- [ ] 4.2 Sur un téléphone Android réel : envoyer la liste vers une messagerie, puis partager le message reçu vers l'application, et vérifier que les mêmes articles reviennent, doutes compris

## Workflow follow-up

- Archiver le change avec `/opsx:archive` après la vérification sur téléphone.
