import { describe, expect, it } from 'vitest';
import { takeSharedContent } from './share-target';

function launch(url: string) {
  const replaced: string[] = [];
  const content = takeSharedContent(new URL(url), (cleanUrl) => replaced.push(cleanUrl));
  return { content, replaced };
}

describe('takeSharedContent', () => {
  it('returns nothing for a normal launch and leaves the address untouched', () => {
    expect(launch('https://example.test/app/')).toEqual({ content: undefined, replaced: [] });
  });

  it('reads the shared title and text', () => {
    expect(launch('https://example.test/app/?title=pain&text=lait%2C%20%C5%93ufs').content).toEqual(
      {
        title: 'pain',
        text: 'lait, œufs',
      },
    );
  });

  it('treats a share without text as a share', () => {
    expect(launch('https://example.test/app/?text=').content).toEqual({ text: '' });
  });

  it('removes the shared parameters from the address', () => {
    expect(launch('https://example.test/app/?text=lait&url=https%3A%2F%2Fx.test').replaced).toEqual(
      ['/app/'],
    );
  });
});
