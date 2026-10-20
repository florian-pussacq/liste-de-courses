import { expect, test, type Page } from '@playwright/test';
import { addItems, proposals, toBuy } from './helpers';

const toCheckList = (page: Page) => page.getByRole('list', { name: 'À vérifier' });

async function shareAndValidate(page: Page, text: string, count: number) {
  await page.goto(`./?text=${encodeURIComponent(text)}`);
  await page.getByRole('button', { name: `Ajouter ${count} à la liste` }).click();
}

test('turns a shared element ending with a question mark into an item to check', async ({
  page,
}) => {
  await page.goto(`./?text=${encodeURIComponent('riz\ncompote ?')}`);

  await expect(proposals(page)).toHaveText(['riz', /^compote\s*\?$/]);
  await expect(page.getByRole('button', { name: 'Écarter compote, à vérifier' })).toBeVisible();

  await page.getByRole('button', { name: 'Ajouter 2 à la liste' }).click();

  await expect(page.getByRole('heading', { name: 'À vérifier avant de partir (1)' })).toBeVisible();
  await expect(toCheckList(page)).toContainText('compote');
  await expect(toBuy(page)).toHaveText(['riz']);
});

test('switches a proposal between certain and to check before validating', async ({ page }) => {
  await page.goto(`./?text=${encodeURIComponent('farine, compote ?')}`);

  await proposals(page).filter({ hasText: 'compote' }).click({ button: 'right' });
  await page.getByRole('button', { name: 'Rendre certain' }).click();
  await expect(page.getByRole('button', { name: 'Écarter compote', exact: true })).toBeVisible();

  await proposals(page).filter({ hasText: 'farine' }).click({ button: 'right' });
  await page.getByRole('button', { name: 'Marquer à vérifier' }).click();
  await page.getByRole('button', { name: 'Ajouter 2 à la liste' }).click();

  await expect(toCheckList(page)).toContainText('farine');
  await expect(toBuy(page)).toHaveText(['compote']);
});

test('removes an item the user already has', async ({ page }) => {
  await shareAndValidate(page, 'riz\ncompote ?', 2);

  await page.getByRole('button', { name: 'On a déjà compote' }).click();

  await expect(toCheckList(page)).toBeHidden();
  await expect(toBuy(page)).toHaveText(['riz']);
});

test('turns a needed item into an item to buy at its place', async ({ page }) => {
  await shareAndValidate(page, 'pain\ncompote ?\nlait', 3);

  await page.getByRole('button', { name: 'Il faut compote' }).click();

  await expect(toCheckList(page)).toBeHidden();
  await expect(toBuy(page)).toHaveText(['pain', 'compote', 'lait']);
});

test('does not count items to check in the progress', async ({ page }) => {
  await shareAndValidate(page, 'pain\nlait\nsel\nriz\ncompote ?\nconfiture ?', 6);
  await toBuy(page).filter({ hasText: 'pain' }).click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('3 à prendre');
  await expect(page.getByText('1 / 4 pris')).toBeVisible();
});

test('asks to check first when the list only holds items to check', async ({ page }) => {
  await shareAndValidate(page, 'compote ?', 1);

  await expect(page.getByRole('heading', { level: 1 })).toHaveText("À vérifier d'abord");
  await expect(page.getByRole('progressbar')).toBeHidden();
});

test('marks an item to buy as to check from its actions, and back', async ({ page }) => {
  await page.goto('./');
  await addItems(page, 'farine', 'sel');

  await toBuy(page).filter({ hasText: 'farine' }).click({ button: 'right' });
  await page.getByRole('button', { name: 'Marquer à vérifier' }).click();
  await expect(toCheckList(page)).toContainText('farine');
  await expect(toBuy(page)).toHaveText(['sel']);

  await toCheckList(page).getByText('farine').click({ button: 'right' });
  await page.getByRole('dialog').getByRole('button', { name: 'Il en faut' }).click();
  await expect(toBuy(page)).toHaveText(['farine', 'sel']);
});
