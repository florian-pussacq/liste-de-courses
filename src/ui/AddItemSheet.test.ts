// @vitest-environment jsdom
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it } from 'vitest';
import type { Shopping } from '../application/shopping';
import { success } from '../domain/result';
import type { ShoppingList } from '../domain/shopping-list';
import AddItemSheet from './AddItemSheet.svelte';

function slowAddItem() {
  const pending: (() => void)[] = [];
  const app = {
    addItem: (label: string) =>
      new Promise((resolve) => {
        const list: ShoppingList = {
          items: [{ id: label, label, checked: false, toCheck: false, addedAt: 0, updatedAt: 0 }],
        };
        pending.push(() => resolve(success(list)));
      }),
  } as unknown as Shopping;
  return { app, resolveNext: () => pending.shift()?.() };
}

// jsdom does not implement modal dialogs.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
});

describe('AddItemSheet', () => {
  it('keeps what is typed while the previous item is still being added', async () => {
    const user = userEvent.setup();
    const { app, resolveNext } = slowAddItem();
    render(AddItemSheet, { app, onchange: () => {}, onclose: () => {} });
    const input = screen.getByLabelText('Nouvel article');

    await user.type(input, 'riz{Enter}');
    await user.type(input, 'tomate');
    resolveNext();

    await expect.poll(() => (input as HTMLInputElement).value).toBe('tomate');
  });
});
