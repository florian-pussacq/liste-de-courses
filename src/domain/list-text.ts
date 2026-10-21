import { itemsToBuy, itemsToCheck, type ShoppingList } from './shopping-list';

// The text must read back through `splitIntoEntries` unchanged: no title, no bullets.
export function listAsText(list: ShoppingList): string {
  return [
    ...itemsToBuy(list).map((item) => item.label),
    ...itemsToCheck(list).map((item) => `${item.label} ?`),
  ].join('\n');
}
