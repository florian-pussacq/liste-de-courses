import { labelKey } from './label';
import type { Quantity } from './quantity';
import type { Item, ItemId } from './shopping-list';

// A copy of what was taken: renaming or removing the item later does not rewrite the past.
export interface Purchase {
  readonly itemId: ItemId;
  readonly label: string;
  readonly quantity?: Quantity;
  readonly takenAt: number;
}

// Purchases in the order they were taken.
export interface PurchaseHistory {
  readonly purchases: readonly Purchase[];
}

// A local calendar day, "YYYY-MM-DD".
export type Day = string;

export interface PurchaseDay {
  readonly day: Day;
  readonly purchases: readonly Purchase[];
}

export const emptyPurchaseHistory = (): PurchaseHistory => ({ purchases: [] });

export function recordPurchase(
  history: PurchaseHistory,
  { id, label, quantity }: Item,
  takenAt: number,
): PurchaseHistory {
  const purchase: Purchase = {
    itemId: id,
    label,
    ...(quantity !== undefined && { quantity }),
    takenAt,
  };
  return { purchases: [...history.purchases, purchase] };
}

// Unchecking an item takes back its last check, the only one it can be about.
export function cancelPurchase(history: PurchaseHistory, itemId: ItemId): PurchaseHistory {
  const index = history.purchases.findLastIndex((purchase) => purchase.itemId === itemId);
  if (index === -1) return history;
  return { purchases: history.purchases.filter((_, position) => position !== index) };
}

export function purchasesByDay(history: PurchaseHistory): PurchaseDay[] {
  const days = new Map<Day, Purchase[]>();
  for (const purchase of history.purchases) {
    const day = dayOf(purchase.takenAt);
    days.set(day, [...(days.get(day) ?? []), purchase]);
  }
  return [...days]
    .map(([day, purchases]) => ({ day, purchases }))
    .sort((a, b) => b.day.localeCompare(a.day));
}

function dayOf(time: number): Day {
  const date = new Date(time);
  const twoDigits = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}-${twoDigits(date.getDate())}`;
}

// What the history knows about one item, all its purchases taken together.
export interface PurchasedArticle {
  readonly label: string;
  readonly purchaseCount: number;
  readonly lastTakenAt: number;
  readonly lastQuantity?: Quantity;
}

const MIN_QUERY_LENGTH = 2;

// The same rule as duplicates decides what is one item: "tomate" finds "Tomates cerises".
// Too short a query is no search at all, which differs from a search finding nothing.
export function searchPurchases(
  history: PurchaseHistory,
  query: string,
): PurchasedArticle[] | undefined {
  const key = labelKey(query);
  if (key.length < MIN_QUERY_LENGTH) return undefined;
  const articles = new Map<string, PurchasedArticle>();
  for (const { label, quantity, takenAt } of history.purchases) {
    const articleKey = labelKey(label);
    if (!articleKey.includes(key)) continue;
    const known = articles.get(articleKey);
    articles.set(articleKey, {
      label,
      purchaseCount: (known?.purchaseCount ?? 0) + 1,
      lastTakenAt: takenAt,
      ...(quantity !== undefined && { lastQuantity: quantity }),
    });
  }
  return [...articles.values()].sort((a, b) => b.lastTakenAt - a.lastTakenAt);
}
