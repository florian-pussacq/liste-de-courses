import { expect, test, type Page } from '@playwright/test';

const proposedValues = (page: Page) =>
  page
    .getByRole('list', { name: 'Articles proposés' })
    .getByRole('textbox')
    .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value));

test('opens the inbox with the items of a shared text', async ({ page }) => {
  await page.goto(`./?text=${encodeURIComponent('lait, œufs')}`);

  await expect(page.getByRole('heading', { name: 'Boîte de réception' })).toBeVisible();
  await expect.poll(() => proposedValues(page)).toEqual(['lait', 'œufs']);
  expect(new URL(page.url()).search).toBe('');
});

test('takes the shared title first', async ({ page }) => {
  await page.goto('./?title=pain&text=beurre');

  await expect.poll(() => proposedValues(page)).toEqual(['pain', 'beurre']);
});

test('says so when a share holds no item', async ({ page }) => {
  await page.goto('./?text=%20%20');

  await expect(page.getByText('Le texte partagé ne contient aucun article.')).toBeVisible();
});

test('adds a new share to the proposals still pending', async ({ page }) => {
  await page.goto('./?text=pain');
  await expect.poll(() => proposedValues(page)).toEqual(['pain']);

  await page.goto('./?text=beurre');

  await expect.poll(() => proposedValues(page)).toEqual(['pain', 'beurre']);
});

test('does not capture the same share twice on reload', async ({ page }) => {
  await page.goto('./?text=pain');
  await expect.poll(() => proposedValues(page)).toEqual(['pain']);

  await page.reload();

  await page.getByRole('button', { name: '1 article à valider' }).click();
  await expect.poll(() => proposedValues(page)).toEqual(['pain']);
});
