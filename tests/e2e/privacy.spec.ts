import { expect, test } from '@playwright/test';

test('sends nothing to another origin during a complete capture', async ({ page, baseURL }) => {
  const appOrigin = new URL(baseURL ?? '').origin;
  const foreignRequests: string[] = [];
  const violations: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== appOrigin) foreignRequests.push(request.url());
  });
  page.on('console', (message) => {
    if (message.text().includes('Content Security Policy')) violations.push(message.text());
  });

  await page.goto(`./?text=${encodeURIComponent('pain, beurre')}`);
  await page.getByRole('button', { name: 'Mettre dans la liste' }).click();
  await page.getByRole('checkbox', { name: 'pain' }).click();

  expect(foreignRequests).toEqual([]);
  expect(violations).toEqual([]);
});

test('blocks requests to another origin', async ({ page }) => {
  const violations: string[] = [];
  page.on('console', (message) => {
    if (message.text().includes('Content Security Policy')) violations.push(message.text());
  });
  await page.goto('./');

  const reached = await page.evaluate(() =>
    fetch('https://example.com/', { mode: 'no-cors' }).then(
      () => true,
      () => false,
    ),
  );

  expect(reached).toBe(false);
  expect(violations).not.toEqual([]);
});

test('serves its typeface from its own origin', async ({ page, baseURL }) => {
  const fontRequests: string[] = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'font') fontRequests.push(request.url());
  });

  await page.goto('./');

  await expect
    .poll(() =>
      page.evaluate(() =>
        [...document.fonts].filter((font) => font.status === 'loaded').map((font) => font.family),
      ),
    )
    .toContain('Bricolage Grotesque Variable');
  expect(fontRequests.length).toBeGreaterThan(0);
  expect(fontRequests.every((url) => url.startsWith(new URL(baseURL ?? '').origin))).toBe(true);
});
