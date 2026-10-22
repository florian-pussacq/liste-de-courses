import type { Entry } from './captured-text';
import { cleanLabel, labelKey } from './label';
import { addQuantities, quantityOf, readQuantity, withQuantity, type Quantity } from './quantity';
import { failure, success, type Result } from './result';

export type ItemId = string;

export interface Item {
  readonly id: ItemId;
  readonly label: string;
  readonly checked: boolean;
  readonly toCheck: boolean;
  readonly quantity?: Quantity;
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
  context: AddContext,
  toCheck = false,
): Result<ShoppingList, AddItemError> {
  const { label, quantity } = readQuantity(rawLabel);
  return addEntry(list, withQuantity<Entry>({ label, toCheck }, quantity), context);
}

function addEntry(
  list: ShoppingList,
  entry: Entry,
  { now, newId }: AddContext,
): Result<ShoppingList, AddItemError> {
  const label = cleanLabel(entry.label);
  if (label === '') return failure('empty-label');

  const existing = findByLabel(list, label);
  if (!existing) {
    const item: Item = {
      id: newId(),
      label,
      checked: false,
      toCheck: entry.toCheck,
      addedAt: now,
      updatedAt: now,
    };
    return success({ items: [...list.items, withQuantity(item, entry.quantity)] });
  }
  // A doubt never overrides what is already known; a certain item settles a doubt or a taken item,
  // and brings its own quantity: the taken ones are already in the basket, the doubtful ones unsure.
  if (entry.toCheck) return success(list);
  if (existing.checked || existing.toCheck) {
    return success(
      updateItem(list, existing.id, (item) =>
        withQuantity({ ...item, checked: false, toCheck: false, updatedAt: now }, entry.quantity),
      ),
    );
  }
  const quantity = addQuantities(existing.quantity, entry.quantity);
  if (quantity === existing.quantity) return success(list);
  return success(
    updateItem(list, existing.id, (item) => withQuantity({ ...item, updatedAt: now }, quantity)),
  );
}

export interface ListedAgain {
  readonly label: string;
  // Present only when the batch changed the quantity of the item.
  readonly quantity?: { readonly before: Quantity; readonly after: Quantity };
}

export interface BatchAddition {
  readonly list: ShoppingList;
  // Each item reported once, as it stands after the whole batch, in the order of the batch.
  readonly added: readonly string[];
  readonly alreadyListed: readonly ListedAgain[];
}

// Blank labels carry no item, so a batch simply skips them. A taken item put back to buy
// counts as added: for the shopping, it is on the list again.
export function addItems(
  list: ShoppingList,
  entries: readonly Entry[],
  context: AddContext,
): BatchAddition {
  let current = list;
  const beforeBatch = new Map<ItemId, Item | undefined>();
  for (const entry of entries) {
    const result = addEntry(current, entry, context);
    if (!result.ok) continue;
    const before = findByLabel(current, entry.label);
    current = result.value;
    const item = findByLabel(current, entry.label);
    if (item && !beforeBatch.has(item.id)) beforeBatch.set(item.id, before);
  }
  const added: string[] = [];
  const alreadyListed: ListedAgain[] = [];
  for (const [id, before] of beforeBatch) {
    const item = current.items.find((candidate) => candidate.id === id);
    if (!item) continue;
    const putBack = before?.checked === true && !item.checked;
    if (!before || putBack) added.push(item.label);
    else alreadyListed.push(listedAgain(before, item));
  }
  return { list: current, added, alreadyListed };
}

function listedAgain(before: Item, { label, quantity }: Item): ListedAgain {
  const [previous, current] = [quantityOf(before.quantity), quantityOf(quantity)];
  if (current === previous) return { label };
  return { label, quantity: { before: previous, after: current } };
}

export function renameItem(
  list: ShoppingList,
  id: ItemId,
  rawLabel: string,
  now: number,
): Result<ShoppingList, RenameItemError> {
  const { label, quantity } = readQuantity(rawLabel);
  if (label === '') return failure('empty-label');
  const item = list.items.find((candidate) => candidate.id === id);
  if (!item) return failure('item-not-found');

  const homonym = findByLabel(list, label);
  if (homonym && homonym.id !== id) return failure('duplicate-label');

  return success(
    updateItem(list, id, (current) =>
      withQuantity({ ...current, label, updatedAt: now }, quantity ?? current.quantity),
    ),
  );
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
  return updateItem(list, id, (item) => ({ ...item, toCheck, updatedAt: now }));
}

export function setQuantity(
  list: ShoppingList,
  id: ItemId,
  quantity: Quantity | undefined,
  now: number,
): ShoppingList {
  return updateItem(list, id, (item) => withQuantity({ ...item, updatedAt: now }, quantity));
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

export const isInStore = (list: ShoppingList): boolean => list.items.some((item) => item.checked);

function findByLabel(list: ShoppingList, label: string): Item | undefined {
  const key = labelKey(label);
  return list.items.find((item) => labelKey(item.label) === key);
}

function updateItem(list: ShoppingList, id: ItemId, update: (item: Item) => Item): ShoppingList {
  return { items: list.items.map((item) => (item.id === id ? update(item) : item)) };
}
