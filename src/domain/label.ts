const LIGATURES: Readonly<Record<string, string>> = { œ: 'oe', æ: 'ae' };
const COMBINING_MARKS = /\p{M}/gu;
// A final s or x on a word of three letters or more: « petits pois » and « petit pois » are
// one item. Applied to both sides of a comparison, a word like « ananas » still equals itself.
const PLURAL_MARK = /(?<=\p{L}{2})[sx]\b/gu;

export function cleanLabel(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

// NFD does not decompose œ and æ, so they are expanded explicitly.
export function labelKey(label: string): string {
  return cleanLabel(label)
    .toLowerCase()
    .replace(/[œæ]/g, (ligature) => LIGATURES[ligature] ?? ligature)
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(PLURAL_MARK, '');
}
