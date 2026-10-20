import { openDB, type DBSchema, type IDBPDatabase, type IDBPTransaction } from 'idb';
import type { InboxRepository, ShoppingListRepository } from '../application/ports';
import { emptyInbox, type Inbox } from '../domain/inbox';
import { emptyShoppingList, type ShoppingList } from '../domain/shopping-list';

// Bump the version and migrate in `upgrade` whenever the stored shape changes.
const SCHEMA_VERSION = 2;
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
    async upgrade(database, oldVersion, _newVersion, transaction) {
      if (oldVersion < 1) database.createObjectStore(DOCUMENTS);
      if (oldVersion < 2) await migrateInboxToVersion2(transaction);
    },
  });

  return {
    shoppingLists: documentRepository(db, 'shopping-list', emptyShoppingList),
    inboxes: documentRepository(db, 'inbox', emptyInbox),
    close: () => db.close(),
  };
}

interface InboxVersion1 {
  readonly proposals: readonly { readonly id: string; readonly label: string }[];
}

// Version 2 lets proposals be discarded reversibly and remembers the captured texts.
async function migrateInboxToVersion2(
  transaction: IDBPTransaction<Schema, (typeof DOCUMENTS)[], 'versionchange'>,
): Promise<void> {
  const store = transaction.objectStore(DOCUMENTS);
  const stored = (await store.get('inbox')) as InboxVersion1 | undefined;
  if (!stored) return;
  const migrated: Inbox = {
    proposals: stored.proposals.map((proposal) => ({ ...proposal, discarded: false })),
    capturedTexts: [],
  };
  await store.put(migrated, 'inbox');
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
