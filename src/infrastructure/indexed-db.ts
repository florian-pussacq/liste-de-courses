import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { InboxRepository, ShoppingListRepository } from '../application/ports';
import { emptyInbox, type Inbox } from '../domain/inbox';
import { emptyShoppingList, type ShoppingList } from '../domain/shopping-list';

// Bump the version and migrate in `upgrade` whenever the stored shape changes.
const SCHEMA_VERSION = 1;
const DOCUMENTS = 'documents';

interface Documents {
  'shopping-list': ShoppingList;
  inbox: Inbox;
}

interface Schema extends DBSchema {
  [DOCUMENTS]: { key: keyof Documents; value: Documents[keyof Documents] };
}

export interface Storage {
  readonly shoppingLists: ShoppingListRepository;
  readonly inboxes: InboxRepository;
  close(): void;
}

export async function openStorage(name = 'liste-de-courses'): Promise<Storage> {
  const db = await openDB<Schema>(name, SCHEMA_VERSION, {
    upgrade(database) {
      database.createObjectStore(DOCUMENTS);
    },
  });

  return {
    shoppingLists: documentRepository(db, 'shopping-list', emptyShoppingList),
    inboxes: documentRepository(db, 'inbox', emptyInbox),
    close: () => db.close(),
  };
}

function documentRepository<K extends keyof Documents>(
  db: IDBPDatabase<Schema>,
  key: K,
  empty: () => Documents[K],
) {
  return {
    async load(): Promise<Documents[K]> {
      return ((await db.get(DOCUMENTS, key)) as Documents[K] | undefined) ?? empty();
    },
    async save(document: Documents[K]): Promise<void> {
      await db.put(DOCUMENTS, document, key);
    },
  };
}
