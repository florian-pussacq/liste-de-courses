import { expect, test, type Page } from '@playwright/test';
import { addItems, inBasket, openInboxByHand, pasteByHand, proposals, toBuy } from './helpers';

const report = (page: Page) => page.getByRole('status').filter({ hasText: 'Ajouté' });
const clearList = (page: Page) => page.getByRole('button', { name: 'Vider la liste' });

test.beforeEach(async ({ page }) => {
  await page.goto('./');
});

test.describe('validation report', () => {
  async function validate(page: Page, text: string) {
    await openInboxByHand(page);
    await pasteByHand(page, text);
    await page.getByRole('button', { name: 'Mettre dans la liste' }).click();
  }

  test('tells what was added and what was already listed', async ({ page }) => {
    await addItems(page, 'petits pois');

    await validate(page, 'petit pois\nlait');

    await expect(report(page)).toContainText('Ajouté : lait');
    await expect(report(page)).toContainText('Déjà dans la liste : petits pois');
  });

  test('counts a taken item validated again as added, to buy again', async ({ page }) => {
    await addItems(page, 'lait');
    await toBuy(page).filter({ hasText: 'lait' }).click();

    await validate(page, 'lait');

    await expect(report(page)).toContainText('Ajouté : lait');
    await expect(toBuy(page)).toHaveText(['lait']);
  });

  test('closes on demand', async ({ page }) => {
    await validate(page, 'lait');

    await page.getByRole('button', { name: 'Fermer le bilan' }).click();

    await expect(report(page)).toBeHidden();
  });

  test('keeps each comma on the line of the label before it', async ({ page }) => {
    await validate(
      page,
      'pain, 3 citrons, lait, 2 kg pommes de terre, yaourts nature au lait entier de brebis, compote',
    );

    const commas = await report(page).evaluate((element) => {
      const characters: { node: Text; offset: number }[] = [];
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        for (let offset = 0; offset < (node.textContent ?? '').length; offset++) {
          characters.push({ node: node as Text, offset });
        }
      }
      const lineOf = ({ node, offset }: { node: Text; offset: number }) => {
        const range = document.createRange();
        range.setStart(node, offset);
        range.setEnd(node, offset + 1);
        return range.getBoundingClientRect().top;
      };
      const found = characters.flatMap((character, index) => {
        const previous = characters[index - 1];
        if (character.node.textContent?.[character.offset] !== ',' || !previous) return [];
        return [lineOf(character) > lineOf(previous) + 1];
      });
      return { count: found.length, offTheirLabel: found.filter(Boolean).length };
    });

    expect(commas.count).toBe(5);
    expect(commas.offTheirLabel).toBe(0);
  });

  test('disappears once the list changes', async ({ page }) => {
    await validate(page, 'lait, pain');
    await expect(report(page)).toContainText('Ajoutés : lait, pain');

    await toBuy(page).filter({ hasText: 'pain' }).click();

    await expect(report(page)).toBeHidden();
  });
});

test.describe('initial capital', () => {
  test('shows an item with an initial capital, still recognised as typed', async ({ page }) => {
    await addItems(page, 'lait', 'Lait');

    await expect(toBuy(page)).toHaveText(['Lait'], { useInnerText: true });
  });

  test('shows a proposal with an initial capital', async ({ page }) => {
    await openInboxByHand(page);
    await pasteByHand(page, 'carottes');

    await expect(proposals(page)).toHaveText(['Carottes'], { useInnerText: true });
  });
});

test.describe('clearing the list', () => {
  test('removes every item, then can be undone', async ({ page }) => {
    await addItems(page, 'pain', 'lait');
    await toBuy(page).filter({ hasText: 'lait' }).click();

    await clearList(page).click();

    await expect(page.getByText('La liste est vide.')).toBeVisible();
    await page.getByRole('button', { name: 'Annuler', exact: true }).click();
    await expect(toBuy(page)).toHaveText(['pain']);
    await page.getByRole('button', { name: '1 article dans le panier' }).click();
    await expect(inBasket(page)).toHaveText(['lait']);
  });

  test('stays reachable above the dock while a report is shown', async ({ page }) => {
    await addItems(page, ...Array.from({ length: 12 }, (_, index) => `article ${index + 1}`));
    await openInboxByHand(page);
    await pasteByHand(
      page,
      'tomates cerises\npommes de terre\ncompote\nyaourts\narticle 1\narticle 2\narticle 3',
    );
    await page.getByRole('button', { name: 'Mettre dans la liste' }).click();
    await expect(report(page)).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const button = await clearList(page).boundingBox();
    const dock = await page.getByRole('navigation', { name: 'Ajouter des articles' }).boundingBox();
    expect(button && dock && button.y + button.height).toBeLessThanOrEqual(dock?.y ?? 0);
  });

  test('is not offered when everything is taken, leaving the removal of taken items', async ({
    page,
  }) => {
    await addItems(page, 'pain', 'lait');
    await toBuy(page).filter({ hasText: 'pain' }).click();
    await expect(clearList(page)).toBeVisible();

    await toBuy(page).filter({ hasText: 'lait' }).click();
    await page.getByRole('button', { name: '2 articles dans le panier' }).click();

    await expect(page.getByRole('button', { name: 'Retirer les articles pris' })).toBeVisible();
    await expect(clearList(page)).toBeHidden();
  });

  test('is not offered for an empty list', async ({ page }) => {
    await expect(page.getByText('La liste est vide.')).toBeVisible();

    await expect(clearList(page)).toBeHidden();
  });
});
