import { expect, type Page } from '@playwright/test';

export async function addItems(page: Page, ...labels: string[]) {
  await page.getByRole('button', { name: 'Ajouter un article' }).click();
  for (const label of labels) {
    await page.getByLabel('Nouvel article').fill(label);
    await page.getByRole('button', { name: 'Ajouter', exact: true }).click();
    await expect(page.getByLabel('Nouvel article')).toHaveValue('');
  }
  await page.getByRole('button', { name: 'Terminé' }).click();
}

export const toBuy = (page: Page) =>
  page.getByRole('list', { name: 'À prendre' }).getByRole('checkbox');

export const inBasket = (page: Page) =>
  page.getByRole('list', { name: 'Panier' }).getByRole('checkbox');

export const proposals = (page: Page) =>
  page.getByRole('list', { name: 'Articles proposés' }).getByRole('button');

export async function pasteByHand(page: Page, text: string) {
  await page.getByLabel('Texte à découper').fill(text);
  await page.getByRole('button', { name: 'Proposer les articles' }).click();
}

// Stands in for the browser's answer to a clipboard read: a permission prompt nobody
// answers would leave the read pending forever.
export async function stubClipboard(
  page: Page,
  answer: { text: string } | { refused: true } | { pending: true },
) {
  await page.addInitScript((stubbed) => {
    navigator.clipboard.readText = () => {
      if ('text' in stubbed) return Promise.resolve(stubbed.text);
      if ('refused' in stubbed)
        return Promise.reject(new DOMException('Read permission denied.', 'NotAllowedError'));
      return new Promise<string>(() => {});
    };
  }, answer);
}

export async function openInboxByHand(page: Page) {
  await page.getByRole('button', { name: 'Coller une liste' }).click();
  await expect(page.getByLabel('Texte à découper')).toBeVisible();
}

// A sheet is modal: what lies under it cannot be used until it has closed, as for a person.
export async function sheetClosed(page: Page, title: string) {
  await expect(page.getByRole('dialog', { name: title, exact: true })).toBeHidden();
}
