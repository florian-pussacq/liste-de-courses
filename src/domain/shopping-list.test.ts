import { describe, expect, it } from 'vitest';
import {
  addItem,
  addItems,
  checkedItems,
  clearChecked,
  emptyShoppingList,
  itemsToBuy,
  removeItem,
  renameItem,
  toggleItem,
  type ShoppingList,
} from './shopping-list';

function sequentialIds() {
  let next = 0;
  return () => `item-${++next}`;
}

const at = (now: number, newId = sequentialIds()) => ({ now, newId });

function listOf(...labels: string[]): ShoppingList {
  const context = at(0);
  return labels.reduce((list, label) => {
    const result = addItem(list, label, context);
    if (!result.ok) throw new Error(`Cannot build fixture with "${label}"`);
    return result.value;
  }, emptyShoppingList());
}

function added(list: ShoppingList, label: string, now = 1): ShoppingList {
  const result = addItem(
    list,
    label,
    at(now, () => `new-${label}`),
  );
  if (!result.ok) throw new Error(`Unexpected error ${result.error}`);
  return result.value;
}

const labels = (list: ShoppingList) => list.items.map((item) => item.label);
const find = (list: ShoppingList, label: string) => {
  const item = list.items.find((candidate) => candidate.label === label);
  if (!item) throw new Error(`No item "${label}"`);
  return item;
};

describe('adding an item', () => {
  it('adds an unchecked item with a stable identity and timestamps', () => {
    const list = added(emptyShoppingList(), 'café', 42);

    expect(list.items).toEqual([
      { id: 'new-café', label: 'café', checked: false, addedAt: 42, updatedAt: 42 },
    ]);
  });

  it('cleans surrounding and repeated whitespace from the label', () => {
    expect(labels(added(emptyShoppingList(), '  pommes   de terre '))).toEqual(['pommes de terre']);
  });

  it('refuses a blank label', () => {
    expect(addItem(emptyShoppingList(), '   ', at(1))).toEqual({ ok: false, error: 'empty-label' });
  });
});

describe('preventing duplicates', () => {
  it('keeps a single unchecked item when the same label is added again', () => {
    const list = added(listOf('Œufs'), 'oeufs');

    expect(list.items).toHaveLength(1);
    expect(find(list, 'Œufs').checked).toBe(false);
  });

  it('unchecks an already checked item instead of duplicating it', () => {
    const initial = listOf('lait');
    const checked = toggleItem(initial, find(initial, 'lait').id, 5);

    const list = added(checked, 'Lait', 9);

    expect(list.items).toHaveLength(1);
    expect(find(list, 'lait')).toMatchObject({ checked: false, updatedAt: 9 });
  });

  it('collapses duplicates added one after another', () => {
    expect(labels(added(added(emptyShoppingList(), 'pain'), 'Pain'))).toEqual(['pain']);
  });
});

describe('adding several items at once', () => {
  it('adds each label without duplicates', () => {
    const list = addItems(listOf('lait'), ['pain', 'Pain', 'LAIT'], at(1));

    expect(labels(list)).toEqual(['lait', 'pain']);
  });

  it('skips blank labels', () => {
    expect(labels(addItems(emptyShoppingList(), ['pain', ' '], at(1)))).toEqual(['pain']);
  });
});

describe('renaming an item', () => {
  it('replaces the label of the item', () => {
    const list = listOf('tomate');
    const result = renameItem(list, find(list, 'tomate').id, 'tomates cerises', 3);

    expect(result.ok && labels(result.value)).toEqual(['tomates cerises']);
    expect(result.ok && result.value.items[0]?.updatedAt).toBe(3);
  });

  it('refuses a label already used by another item', () => {
    const list = listOf('riz', 'pâtes');

    expect(renameItem(list, find(list, 'pâtes').id, 'Riz', 3)).toEqual({
      ok: false,
      error: 'duplicate-label',
    });
  });

  it('accepts a label that only changes the case of the same item', () => {
    const list = listOf('riz');
    const result = renameItem(list, find(list, 'riz').id, 'Riz', 3);

    expect(result.ok && labels(result.value)).toEqual(['Riz']);
  });

  it('refuses a blank label', () => {
    const list = listOf('riz');

    expect(renameItem(list, find(list, 'riz').id, ' ', 3)).toEqual({
      ok: false,
      error: 'empty-label',
    });
  });

  it('reports an unknown item', () => {
    expect(renameItem(listOf('riz'), 'unknown', 'pâtes', 3)).toEqual({
      ok: false,
      error: 'item-not-found',
    });
  });
});

describe('removing an item', () => {
  it('removes the item from the list', () => {
    const list = listOf('sucre', 'sel');

    expect(labels(removeItem(list, find(list, 'sucre').id))).toEqual(['sel']);
  });
});

describe('checking items while shopping', () => {
  it('checks then unchecks an item', () => {
    const list = listOf('beurre');
    const id = find(list, 'beurre').id;

    const checked = toggleItem(list, id, 4);
    expect(find(checked, 'beurre')).toMatchObject({ checked: true, updatedAt: 4 });

    const unchecked = toggleItem(checked, id, 6);
    expect(find(unchecked, 'beurre')).toMatchObject({ checked: false, updatedAt: 6 });
  });
});

describe('clearing checked items', () => {
  it('removes checked items and keeps the others', () => {
    const list = listOf('pain', 'sel');
    const shopped = toggleItem(list, find(list, 'pain').id, 2);

    expect(labels(clearChecked(shopped))).toEqual(['sel']);
  });
});

describe('display order', () => {
  it('lists items to buy in the order they were added', () => {
    expect(
      itemsToBuy(added(added(emptyShoppingList(), 'pain'), 'lait')).map((i) => i.label),
    ).toEqual(['pain', 'lait']);
  });

  it('separates checked items from the items still to buy', () => {
    const list = listOf('pain', 'beurre', 'lait');
    const shopped = toggleItem(list, find(list, 'beurre').id, 2);

    expect(itemsToBuy(shopped).map((i) => i.label)).toEqual(['pain', 'lait']);
    expect(checkedItems(shopped).map((i) => i.label)).toEqual(['beurre']);
  });

  it('puts an unchecked item back at its original place among the items to buy', () => {
    const list = listOf('pain', 'beurre', 'lait');
    const id = find(list, 'beurre').id;

    const back = toggleItem(toggleItem(list, id, 2), id, 3);

    expect(itemsToBuy(back).map((i) => i.label)).toEqual(['pain', 'beurre', 'lait']);
  });
});
