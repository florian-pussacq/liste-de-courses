import { expect, test, type Page } from '@playwright/test';

async function loadThenGoOffline(page: Page) {
  await page.goto('./');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.context().setOffline(true);
}

test('works without network once loaded', async ({ page }) => {
  await loadThenGoOffline(page);

  await page.reload();
  await page.getByLabel('Nouvel article').fill('pain');
  await page.getByRole('button', { name: 'Ajouter' }).click();
  await page.getByRole('checkbox', { name: 'pain' }).check();
  await page.getByRole('button', { name: 'Supprimer pain' }).click();

  await expect(page.getByText('La liste est vide.')).toBeVisible();
});

test('receives a share without network', async ({ page }) => {
  await loadThenGoOffline(page);

  await page.goto('./?text=lait%2C%20%C5%93ufs');

  await expect(
    page.getByRole('list', { name: 'Articles proposés' }).getByRole('textbox'),
  ).toHaveCount(2);
});
