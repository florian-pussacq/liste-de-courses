import { expect, test, type Page } from '@playwright/test';
import { addItems, inBasket, toBuy } from './helpers';

const undo = (page: Page) => page.getByRole('button', { name: 'Annuler', exact: true });

async function removeSucre(page: Page) {
  await addItems(page, 'pain', 'sucre', 'sel');
  await toBuy(page).filter({ hasText: 'sucre' }).click({ button: 'right' });
  await page.getByRole('button', { name: 'Supprimer sucre' }).click();
  await expect(toBuy(page)).toHaveText(['pain', 'sel']);
}

test.beforeEach(async ({ page }) => {
  await page.clock.install();
  await page.goto('./');
});

test('undoes a removal, putting the item back at its place', async ({ page }) => {
  await removeSucre(page);

  await undo(page).click();

  await expect(toBuy(page)).toHaveText(['pain', 'sucre', 'sel']);
  await expect(undo(page)).toBeHidden();
  await page.reload();
  await expect(toBuy(page)).toHaveText(['pain', 'sucre', 'sel']);
});

test('undoes the removal of the items taken', async ({ page }) => {
  await addItems(page, 'pain', 'lait', 'sel');
  await toBuy(page).filter({ hasText: 'pain' }).click();
  await toBuy(page).filter({ hasText: 'lait' }).click();
  await page.getByRole('button', { name: '2 articles dans le panier' }).click();
  await page.getByRole('button', { name: 'Retirer les articles pris' }).click();
  await expect(page.getByRole('button', { name: /dans le panier/ })).toBeHidden();

  await undo(page).click();

  await expect(inBasket(page)).toHaveText(['pain', 'lait']);
});

test('undoes a doubt settled by mistake', async ({ page }) => {
  await page.goto(`./?text=${encodeURIComponent('riz\ncompote ?')}`);
  await page.getByRole('button', { name: 'Ajouter 2 à la liste' }).click();
  await page.getByRole('button', { name: 'On a déjà compote' }).click();
  await expect(page.getByRole('list', { name: 'À vérifier' })).toBeHidden();

  await undo(page).click();

  await expect(page.getByRole('list', { name: 'À vérifier' })).toContainText('compote');
});

test('offers to undo for a few seconds only', async ({ page }) => {
  await removeSucre(page);

  await page.clock.fastForward(5000);
  await expect(undo(page)).toBeVisible();
  await page.clock.fastForward(1000);

  await expect(undo(page)).toBeHidden();
  await expect(toBuy(page)).toHaveText(['pain', 'sel']);
});

test('no longer offers to undo once the list changed otherwise', async ({ page }) => {
  await removeSucre(page);

  await toBuy(page).filter({ hasText: 'pain' }).click();

  await expect(undo(page)).toBeHidden();
});
