import { splitIntoEntries, type Entry } from './captured-text';
import { cleanLabel, labelKey } from './label';
import { failure, success, type Result } from './result';

export type DishId = string;

// A dish remembers how a meal translates into items, so that it never has to be done by heart again.
export interface Dish {
  readonly id: DishId;
  readonly name: string;
  readonly ingredients: readonly Entry[];
}

export type DefineDishError = 'empty-name' | 'no-ingredient';

export function defineDish(
  rawName: string,
  ingredientsText: string,
  newId: () => DishId,
): Result<Dish, DefineDishError> {
  const name = cleanLabel(rawName);
  if (name === '') return failure('empty-name');
  const ingredients = splitIntoEntries(ingredientsText);
  if (ingredients.length === 0) return failure('no-ingredient');
  return success({ id: newId(), name, ingredients });
}

export function findDish(dishes: readonly Dish[], label: string): Dish | undefined {
  const key = labelKey(label);
  return dishes.find((dish) => labelKey(dish.name) === key);
}

// Defining a dish whose name is already known replaces its definition.
export function rememberDish(dishes: readonly Dish[], dish: Dish): readonly Dish[] {
  const known = findDish(dishes, dish.name);
  return known
    ? dishes.map((candidate) => (candidate === known ? { ...dish, id: known.id } : candidate))
    : [...dishes, dish];
}
