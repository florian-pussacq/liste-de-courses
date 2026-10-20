import { expect, test, type Page } from '@playwright/test';
import { addItems, proposals, toBuy } from './helpers';

async function loadThenGoOffline(page: Page) {
  await page.goto('./');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.context().setOffline(true);
}

test('works without network once loaded', async ({ page }) => {
  await loadThenGoOffline(page);

  await page.reload();
  await addItems(page, 'pain', 'sel');
  await toBuy(page).filter({ hasText: 'pain' }).click();
  await toBuy(page).filter({ hasText: 'sel' }).click({ button: 'right' });
  await page.getByRole('button', { name: 'Supprimer sel' }).click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tout est pris');
});

test('receives a share without network', async ({ page }) => {
  await loadThenGoOffline(page);

  await page.goto('./?text=lait%2C%20%C5%93ufs');

  await expect(proposals(page)).toHaveText(['lait', 'œufs']);
});
