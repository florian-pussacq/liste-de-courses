# Design

## Context

Dépôt vierge : aucune ligne de code, aucun outillage. La cible est un téléphone Android (Chrome), avec un usage en magasin où le réseau est généralement disponible mais pas garanti. Le partage de liste entre plusieurs personnes est prévu plus tard (hors périmètre, voir proposal.md) et ne doit pas être rendu coûteux par les choix d'aujourd'hui. Les exigences sont dans `specs/item-capture`, `specs/shopping-list` et `specs/offline-app`.

## Goals / Non-Goals

**Goals:**
- Un domaine métier pur, sans dépendance au navigateur ni au framework, entièrement testable en unitaire.
- Un modèle de données qui ne bloque pas une future synchronisation entre appareils.
- Une application statique, sans backend, déployée automatiquement depuis `main`.

**Non-Goals:**
- Synchronisation, comptes utilisateurs, backend.
- Prise en charge d'iOS : la réception de partages par une application web n'y est pas possible.
- Internationalisation : l'interface est en français uniquement.

## Decisions

### Code en anglais, glossaire explicite
Le code, les noms de fichiers et les tests sont en anglais ; les specs et l'interface restent en français. Pour préserver le langage ubiquitaire, la correspondance est fixée une fois pour toutes :

| Spec (fr)            | Code (en)        |
|----------------------|------------------|
| liste de courses     | `ShoppingList`   |
| article              | `Item`           |
| libellé              | `label`          |
| coché / pris         | `checked`        |
| boîte de réception   | `Inbox`          |
| article proposé      | `Proposal`       |
| texte reçu           | `capturedText`   |

### PWA plutôt qu'application native
Une PWA installée sur Chrome Android peut recevoir des partages (Web Share Target), fonctionner hors ligne et s'installer sans store. Alternative écartée : application native (Kotlin ou React Native), qui imposerait un store ou du sideloading, une chaîne de build plus lourde et un second langage, pour aucun besoin que la PWA ne couvre pas sur Android.

### TypeScript strict, Vite, Svelte 5
- TypeScript en mode `strict` pour l'ensemble du code.
- Vite pour le build et le serveur de développement.
- Svelte 5 pour l'interface : peu de code d'infrastructure, réactivité native, bundle léger, adapté à une petite application. Alternative considérée : React, plus répandu mais plus verbeux et plus lourd pour ce besoin. Le choix est peu risqué car le domaine ne dépend pas du framework (voir décision suivante) : changer d'UI ne toucherait que la couche `ui/`.

### Architecture hexagonale légère
```
src/
  domain/          logique métier pure : Item, ShoppingList, Inbox, découpage du texte, normalisation des libellés
  application/     cas d'usage (captureText, validateInbox, addItem, toggleItem, clearChecked...) et ports (interfaces de dépôt)
  infrastructure/  adaptateurs : persistance IndexedDB, lecture des paramètres de partage
  ui/              composants Svelte, uniquement branchés sur la couche application
```
Les dépendances pointent vers `domain/`. Le domaine est fait d'objets immuables et de fonctions pures : chaque opération renvoie un nouvel état, ce qui le rend trivial à tester et à rejouer.

### Persistance : IndexedDB via `idb`
IndexedDB est asynchrone, sans limite de taille pratique, et durable. `idb` est une fine surcouche typée (environ 1 ko) sur l'API native. Au démarrage, l'application appelle `navigator.storage.persist()` pour réduire le risque d'éviction par le navigateur.

Alternatives écartées :
- `localStorage` : synchrone, limité, plus exposé à l'éviction.
- Dexie : plus riche, mais inutile pour deux collections.

La base porte un numéro de version de schéma, pour permettre des migrations futures.

### Modèle de données prêt pour la synchronisation, sans la construire
Chaque article a un identifiant stable généré côté client (`crypto.randomUUID()`), un `addedAt` et un `updatedAt`. C'est ce qu'exigera une synchronisation future, et cela ne coûte rien aujourd'hui. Pas de CRDT ni de journal d'opérations à ce stade (YAGNI).

### Normalisation des libellés pour le dédoublonnage
Clé de comparaison : passage en minuscules, remplacement des ligatures (`œ` → `oe`, `æ` → `ae`), décomposition NFD puis suppression des diacritiques, réduction des espaces. Attention : NFD ne décompose pas `œ`, d'où la règle explicite sur les ligatures. Le libellé affiché reste celui de l'article existant.

### Réception des partages : `share_target` en GET sur la racine
Le manifeste déclare un `share_target` en méthode GET avec `action: "./"` et les paramètres `title`, `text` et `url`. Au démarrage, l'application lit ces paramètres, alimente la boîte de réception, puis nettoie l'URL avec `history.replaceState`.

Pourquoi ces choix :
- GET n'exige pas d'intercepter la requête dans le service worker, contrairement à POST.
- Cibler la racine évite tout problème de routage sur un hébergement statique.
- Le paramètre `url` est ignoré en v1, car il ne décrit pas d'articles.

### Hors ligne et mises à jour : `vite-plugin-pwa` (Workbox)
Le plugin génère le manifeste et un service worker qui précache tous les fichiers de l'application. Avec la stratégie `autoUpdate`, une nouvelle version s'applique au plus tard à l'ouverture suivante, comme l'exige la spec. Les données sont en IndexedDB et ne sont jamais touchées par le cache.

### Confidentialité appliquée par la plateforme
Une Content Security Policy en balise `<meta>` restreint `connect-src` à `'self'`. Même par erreur, le code ne peut donc pas envoyer de données ailleurs. Pas d'analytics, pas de police ni de script tiers.

### Hébergement : GitHub Pages via GitHub Actions
L'hébergement est statique, en HTTPS (requis pour le service worker), gratuit et déployé depuis `main`. L'application est publique, mais les données restent sur l'appareil. Le `base` de Vite est configuré sur le chemin du dépôt.

### Qualité et trunk-based development
Une CI sur chaque push vers `main` bloque le déploiement en cas d'échec. Elle exécute, dans l'ordre :
1. `openspec validate --all --strict` ;
2. lint (ESLint) et formatage (Prettier) ;
3. vérification de types (`svelte-check`, `tsc`) ;
4. tests unitaires (Vitest) ;
5. tests de bout en bout (Playwright sur Chromium) ;
6. build ;
7. déploiement.

Stratégie de test :
- le domaine et les cas d'usage en TDD avec Vitest, avec des dépôts en mémoire ;
- l'adaptateur IndexedDB testé contre `fake-indexeddb` ;
- les scénarios des specs couverts en bout en bout par Playwright :
  - le partage, en ouvrant l'URL avec les paramètres `title` et `text` ;
  - le hors ligne, avec `context.setOffline(true)` ;
  - la confidentialité, en échouant sur toute requête vers une autre origine.

## Risks / Trade-offs

- [La Web Share Target ne fonctionne qu'une fois l'application installée, et seulement sur Chrome ou Edge Android] → Cible assumée. Le collage manuel reste disponible partout.
- [Le texte libre est mal découpé (« pense à prendre du lait stp »)] → Correction manuelle dans la boîte de réception avant validation. Une analyse plus intelligente pourra faire l'objet d'un change dédié si la douleur persiste.
- [Le navigateur évince les données IndexedDB en cas de stockage saturé] → `navigator.storage.persist()`. Un export ou une sauvegarde pourra être envisagé plus tard.
- [Le partage Android n'est pas testable en CI] → Le test de bout en bout simule l'arrivée par l'URL. Une vérification manuelle sur téléphone est inscrite dans les tâches avant de considérer la v1 terminée.
- [Svelte est moins répandu que React] → Domaine indépendant du framework : le coût d'un changement reste limité à `ui/`.
- [Le service worker sert une ancienne version] → `autoUpdate` et versionnage des fichiers par Vite. En dernier recours, désinstaller puis réinstaller l'application.

## Migration Plan

Aucune migration : première version. Retour arrière par `git revert` sur `main`, qui redéploie la version précédente. Le schéma IndexedDB étant versionné dès le départ, toute évolution future du modèle passera par une migration explicite au chargement.

## Open Questions

- Nom affiché et icône de l'application : sans impact sur les specs ni le découpage, une icône provisoire suffit.
