import { quantityOf } from './quantity';
import { itemsToBuy, itemsToCheck, type Item, type ShoppingList } from './shopping-list';

// The text must read back through `splitIntoEntries` unchanged: no title, no bullets.
export function listAsText(list: ShoppingList): string {
  return [
    ...itemsToBuy(list).map(line),
    ...itemsToCheck(list).map((item) => `${line(item)} ?`),
  ].join('\n');
}

// The quantity comes first, as written by hand ("3 citrons"), and reads back as a quantity.
// A quantity of 1 goes without saying, as on a list written by hand.
const line = ({ label, quantity }: Item) =>
  withInitialCapital(quantityOf(quantity) > 1 ? `${quantity} ${label}` : label);

const withInitialCapital = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
