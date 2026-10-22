import { expect, test, type Page } from '@playwright/test';
import { addItems, proposals, stubClipboard, toBuy } from './helpers';

test('captures the list held by the clipboard in one touch', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('./');
  await page.evaluate(() => navigator.clipboard.writeText('pain, beurre'));

  await page.getByRole('button', { name: 'Coller une liste' }).click();

  await expect(proposals(page)).toHaveText(['pain', 'beurre']);
});

test('falls back to typing when the clipboard is empty', async ({ page }) => {
  await stubClipboard(page, { text: '  ' });
  await page.goto('./');

  await page.getByRole('button', { name: 'Coller une liste' }).click();

  await expect(page.getByRole('status')).toContainText('Le presse-papiers est vide.');
  await expect(page.getByLabel('Texte à découper')).toBeVisible();
});

test('falls back to typing when reading the clipboard is refused', async ({ page }) => {
  await stubClipboard(page, { refused: true });
  await page.goto('./');

  await page.getByRole('button', { name: 'Coller une liste' }).click();

  await expect(page.getByRole('status')).toContainText("Le presse-papiers n'a pas pu être lu.");
  await expect(page.getByLabel('Texte à découper')).toBeVisible();
});

test('lets the user type while the clipboard read waits for permission', async ({ page }) => {
  await stubClipboard(page, { pending: true });
  await page.goto('./');

  await page.getByRole('button', { name: 'Coller une liste' }).click();

  await expect(page.getByRole('status')).toHaveText('Lecture du presse-papiers…');
  await page.getByLabel('Texte à découper').fill('pain');
  await page.getByRole('button', { name: 'Proposer les articles' }).click();
  await expect(proposals(page)).toHaveText(['pain']);
});

test('stops warning about the clipboard once a list was pasted by hand', async ({ page }) => {
  await stubClipboard(page, { text: '' });
  await page.goto('./');
  await page.getByRole('button', { name: 'Coller une liste' }).click();
  await expect(page.getByRole('status')).toContainText('Le presse-papiers est vide.');

  await page.getByLabel('Texte à découper').fill('pain');
  await page.getByRole('button', { name: 'Proposer les articles' }).click();

  await expect(proposals(page)).toHaveText(['pain']);
  await expect(page.getByRole('status')).toBeHidden();
});

test('opens the inbox without activating a field, so no keyboard pops up', async ({ page }) => {
  await stubClipboard(page, { text: 'pain, beurre' });
  await page.goto('./');

  await page.getByRole('button', { name: 'Coller une liste' }).click();

  await expect(proposals(page)).toHaveText(['pain', 'beurre']);
  await expect(page.locator('input:focus, textarea:focus')).toHaveCount(0);
});

test.describe('the paste action', () => {
  const paste = (page: Page) => page.getByRole('button', { name: 'Coller une liste' });

  test('shows its label while preparing the list', async ({ page }) => {
    await page.goto('./');
    await addItems(page, 'pain');

    await expect(paste(page)).toHaveText('Coller une liste');
  });

  test('shrinks to its icon in store, keeping its name', async ({ page }) => {
    await page.goto('./');
    await addItems(page, 'pain');
    await toBuy(page).filter({ hasText: 'pain' }).click();

    await expect(paste(page)).toHaveText('');
  });

  test.describe('in dark mode', () => {
    test.use({ colorScheme: 'dark' });

    test('keeps its icon visible against the button', async ({ page }) => {
      await page.goto('./');

      const background = await paste(page).evaluate(
        (button) => getComputedStyle(button).backgroundColor,
      );
      const icon = await paste(page)
        .locator('svg')
        .evaluate((svg) => getComputedStyle(svg).stroke);

      // WCAG 1.4.11: a graphic that identifies a control needs 3:1 against its background.
      expect(contrast(icon, background)).toBeGreaterThanOrEqual(3);
    });
  });

  test('still captures the clipboard in store', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('./');
    await addItems(page, 'pain');
    await toBuy(page).filter({ hasText: 'pain' }).click();
    await page.evaluate(() => navigator.clipboard.writeText('beurre'));

    await paste(page).click();

    await expect(proposals(page)).toHaveText(['beurre']);
  });
});

function luminance(color: string): number {
  const rgb = /^rgba?\((\d+), (\d+), (\d+)/.exec(color);
  if (!rgb) throw new Error(`Unexpected color "${color}"`);
  const linear = (channel: string) => {
    const value = Number(channel) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * linear(rgb[1] ?? '') + 0.7152 * linear(rgb[2] ?? '') + 0.0722 * linear(rgb[3] ?? '')
  );
}

function contrast(first: string, second: string): number {
  const [a, b] = [luminance(first), luminance(second)];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
