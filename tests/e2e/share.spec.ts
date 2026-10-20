import { expect, test } from '@playwright/test';
import { proposals } from './helpers';

test('opens the inbox with the items of a shared text', async ({ page }) => {
  await page.goto(`./?text=${encodeURIComponent('lait, œufs')}`);

  await expect(page.getByRole('dialog', { name: '2 articles trouvés' })).toBeVisible();
  await expect(proposals(page)).toHaveText(['lait', 'œufs']);
  expect(new URL(page.url()).search).toBe('');
});

test('takes the shared title first', async ({ page }) => {
  await page.goto('./?title=pain&text=beurre');

  await expect(proposals(page)).toHaveText(['pain', 'beurre']);
});

test('says so when a share holds no item', async ({ page }) => {
  await page.goto('./?text=%20%20');

  await expect(page.getByText('Le texte partagé ne contient aucun article.')).toBeVisible();
});

test('adds a new share to the proposals still pending', async ({ page }) => {
  await page.goto('./?text=pain');
  await expect(proposals(page)).toHaveText(['pain']);

  await page.goto('./?text=beurre');

  await expect(proposals(page)).toHaveText(['pain', 'beurre']);
});

test('does not capture the same share twice on reload', async ({ page }) => {
  await page.goto('./?text=pain');
  await expect(proposals(page)).toHaveText(['pain']);

  await page.reload();

  await page.getByRole('button', { name: '1 article à trier' }).click();
  await expect(proposals(page)).toHaveText(['pain']);
});
