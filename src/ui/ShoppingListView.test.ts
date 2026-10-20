// @vitest-environment jsdom
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { Shopping } from '../application/shopping';
import { success } from '../domain/result';
import { emptyShoppingList, type ShoppingList } from '../domain/shopping-list';
import ShoppingListView from './ShoppingListView.svelte';

function slowAddItem() {
  const pending: (() => void)[] = [];
  const app = {
    addItem: (label: string) =>
      new Promise((resolve) => {
        const list: ShoppingList = {
          items: [{ id: label, label, checked: false, addedAt: 0, updatedAt: 0 }],
        };
        pending.push(() => resolve(success(list)));
      }),
  } as unknown as Shopping;
  return { app, resolveNext: () => pending.shift()?.() };
}

describe('ShoppingListView', () => {
  it('keeps what is typed while the previous item is still being added', async () => {
    const user = userEvent.setup();
    const { app, resolveNext } = slowAddItem();
    render(ShoppingListView, {
      app,
      list: emptyShoppingList(),
      pending: 0,
      onopeninbox: () => {},
    });
    const input = screen.getByLabelText('Nouvel article');

    await user.type(input, 'riz{Enter}');
    await user.type(input, 'tomate');
    resolveNext();

    await expect.poll(() => (input as HTMLInputElement).value).toBe('tomate');
  });
});
