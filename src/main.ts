import { mount } from 'svelte';
import { shopping } from './application/shopping';
import { openStorage } from './infrastructure/indexed-db';
import { requestPersistentStorage } from './infrastructure/persistent-storage';
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
  });

  mount(App, {
    target,
    props: {
      app,
      initialList: await app.shoppingList(),
      initialInbox: await app.inbox(),
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
