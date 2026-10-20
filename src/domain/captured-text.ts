import { cleanLabel } from './label';

const SEPARATORS = /[\r\n,;]+/;
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
    .split(SEPARATORS)
    .map((element) => toEntry(cleanLabel(element.replace(LEADING_BULLET_OR_NUMBER, ''))))
    .filter((entry) => entry.label !== '');
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
