import { cleanLabel, labelKey } from './label';
import { failure, success, type Result } from './result';

export type ItemId = string;

export interface Item {
  readonly id: ItemId;
  readonly label: string;
  readonly checked: boolean;
  readonly addedAt: number;
  readonly updatedAt: number;
}

// Items are kept in the order they were added to the list.
export interface ShoppingList {
  readonly items: readonly Item[];
}

export interface AddContext {
  readonly now: number;
  readonly newId: () => ItemId;
}

export type AddItemError = 'empty-label';
export type RenameItemError = 'empty-label' | 'duplicate-label' | 'item-not-found';

export const emptyShoppingList = (): ShoppingList => ({ items: [] });

export function addItem(
  list: ShoppingList,
  rawLabel: string,
  { now, newId }: AddContext,
): Result<ShoppingList, AddItemError> {
  const label = cleanLabel(rawLabel);
  if (label === '') return failure('empty-label');

  const existing = findByLabel(list, label);
  if (!existing) {
    const item: Item = { id: newId(), label, checked: false, addedAt: now, updatedAt: now };
    return success({ items: [...list.items, item] });
  }
  if (!existing.checked) return success(list);
  return success(updateItem(list, existing.id, { checked: false, updatedAt: now }));
}

export function renameItem(
  list: ShoppingList,
  id: ItemId,
  rawLabel: string,
  now: number,
): Result<ShoppingList, RenameItemError> {
  const label = cleanLabel(rawLabel);
  if (label === '') return failure('empty-label');
  if (!list.items.some((item) => item.id === id)) return failure('item-not-found');

  const homonym = findByLabel(list, label);
  if (homonym && homonym.id !== id) return failure('duplicate-label');

  return success(updateItem(list, id, { label, updatedAt: now }));
}

export function removeItem(list: ShoppingList, id: ItemId): ShoppingList {
  return { items: list.items.filter((item) => item.id !== id) };
}

export function toggleItem(list: ShoppingList, id: ItemId, now: number): ShoppingList {
  return {
    items: list.items.map((item) =>
      item.id === id ? { ...item, checked: !item.checked, updatedAt: now } : item,
    ),
  };
}

export function clearChecked(list: ShoppingList): ShoppingList {
  return { items: list.items.filter((item) => !item.checked) };
}

export const itemsToBuy = (list: ShoppingList): readonly Item[] =>
  list.items.filter((item) => !item.checked);

export const checkedItems = (list: ShoppingList): readonly Item[] =>
  list.items.filter((item) => item.checked);

function findByLabel(list: ShoppingList, label: string): Item | undefined {
  const key = labelKey(label);
  return list.items.find((item) => labelKey(item.label) === key);
}

function updateItem(
  list: ShoppingList,
  id: ItemId,
  changes: Partial<Pick<Item, 'label' | 'checked' | 'updatedAt'>>,
): ShoppingList {
  return { items: list.items.map((item) => (item.id === id ? { ...item, ...changes } : item)) };
}
