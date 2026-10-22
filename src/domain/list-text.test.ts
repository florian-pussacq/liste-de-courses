import { describe, expect, it } from 'vitest';
import { splitIntoEntries } from './captured-text';
import { labelKey } from './label';
import { listAsText } from './list-text';
import { addItems, emptyShoppingList, toggleItem, type ShoppingList } from './shopping-list';

function sampleList(): ShoppingList {
  let next = 0;
  const { list } = addItems(
    emptyShoppingList(),
    [
      { label: 'pain', toCheck: false },
      { label: 'compote', toCheck: true },
      { label: 'sel', toCheck: false },
      { label: 'lait', toCheck: false },
    ],
    { now: 0, newId: () => `item-${++next}` },
  );
  const salt = list.items.find((item) => item.label === 'sel');
  if (!salt) throw new Error('Missing fixture');
  return toggleItem(list, salt.id, 1);
}

describe('listAsText', () => {
  it('lists items to buy, then items to check followed by a question mark, without taken items', () => {
    expect(listAsText(sampleList())).toBe('Pain\nLait\nCompote ?');
  });

  it('reads back as the same entries', () => {
    const readBack = splitIntoEntries(listAsText(sampleList()));

    expect(readBack.map(({ label, toCheck }) => [labelKey(label), toCheck])).toEqual([
      [labelKey('pain'), false],
      [labelKey('lait'), false],
      [labelKey('compote'), true],
    ]);
  });

  it('keeps the rest of each label as written', () => {
    const { list } = addItems(emptyShoppingList(), [{ label: 'œufs de ferme', toCheck: false }], {
      now: 0,
      newId: () => 'item',
    });

    expect(listAsText(list)).toBe('Œufs de ferme');
  });

  it('is empty when nothing is left to send', () => {
    expect(listAsText(emptyShoppingList())).toBe('');
  });
});

function sequentialIds() {
  let next = 0;
  return () => `item-${++next}`;
}

describe('listAsText with quantities', () => {
  const list = () =>
    addItems(
      emptyShoppingList(),
      [
        { label: 'citrons', toCheck: false, quantity: 3 },
        { label: 'lait', toCheck: false },
        { label: 'œufs', toCheck: true, quantity: 6 },
      ],
      { now: 0, newId: sequentialIds() },
    ).list;

  it('writes the quantity before the label', () => {
    expect(listAsText(list())).toBe('3 citrons\nLait\n6 œufs ?');
  });

  it('reads back with the same quantities', () => {
    expect(splitIntoEntries(listAsText(list()))).toEqual([
      { label: 'citrons', toCheck: false, quantity: 3 },
      { label: 'Lait', toCheck: false },
      { label: 'œufs', toCheck: true, quantity: 6 },
    ]);
  });
});
