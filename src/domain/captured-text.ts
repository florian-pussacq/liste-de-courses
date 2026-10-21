import { cleanLabel } from './label';

const LINE_BREAKS = /\r?\n/;
const SEPARATORS = /[,;]+/;
// A menu line ("Lundi 3 : dish / side-side") also separates on slash and dash.
const MENU_LINE_PREFIX = /^\s*(?:lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\b[^:]*:/i;
const MENU_SEPARATORS = /[,;/-]+/;
const LEADING_BULLET_OR_NUMBER = /^\s*(?:[-*•·–—]|\d+[.)])\s*/;
const TRAILING_QUESTION_MARK = /\s*\?$/;

// An element ending with "?" is an item the user is unsure about and must check before leaving.
export interface Entry {
  readonly label: string;
  readonly toCheck: boolean;
}

export interface SharedContent {
  readonly title?: string;
  readonly text?: string;
}

export function splitIntoEntries(capturedText: string): Entry[] {
  return capturedText
    .split(LINE_BREAKS)
    .flatMap(splitLine)
    .map((element) => toEntry(cleanLabel(element.replace(LEADING_BULLET_OR_NUMBER, ''))))
    .filter((entry) => entry.label !== '');
}

function splitLine(line: string): string[] {
  return MENU_LINE_PREFIX.test(line)
    ? line.replace(MENU_LINE_PREFIX, '').split(MENU_SEPARATORS)
    : line.split(SEPARATORS);
}

function toEntry(element: string): Entry {
  const toCheck = TRAILING_QUESTION_MARK.test(element);
  return { label: toCheck ? element.replace(TRAILING_QUESTION_MARK, '') : element, toCheck };
}

export function sharedText({ title, text }: SharedContent): string {
  return [title, text]
    .map((part) => part?.trim() ?? '')
    .filter((part) => part !== '')
    .join('\n');
}
