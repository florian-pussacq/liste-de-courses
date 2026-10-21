# Design

## Context

La liste vit dans IndexedDB et n'en sort jamais. Le navigateur offre l'API Web Share (`navigator.share`), qui ouvre le menu de partage d'Android ; l'adaptateur du presse-papiers existe déjà en lecture (`infrastructure/clipboard.ts`). La CSP limite `connect-src` à l'origine de l'application. Les exigences sont dans `specs/shopping-list` et `specs/offline-app`.

## Goals / Non-Goals

**Goals:**
- Un texte de liste que l'application sait relire à l'identique : envoyer puis recevoir la liste est sans perte.
- Aucune requête réseau ajoutée : c'est l'application choisie par l'utilisateur qui transmet.

**Non-Goals:**
- Un format riche (titre, sections, emojis) : il serait relu comme des articles parasites.
- La synchronisation d'une liste entre plusieurs appareils.

## Decisions

### Le format est celui que le découpage sait lire
`listAsText(list)` (domaine, fonction pure) produit les articles à prendre puis les articles à vérifier, dans leur ordre d'ajout, un par ligne, les seconds suffixés de « ? ». Pas de titre ni de puce : un titre deviendrait un article à la relecture. La propriété « relire le texte redonne les mêmes entrées » est vérifiée par un test qui enchaîne `listAsText` et `splitIntoEntries`.

Alternative écartée : un format lisible à l'œil avec un titre et des sections. Il est plus joli dans une messagerie, mais il casse la relecture, qui est justement ce qui rend l'envoi utile entre deux personnes utilisant l'application.

### Adaptateur d'envoi : Web Share, puis presse-papiers
`sendText(text)` dans `infrastructure/` renvoie `'shared' | 'copied' | 'cancelled' | 'unavailable'` et ne lève jamais :
- `navigator.share({ text })` quand il existe ;
- un `AbortError` (menu fermé sans choix) donne `cancelled`, rien n'est affiché ;
- sans `navigator.share`, `navigator.clipboard.writeText` donne `copied`, et l'interface affiche « Liste copiée » ;
- sans les deux, ou en cas d'autre échec, `unavailable`, avec un message explicite.

Ces deux API ne font aucune requête réseau depuis la page : la CSP n'est pas modifiée.

### Port applicatif
L'envoi passe par un port `sendText` dans `Dependencies`, comme `readClipboard`. Le cas d'usage `sendList()` lit la liste, la met en texte et appelle le port. L'interface ne connaît pas l'API du navigateur.

### Interface
Un bouton « Envoyer la liste » (icône de partage, nom accessible explicite) dans l'en-tête, désactivé quand il n'y a rien à envoyer. Les messages « Liste copiée » ou « Envoi impossible » passent par une zone `role="status"`.

## Risks / Trade-offs

- [Un libellé saisi à la main contient une virgule (« sel, poivre »)] → À la relecture, il donne deux articles. C'est accepté : le découpage le fait déjà pour tout texte reçu, et la correction se fait au tri.
- [Web Share absent sur certains navigateurs de bureau] → Repli sur le presse-papiers, couvert par un test.
- [Un test de bout en bout ne peut pas ouvrir le vrai menu de partage] → `navigator.share` est simulé par un script d'initialisation qui enregistre le texte reçu ; la vérification réelle se fait sur téléphone.

## Migration Plan

Aucune donnée ni schéma modifié. Déploiement normal depuis `main`.
