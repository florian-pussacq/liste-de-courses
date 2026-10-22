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
`registerType: 'prompt'`, `injectRegister: false`, et un adaptateur d'infrastructure `watchForUpdates(register, onUpdateReady)` qui appelle `registerSW` de `virtual:pwa-register`, reçu en paramètre :
- `onNeedRefresh` signale qu'une version attend, avec une fonction `apply` qui active le nouveau service worker et recharge la page (`updateSW(true)`) ;
- une fois l'enregistrement fait, `registration.update()` est appelé à chaque retour au premier plan (`visibilitychange` → `visible`).

En mode « prompt », le service worker en attente s'active aussi seul quand toutes les fenêtres de l'application sont fermées : ignorer le bandeau garde le comportement actuel.

Alternative écartée : garder `autoUpdate` et recharger automatiquement à l'activation. Elle rechargerait l'application sous les doigts de l'utilisateur.

### Le bandeau dans `App`
`main.ts` branche `watchForUpdates` et transmet l'événement à `App` par une propriété `onupdateready` à laquelle `App` s'abonne, pour que l'interface ne dépende pas du module virtuel du plugin. Le bandeau (`role="status"`, « Nouvelle version disponible » + « Recharger ») s'affiche en haut de l'écran, loin des bandeaux d'annulation et de bilan placés au-dessus du dock.

### Tests : à la frontière du plugin, puis sur téléphone
Playwright n'intercepte pas la requête de `sw.js` faite par le navigateur pour vérifier une mise à jour (vérifié : la route n'est jamais appelée) ; simuler une nouvelle version en e2e demanderait de modifier les fichiers servis pendant que d'autres tests tournent. Les tests portent donc sur :
- `watchForUpdates`, qui reçoit `registerSW` en paramètre (fourni par `main.ts`) : une version en attente est annoncée avec la fonction qui la charge, et `registration.update()` est appelé au retour au premier plan, pas au passage en arrière-plan ;
- `App`, au niveau composant : le bandeau n'apparaît qu'une fois une version annoncée, et « Recharger » la charge ;
- la conservation de la liste quand les fichiers de l'application sont remplacés, déjà couverte en e2e ;
- la mise à jour réelle, vérifiée sur téléphone.

## Risks / Trade-offs

- [Aucun test automatique ne déroule une vraie mise à jour de bout en bout] → Les deux moitiés sont testées à leur frontière ; l'enchaînement réel est vérifié sur téléphone avant l'archivage.
- [Un rechargement efface un champ en cours de saisie] → Le rechargement n'a lieu que sur demande ; la liste et le tri sont en IndexedDB.

## Migration Plan

Le premier déploiement remplace un service worker `autoUpdate` par un service worker « prompt » : il s'installe et s'active comme toute mise à jour actuelle. Aucune donnée modifiée.
