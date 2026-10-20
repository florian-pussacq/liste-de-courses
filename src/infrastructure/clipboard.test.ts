import { describe, expect, it } from 'vitest';
import { readClipboard } from './clipboard';

const holding = (text: string) => ({ readText: async () => text });

describe('readClipboard', () => {
  it('returns the text held by the clipboard', async () => {
    expect(await readClipboard(holding('pain, beurre'))).toEqual({
      kind: 'text',
      text: 'pain, beurre',
    });
  });

  it('reports an empty clipboard', async () => {
    expect(await readClipboard(holding(''))).toEqual({ kind: 'empty' });
    expect(await readClipboard(holding('  \n '))).toEqual({ kind: 'empty' });
  });

  it('reports an unavailable clipboard when the API is missing', async () => {
    expect(await readClipboard(undefined)).toEqual({ kind: 'unavailable' });
  });

  it('reports an unavailable clipboard when reading is refused', async () => {
    const refusing = {
      readText: () =>
        Promise.reject(new DOMException('Read permission denied.', 'NotAllowedError')),
    };

    expect(await readClipboard(refusing)).toEqual({ kind: 'unavailable' });
  });
});
