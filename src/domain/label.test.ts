import { describe, expect, it } from 'vitest';
import { labelKey } from './label';

describe('labelKey', () => {
  it('ignores case', () => {
    expect(labelKey('Lait')).toBe(labelKey('lait'));
  });

  it('ignores accents', () => {
    expect(labelKey('café')).toBe(labelKey('cafe'));
  });

  it('expands ligatures that Unicode decomposition leaves intact', () => {
    expect(labelKey('Œufs')).toBe(labelKey('oeufs'));
    expect(labelKey('Ex æquo')).toBe(labelKey('ex aequo'));
  });

  it('ignores surrounding and repeated whitespace', () => {
    expect(labelKey('  pommes   de  terre ')).toBe(labelKey('pommes de terre'));
  });

  it('ignores the plural mark at the end of each word', () => {
    expect(labelKey('petits pois')).toBe(labelKey('petit pois'));
    expect(labelKey('Tomates cerises')).toBe(labelKey('tomate cerise'));
    expect(labelKey('choux')).toBe(labelKey('chou'));
    expect(labelKey('pains')).toBe(labelKey('pain'));
  });

  it('leaves words of two letters or fewer intact', () => {
    expect(labelKey('os')).not.toBe(labelKey('o'));
  });

  it('keeps distinct labels distinct', () => {
    expect(labelKey('pain')).not.toBe(labelKey('pâte'));
    expect(labelKey('pommes')).not.toBe(labelKey('pommes de terre'));
  });
});
