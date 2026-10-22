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

// Only the quantities written down add up: an unspecified one adds nothing.
export function addQuantities(a?: Quantity, b?: Quantity): Quantity | undefined {
  if (a === undefined && b === undefined) return undefined;
  return Math.min(MAX_QUANTITY, (a ?? 0) + (b ?? 0));
}

// With a floor of 0, stepping below 1 leaves the quantity unspecified.
export function stepQuantity(
  quantity: Quantity | undefined,
  delta: 1 | -1,
  floor: 0 | 1,
): Quantity | undefined {
  const next = Math.min(MAX_QUANTITY, Math.max(floor, (quantity ?? 0) + delta));
  return next === 0 ? undefined : next;
}
