import { expect, test, type Page } from '@playwright/test';

async function addItem(page: Page, label: string) {
  await page.getByLabel('Nouvel article').fill(label);
  await page.getByRole('button', { name: 'Ajouter' }).click();
}

const toBuy = (page: Page) => page.getByRole('list', { name: 'À prendre' });
const taken = (page: Page) => page.getByRole('list', { name: 'Pris' });
const labelsOf = (list: ReturnType<typeof toBuy>) => list.locator('label');

test.beforeEach(async ({ page }) => {
  await page.goto('./');
});

test('shows an empty list with a hint on how to add items', async ({ page }) => {
  await expect(page.getByText('La liste est vide.')).toBeVisible();
});

test('adds items in order and ignores duplicates', async ({ page }) => {
  await addItem(page, 'pain');
  await addItem(page, 'lait');
  await addItem(page, 'Pain');

  await expect(labelsOf(toBuy(page))).toHaveText(['pain', 'lait']);
  await expect(page.getByText('La liste est vide.')).toBeHidden();
});

test('does not add a blank item', async ({ page }) => {
  await addItem(page, '   ');

  await expect(page.getByRole('alert')).toHaveText('Le libellé ne peut pas être vide.');
  await expect(page.getByText('La liste est vide.')).toBeVisible();
});

test('checks an item, unchecks it, then clears checked items', async ({ page }) => {
  await addItem(page, 'beurre');
  await addItem(page, 'sel');

  await page.getByRole('checkbox', { name: 'beurre' }).check();
  await expect(labelsOf(taken(page))).toHaveText(['beurre']);
  await expect(labelsOf(toBuy(page))).toHaveText(['sel']);

  await page.getByRole('checkbox', { name: 'beurre' }).uncheck();
  await expect(labelsOf(toBuy(page))).toHaveText(['beurre', 'sel']);

  await page.getByRole('checkbox', { name: 'beurre' }).check();
  await page.getByRole('button', { name: 'Retirer les articles pris' }).click();
  await expect(labelsOf(toBuy(page))).toHaveText(['sel']);
  await expect(taken(page)).toBeHidden();
});

test('renames an item and refuses a label already in the list', async ({ page }) => {
  await addItem(page, 'riz');
  await addItem(page, 'tomate');

  await page.getByRole('button', { name: 'Modifier tomate' }).click();
  await page.getByLabel('Libellé de tomate').fill('Riz');
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  await expect(page.getByRole('alert')).toHaveText('Cet article est déjà dans la liste.');

  await page.getByLabel('Libellé de tomate').fill('tomates cerises');
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  await expect(labelsOf(toBuy(page))).toHaveText(['riz', 'tomates cerises']);
});

test('removes an item', async ({ page }) => {
  await addItem(page, 'sucre');

  await page.getByRole('button', { name: 'Supprimer sucre' }).click();

  await expect(page.getByText('La liste est vide.')).toBeVisible();
});
