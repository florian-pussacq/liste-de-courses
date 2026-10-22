import { cleanLabel } from './label';

// A number of units to take, from 1 to 99; absent means the quantity is not specified.
export type Quantity = number;

export interface QuantifiedLabel {
  readonly label: string;
  readonly quantity?: Quantity;
}

const MAX_QUANTITY = 99;
const LEADING_QUANTITY = /^(\d{1,2})\s+(.+)$/;
const TRAILING_QUANTITY = /^(.+?)\s+[x×]\s*(\d{1,2})$/i;
// A weight or a volume belongs to the label: "2 kg pommes de terre" is one item, not two.
const MEASURE_UNIT = /^(?:mg|kg|g|cl|ml|dl|l|%)(?=\s|$)/i;

export function readQuantity(raw: string): QuantifiedLabel {
  const label = cleanLabel(raw);
  const leading = LEADING_QUANTITY.exec(label);
  if (leading && !MEASURE_UNIT.test(leading[2] ?? '')) {
    return quantified(leading[2], leading[1], label);
  }
  const trailing = TRAILING_QUANTITY.exec(label);
  if (trailing) return quantified(trailing[1], trailing[2], label);
  return { label };
}

function quantified(
  rest: string | undefined,
  digits: string | undefined,
  label: string,
): QuantifiedLabel {
  const quantity = Number(digits);
  if (rest === undefined || quantity < 1) return { label };
  return { label: rest, quantity };
}

// An item always has a quantity: none written means one.
export const quantityOf = (quantity?: Quantity): Quantity => quantity ?? 1;

// A written quantity adds to what is shown; an entry without a written number is the same
// need again and changes nothing, so pasting a list twice does not double it.
export function addQuantities(existing?: Quantity, written?: Quantity): Quantity | undefined {
  if (written === undefined) return existing;
  return Math.min(MAX_QUANTITY, quantityOf(existing) + written);
}

export function stepQuantity(quantity: Quantity | undefined, delta: 1 | -1): Quantity {
  return Math.min(MAX_QUANTITY, Math.max(1, quantityOf(quantity) + delta));
}

// Leaves no `quantity: undefined` behind: an unspecified quantity is an absent one.
export function withQuantity<T extends { readonly quantity?: Quantity }>(
  value: T,
  quantity: Quantity | undefined,
): T {
  const { quantity: _replaced, ...rest } = value;
  return (quantity === undefined ? rest : { ...rest, quantity }) as T;
}
