import type { SharedContent } from '../domain/captured-text';

const SHARE_PARAMETERS = ['title', 'text', 'url'] as const;

// The manifest's share_target opens the app root with these query parameters.
// They are removed from the address so that a reload does not capture them twice.
export function takeSharedContent(
  url: URL,
  replaceUrl: (cleanUrl: string) => void,
): SharedContent | undefined {
  const params = url.searchParams;
  if (!SHARE_PARAMETERS.some((name) => params.has(name))) return undefined;

  const title = params.get('title');
  const text = params.get('text');
  replaceUrl(url.pathname);

  return {
    ...(title !== null && { title }),
    ...(text !== null && { text }),
  };
}
