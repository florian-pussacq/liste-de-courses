import { expect, test, type Page } from '@playwright/test';
import { addItems, toBuy } from './helpers';

declare global {
  interface Window {
    sharedTexts: string[];
  }
}

// Stands in for Android's share menu, which no browser automation can open.
async function stubShareMenu(page: Page, answer: 'share' | 'cancel' | 'absent') {
  await page.addInitScript((mode) => {
    window.sharedTexts = [];
    if (mode === 'absent') {
      Object.defineProperty(navigator, 'share', { value: undefined });
      return;
    }
    navigator.share = async (data?: ShareData) => {
      if (mode === 'cancel') throw new DOMException('Share canceled', 'AbortError');
      window.sharedTexts.push(data?.text ?? '');
    };
  }, answer);
}

const sendButton = (page: Page) => page.getByRole('button', { name: 'Envoyer la liste' });

test('sends items to buy then items to check, without taken items', async ({ page }) => {
  await stubShareMenu(page, 'share');
  await page.goto(`./?text=${encodeURIComponent('pain\nlait\ncompote ?\nsel')}`);
  await page.getByRole('button', { name: 'Ajouter 4 à la liste' }).click();
  await toBuy(page).filter({ hasText: 'sel' }).click();

  await sendButton(page).click();

  await expect
    .poll(() => page.evaluate(() => window.sharedTexts))
    .toEqual(['Pain\nLait\nCompote ?']);
  await expect(page.getByRole('status')).toBeHidden();
});

test('cannot send a list where everything is taken', async ({ page }) => {
  await stubShareMenu(page, 'share');
  await page.goto('./');
  await expect(sendButton(page)).toBeDisabled();

  await addItems(page, 'pain');
  await expect(sendButton(page)).toBeEnabled();

  await toBuy(page).filter({ hasText: 'pain' }).click();
  await expect(sendButton(page)).toBeDisabled();
});

test('copies the list when the phone offers no share menu', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await stubShareMenu(page, 'absent');
  await page.goto('./');
  await addItems(page, 'pain', 'lait');

  await sendButton(page).click();

  await expect(page.getByRole('status')).toHaveText('Liste copiée : colle-la dans ta messagerie.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('Pain\nLait');
});

test('says nothing when the share menu is closed without choosing', async ({ page }) => {
  await stubShareMenu(page, 'cancel');
  await page.goto('./');
  await addItems(page, 'pain');

  await sendButton(page).click();

  await expect(toBuy(page)).toHaveText(['pain']);
  await expect(page.getByRole('status')).toBeHidden();
  await expect(page.getByRole('alert')).toBeHidden();
});

test('makes no request to another origin while sending', async ({ page, baseURL }) => {
  const appOrigin = new URL(baseURL ?? '').origin;
  const foreignRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== appOrigin) foreignRequests.push(request.url());
  });
  await stubShareMenu(page, 'share');
  await page.goto('./');
  await addItems(page, 'pain');

  await sendButton(page).click();

  await expect.poll(() => page.evaluate(() => window.sharedTexts.length)).toBe(1);
  expect(foreignRequests).toEqual([]);
});
