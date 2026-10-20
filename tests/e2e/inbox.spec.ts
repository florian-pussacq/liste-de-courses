import { expect, test } from '@playwright/test';
import { openInboxByHand, pasteByHand, proposals, stubClipboard, toBuy } from './helpers';

test.beforeEach(async ({ page }) => {
  await stubClipboard(page, { text: '' });
  await page.goto('./');
  await openInboxByHand(page);
});

test('proposes one item per line of a pasted list and recalls the text', async ({ page }) => {
  await pasteByHand(page, '- pain\n* beurre\n\n1. confiture');

  await expect(proposals(page)).toHaveText(['pain', 'beurre', 'confiture']);
  await expect(page.getByRole('region', { name: 'Textes reçus' })).toContainText('1. confiture');
});

test('recalls several received texts in their order', async ({ page }) => {
  await pasteByHand(page, 'pain');
  await pasteByHand(page, 'beurre');

  await expect(page.getByRole('region', { name: 'Textes reçus' }).locator('blockquote')).toHaveText(
    ['pain', 'beurre'],
  );
});

test('discards a proposal, puts it back, and adds only kept proposals', async ({ page }) => {
  await pasteByHand(page, 'pain, stp, confiture');

  await page.getByRole('button', { name: 'Écarter stp' }).click();
  await page.getByRole('button', { name: 'Écarter confiture' }).click();
  await page.getByRole('button', { name: 'Remettre confiture' }).click();
  await expect(page.getByRole('button', { name: 'Ajouter 2 à la liste' })).toBeEnabled();

  await page.getByRole('button', { name: 'Ajouter 2 à la liste' }).click();

  await expect(toBuy(page)).toHaveText(['pain', 'confiture']);
});

test('corrects a proposal with a long press and adds one by hand', async ({ page }) => {
  await pasteByHand(page, 'pense à prendre du lait stp');

  await proposals(page).first().click({ button: 'right' });
  await page.getByLabel('Corriger pense à prendre du lait stp').fill('lait');
  await page.getByRole('button', { name: 'Corriger', exact: true }).click();
  await page.getByLabel('Article à proposer').fill('farine');
  await page.getByRole('button', { name: 'Ajouter', exact: true }).click();

  await expect(proposals(page)).toHaveText(['lait', 'farine']);
});

test('refuses to blank a proposal', async ({ page }) => {
  await pasteByHand(page, 'lait');

  await proposals(page).first().click({ button: 'right' });
  await page.getByLabel('Corriger lait').fill(' ');
  await page.getByRole('button', { name: 'Corriger', exact: true }).click();

  await expect(page.getByRole('alert')).toHaveText('Le libellé ne peut pas être vide.');
  await expect(proposals(page)).toHaveText(['lait']);
});

test('abandons a capture without touching the list', async ({ page }) => {
  await pasteByHand(page, 'pain, beurre');

  await page.getByRole('button', { name: 'Annuler' }).click();

  await expect(page.getByText('La liste est vide.')).toBeVisible();
  await expect(page.getByRole('button', { name: /à trier/ })).toBeHidden();
});

test('keeps pending proposals when the application is reopened', async ({ page }) => {
  await pasteByHand(page, 'pain, beurre');
  await expect(proposals(page)).toHaveText(['pain', 'beurre']);

  await page.reload();

  await page.getByRole('button', { name: '2 articles à trier' }).click();
  await expect(proposals(page)).toHaveText(['pain', 'beurre']);
});
