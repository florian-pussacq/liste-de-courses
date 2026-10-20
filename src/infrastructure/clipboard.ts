import type { ClipboardContent } from '../application/ports';

type ClipboardLike = Pick<Clipboard, 'readText'>;

// Must be called from a user gesture: browsers refuse clipboard reads otherwise.
// A refusal is an expected outcome, not an error: the user can still paste by hand.
export async function readClipboard(
  clipboard: ClipboardLike | undefined = globalThis.navigator?.clipboard,
): Promise<ClipboardContent> {
  if (!clipboard?.readText) return { kind: 'unavailable' };
  try {
    const text = await clipboard.readText();
    return text.trim() === '' ? { kind: 'empty' } : { kind: 'text', text };
  } catch {
    return { kind: 'unavailable' };
  }
}
