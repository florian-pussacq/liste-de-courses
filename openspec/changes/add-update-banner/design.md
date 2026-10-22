# Design

## Context

`vite-plugin-pwa` est en `registerType: 'autoUpdate'` avec un script d'enregistrement injecté : le nouveau service worker s'active dès son installation, mais la page ouverte garde l'ancienne version jusqu'au prochain chargement, sans rien en dire. Le navigateur ne vérifie le service worker qu'à la navigation : une application installée reprise depuis l'arrière-plan ne vérifie rien.

## Goals / Non-Goals

**Goals:**
- Dire qu'une nouvelle version est prête et la charger d'un geste.
- Chercher une nouvelle version au retour au premier plan.

**Non-Goals:**
- Recharger sans l'accord de l'utilisateur (un rechargement au milieu d'un tri serait déroutant).
- Notes de version.

## Decisions

### Mode « prompt » et enregistrement par l'application
`registerType: 'prompt'`, `injectRegister: false`, et un adaptateur d'infrastructure `watchForUpdates(onUpdateReady)` qui appelle `registerSW` de `virtual:pwa-register` :
- `onNeedRefresh` signale qu'une version attend, avec une fonction `apply` qui active le nouveau service worker et recharge la page (`updateSW(true)`) ;
- une fois l'enregistrement fait, `registration.update()` est appelé à chaque retour au premier plan (`visibilitychange` → `visible`).

En mode « prompt », le service worker en attente s'active aussi seul quand toutes les fenêtres de l'application sont fermées : ignorer le bandeau garde le comportement actuel.

Alternative écartée : garder `autoUpdate` et recharger automatiquement à l'activation. Elle rechargerait l'application sous les doigts de l'utilisateur.

### Le bandeau dans `App`
`main.ts` branche `watchForUpdates` et transmet l'événement à `App` par une propriété `onupdateready` à laquelle `App` s'abonne, pour que l'interface ne dépende pas du module virtuel du plugin. Le bandeau (`role="status"`, « Nouvelle version disponible » + « Recharger ») s'affiche en haut de l'écran, loin des bandeaux d'annulation et de bilan placés au-dessus du dock.

### Test de bout en bout réel
Le test e2e sert l'application construite, attend le service worker, puis intercepte la requête de `sw.js` (route Playwright) pour en servir une version modifiée d'un octet : le navigateur y voit une nouvelle version, l'installe, et le bandeau doit apparaître. Le rechargement est ensuite vérifié avec une liste existante.

## Risks / Trade-offs

- [L'interception de `sw.js` par Playwright pourrait ne pas couvrir la vérification de mise à jour faite par le navigateur] → À vérifier en premier ; à défaut, le bandeau est testé au niveau composant avec une source d'événements simulée, et la mise à jour réelle sur téléphone.
- [Un rechargement efface un champ en cours de saisie] → Le rechargement n'a lieu que sur demande ; la liste et le tri sont en IndexedDB.

## Migration Plan

Le premier déploiement remplace un service worker `autoUpdate` par un service worker « prompt » : il s'installe et s'active comme toute mise à jour actuelle. Aucune donnée modifiée.
