import { expect, test, type Page } from '@playwright/test';
import { addItems, inBasket, toBuy } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('./');
});

test('explains how to fill an empty list', async ({ page }) => {
  await expect(page.getByText('La liste est vide.')).toBeVisible();
  await expect(page.getByText('Un appui long sur un article')).toBeVisible();
});

test('adds items in order, ignores duplicates and refuses a blank label', async ({ page }) => {
  await addItems(page, 'pain', 'lait', 'Pain');

  await expect(toBuy(page)).toHaveText(['pain', 'lait']);

  await page.getByRole('button', { name: 'Ajouter un article' }).click();
  await page.getByLabel('Nouvel article').fill('   ');
  await page.getByRole('button', { name: 'Ajouter', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Le libellé ne peut pas être vide.');
});

test.describe('reminder of the long press', () => {
  const reminder = (page: Page) =>
    page.getByText('Appui long sur un article pour le modifier ou le supprimer.');

  test('follows the items while preparing', async ({ page }) => {
    await addItems(page, 'pain');

    await expect(reminder(page)).toBeVisible();
  });

  test('is gone in store', async ({ page }) => {
    await addItems(page, 'pain', 'lait');
    await toBuy(page).filter({ hasText: 'pain' }).click();

    await expect(reminder(page)).toBeHidden();
  });
});

test.describe('progress bar', () => {
  test('is absent while preparing', async ({ page }) => {
    await addItems(page, 'pain', 'lait');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('2 à prendre');
    await expect(page.getByRole('progressbar')).toBeHidden();
  });

  test('appears in store', async ({ page }) => {
    await addItems(page, 'pain', 'lait');
    await toBuy(page).filter({ hasText: 'pain' }).click();

    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '1 pris sur 2');
  });
});

test('shows the progress of the shopping', async ({ page }) => {
  await addItems(page, 'pain', 'lait', 'sel', 'riz', 'café');
  await toBuy(page).filter({ hasText: 'pain' }).click();
  await toBuy(page).filter({ hasText: 'lait' }).click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('3 à prendre');
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '2 pris sur 5');
  await expect(page.getByText('2 / 5 pris')).toHaveCount(0);

  for (const label of ['sel', 'riz', 'café']) await toBuy(page).filter({ hasText: label }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tout est pris');
});

test('checks an item by touching its whole row and keeps it in a folded basket', async ({
  page,
}) => {
  await addItems(page, 'beurre', 'sel');

  // Far from the round mark, at the right end of the zone that checks the item.
  const beurre = toBuy(page).filter({ hasText: 'beurre' });
  const zone = await beurre.boundingBox();
  await beurre.click({ position: { x: (zone?.width ?? 0) - 10, y: 20 } });

  await expect(toBuy(page)).toHaveText(['sel']);
  const basketToggle = page.getByRole('button', { name: '1 article dans le panier' });
  await expect(basketToggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('list', { name: 'Panier' })).toBeHidden();

  await basketToggle.click();
  await expect(inBasket(page)).toHaveText(['beurre']);
  await expect(inBasket(page).first()).toBeChecked();
});

test('unchecks an item from the basket', async ({ page }) => {
  await addItems(page, 'beurre', 'sel');
  await toBuy(page).filter({ hasText: 'beurre' }).click();

  await page.getByRole('button', { name: '1 article dans le panier' }).click();
  await inBasket(page).filter({ hasText: 'beurre' }).click();

  await expect(toBuy(page)).toHaveText(['beurre', 'sel']);
});

test('clears checked items from the opened basket', async ({ page }) => {
  await addItems(page, 'pain', 'sel');
  await toBuy(page).filter({ hasText: 'pain' }).click();

  await page.getByRole('button', { name: '1 article dans le panier' }).click();
  await page.getByRole('button', { name: 'Retirer les articles pris' }).click();

  await expect(toBuy(page)).toHaveText(['sel']);
  await expect(page.getByRole('button', { name: /dans le panier/ })).toBeHidden();
});

test('opens the actions of an item with a long press, without checking it', async ({ page }) => {
  await addItems(page, 'tomate');

  await toBuy(page).filter({ hasText: 'tomate' }).click({ button: 'right' });

  await expect(page.getByRole('dialog', { name: 'tomate' })).toBeVisible();
  await expect(toBuy(page).filter({ hasText: 'tomate' })).not.toBeChecked();
});

test('renames an item and refuses a label already in the list', async ({ page }) => {
  await addItems(page, 'riz', 'tomate');
  await toBuy(page).filter({ hasText: 'tomate' }).click({ button: 'right' });

  await page.getByLabel('Libellé de tomate').fill('Riz');
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  await expect(page.getByRole('alert')).toHaveText('Cet article est déjà dans la liste.');

  await page.getByLabel('Libellé de tomate').fill('tomates cerises');
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  await expect(toBuy(page)).toHaveText(['riz', 'tomates cerises']);
});

test('removes an item from its actions', async ({ page }) => {
  await addItems(page, 'sucre');

  await toBuy(page).filter({ hasText: 'sucre' }).click({ button: 'right' });
  await page.getByRole('button', { name: 'Supprimer sucre' }).click();

  await expect(page.getByText('La liste est vide.')).toBeVisible();
});

test('does not add the singular of an item already listed in the plural', async ({ page }) => {
  await addItems(page, 'petits pois', 'petit pois');

  await expect(toBuy(page)).toHaveText(['petits pois']);
});
