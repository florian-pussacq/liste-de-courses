import type { Dish } from '../domain/dish';
import type { Inbox } from '../domain/inbox';
import type { PurchaseHistory } from '../domain/purchase-history';
import type { ShoppingList } from '../domain/shopping-list';

export interface ShoppingListRepository {
  load(): Promise<ShoppingList>;
  save(list: ShoppingList): Promise<void>;
}

export interface InboxRepository {
  load(): Promise<Inbox>;
  save(inbox: Inbox): Promise<void>;
}

export interface DishRepository {
  load(): Promise<readonly Dish[]>;
  save(dishes: readonly Dish[]): Promise<void>;
}

export interface PurchaseHistoryRepository {
  load(): Promise<PurchaseHistory>;
  save(history: PurchaseHistory): Promise<void>;
}

export type ClipboardContent =
  | { readonly kind: 'text'; readonly text: string }
  | { readonly kind: 'empty' }
  | { readonly kind: 'unavailable' };

export type SendOutcome = 'shared' | 'copied' | 'cancelled' | 'unavailable';

export interface Dependencies {
  readonly shoppingLists: ShoppingListRepository;
  readonly inboxes: InboxRepository;
  readonly dishes: DishRepository;
  readonly purchases: PurchaseHistoryRepository;
  readonly now: () => number;
  readonly newId: () => string;
  readonly readClipboard: () => Promise<ClipboardContent>;
  readonly sendText: (text: string) => Promise<SendOutcome>;
}
