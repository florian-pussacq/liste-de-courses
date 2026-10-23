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
  test('raises an item without written quantity from 1', async ({ page }) => {
    await addItems(page, 'lait');
    await toBuy(page).filter({ hasText: 'lait' }).click({ button: 'right' });

    await inSheet(page, 'Augmenter lait').click();
    await expect(page.getByRole('dialog').getByText('2', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Fermer' }).click();
    await sheetClosed(page, 'lait');

    await expect(page.getByRole('group', { name: 'Quantité de lait' })).toContainText('2');
  });

  test('stops at 1', async ({ page }) => {
    await addItems(page, 'citrons');
    await toBuy(page).filter({ hasText: 'citrons' }).click({ button: 'right' });

    await expect(inSheet(page, 'Diminuer citrons')).toBeDisabled();
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

  test('offers the controls on every line, 1 included, the label still checking it', async ({
    page,
  }) => {
    await addItems(page, 'lait');

    await expect(page.getByRole('group', { name: 'Quantité de lait' })).toContainText('1');
    await row(page, 'lait').getByRole('button', { name: 'Augmenter lait' }).click();
    await expect(page.getByRole('group', { name: 'Quantité de lait' })).toContainText('2');
    await toBuy(page).filter({ hasText: 'lait' }).click();
    await expect(page.getByRole('button', { name: '1 article dans le panier' })).toBeVisible();
  });
});

test.describe('in store, once an item is taken', () => {
  test.beforeEach(async ({ page }) => {
    await addItems(page, 'pain', '3 citrons', 'lait');
    await toBuy(page).filter({ hasText: 'pain' }).click();
  });

  test('offers no quantity controls on the lines to buy', async ({ page }) => {
    await expect(page.getByRole('group', { name: /^Quantité de/ })).toHaveCount(0);
  });

  test('shows a quantity only beyond 1', async ({ page }) => {
    await expect(row(page, 'citrons')).toHaveText('3citrons');
    await expect(row(page, 'lait')).toHaveText('lait');
  });

  test('still adjusts the quantity from the actions of an item', async ({ page }) => {
    await toBuy(page).filter({ hasText: 'citrons' }).click({ button: 'right' });
    await inSheet(page, 'Augmenter citrons').click();
    await page.getByRole('button', { name: 'Fermer' }).click();
    await sheetClosed(page, 'citrons');

    await expect(row(page, 'citrons')).toHaveText('4citrons');
  });
});

test.describe('once the last item was taken more than an hour ago', () => {
  test('stays in store within the hour, then ends the shopping by itself', async ({ page }) => {
    await page.clock.install();
    await page.goto('./');
    await addItems(page, 'pain', 'lait');
    await toBuy(page).filter({ hasText: 'pain' }).click();

    await page.clock.fastForward('30:00');
    await expect(page.getByRole('group', { name: 'Quantité de lait' })).toHaveCount(0);

    await page.clock.fastForward('31:00');
    await expect(page.getByRole('group', { name: 'Quantité de lait' })).toContainText('1');
  });

  test('is preparing again, with the controls and the paste label back', async ({ page }) => {
    await page.clock.install();
    await page.goto('./');
    await addItems(page, 'pain', 'lait');
    await toBuy(page).filter({ hasText: 'pain' }).click();
    await expect(page.getByRole('group', { name: 'Quantité de lait' })).toHaveCount(0);

    await page.clock.fastForward('02:00:00');

    await expect(page.getByRole('group', { name: 'Quantité de lait' })).toContainText('1');
    await expect(page.getByRole('button', { name: 'Coller une liste' })).toHaveText(
      'Coller une liste',
    );
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

test('shows no quantity of 1 in the inbox, only those above', async ({ page }) => {
  await openInboxByHand(page);
  await pasteByHand(page, 'lait, 3 citrons');

  await expect(proposals(page)).toHaveText(['lait', /^\s*3\s*citrons\s*$/]);
});
