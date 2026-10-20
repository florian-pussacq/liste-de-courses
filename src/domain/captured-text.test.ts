import { describe, expect, it } from 'vitest';
import { sharedText, splitIntoEntries, type Entry } from './captured-text';

const certain = (label: string): Entry => ({ label, toCheck: false });
const toCheck = (label: string): Entry => ({ label, toCheck: true });
const labelsOf = (text: string) => splitIntoEntries(text).map((entry) => entry.label);

describe('splitIntoEntries', () => {
  it('proposes one label per non-empty line', () => {
    expect(labelsOf('pain\n\nbeurre\r\nconfiture')).toEqual(['pain', 'beurre', 'confiture']);
  });

  it('removes bullets', () => {
    expect(labelsOf('- pain\n* beurre\n• confiture')).toEqual(['pain', 'beurre', 'confiture']);
  });

  it('removes numbering', () => {
    expect(labelsOf('1. riz\n2) tomates')).toEqual(['riz', 'tomates']);
  });

  it('splits on commas and semicolons and drops empty elements', () => {
    expect(labelsOf('lait,, œufs ;\n\n  farine  ')).toEqual(['lait', 'œufs', 'farine']);
  });

  it('keeps free text as a single label to be corrected', () => {
    expect(labelsOf('pense à prendre du lait stp')).toEqual(['pense à prendre du lait stp']);
  });

  it('proposes nothing for blank text', () => {
    expect(labelsOf('  \n ')).toEqual([]);
  });

  it('marks an element ending with a question mark as to check', () => {
    expect(splitIntoEntries('riz\ncompote ?')).toEqual([certain('riz'), toCheck('compote')]);
  });

  it('recognises a question mark stuck to the word', () => {
    expect(splitIntoEntries('confiture?')).toEqual([toCheck('confiture')]);
  });

  it('keeps a question mark in the middle of an element', () => {
    expect(splitIntoEntries('thé ? ou café')).toEqual([certain('thé ? ou café')]);
  });

  it('ignores an element reduced to a question mark', () => {
    expect(splitIntoEntries('pain\n?')).toEqual([certain('pain')]);
  });

  it('removes bullets before looking for the question mark', () => {
    expect(splitIntoEntries('- farine ?')).toEqual([toCheck('farine')]);
  });
});

describe('sharedText', () => {
  it('uses the text alone when there is no title', () => {
    expect(sharedText({ text: 'lait, œufs' })).toBe('lait, œufs');
  });

  it('puts the title before the text', () => {
    expect(sharedText({ title: 'pain', text: 'beurre' })).toBe('pain\nbeurre');
  });

  it('ignores blank parts', () => {
    expect(sharedText({ title: '  ', text: 'beurre' })).toBe('beurre');
    expect(sharedText({ title: ' ', text: '' })).toBe('');
  });
});
