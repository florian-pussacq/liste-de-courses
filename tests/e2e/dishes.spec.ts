import { expect, test, type Page } from '@playwright/test';
import { pasteByHand, openInboxByHand, proposals, stubClipboard, toBuy } from './helpers';

const ingredientsOf = (page: Page, dish: string) =>
  page.getByRole('list', { name: `Ingrédients de ${dish}` }).getByRole('button');

async function defineDish(page: Page, label: string, ingredients: string) {
  await page
    .getByRole('button', { name: `Écarter ${label}`, exact: true })
    .click({ button: 'right' });
  await page.getByRole('button', { name: "C'est un plat" }).click();
  await page.getByLabel(`Liste des ingrédients de ${label}`).fill(ingredients);
  await page.getByRole('button', { name: 'Enregistrer le plat' }).click();
}

test.beforeEach(async ({ page }) => {
  await stubClipboard(page, { text: '' });
  await page.goto('./');
  await openInboxByHand(page);
});

test('defines a dish from the inbox and expands it at once', async ({ page }) => {
  await pasteByHand(page, 'omelette, pain');

  await defineDish(page, 'omelette', 'œufs\nfromage ?\nciboulette');

  await expect(ingredientsOf(page, 'omelette')).toHaveText([
    'œufs',
    /^fromage\s*\?$/,
    'ciboulette',
  ]);
  await expect(page.getByRole('button', { name: 'Écarter fromage, à vérifier' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Écarter pain' })).toBeVisible();
});

test('refuses a dish without ingredient', async ({ page }) => {
  await pasteByHand(page, 'omelette');

  await proposals(page).first().click({ button: 'right' });
  await page.getByRole('button', { name: "C'est un plat" }).click();
  await page.getByRole('button', { name: 'Enregistrer le plat' }).click();

  await expect(page.getByRole('alert')).toHaveText('Indique au moins un ingrédient.');
});

test('recognises a remembered dish in a later menu, once', async ({ page }) => {
  await pasteByHand(page, 'risotto');
  await defineDish(page, 'risotto', 'riz\nparmesan ?');
  await page.getByRole('button', { name: 'Annuler' }).last().click();

  await openInboxByHand(page);
  await pasteByHand(page, 'Lundi 3 : risotto / carottes-brocolis\nMardi 4 :\nMercredi 5 : Risotto');

  await expect(ingredientsOf(page, 'risotto')).toHaveText(['riz', /^parmesan\s*\?$/]);
  await expect(page.getByRole('button', { name: /le plat risotto/ })).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Écarter carottes' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Écarter brocolis' })).toBeVisible();
});

test('discards a whole dish, or a single ingredient', async ({ page }) => {
  await pasteByHand(page, 'risotto, pain');
  await defineDish(page, 'risotto', 'riz\nparmesan');

  await page.getByRole('button', { name: 'Écarter le plat risotto' }).click();
  await expect(page.getByRole('button', { name: 'Ajouter 1 à la liste' })).toBeVisible();

  await page.getByRole('button', { name: 'Remettre le plat risotto' }).click();
  await page.getByRole('button', { name: 'Écarter riz' }).click();
  await page.getByRole('button', { name: 'Ajouter 2 à la liste' }).click();

  await expect(toBuy(page)).toHaveText(['parmesan', 'pain']);
});

test('updates a dish from its group, for this inbox and the next ones', async ({ page }) => {
  await pasteByHand(page, 'risotto');
  await defineDish(page, 'risotto', 'riz');

  await page.getByRole('button', { name: 'Écarter le plat risotto' }).click({ button: 'right' });
  await expect(page.getByLabel('Liste des ingrédients de risotto')).toHaveValue('riz');
  await page.getByLabel('Liste des ingrédients de risotto').fill('riz\nbouillon');
  await page.getByRole('button', { name: 'Enregistrer le plat' }).click();
  await expect(ingredientsOf(page, 'risotto')).toHaveText(['riz', 'bouillon']);

  await page.getByRole('button', { name: 'Annuler' }).last().click();
  await page.reload();
  await openInboxByHand(page);
  await pasteByHand(page, 'risotto');
  await expect(ingredientsOf(page, 'risotto')).toHaveText(['riz', 'bouillon']);
});

test('never sends dishes with the list', async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { sharedTexts: string[] }).sharedTexts = [];
    navigator.share = async (data?: ShareData) => {
      (window as unknown as { sharedTexts: string[] }).sharedTexts.push(data?.text ?? '');
    };
  });
  await pasteByHand(page, 'omelette');
  await defineDish(page, 'omelette', 'œufs\nlait');
  await page.getByRole('button', { name: 'Ajouter 2 à la liste' }).click();
  await page.reload();

  await page.getByRole('button', { name: 'Envoyer la liste' }).click();

  await expect
    .poll(() => page.evaluate(() => (window as unknown as { sharedTexts: string[] }).sharedTexts))
    .toEqual(['œufs\nlait']);
});
