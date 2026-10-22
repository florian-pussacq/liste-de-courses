import { expect, test, type Page } from '@playwright/test';
import { addItems, openInboxByHand, pasteByHand, proposals, sheetClosed, toBuy } from './helpers';

const row = (page: Page, label: string) =>
  page.getByRole('list', { name: 'À prendre' }).getByRole('listitem').filter({ hasText: label });
const inSheet = (page: Page, name: string) =>
  page.getByRole('dialog').getByRole('button', { name, exact: true });

test.beforeEach(async ({ page }) => {
  await page.goto('./');
});

test('shows the quantity of an item next to its label', async ({ page }) => {
  await addItems(page, '3 citrons', 'lait');

  await expect(page.getByRole('group', { name: 'Quantité de citrons' })).toContainText('3');
  await expect(toBuy(page)).toHaveText(['citrons', 'lait']);
});

test('shows the quantity of an item to check as a badge', async ({ page }) => {
  await page.goto(`./?text=${encodeURIComponent('6 œufs ?')}`);
  await page.getByRole('button', { name: 'Mettre dans la liste' }).click();

  await expect(page.getByRole('list', { name: 'À vérifier' })).toContainText('6');
});

test.describe('from the actions of an item', () => {
  test('gives a quantity to an item that had none', async ({ page }) => {
    await addItems(page, 'lait');
    await toBuy(page).filter({ hasText: 'lait' }).click({ button: 'right' });

    await inSheet(page, 'Augmenter lait').click();
    await expect(page.getByRole('dialog').getByText('1', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Fermer' }).click();
    await sheetClosed(page, 'lait');

    await expect(page.getByRole('group', { name: 'Quantité de lait' })).toContainText('1');
  });

  test('removes the quantity below 1', async ({ page }) => {
    await addItems(page, '1 citrons');
    await toBuy(page).filter({ hasText: 'citrons' }).click({ button: 'right' });

    await inSheet(page, 'Diminuer citrons').click();
    await page.getByRole('button', { name: 'Fermer' }).click();
    await sheetClosed(page, 'citrons');

    await expect(toBuy(page)).toHaveText(['citrons']);
  });
});

test.describe('on the line of an item to buy', () => {
  test('lowers the quantity', async ({ page }) => {
    await addItems(page, '3 citrons');

    await row(page, 'citrons').getByRole('button', { name: 'Diminuer citrons' }).click();

    await expect(page.getByRole('group', { name: 'Quantité de citrons' })).toContainText('2');
  });

  test('stops at 1', async ({ page }) => {
    await addItems(page, '1 citrons');

    await expect(
      row(page, 'citrons').getByRole('button', { name: 'Diminuer citrons' }),
    ).toBeDisabled();
  });

  test('offers no quantity control without a quantity, the line still checks', async ({ page }) => {
    await addItems(page, 'lait');

    await expect(row(page, 'lait').getByRole('button', { name: 'Augmenter lait' })).toHaveCount(0);
    await toBuy(page).filter({ hasText: 'lait' }).click();
    await expect(page.getByRole('button', { name: '1 article dans le panier' })).toBeVisible();
  });
});

test('raises the quantity of a proposal from its actions', async ({ page }) => {
  await openInboxByHand(page);
  await pasteByHand(page, '3 citrons');

  await proposals(page).first().click({ button: 'right' });
  await page
    .getByRole('dialog', { name: 'citrons' })
    .getByRole('button', { name: 'Augmenter citrons' })
    .click();
  await page
    .getByRole('dialog', { name: 'citrons' })
    .getByRole('button', { name: 'Fermer' })
    .click();
  await sheetClosed(page, 'citrons');

  await expect(proposals(page).first()).toContainText('4');
});

test('tells in the report how the quantity of an item already listed changed', async ({ page }) => {
  await addItems(page, '3 citrons');
  await openInboxByHand(page);
  await pasteByHand(page, '2 citrons');
  await page.getByRole('button', { name: 'Mettre dans la liste' }).click();

  await expect(page.getByRole('status').filter({ hasText: 'Déjà dans la liste' })).toContainText(
    'citrons (3 → 5)',
  );
});
