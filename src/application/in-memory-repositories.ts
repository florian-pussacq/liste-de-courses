import { emptyInbox, type Inbox } from '../domain/inbox';
import { emptyShoppingList, type ShoppingList } from '../domain/shopping-list';
import type { InboxRepository, ShoppingListRepository } from './ports';

export class InMemoryShoppingListRepository implements ShoppingListRepository {
  constructor(private list: ShoppingList = emptyShoppingList()) {}

  async load(): Promise<ShoppingList> {
    return this.list;
  }

  async save(list: ShoppingList): Promise<void> {
    this.list = list;
  }
}

export class InMemoryInboxRepository implements InboxRepository {
  constructor(private inbox: Inbox = emptyInbox()) {}

  async load(): Promise<Inbox> {
    return this.inbox;
  }

  async save(inbox: Inbox): Promise<void> {
    this.inbox = inbox;
  }
}
