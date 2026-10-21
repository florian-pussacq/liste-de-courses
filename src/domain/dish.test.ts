import { describe, expect, it } from 'vitest';
import { defineDish, findDish, rememberDish, type Dish } from './dish';

const newId = () => 'dish-1';

describe('defineDish', () => {
  it('keeps the name and reads ingredients one per line, with their doubts', () => {
    expect(defineDish(' omelette ', 'œufs\nfromage ?\n\nciboulette', newId)).toEqual({
      ok: true,
      value: {
        id: 'dish-1',
        name: 'omelette',
        ingredients: [
          { label: 'œufs', toCheck: false },
          { label: 'fromage', toCheck: true },
          { label: 'ciboulette', toCheck: false },
        ],
      },
    });
  });

  it('refuses a dish without name', () => {
    expect(defineDish('  ', 'œufs', newId)).toEqual({ ok: false, error: 'empty-name' });
  });

  it('refuses a dish without ingredient', () => {
    expect(defineDish('omelette', ' \n ', newId)).toEqual({ ok: false, error: 'no-ingredient' });
  });
});

describe('findDish', () => {
  const risotto: Dish = {
    id: 'd',
    name: 'Risotto',
    ingredients: [{ label: 'riz', toCheck: false }],
  };

  it('finds a dish whatever the case, accents or spaces', () => {
    expect(findDish([risotto], '  risotto ')).toBe(risotto);
  });

  it('finds nothing for an unknown label', () => {
    expect(findDish([risotto], 'soupe')).toBeUndefined();
  });
});

describe('rememberDish', () => {
  const omelette: Dish = {
    id: 'a',
    name: 'omelette',
    ingredients: [{ label: 'œufs', toCheck: false }],
  };

  it('adds a new dish', () => {
    expect(rememberDish([], omelette)).toEqual([omelette]);
  });

  it('replaces the definition of a dish with the same name, keeping its identity', () => {
    const updated: Dish = {
      id: 'b',
      name: 'Omelette',
      ingredients: [
        { label: 'œufs', toCheck: false },
        { label: 'lait', toCheck: false },
      ],
    };

    expect(rememberDish([omelette], updated)).toEqual([{ ...updated, id: 'a' }]);
  });
});
