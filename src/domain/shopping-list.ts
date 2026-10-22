import type { Entry } from './captured-text';
import { cleanLabel, labelKey } from './label';
import { failure, success, type Result } from './result';

export type ItemId = string;

export interface Item {
  readonly id: ItemId;
  readonly label: string;
  readonly checked: boolean;
  readonly toCheck: boolean;
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
  toCheck = false,
): Result<ShoppingList, AddItemError> {
  const label = cleanLabel(rawLabel);
  if (label === '') return failure('empty-label');

  const existing = findByLabel(list, label);
  if (!existing) {
    const item: Item = {
      id: newId(),
      label,
      checked: false,
      toCheck,
      addedAt: now,
      updatedAt: now,
    };
    return success({ items: [...list.items, item] });
  }
  // A doubt never overrides what is already known; a certain item settles a doubt or a taken item.
  if (toCheck) return success(list);
  if (existing.checked)
    return success(updateItem(list, existing.id, { checked: false, updatedAt: now }));
  if (existing.toCheck)
    return success(updateItem(list, existing.id, { toCheck: false, updatedAt: now }));
  return success(list);
}

export interface BatchAddition {
  readonly list: ShoppingList;
  // Labels as they appear in the list, each item reported once, in the order of the batch.
  readonly added: readonly string[];
  readonly alreadyListed: readonly string[];
}

// Blank labels carry no item, so a batch simply skips them. A taken item put back to buy
// counts as added: for the shopping, it is on the list again.
export function addItems(
  list: ShoppingList,
  entries: readonly Entry[],
  context: AddContext,
): BatchAddition {
  let current = list;
  const added: string[] = [];
  const alreadyListed: string[] = [];
  const reported = new Set<ItemId>();
  for (const { label, toCheck } of entries) {
    const result = addItem(current, label, context, toCheck);
    if (!result.ok) continue;
    const before = findByLabel(current, label);
    current = result.value;
    const item = findByLabel(current, label);
    if (!item || reported.has(item.id)) continue;
    reported.add(item.id);
    const putBack = before?.checked === true && !item.checked;
    (before && !putBack ? alreadyListed : added).push(item.label);
  }
  return { list: current, added, alreadyListed };
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

export function setToCheck(
  list: ShoppingList,
  id: ItemId,
  toCheck: boolean,
  now: number,
): ShoppingList {
  return updateItem(list, id, { toCheck, updatedAt: now });
}

export function clearChecked(list: ShoppingList): ShoppingList {
  return { items: list.items.filter((item) => !item.checked) };
}

export const itemsToBuy = (list: ShoppingList): readonly Item[] =>
  list.items.filter((item) => !item.checked && !item.toCheck);

export const itemsToCheck = (list: ShoppingList): readonly Item[] =>
  list.items.filter((item) => !item.checked && item.toCheck);

export const checkedItems = (list: ShoppingList): readonly Item[] =>
  list.items.filter((item) => item.checked);

function findByLabel(list: ShoppingList, label: string): Item | undefined {
  const key = labelKey(label);
  return list.items.find((item) => labelKey(item.label) === key);
}

function updateItem(
  list: ShoppingList,
  id: ItemId,
  changes: Partial<Pick<Item, 'label' | 'checked' | 'toCheck' | 'updatedAt'>>,
): ShoppingList {
  return { items: list.items.map((item) => (item.id === id ? { ...item, ...changes } : item)) };
}
