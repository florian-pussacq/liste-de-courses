import { describe, expect, it } from 'vitest';
import { sharedText, splitIntoLabels } from './captured-text';

describe('splitIntoLabels', () => {
  it('proposes one label per non-empty line', () => {
    expect(splitIntoLabels('pain\n\nbeurre\r\nconfiture')).toEqual(['pain', 'beurre', 'confiture']);
  });

  it('removes bullets', () => {
    expect(splitIntoLabels('- pain\n* beurre\n• confiture')).toEqual([
      'pain',
      'beurre',
      'confiture',
    ]);
  });

  it('removes numbering', () => {
    expect(splitIntoLabels('1. riz\n2) tomates')).toEqual(['riz', 'tomates']);
  });

  it('splits on commas and semicolons and drops empty elements', () => {
    expect(splitIntoLabels('lait,, œufs ;\n\n  farine  ')).toEqual(['lait', 'œufs', 'farine']);
  });

  it('keeps free text as a single label to be corrected', () => {
    expect(splitIntoLabels('pense à prendre du lait stp')).toEqual(['pense à prendre du lait stp']);
  });

  it('proposes nothing for blank text', () => {
    expect(splitIntoLabels('  \n ')).toEqual([]);
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
