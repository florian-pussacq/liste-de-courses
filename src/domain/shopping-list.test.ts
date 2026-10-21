import { describe, expect, it } from 'vitest';
import {
  addItem,
  addItems,
  checkedItems,
  clearChecked,
  emptyShoppingList,
  itemsToBuy,
  itemsToCheck,
  removeItem,
  renameItem,
  setToCheck,
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

function added(list: ShoppingList, label: string, now = 1, toCheck = false): ShoppingList {
  const result = addItem(
    list,
    label,
    at(now, () => `new-${label}`),
    toCheck,
  );
  if (!result.ok) throw new Error(`Unexpected error ${result.error}`);
  return result.value;
}

const addedToCheck = (list: ShoppingList, label: string, now = 1) => added(list, label, now, true);
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
      {
        id: 'new-café',
        label: 'café',
        checked: false,
        toCheck: false,
        addedAt: 42,
        updatedAt: 42,
      },
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

  it('keeps the existing label when the same item is added in the singular', () => {
    const list = added(listOf('petits pois'), 'petit pois');

    expect(list.items.map((item) => item.label)).toEqual(['petits pois']);
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
    const list = addItems(
      listOf('lait'),
      ['pain', 'Pain', 'LAIT'].map((label) => ({ label, toCheck: false })),
      at(1),
    );

    expect(labels(list)).toEqual(['lait', 'pain']);
  });

  it('skips blank labels', () => {
    expect(
      labels(
        addItems(
          emptyShoppingList(),
          [
            { label: 'pain', toCheck: false },
            { label: ' ', toCheck: false },
          ],
          at(1),
        ),
      ),
    ).toEqual(['pain']);
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

describe('items to check', () => {
  const stateOf = (list: ShoppingList, label: string) => {
    const item = find(list, label);
    return item.checked ? 'taken' : item.toCheck ? 'to-check' : 'to-buy';
  };

  it('adds an item to check apart from the items to buy', () => {
    const list = addedToCheck(listOf('riz'), 'compote');

    expect(itemsToCheck(list).map((item) => item.label)).toEqual(['compote']);
    expect(itemsToBuy(list).map((item) => item.label)).toEqual(['riz']);
  });

  it('makes an item to check certain when it is added as certain', () => {
    const list = added(addedToCheck(emptyShoppingList(), 'compote'), 'Compote', 5);

    expect(list.items).toHaveLength(1);
    expect(stateOf(list, 'compote')).toBe('to-buy');
    expect(find(list, 'compote').updatedAt).toBe(5);
  });

  it('keeps an item to check when the same doubt arrives again', () => {
    const list = addedToCheck(addedToCheck(emptyShoppingList(), 'compote'), 'compote');

    expect(list.items).toHaveLength(1);
    expect(stateOf(list, 'compote')).toBe('to-check');
  });

  it('does not turn an item to buy into a doubt', () => {
    expect(stateOf(addedToCheck(listOf('riz'), 'riz'), 'riz')).toBe('to-buy');
  });

  it('does not touch a taken item when a doubt arrives', () => {
    const initial = listOf('lait');
    const taken = toggleItem(initial, find(initial, 'lait').id, 2);

    expect(stateOf(addedToCheck(taken, 'lait'), 'lait')).toBe('taken');
  });

  it('resolves a doubt into an item to buy, at its place in the order of addition', () => {
    const list = addedToCheck(listOf('pain'), 'compote');
    const withLait = added(list, 'lait');

    const needed = setToCheck(withLait, find(withLait, 'compote').id, false, 7);

    expect(itemsToBuy(needed).map((item) => item.label)).toEqual(['pain', 'compote', 'lait']);
    expect(find(needed, 'compote').updatedAt).toBe(7);
  });

  it('marks an item to buy as to check', () => {
    const list = listOf('farine');

    expect(stateOf(setToCheck(list, find(list, 'farine').id, true, 3), 'farine')).toBe('to-check');
  });

  it('adds several entries keeping their state', () => {
    const list = addItems(
      emptyShoppingList(),
      [
        { label: 'riz', toCheck: false },
        { label: 'compote', toCheck: true },
      ],
      at(1),
    );

    expect([stateOf(list, 'riz'), stateOf(list, 'compote')]).toEqual(['to-buy', 'to-check']);
  });
});
