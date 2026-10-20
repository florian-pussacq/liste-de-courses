import { beforeEach, describe, expect, it } from 'vitest';
import { keptLabels, proposedLabels } from '../domain/inbox';
import { checkedItems, itemsToBuy, type ShoppingList } from '../domain/shopping-list';
import { InMemoryInboxRepository, InMemoryShoppingListRepository } from './in-memory-repositories';
import { shopping, type Shopping } from './shopping';

const labels = (list: ShoppingList) => list.items.map((item) => item.label);

let shoppingLists: InMemoryShoppingListRepository;
let inboxes: InMemoryInboxRepository;
let app: Shopping;

beforeEach(() => {
  shoppingLists = new InMemoryShoppingListRepository();
  inboxes = new InMemoryInboxRepository();
  let clock = 0;
  let id = 0;
  app = shopping({ shoppingLists, inboxes, now: () => ++clock, newId: () => `id-${++id}` });
});

async function idOf(label: string): Promise<string> {
  const item = (await shoppingLists.load()).items.find((candidate) => candidate.label === label);
  if (!item) throw new Error(`No item "${label}"`);
  return item.id;
}

async function proposalIdOf(label: string): Promise<string> {
  const proposal = (await inboxes.load()).proposals.find((p) => p.label === label);
  if (!proposal) throw new Error(`No proposal "${label}"`);
  return proposal.id;
}

describe('capture', () => {
  it('stores the proposals of a captured text', async () => {
    await app.captureText('lait, œufs');

    expect(proposedLabels(await inboxes.load())).toEqual(['lait', 'œufs']);
  });

  it('captures shared content, title first', async () => {
    const inbox = await app.captureShared({ title: 'pain', text: 'beurre' });

    expect(proposedLabels(inbox)).toEqual(['pain', 'beurre']);
  });

  it('accumulates captures until validation', async () => {
    await app.captureText('pain');
    await app.captureText('beurre');

    expect(proposedLabels(await app.inbox())).toEqual(['pain', 'beurre']);
  });

  it('corrects, discards and adds proposals', async () => {
    await app.captureText('pense à prendre du lait stp, stp');
    await app.editProposal(await proposalIdOf('pense à prendre du lait stp'), 'lait');
    await app.toggleProposal(await proposalIdOf('stp'));
    await app.addProposal('farine');

    expect(keptLabels(await inboxes.load())).toEqual(['lait', 'farine']);
  });

  it('reports a blank correction without changing the proposals', async () => {
    await app.captureText('lait');

    expect(await app.editProposal(await proposalIdOf('lait'), ' ')).toEqual({
      ok: false,
      error: 'empty-label',
    });
    expect(proposedLabels(await inboxes.load())).toEqual(['lait']);
  });

  it('moves the proposals to the list on validation and empties the inbox', async () => {
    await app.captureText('pain, beurre');

    const list = await app.validateInbox();

    expect(labels(list)).toEqual(['pain', 'beurre']);
    expect(labels(await shoppingLists.load())).toEqual(['pain', 'beurre']);
    expect(proposedLabels(await inboxes.load())).toEqual([]);
  });

  it('adds only the proposals that were not discarded', async () => {
    await app.captureText('pain, stp');
    await app.toggleProposal(await proposalIdOf('stp'));

    expect(labels(await app.validateInbox())).toEqual(['pain']);
  });

  it('adds duplicates validated together only once', async () => {
    await app.captureText('pain\nPain');

    expect(labels(await app.validateInbox())).toEqual(['pain']);
  });

  it('empties the inbox without touching the list when the capture is abandoned', async () => {
    await app.addItem('sel');
    await app.captureText('pain');

    await app.abandonInbox();

    expect(proposedLabels(await inboxes.load())).toEqual([]);
    expect(labels(await shoppingLists.load())).toEqual(['sel']);
  });
});

describe('shopping list', () => {
  it('adds an item', async () => {
    await app.addItem('café');

    expect(labels(await app.shoppingList())).toEqual(['café']);
  });

  it('reports a blank item without saving anything', async () => {
    expect(await app.addItem(' ')).toEqual({ ok: false, error: 'empty-label' });
    expect(labels(await shoppingLists.load())).toEqual([]);
  });

  it('renames an item and reports a duplicate label', async () => {
    await app.addItem('riz');
    await app.addItem('pâtes');

    expect(await app.renameItem(await idOf('pâtes'), 'Riz')).toEqual({
      ok: false,
      error: 'duplicate-label',
    });
    await app.renameItem(await idOf('pâtes'), 'nouilles');

    expect(labels(await shoppingLists.load())).toEqual(['riz', 'nouilles']);
  });

  it('removes an item', async () => {
    await app.addItem('sucre');
    await app.removeItem(await idOf('sucre'));

    expect(labels(await shoppingLists.load())).toEqual([]);
  });

  it('checks an item then clears checked items', async () => {
    await app.addItem('pain');
    await app.addItem('sel');

    const shopped = await app.toggleItem(await idOf('pain'));
    expect(checkedItems(shopped).map((item) => item.label)).toEqual(['pain']);

    const cleared = await app.clearChecked();
    expect(itemsToBuy(cleared).map((item) => item.label)).toEqual(['sel']);
    expect(labels(await shoppingLists.load())).toEqual(['sel']);
  });
});
