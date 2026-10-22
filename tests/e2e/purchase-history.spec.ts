import { expect, test, type Page } from '@playwright/test';
import { addItems, sheetClosed, toBuy } from './helpers';

const openHistory = (page: Page) =>
  page.getByRole('button', { name: 'Historique des achats' }).click();
const history = (page: Page) => page.getByRole('dialog', { name: 'Historique des achats' });
const day = (page: Page, name: string) => history(page).getByRole('region', { name });

test('groups the purchases by day, most recent first', async ({ page }) => {
  await page.clock.install({ time: new Date(2026, 9, 19, 10) });
  await page.goto('./');
  await addItems(page, 'lait', 'pain', '2 citrons');
  await toBuy(page).filter({ hasText: 'lait' }).click();
  await toBuy(page).filter({ hasText: 'pain' }).click();
  await page.clock.setFixedTime(new Date(2026, 9, 20, 9));
  await toBuy(page).filter({ hasText: 'citrons' }).click();

  await openHistory(page);

  await expect(history(page).getByRole('heading', { level: 3 })).toHaveText([
    'mardi 20 octobre',
    'lundi 19 octobre',
  ]);
  await expect(day(page, 'mardi 20 octobre').getByRole('listitem')).toHaveText([/2\s*citrons/]);
  await expect(day(page, 'lundi 19 octobre').getByRole('listitem')).toHaveText(['lait', 'pain']);
});

test('tells when nothing was bought yet', async ({ page }) => {
  await page.goto('./');

  await openHistory(page);

  await expect(history(page)).toContainText('Aucun achat enregistré pour l’instant.');
});

test('keeps a purchase once the taken items are removed, across a reload', async ({ page }) => {
  await page.goto('./');
  await addItems(page, 'pain');
  await toBuy(page).filter({ hasText: 'pain' }).click();
  await page.getByRole('button', { name: '1 article dans le panier' }).click();
  await page.getByRole('button', { name: 'Retirer les articles pris' }).click();
  await expect(page.getByText('La liste est vide.')).toBeVisible();

  await page.reload();
  await openHistory(page);

  await expect(history(page).getByRole('listitem')).toHaveText(['pain']);
  await page.getByRole('button', { name: 'Fermer' }).click();
  await sheetClosed(page, 'Historique des achats');
});

test.describe('clearing the history', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await addItems(page, 'pain');
    await toBuy(page).filter({ hasText: 'pain' }).click();
    await openHistory(page);
    await history(page).getByRole('button', { name: 'Effacer l’historique' }).click();
  });

  test('clears every purchase once confirmed, and leaves the list alone', async ({ page }) => {
    await history(page).getByRole('button', { name: 'Effacer tout' }).click();

    await expect(history(page)).toContainText('Aucun achat enregistré pour l’instant.');
    await history(page).getByRole('button', { name: 'Fermer' }).click();
    await sheetClosed(page, 'Historique des achats');
    await expect(page.getByRole('button', { name: '1 article dans le panier' })).toBeVisible();
  });

  test('keeps the purchases when the user changes their mind', async ({ page }) => {
    await history(page).getByRole('button', { name: 'Garder' }).click();

    await expect(history(page).getByRole('listitem')).toHaveText(['pain']);
    await expect(history(page).getByRole('button', { name: 'Effacer l’historique' })).toBeVisible();
  });
});

test.describe('searching the history', () => {
  const search = (page: Page) => history(page).getByLabel('Rechercher un article');
  const found = (page: Page) =>
    history(page).getByRole('list', { name: 'Articles trouvés' }).getByRole('listitem');

  async function buy(page: Page, ...labels: string[]) {
    await addItems(page, ...labels);
    for (const label of labels) {
      await toBuy(page)
        .filter({ hasText: label.replace(/^\d+ /, '') })
        .click();
    }
    await page.getByRole('button', { name: /dans le panier/ }).click();
    await page.getByRole('button', { name: 'Retirer les articles pris' }).click();
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('./');
  });

  test('finds an item bought, then goes back to the days once cleared', async ({ page }) => {
    await buy(page, 'parmesan', 'lait');
    await openHistory(page);

    await search(page).fill('parm');

    await expect(found(page)).toHaveCount(1);
    await expect(found(page).first()).toContainText('parmesan');
    await expect(found(page).first()).toContainText('1 achat');
    await search(page).fill('');
    await expect(history(page).getByRole('heading', { level: 3 })).toHaveCount(1);
  });

  test('tells when no purchase matches', async ({ page }) => {
    await buy(page, 'lait');
    await openHistory(page);

    await search(page).fill('sucre');

    await expect(history(page)).toContainText('Aucun achat ne correspond à « sucre ».');
  });

  test('puts an item back on the list with its last quantity', async ({ page }) => {
    await buy(page, '3 citrons');
    await openHistory(page);
    await search(page).fill('citr');

    await history(page).getByRole('button', { name: 'Remettre citrons' }).click();

    await expect(found(page).first()).toContainText('Dans la liste');
    await history(page).getByRole('button', { name: 'Fermer' }).click();
    await sheetClosed(page, 'Historique des achats');
    await expect(page.getByRole('group', { name: 'Quantité de citrons' })).toContainText('3');
  });

  test('tells an item already on the list instead of offering it again', async ({ page }) => {
    await buy(page, 'citrons');
    await addItems(page, 'citrons');
    await openHistory(page);

    await search(page).fill('citr');

    await expect(found(page).first()).toContainText('Dans la liste');
    await expect(history(page).getByRole('button', { name: 'Remettre citrons' })).toHaveCount(0);
  });
});
