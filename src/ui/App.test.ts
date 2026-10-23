// @vitest-environment jsdom
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { Shopping } from '../application/shopping';
import { emptyInbox } from '../domain/inbox';
import { emptyShoppingList } from '../domain/shopping-list';
import App from './App.svelte';

// jsdom does not implement ResizeObserver, which measures the height of the dock.
beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

function renderWithUpdates() {
  let announce: (apply: () => Promise<void>) => void = () => {};
  render(App, {
    app: { now: () => 0 } as Shopping,
    initialList: emptyShoppingList(),
    initialInbox: emptyInbox(),
    onupdateready: (listener) => (announce = listener),
  });
  return { announce: (apply: () => Promise<void>) => announce(apply) };
}

describe('update banner', () => {
  it('stays hidden while no new version is ready', () => {
    renderWithUpdates();

    expect(screen.queryByText('Nouvelle version disponible')).toBeNull();
  });

  it('offers to load a new version once ready, and loads it on demand', async () => {
    const { announce } = renderWithUpdates();
    const apply = vi.fn(async () => {});

    announce(apply);
    await userEvent.click(await screen.findByRole('button', { name: 'Recharger' }));

    expect(screen.getByRole('status')).toHaveProperty(
      'textContent',
      expect.stringContaining('Nouvelle version disponible'),
    );
    expect(apply).toHaveBeenCalledOnce();
  });
});
