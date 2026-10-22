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
