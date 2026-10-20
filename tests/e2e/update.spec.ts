import { expect, test } from '@playwright/test';

// A new version replaces the service worker and its precache. The list must not
// depend on either, so it survives even when both are wiped out.
test('keeps the list when the application files are replaced', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.getByLabel('Nouvel article').fill('pain');
  await page.getByRole('button', { name: 'Ajouter' }).click();
  await page.getByRole('checkbox', { name: 'pain' }).check();
  await expect(page.getByRole('list', { name: 'Pris' })).toContainText('pain');

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

  await expect(page.getByRole('checkbox', { name: 'pain' })).toBeChecked();
});
