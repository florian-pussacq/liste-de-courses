import { describe, expect, it } from 'vitest';
import { splitIntoEntries } from './captured-text';
import { listAsText } from './list-text';
import { addItems, emptyShoppingList, toggleItem, type ShoppingList } from './shopping-list';

function sampleList(): ShoppingList {
  let next = 0;
  const list = addItems(
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
    expect(listAsText(sampleList())).toBe('pain\nlait\ncompote ?');
  });

  it('reads back as the same entries', () => {
    expect(splitIntoEntries(listAsText(sampleList()))).toEqual([
      { label: 'pain', toCheck: false },
      { label: 'lait', toCheck: false },
      { label: 'compote', toCheck: true },
    ]);
  });

  it('is empty when nothing is left to send', () => {
    expect(listAsText(emptyShoppingList())).toBe('');
  });
});
