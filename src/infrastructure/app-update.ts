import type { registerSW } from 'virtual:pwa-register';

export type RegisterServiceWorker = typeof registerSW;

// A new version waits until the user chooses to load it: reloading on its own would pull the
// application out from under their fingers. An installed application resumed from the background
// does not navigate, so the browser would never look for a new version without a nudge.
export function watchForUpdates(
  register: RegisterServiceWorker,
  onUpdateReady: (apply: () => Promise<void>) => void,
): void {
  const updateServiceWorker = register({
    onNeedRefresh: () => onUpdateReady(() => updateServiceWorker(true)),
    onRegisteredSW: (_url, registration) => {
      if (!registration) return;
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') void registration.update();
      });
    },
  });
}
