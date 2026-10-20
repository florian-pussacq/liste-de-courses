const LIGATURES: Readonly<Record<string, string>> = { œ: 'oe', æ: 'ae' };
const COMBINING_MARKS = /\p{M}/gu;

export function cleanLabel(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

// NFD does not decompose œ and æ, so they are expanded explicitly.
export function labelKey(label: string): string {
  return cleanLabel(label)
    .toLowerCase()
    .replace(/[œæ]/g, (ligature) => LIGATURES[ligature] ?? ligature)
    .normalize('NFD')
    .replace(COMBINING_MARKS, '');
}
