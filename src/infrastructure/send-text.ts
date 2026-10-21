import type { SendOutcome } from '../application/ports';

interface NavigatorLike {
  readonly share?: (data: ShareData) => Promise<void>;
  readonly clipboard?: Pick<Clipboard, 'writeText'>;
}

// Must be called from a user gesture. Hands the text over to another application:
// the page itself makes no network request.
export async function sendText(
  text: string,
  navigator: NavigatorLike = globalThis.navigator,
): Promise<SendOutcome> {
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return 'shared';
    } catch (error) {
      return error instanceof DOMException && error.name === 'AbortError'
        ? 'cancelled'
        : 'unavailable';
    }
  }
  if (!navigator.clipboard?.writeText) return 'unavailable';
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'unavailable';
  }
}
