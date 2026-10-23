import { describe, expect, it } from 'vitest';
import {
  addItem,
  addItems,
  checkedItems,
  clearChecked,
  emptyShoppingList,
  isInStore,
  itemsToBuy,
  itemsToCheck,
  removeItem,
  renameItem,
  setQuantity,
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
    const { list } = addItems(
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
        ).list,
      ),
    ).toEqual(['pain']);
  });

  const certain = (...labels: string[]) => labels.map((label) => ({ label, toCheck: false }));

  it('reports added items and items already listed, in the order validated', () => {
    const { added, alreadyListed } = addItems(
      listOf('petits pois', 'sel'),
      certain('petit pois', 'lait', 'Lait', 'sel'),
      at(1, () => 'new-item'),
    );

    expect(added).toEqual(['lait']);
    expect(alreadyListed).toEqual([{ label: 'petits pois' }, { label: 'sel' }]);
  });

  it('reports a taken item put back to buy as added', () => {
    const initial = listOf('lait');
    const taken = toggleItem(initial, find(initial, 'lait').id, 1);

    const { list, added, alreadyListed } = addItems(taken, certain('lait', 'lait'), at(2));

    expect(added).toEqual(['lait']);
    expect(alreadyListed).toEqual([]);
    expect(find(list, 'lait').checked).toBe(false);
  });

  it('reports an item to check made certain as already listed', () => {
    const initial = addItems(emptyShoppingList(), [{ label: 'compote', toCheck: true }], at(0));

    expect(addItems(initial.list, certain('compote'), at(1)).alreadyListed).toEqual([
      { label: 'compote' },
    ]);
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

  it('remembers when an item was taken, until it is unchecked', () => {
    const list = listOf('beurre');
    const id = find(list, 'beurre').id;

    const checked = toggleItem(list, id, 4);
    expect(find(checked, 'beurre').checkedAt).toBe(4);

    expect(find(toggleItem(checked, id, 6), 'beurre')).not.toHaveProperty('checkedAt');
  });
});

describe('moment of the shopping', () => {
  const minutes = (count: number) => count * 60_000;
  const taken = (list: ShoppingList, label: string, at: number) =>
    toggleItem(list, find(list, label).id, at);

  it('is preparing while no item is taken', () => {
    expect(isInStore(listOf('pain', 'lait'), 0)).toBe(false);
  });

  it('is in store once an item is taken', () => {
    expect(isInStore(taken(listOf('pain', 'lait'), 'pain', 0), minutes(1))).toBe(true);
  });

  it('does not count an item to check', () => {
    expect(isInStore(addedToCheck(listOf('pain'), 'compote'), 0)).toBe(false);
  });

  it('is preparing again once the last taken item is unchecked', () => {
    const shopping = taken(listOf('pain'), 'pain', 0);

    expect(isInStore(taken(shopping, 'pain', minutes(5)), minutes(5))).toBe(false);
  });

  it('is preparing again once taken items are cleared', () => {
    expect(isInStore(clearChecked(taken(listOf('pain', 'sel'), 'pain', 0)), minutes(5))).toBe(
      false,
    );
  });

  it('is preparing when the basket only holds items of a previous shopping', () => {
    expect(isInStore(taken(listOf('pain', 'lait'), 'pain', 0), minutes(120))).toBe(false);
  });

  it('counts the last taken item, not the first', () => {
    const shopping = taken(taken(listOf('pain', 'sel'), 'pain', 0), 'sel', minutes(110));

    expect(isInStore(shopping, minutes(120))).toBe(true);
  });

  it('ends the shopping an hour after the last taken item', () => {
    const shopping = taken(listOf('pain'), 'pain', 0);

    expect(isInStore(shopping, minutes(59))).toBe(true);
    expect(isInStore(shopping, minutes(60))).toBe(false);
  });

  it('reads an item taken before the time was recorded as taken long ago', () => {
    const legacy: ShoppingList = {
      items: listOf('pain').items.map((item) => ({ ...item, checked: true })),
    };

    expect(isInStore(legacy, 0)).toBe(false);
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
    const { list } = addItems(
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

describe('quantities', () => {
  const quantityOf = (list: ShoppingList, label: string) => find(list, label).quantity;
  const certain = (label: string, quantity?: number) =>
    quantity === undefined ? { label, toCheck: false } : { label, toCheck: false, quantity };

  it('reads the quantity of a label typed directly', () => {
    const list = added(emptyShoppingList(), '3 citrons');

    expect(labels(list)).toEqual(['citrons']);
    expect(quantityOf(list, 'citrons')).toBe(3);
  });

  it('keeps an item typed without quantity without one', () => {
    expect(quantityOf(added(emptyShoppingList(), 'lait'), 'lait')).toBeUndefined();
  });

  it('adds up the quantities of an item added again', () => {
    expect(quantityOf(added(added(emptyShoppingList(), '3 citrons'), '2 citrons'), 'citrons')).toBe(
      5,
    );
  });

  it('adds a written quantity to the 1 of an item without one', () => {
    expect(quantityOf(added(added(emptyShoppingList(), 'citrons'), '2 citrons'), 'citrons')).toBe(
      3,
    );
  });

  it('keeps the quantity of a duplicate added without a number', () => {
    expect(quantityOf(added(added(emptyShoppingList(), 'lait'), 'lait'), 'lait')).toBeUndefined();
  });

  it('keeps the quantity when the item is added again without one', () => {
    expect(quantityOf(added(added(emptyShoppingList(), '3 citrons'), 'citrons'), 'citrons')).toBe(
      3,
    );
  });

  it('puts a taken item back to buy with the quantity added only', () => {
    const initial = added(emptyShoppingList(), '3 citrons');
    const taken = toggleItem(initial, find(initial, 'citrons').id, 1);

    const list = added(taken, '2 citrons');

    expect(find(list, 'citrons').checked).toBe(false);
    expect(quantityOf(list, 'citrons')).toBe(2);
  });

  it('settles a doubt with the quantity of the certain item', () => {
    const doubtful = addItems(
      emptyShoppingList(),
      [{ label: 'citrons', toCheck: true, quantity: 3 }],
      at(0),
    );

    const { list } = addItems(doubtful.list, [certain('citrons', 2)], at(1));

    expect(find(list, 'citrons').toCheck).toBe(false);
    expect(quantityOf(list, 'citrons')).toBe(2);
  });

  it('leaves a certain item untouched by a doubt, quantity included', () => {
    const list = addItems(
      added(emptyShoppingList(), '3 citrons'),
      [{ label: 'citrons', toCheck: true, quantity: 2 }],
      at(1),
    ).list;

    expect(quantityOf(list, 'citrons')).toBe(3);
  });

  it('replaces the quantity with the one typed when renaming', () => {
    const initial = added(emptyShoppingList(), '3 citrons');

    const renamed = renameItem(initial, find(initial, 'citrons').id, '4 citrons', 2);

    expect(renamed.ok && quantityOf(renamed.value, 'citrons')).toBe(4);
  });

  it('keeps the quantity when renaming without one', () => {
    const initial = added(emptyShoppingList(), '3 citrons');

    const renamed = renameItem(initial, find(initial, 'citrons').id, 'citrons jaunes', 2);

    expect(renamed.ok && quantityOf(renamed.value, 'citrons jaunes')).toBe(3);
  });

  it('reports how the quantity of an item already listed changed, once per batch', () => {
    const { alreadyListed } = addItems(
      added(added(emptyShoppingList(), '3 citrons'), 'lait'),
      [certain('citrons', 2), certain('citrons', 1), certain('lait')],
      at(2),
    );

    expect(alreadyListed).toEqual([
      { label: 'citrons', quantity: { before: 3, after: 6 } },
      { label: 'lait' },
    ]);
  });

  it('reports the 1 of an item without quantity as where its quantity started', () => {
    const { alreadyListed } = addItems(
      added(emptyShoppingList(), 'lait'),
      [certain('lait', 2)],
      at(2),
    );

    expect(alreadyListed).toEqual([{ label: 'lait', quantity: { before: 1, after: 3 } }]);
  });

  it('sets the quantity of an item, or removes it', () => {
    const initial = added(emptyShoppingList(), 'lait');
    const id = find(initial, 'lait').id;

    expect(quantityOf(setQuantity(initial, id, 2, 1), 'lait')).toBe(2);
    expect(quantityOf(setQuantity(setQuantity(initial, id, 2, 1), id, undefined, 2), 'lait')).toBe(
      undefined,
    );
  });
});
