import { expect, test } from '@playwright/test';

test('is installable as an application', async ({ page, context }) => {
  await page.goto('./');
  await page.evaluate(() => navigator.serviceWorker.ready);

  const cdp = await context.newCDPSession(page);
  const { installabilityErrors } = await cdp.send('Page.getInstallabilityErrors');

  // Playwright contexts are incognito, which Chrome never treats as installable.
  const errors = installabilityErrors
    .map(({ errorId }) => errorId)
    .filter((errorId) => errorId !== 'in-incognito');
  expect(errors).toEqual([]);
});
