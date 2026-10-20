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

  it('keeps distinct labels distinct', () => {
    expect(labelKey('pain')).not.toBe(labelKey('pains'));
  });
});
