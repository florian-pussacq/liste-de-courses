import { cleanLabel } from './label';

const SEPARATORS = /[\r\n,;]+/;
const LEADING_BULLET_OR_NUMBER = /^\s*(?:[-*•·–—]|\d+[.)])\s*/;

export interface SharedContent {
  readonly title?: string;
  readonly text?: string;
}

export function splitIntoLabels(capturedText: string): string[] {
  return capturedText
    .split(SEPARATORS)
    .map((element) => cleanLabel(element.replace(LEADING_BULLET_OR_NUMBER, '')))
    .filter((label) => label !== '');
}

export function sharedText({ title, text }: SharedContent): string {
  return [title, text]
    .map((part) => part?.trim() ?? '')
    .filter((part) => part !== '')
    .join('\n');
}
