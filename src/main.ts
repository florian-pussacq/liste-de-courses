import { mount } from 'svelte';
import { shopping } from './application/shopping';
import { readClipboard } from './infrastructure/clipboard';
import { openStorage } from './infrastructure/indexed-db';
import { requestPersistentStorage } from './infrastructure/persistent-storage';
import { takeSharedContent } from './infrastructure/share-target';
import App from './ui/App.svelte';
import './ui/app.css';

async function start(target: HTMLElement): Promise<void> {
  const storage = await openStorage();
  void requestPersistentStorage();

  const app = shopping({
    shoppingLists: storage.shoppingLists,
    inboxes: storage.inboxes,
    now: () => Date.now(),
    newId: () => crypto.randomUUID(),
    readClipboard: () => readClipboard(),
  });

  const shared = takeSharedContent(new URL(location.href), (cleanUrl) =>
    history.replaceState(history.state, '', cleanUrl),
  );
  const pendingBefore = (await app.inbox()).proposals.length;
  const initialInbox = shared ? await app.captureShared(shared) : await app.inbox();

  mount(App, {
    target,
    props: {
      app,
      initialList: await app.shoppingList(),
      initialInbox,
      openInbox: shared !== undefined,
      emptyShare: shared !== undefined && initialInbox.proposals.length === pendingBefore,
    },
  });
}

const target = document.getElementById('app');
if (!target) {
  throw new Error('Missing #app mount point');
}

start(target).catch((error: unknown) => {
  console.error(error);
  target.textContent = "L'application n'a pas pu démarrer. Recharge la page pour réessayer.";
});
