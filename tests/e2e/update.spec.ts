import { expect, test } from '@playwright/test';
import { addItems, toBuy } from './helpers';

// A new version replaces the service worker and its precache. The list must not
// depend on either, so it survives even when both are wiped out.
test('keeps the list when the application files are replaced', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await addItems(page, 'pain', 'sel');
  await toBuy(page).filter({ hasText: 'pain' }).click();
  await expect(page.getByRole('button', { name: '1 article dans le panier' })).toBeVisible();

  const removedCaches = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    await registration.unregister();
    const names = await caches.keys();
    await Promise.all(names.map((name) => caches.delete(name)));
    return names.length;
  });
  expect(removedCaches).toBeGreaterThan(0);

  await page.reload();
  await page.evaluate(() => navigator.serviceWorker.ready);

  await page.getByRole('button', { name: '1 article dans le panier' }).click();
  await expect(page.getByRole('checkbox', { name: 'pain' })).toBeChecked();
});
