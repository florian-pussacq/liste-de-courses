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

describe('splitIntoEntries on menu lines', () => {
  it('drops the day prefix and splits on slash and dash', () => {
    expect(labelsOf('Lundi 3 : omelette / carottes-brocolis')).toEqual([
      'omelette',
      'carottes',
      'brocolis',
    ]);
  });

  it('recognises the day whatever its case or spacing', () => {
    expect(labelsOf('MARDI 4:soupe\n  jeudi 1er : risotto')).toEqual(['soupe', 'risotto']);
  });

  it('proposes nothing for a day without meal', () => {
    expect(labelsOf('Mardi 4 :\nMercredi 5 : risotto')).toEqual(['risotto']);
  });

  it('keeps slashes and dashes in ordinary lines', () => {
    expect(labelsOf('sel/poivre\npâte brisée - pur beurre')).toEqual([
      'sel/poivre',
      'pâte brisée - pur beurre',
    ]);
  });

  it('does not take a word starting like a day for a menu line', () => {
    expect(labelsOf('lundis : rien')).toEqual(['lundis : rien']);
  });
});

describe('dish names in menu lines', () => {
  const dish = (label: string, toCheck = false): Entry => ({ label, toCheck, isDish: true });

  it('marks the part before the first slash as a dish name', () => {
    expect(splitIntoEntries('Lundi 3 : omelette / carottes-brocolis')).toEqual([
      dish('omelette'),
      certain('carottes'),
      certain('brocolis'),
    ]);
  });

  it('does not split a dish name on dashes', () => {
    expect(splitIntoEntries('Jeudi 6 : chou-fleur gratiné / purée')).toEqual([
      dish('chou-fleur gratiné'),
      certain('purée'),
    ]);
  });

  it('keeps a doubt on a dish name', () => {
    expect(splitIntoEntries('Samedi 8 : restaurant ? / purée')).toEqual([
      dish('restaurant', true),
      certain('purée'),
    ]);
  });

  it('treats a menu line without slash as a dish name', () => {
    expect(splitIntoEntries('Dimanche 9 : soupe, salade')).toEqual([dish('soupe'), dish('salade')]);
  });

  it('marks nothing as a dish in ordinary lines', () => {
    expect(splitIntoEntries('omelette')).toEqual([certain('omelette')]);
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

describe('quantities in captured text', () => {
  it('reads the quantity of each element', () => {
    expect(splitIntoEntries('4 courgettes, citrons x3\nlait')).toEqual([
      { label: 'courgettes', toCheck: false, quantity: 4 },
      { label: 'citrons', toCheck: false, quantity: 3 },
      certain('lait'),
    ]);
  });

  it('keeps the quantity of an item to check', () => {
    expect(splitIntoEntries('3 citrons ?')).toEqual([
      { label: 'citrons', toCheck: true, quantity: 3 },
    ]);
  });

  it('does not take numbering for a quantity', () => {
    expect(splitIntoEntries('1. citrons\n2) 3 courgettes')).toEqual([
      certain('citrons'),
      { label: 'courgettes', toCheck: false, quantity: 3 },
    ]);
  });

  it('reads the quantity of a side in a menu line', () => {
    expect(splitIntoEntries('Lundi 3 : risotto / 2 courgettes')).toEqual([
      { label: 'risotto', toCheck: false, isDish: true },
      { label: 'courgettes', toCheck: false, quantity: 2 },
    ]);
  });
});
