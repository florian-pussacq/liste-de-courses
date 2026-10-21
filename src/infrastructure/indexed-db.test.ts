import 'fake-indexeddb/auto';
import { openDB } from 'idb';
import { describe, expect, it } from 'vitest';
import { emptyInbox, type Inbox } from '../domain/inbox';
import { emptyShoppingList, type ShoppingList } from '../domain/shopping-list';
import { openStorage } from './indexed-db';

let databaseCount = 0;
const uniqueName = () => `test-${++databaseCount}`;

const list: ShoppingList = {
  items: [
    { id: 'a', label: 'pain', checked: true, toCheck: false, addedAt: 1, updatedAt: 2 },
    { id: 'b', label: 'lait', checked: false, toCheck: false, addedAt: 3, updatedAt: 3 },
  ],
};

const inbox: Inbox = {
  proposals: [{ id: 'p', label: 'beurre', discarded: false, toCheck: true }],
  capturedTexts: ['beurre'],
};

// Items were stored without any to-check state before version 3.
const listVersion1 = {
  items: [
    { id: 'a', label: 'pain', checked: true, addedAt: 1, updatedAt: 2 },
    { id: 'b', label: 'lait', checked: false, addedAt: 3, updatedAt: 3 },
  ],
};
const certainList: ShoppingList = {
  items: listVersion1.items.map((item) => ({ ...item, toCheck: false })),
};

describe('IndexedDB storage', () => {
  it('starts with an empty list and an empty inbox', async () => {
    const storage = await openStorage(uniqueName());

    expect(await storage.shoppingLists.load()).toEqual(emptyShoppingList());
    expect(await storage.inboxes.load()).toEqual(emptyInbox());
  });

  it('keeps the list and the inbox after the database is reopened', async () => {
    const name = uniqueName();
    const first = await openStorage(name);
    await first.shoppingLists.save(list);
    await first.inboxes.save(inbox);
    first.close();

    const reopened = await openStorage(name);

    expect(await reopened.shoppingLists.load()).toEqual(list);
    expect(await reopened.inboxes.load()).toEqual(inbox);
  });

  it('migrates a version 1 database without losing anything', async () => {
    const name = uniqueName();
    const v1 = await openDB(name, 1, {
      upgrade: (database) => database.createObjectStore('documents'),
    });
    await v1.put('documents', listVersion1, 'shopping-list');
    await v1.put('documents', { proposals: [{ id: 'p', label: 'beurre' }] }, 'inbox');
    v1.close();

    const storage = await openStorage(name);

    expect(await storage.shoppingLists.load()).toEqual(certainList);
    expect(await storage.inboxes.load()).toEqual({
      proposals: [{ id: 'p', label: 'beurre', discarded: false, toCheck: false }],
      capturedTexts: [],
    });
  });

  it('migrates a version 2 database, every item and proposal being certain', async () => {
    const name = uniqueName();
    const v2 = await openDB(name, 2, {
      upgrade: (database) => database.createObjectStore('documents'),
    });
    await v2.put('documents', listVersion1, 'shopping-list');
    await v2.put(
      'documents',
      { proposals: [{ id: 'p', label: 'beurre', discarded: true }], capturedTexts: ['beurre'] },
      'inbox',
    );
    v2.close();

    const storage = await openStorage(name);

    expect(await storage.shoppingLists.load()).toEqual(certainList);
    expect(await storage.inboxes.load()).toEqual({
      proposals: [{ id: 'p', label: 'beurre', discarded: true, toCheck: false }],
      capturedTexts: ['beurre'],
    });
  });

  it('migrates a version 1 database that has no inbox yet', async () => {
    const name = uniqueName();
    const v1 = await openDB(name, 1, {
      upgrade: (database) => database.createObjectStore('documents'),
    });
    v1.close();

    expect(await (await openStorage(name)).inboxes.load()).toEqual(emptyInbox());
  });

  it('keeps the dishes after the database is reopened', async () => {
    const name = uniqueName();
    const first = await openStorage(name);
    expect(await first.dishes.load()).toEqual([]);
    const omelette = {
      id: 'd',
      name: 'omelette',
      ingredients: [{ label: 'œufs', toCheck: false }],
    };
    await first.dishes.save([omelette]);
    first.close();

    expect(await (await openStorage(name)).dishes.load()).toEqual([omelette]);
  });
});
