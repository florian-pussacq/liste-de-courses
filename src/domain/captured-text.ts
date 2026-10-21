import { cleanLabel } from './label';

const LINE_BREAKS = /\r?\n/;
const SEPARATORS = /[,;]+/;
// A menu line reads "Lundi 3 : dish / side-side": the dish name comes before the first slash.
const MENU_LINE_PREFIX = /^\s*(?:lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\b[^:]*:/i;
const SIDE_SEPARATORS = /[,;/-]+/;
const LEADING_BULLET_OR_NUMBER = /^\s*(?:[-*•·–—]|\d+[.)])\s*/;
const TRAILING_QUESTION_MARK = /\s*\?$/;

// An element ending with "?" is an item the user is unsure about and must check before leaving.
export interface Entry {
  readonly label: string;
  readonly toCheck: boolean;
  readonly isDish?: true;
}

interface Element {
  readonly text: string;
  readonly isDish: boolean;
}

export interface SharedContent {
  readonly title?: string;
  readonly text?: string;
}

export function splitIntoEntries(capturedText: string): Entry[] {
  return capturedText
    .split(LINE_BREAKS)
    .flatMap(splitLine)
    .map(toEntry)
    .filter((entry) => entry.label !== '');
}

function splitLine(line: string): Element[] {
  if (!MENU_LINE_PREFIX.test(line)) return elements(line.split(SEPARATORS), false);
  const [dishes = '', ...sides] = line.replace(MENU_LINE_PREFIX, '').split('/');
  return [
    ...elements(dishes.split(SEPARATORS), true),
    ...elements(sides.join('/').split(SIDE_SEPARATORS), false),
  ];
}

const elements = (texts: readonly string[], isDish: boolean): Element[] =>
  texts.map((text) => ({ text, isDish }));

function toEntry({ text, isDish }: Element): Entry {
  const element = cleanLabel(text.replace(LEADING_BULLET_OR_NUMBER, ''));
  const toCheck = TRAILING_QUESTION_MARK.test(element);
  const label = toCheck ? element.replace(TRAILING_QUESTION_MARK, '') : element;
  return isDish ? { label, toCheck, isDish: true } : { label, toCheck };
}

export function sharedText({ title, text }: SharedContent): string {
  return [title, text]
    .map((part) => part?.trim() ?? '')
    .filter((part) => part !== '')
    .join('\n');
}
