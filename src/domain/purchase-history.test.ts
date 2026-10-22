import { describe, expect, it } from 'vitest';
import {
  cancelPurchase,
  emptyPurchaseHistory,
  purchasesByDay,
  recordPurchase,
  searchPurchases,
  type PurchaseHistory,
} from './purchase-history';
import type { Item } from './shopping-list';

const item = (id: string, label: string, quantity?: number): Item => ({
  id,
  label,
  checked: true,
  toCheck: false,
  addedAt: 0,
  updatedAt: 0,
  ...(quantity !== undefined && { quantity }),
});

const monday = (hour: number) => new Date(2026, 9, 19, hour).getTime();
const tuesday = (hour: number) => new Date(2026, 9, 20, hour).getTime();
const thursday = (hour: number) => new Date(2026, 9, 22, hour).getTime();

const record = (history: PurchaseHistory, ...purchases: [Item, number][]) =>
  purchases.reduce((current, [bought, at]) => recordPurchase(current, bought, at), history);

describe('recording purchases', () => {
  it('records the label, the quantity and the time of a taken item', () => {
    expect(record(emptyPurchaseHistory(), [item('i1', 'citrons', 3), tuesday(10)])).toEqual({
      purchases: [{ itemId: 'i1', label: 'citrons', quantity: 3, takenAt: tuesday(10) }],
    });
  });

  it('records an item bought again as another purchase', () => {
    const history = record(
      emptyPurchaseHistory(),
      [item('i1', 'lait'), monday(10)],
      [item('i1', 'lait'), thursday(10)],
    );

    expect(history.purchases.map(({ takenAt }) => takenAt)).toEqual([monday(10), thursday(10)]);
  });

  it('cancels the last purchase of an item unchecked', () => {
    const history = record(
      emptyPurchaseHistory(),
      [item('i1', 'lait'), monday(10)],
      [item('i2', 'beurre'), thursday(9)],
      [item('i1', 'lait'), thursday(10)],
    );

    expect(
      cancelPurchase(history, 'i1').purchases.map(({ label, takenAt }) => [label, takenAt]),
    ).toEqual([
      ['lait', monday(10)],
      ['beurre', thursday(9)],
    ]);
  });

  it('leaves the history alone when the item has no purchase', () => {
    const history = record(emptyPurchaseHistory(), [item('i1', 'lait'), monday(10)]);

    expect(cancelPurchase(history, 'unknown')).toEqual(history);
  });
});

describe('purchases by day', () => {
  it('groups purchases by day, most recent day first, in the order they were taken', () => {
    const history = record(
      emptyPurchaseHistory(),
      [item('i1', 'lait'), monday(10)],
      [item('i2', 'pain'), monday(11)],
      [item('i3', 'citrons', 2), tuesday(9)],
    );

    expect(
      purchasesByDay(history).map(({ day, purchases }) => [
        day,
        purchases.map(({ label }) => label),
      ]),
    ).toEqual([
      ['2026-10-20', ['citrons']],
      ['2026-10-19', ['lait', 'pain']],
    ]);
  });

  it('keeps two purchases of the same item on the same day', () => {
    const history = record(
      emptyPurchaseHistory(),
      [item('i1', 'lait'), monday(10)],
      [item('i1', 'lait'), monday(18)],
    );

    expect(purchasesByDay(history)[0]?.purchases).toHaveLength(2);
  });

  it('has no day without purchase', () => {
    expect(purchasesByDay(emptyPurchaseHistory())).toEqual([]);
  });
});

describe('searching purchases', () => {
  const october = (date: number) => new Date(2026, 9, date, 10).getTime();
  const september = (date: number) => new Date(2026, 8, date, 10).getTime();

  it('finds an item by part of its label, as duplicates are recognised', () => {
    const history = record(emptyPurchaseHistory(), [item('i1', 'Tomates cerises'), october(1)]);

    expect(searchPurchases(history, 'tomate')?.map(({ label }) => label)).toEqual([
      'Tomates cerises',
    ]);
  });

  it('finds nothing for a text matching no purchase', () => {
    const history = record(emptyPurchaseHistory(), [item('i1', 'lait'), october(1)]);

    expect(searchPurchases(history, 'sucre')).toEqual([]);
  });

  it('does not search before two characters, unlike a search finding nothing', () => {
    const history = record(emptyPurchaseHistory(), [item('i1', 'lait'), october(1)]);

    expect(searchPurchases(history, ' l ')).toBeUndefined();
  });

  it('gives one result per item, with its count and its last purchase', () => {
    const history = record(
      emptyPurchaseHistory(),
      [item('i1', 'parmesan', 1), october(2)],
      [item('i2', 'Parmesan', 2), october(21)],
    );

    expect(searchPurchases(history, 'parm')).toEqual([
      { label: 'Parmesan', purchaseCount: 2, lastTakenAt: october(21), lastQuantity: 2 },
    ]);
  });

  it('lists the items bought most recently first', () => {
    const history = record(
      emptyPurchaseHistory(),
      [item('i1', 'parmesan râpé'), september(15)],
      [item('i2', 'parmesan'), october(21)],
    );

    expect(searchPurchases(history, 'parmesan')?.map(({ label }) => label)).toEqual([
      'parmesan',
      'parmesan râpé',
    ]);
  });
});
