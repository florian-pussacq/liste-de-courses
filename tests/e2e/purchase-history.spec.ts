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
