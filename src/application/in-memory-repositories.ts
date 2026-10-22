import type { Dish } from '../domain/dish';
import { emptyInbox, type Inbox } from '../domain/inbox';
import { emptyPurchaseHistory, type PurchaseHistory } from '../domain/purchase-history';
import { emptyShoppingList, type ShoppingList } from '../domain/shopping-list';
import type {
  DishRepository,
  InboxRepository,
  PurchaseHistoryRepository,
  ShoppingListRepository,
} from './ports';

class InMemoryDocument<T> {
  constructor(private document: T) {}

  async load(): Promise<T> {
    return this.document;
  }

  async save(document: T): Promise<void> {
    this.document = document;
  }
}

export class InMemoryShoppingListRepository
  extends InMemoryDocument<ShoppingList>
  implements ShoppingListRepository
{
  constructor(list: ShoppingList = emptyShoppingList()) {
    super(list);
  }
}

export class InMemoryInboxRepository extends InMemoryDocument<Inbox> implements InboxRepository {
  constructor(inbox: Inbox = emptyInbox()) {
    super(inbox);
  }
}

export class InMemoryDishRepository
  extends InMemoryDocument<readonly Dish[]>
  implements DishRepository
{
  constructor(dishes: readonly Dish[] = []) {
    super(dishes);
  }
}

export class InMemoryPurchaseHistoryRepository
  extends InMemoryDocument<PurchaseHistory>
  implements PurchaseHistoryRepository
{
  constructor(history: PurchaseHistory = emptyPurchaseHistory()) {
    super(history);
  }
}
