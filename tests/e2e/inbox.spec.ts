import { expect, test, type Page } from '@playwright/test';

const proposals = (page: Page) =>
  page.getByRole('list', { name: 'Articles proposés' }).getByRole('textbox');
const proposedValues = (page: Page) =>
  proposals(page).evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value));
const listLabels = (page: Page) => page.getByRole('list', { name: 'À prendre' }).locator('label');

async function paste(page: Page, text: string) {
  await page.getByLabel('Texte à découper').fill(text);
  await page.getByRole('button', { name: 'Proposer les articles' }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Coller du texte' }).click();
});

test('proposes one item per line of a pasted list', async ({ page }) => {
  await paste(page, '- pain\n* beurre\n\n1. confiture');

  await expect.poll(() => proposedValues(page)).toEqual(['pain', 'beurre', 'confiture']);
});

test('corrects, discards and adds proposals before validating them', async ({ page }) => {
  await paste(page, 'pense à prendre du lait stp, stp');

  await proposals(page).first().fill('lait');
  await proposals(page).first().blur();
  await page.getByRole('button', { name: 'Écarter stp' }).click();
  await page.getByLabel('Article à proposer').fill('farine');
  await page.getByRole('button', { name: 'Ajouter' }).click();
  await expect.poll(() => proposedValues(page)).toEqual(['lait', 'farine']);

  await page.getByRole('button', { name: 'Valider 2 articles' }).click();

  await expect(listLabels(page)).toHaveText(['lait', 'farine']);
  await expect(page.getByRole('button', { name: 'Coller du texte' })).toBeVisible();
});

test('refuses to blank a proposal', async ({ page }) => {
  await paste(page, 'lait');

  await proposals(page).first().fill(' ');
  await proposals(page).first().blur();

  await expect(page.getByRole('alert')).toHaveText('Le libellé ne peut pas être vide.');
  await expect.poll(() => proposedValues(page)).toEqual(['lait']);
});

test('abandons a capture without touching the list', async ({ page }) => {
  await paste(page, 'pain, beurre');

  await page.getByRole('button', { name: 'Abandonner' }).click();

  await expect(page.getByText('La liste est vide.')).toBeVisible();
  await page.getByRole('button', { name: 'Coller du texte' }).click();
  await expect(page.getByText('Aucun article proposé pour le moment.')).toBeVisible();
});

test('keeps pending proposals when the application is reopened', async ({ page }) => {
  await paste(page, 'pain, beurre');

  await page.reload();

  await page.getByRole('button', { name: '2 articles à valider' }).click();
  await expect.poll(() => proposedValues(page)).toEqual(['pain', 'beurre']);
});
