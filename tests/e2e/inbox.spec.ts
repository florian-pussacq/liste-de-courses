import { expect, test } from '@playwright/test';
import {
  openInboxByHand,
  pasteByHand,
  proposals,
  stubClipboard,
  toBuy,
  sheetClosed,
} from './helpers';

test.beforeEach(async ({ page }) => {
  await stubClipboard(page, { text: '' });
  await page.goto('./');
  await openInboxByHand(page);
});

test('proposes one item per line of a pasted list and recalls the text', async ({ page }) => {
  await pasteByHand(page, '- pain\n* beurre\n\n1. confiture');

  await expect(proposals(page)).toHaveText(['pain', 'beurre', 'confiture']);
  await page.getByText('1 texte reçu').click();
  await expect(page.getByRole('region', { name: 'Textes reçus' })).toContainText('1. confiture');
});

test('folds the received texts by default, telling how many there are', async ({ page }) => {
  await pasteByHand(page, 'pense à prendre du lait stp');

  await expect(page.getByText('1 texte reçu')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Textes reçus' })).toBeHidden();
});

test('recalls several received texts in their order', async ({ page }) => {
  await pasteByHand(page, 'pain');
  await pasteByHand(page, 'beurre');

  await page.getByText('2 textes reçus').click();
  await expect(page.getByRole('region', { name: 'Textes reçus' }).locator('blockquote')).toHaveText(
    ['pain', 'beurre'],
  );
});

test('discards a proposal, puts it back, and adds only kept proposals', async ({ page }) => {
  await pasteByHand(page, 'pain, stp, confiture');

  await page.getByRole('button', { name: 'Écarter stp' }).click();
  await page.getByRole('button', { name: 'Écarter confiture' }).click();
  await page.getByRole('button', { name: 'Remettre confiture' }).click();
  await expect(page.getByRole('heading', { name: '2 articles trouvés' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mettre dans la liste' })).toBeEnabled();

  await page.getByRole('button', { name: 'Mettre dans la liste' }).click();

  await expect(toBuy(page)).toHaveText(['pain', 'confiture']);
});

test('corrects a proposal with a long press and adds one by hand', async ({ page }) => {
  await pasteByHand(page, 'pense à prendre du lait stp');

  await proposals(page).first().click({ button: 'right' });
  await page.getByLabel('Corriger pense à prendre du lait stp').fill('lait');
  await page.getByRole('button', { name: 'Corriger', exact: true }).click();
  await sheetClosed(page, 'pense à prendre du lait stp');
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

test('keeps the validation in sight however long the review is', async ({ page }) => {
  const labels = Array.from({ length: 20 }, (_, index) => `article ${index + 1}`);
  await pasteByHand(page, labels.join('\n'));

  await expect(page.getByRole('button', { name: 'Mettre dans la liste' })).toBeInViewport();
  await expect(page.getByRole('button', { name: 'Annuler', exact: true })).toBeInViewport();
});

test('hides the manual entry while proposals are to be sorted', async ({ page }) => {
  await page.goto(`./?text=${encodeURIComponent('pain, beurre')}`);

  await expect(proposals(page)).toHaveText(['pain', 'beurre']);
  await expect(page.getByLabel('Texte à découper')).toHaveCount(0);
  await expect(page.getByText('Coller ou écrire une liste à la main')).toHaveCount(0);
});
