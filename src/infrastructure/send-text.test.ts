import { describe, expect, it } from 'vitest';
import { sendText } from './send-text';

const refusing = (name: string) => () => Promise.reject(new DOMException('refused', name));

describe('sendText', () => {
  it('hands the text to the share menu', async () => {
    const shared: ShareData[] = [];

    const outcome = await sendText('pain', {
      share: async (data: ShareData) => {
        shared.push(data);
      },
    });

    expect(outcome).toBe('shared');
    expect(shared).toEqual([{ text: 'pain' }]);
  });

  it('reports a share menu closed without choosing an application', async () => {
    expect(await sendText('pain', { share: refusing('AbortError') })).toBe('cancelled');
  });

  it('copies the text when there is no share menu', async () => {
    const copied: string[] = [];

    const outcome = await sendText('pain', {
      clipboard: {
        writeText: async (text: string) => {
          copied.push(text);
        },
      },
    });

    expect(outcome).toBe('copied');
    expect(copied).toEqual(['pain']);
  });

  it('reports that sending is impossible when sharing fails otherwise', async () => {
    expect(await sendText('pain', { share: refusing('NotAllowedError') })).toBe('unavailable');
  });

  it('reports that sending is impossible without share menu nor clipboard', async () => {
    expect(await sendText('pain', {})).toBe('unavailable');
    expect(await sendText('pain', { clipboard: { writeText: refusing('NotAllowedError') } })).toBe(
      'unavailable',
    );
  });
});
