# Règles de développement

Ce projet suit les principes du software craftsmanship : du code maintenable dans le temps, compréhensible, résilient et performant là où c'est mesuré.

## Confidentialité et sécurité

Ce dépôt est public. Tout ce qui y entre (code, specs, commits, messages, noms de fichiers) est considéré comme publié définitivement.

- Les specs décrivent ce que fait l'application, jamais pourquoi ni pour qui elle a été imaginée. Le contexte personnel partagé en conversation reste hors du dépôt.
- Aucune donnée personnelle : noms, adresses, emails, habitudes, exemples tirés de la vie réelle. Les exemples sont fictifs et génériques.
- Aucun secret : clés, tokens, mots de passe, URLs internes. Ils passent par des variables d'environnement non versionnées.
- En cas de doute sur une information, elle n'entre pas dans le dépôt.

## Specs d'abord (OpenSpec)

- Tout changement de comportement passe par une proposition OpenSpec (`/opsx:propose`) avant toute implémentation.
- Les specs dans `openspec/specs/` sont la source de vérité. Si le code et la spec divergent, l'un des deux est faux : on tranche explicitement, on ne laisse pas dériver.
- Un scénario de spec = au moins un test qui le vérifie.
- On valide avec `openspec validate --all` avant de commiter.
- Tous les workflows OpenSpec sont activés. Ce réglage vit dans la config globale d'OpenSpec, pas dans le repo : avant tout `openspec update`, on le rétablit, sinon les workflows hors profil `core` sont supprimés de `.claude/`.

  ```
  openspec config set profile custom
  openspec config set workflows '["propose","explore","new","continue","apply","update","ff","sync","archive","bulk-archive","verify","onboard"]'
  ```

## Trunk-based development

- On travaille directement sur `main`. Pas de branche longue.
- Chaque commit laisse `main` dans un état sain : specs valides, build et tests verts.
- Commits petits et fréquents, une seule intention par commit.
- Une fonctionnalité inachevée est cachée (feature flag, code non branché), jamais laissée cassée.

## Commits

- Rédigés en français, au format Conventional Commits : `type(portée): description`.
- Types : `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `build`, `ci`.
- La description dit ce que fait le commit, à la troisième personne, en minuscule, sans point final.
  - Exemple : `feat(liste): utilise le catalogue pour suggérer les articles fréquents`
- Le corps (optionnel) explique le pourquoi, pas le comment.
- Pas de ligne `Co-Authored-By` ni d'autre mention d'attribution.

## Tests

- TDD : test rouge, code minimal pour le passer, puis refactoring.
- On teste des comportements, pas des détails d'implémentation.
- Les tests sont rapides, déterministes et isolés. Un test instable est un bug, pas une fatalité.
- Un bug corrigé commence par un test qui le reproduit.

## Langues

- Le code, les noms de fichiers et les tests sont en anglais.
- Les specs, l'interface et les commits sont en français.
- Le passage d'une langue à l'autre suit ce glossaire, à compléter à chaque nouveau concept :

| Spec (fr)            | Code (en)       |
| -------------------- | --------------- |
| liste de courses     | `ShoppingList`  |
| article              | `Item`          |
| libellé              | `label`         |
| coché / pris         | `checked`       |
| boîte de réception   | `Inbox`         |
| article proposé      | `Proposal`      |
| texte reçu           | `capturedText`  |
| écarté               | `discarded`     |
| panier               | `basket`        |
| progression          | `progress`      |
| presse-papiers       | `clipboard`     |
| actions d'un article | `ItemActions`   |
| à vérifier           | `toCheck`       |
| entrée (découpage)   | `Entry`         |
| plat                 | `Dish`          |
| ingrédient           | `ingredient`    |
| ligne de menu        | `menuLine`      |
| bilan de validation  | `BatchAddition` |
| déjà dans la liste   | `alreadyListed` |
| vider la liste       | `clearList`     |
| quantité             | `quantity`      |

Le panier n'est pas un concept du domaine : c'est la présentation des articles cochés, et il n'apparaît que dans l'interface.

## Conception

- Le vocabulaire du code est celui des specs (langage ubiquitaire) : un concept, un nom.
- Le domaine ne dépend ni du framework, ni de la base, ni de l'UI. Les dépendances pointent vers le domaine.
- YAGNI : on ne construit que ce qu'une spec demande. Pas d'abstraction spéculative.
- Trois duplications avant d'extraire une abstraction. Une mauvaise abstraction coûte plus cher qu'une duplication.
- Les erreurs sont explicites et traitées au bon niveau. Jamais avalées en silence.
- La performance s'optimise sur mesure, pas sur intuition.

## Code

- Fonctions courtes, une responsabilité, des noms qui rendent les commentaires inutiles.
- Un commentaire explique un pourquoi non évident, jamais un quoi.
- Pas de code mort, pas de code commenté, pas de TODO sans ticket ou change OpenSpec associé.
- Règle du boy scout : on laisse le code un peu plus propre qu'on l'a trouvé, dans le périmètre du changement en cours.
- Le refactoring et le changement de comportement vont dans des commits séparés.
