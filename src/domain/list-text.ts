import { itemsToBuy, itemsToCheck, type ShoppingList } from './shopping-list';

// The text must read back through `splitIntoEntries` unchanged: no title, no bullets.
export function listAsText(list: ShoppingList): string {
  return [
    ...itemsToBuy(list).map((item) => withInitialCapital(item.label)),
    ...itemsToCheck(list).map((item) => `${withInitialCapital(item.label)} ?`),
  ].join('\n');
}

const withInitialCapital = (label: string) => label.charAt(0).toUpperCase() + label.slice(1);
