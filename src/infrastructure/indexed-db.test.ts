import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { emptyInbox, type Inbox } from '../domain/inbox';
import { emptyShoppingList, type ShoppingList } from '../domain/shopping-list';
import { openStorage } from './indexed-db';

let databaseCount = 0;
const uniqueName = () => `test-${++databaseCount}`;

const list: ShoppingList = {
  items: [
    { id: 'a', label: 'pain', checked: true, addedAt: 1, updatedAt: 2 },
    { id: 'b', label: 'lait', checked: false, addedAt: 3, updatedAt: 3 },
  ],
};

const inbox: Inbox = {
  proposals: [{ id: 'p', label: 'beurre', discarded: false }],
  capturedTexts: ['beurre'],
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
});
