import type { Inbox } from '../domain/inbox';
import type { ShoppingList } from '../domain/shopping-list';

export interface ShoppingListRepository {
  load(): Promise<ShoppingList>;
  save(list: ShoppingList): Promise<void>;
}

export interface InboxRepository {
  load(): Promise<Inbox>;
  save(inbox: Inbox): Promise<void>;
}

export interface Dependencies {
  readonly shoppingLists: ShoppingListRepository;
  readonly inboxes: InboxRepository;
  readonly now: () => number;
  readonly newId: () => string;
}
