import { describe, expect, it } from 'vitest';
import { addQuantities, quantityOf, readQuantity, stepQuantity } from './quantity';

describe('readQuantity', () => {
  it('reads a leading number as a quantity', () => {
    expect(readQuantity('4 courgettes')).toEqual({ label: 'courgettes', quantity: 4 });
  });

  it('reads a trailing x or × followed by a number', () => {
    expect(readQuantity('citrons x3')).toEqual({ label: 'citrons', quantity: 3 });
    expect(readQuantity('citrons ×3')).toEqual({ label: 'citrons', quantity: 3 });
    expect(readQuantity('citrons X 12')).toEqual({ label: 'citrons', quantity: 12 });
  });

  it('leaves a label without quantity as it is', () => {
    expect(readQuantity('  lait ')).toEqual({ label: 'lait' });
  });

  it('leaves a weight or a volume in the label', () => {
    expect(readQuantity('2 kg pommes de terre')).toEqual({ label: '2 kg pommes de terre' });
    expect(readQuantity('50 cl crème')).toEqual({ label: '50 cl crème' });
    expect(readQuantity('3 l lait')).toEqual({ label: '3 l lait' });
  });

  it('leaves a number placed elsewhere in the label', () => {
    expect(readQuantity('pain 7 céréales')).toEqual({ label: 'pain 7 céréales' });
  });

  it('accepts only 1 to 99', () => {
    expect(readQuantity('0 citron')).toEqual({ label: '0 citron' });
    expect(readQuantity('100 feuilles')).toEqual({ label: '100 feuilles' });
    expect(readQuantity('99 feuilles')).toEqual({ label: 'feuilles', quantity: 99 });
  });

  it('keeps a lone number as a label', () => {
    expect(readQuantity('3')).toEqual({ label: '3' });
  });
});

describe('quantityOf', () => {
  it('reads a quantity not written as 1', () => {
    expect(quantityOf(undefined)).toBe(1);
    expect(quantityOf(4)).toBe(4);
  });
});

describe('addQuantities', () => {
  it('adds a written quantity to the existing one', () => {
    expect(addQuantities(3, 2)).toBe(5);
  });

  it('adds a written quantity to the 1 of an item without one', () => {
    expect(addQuantities(undefined, 2)).toBe(3);
  });

  it('changes nothing when no quantity is written', () => {
    expect(addQuantities(3, undefined)).toBe(3);
    expect(addQuantities(undefined, undefined)).toBeUndefined();
  });

  it('caps the total at 99', () => {
    expect(addQuantities(60, 50)).toBe(99);
  });
});

describe('stepQuantity', () => {
  it('raises a quantity not written from 1', () => {
    expect(stepQuantity(undefined, 1)).toBe(2);
  });

  it('stops at 1', () => {
    expect(stepQuantity(undefined, -1)).toBe(1);
    expect(stepQuantity(1, -1)).toBe(1);
    expect(stepQuantity(3, -1)).toBe(2);
  });

  it('stops at 99', () => {
    expect(stepQuantity(99, 1)).toBe(99);
  });
});
