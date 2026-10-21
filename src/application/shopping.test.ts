import { beforeEach, describe, expect, it } from 'vitest';
import { keptEntries, proposedLabels } from '../domain/inbox';
import { checkedItems, itemsToBuy, itemsToCheck, type ShoppingList } from '../domain/shopping-list';
import type { ClipboardContent } from './ports';
import {
  InMemoryDishRepository,
  InMemoryInboxRepository,
  InMemoryShoppingListRepository,
} from './in-memory-repositories';
import { shopping, type Shopping } from './shopping';

const labels = (list: ShoppingList) => list.items.map((item) => item.label);

let shoppingLists: InMemoryShoppingListRepository;
let inboxes: InMemoryInboxRepository;
let dishes: InMemoryDishRepository;
let app: Shopping;
let clipboard: ClipboardContent;
let sent: string[];

beforeEach(() => {
  shoppingLists = new InMemoryShoppingListRepository();
  inboxes = new InMemoryInboxRepository();
  dishes = new InMemoryDishRepository();
  let clock = 0;
  let id = 0;
  clipboard = { kind: 'empty' };
  sent = [];
  app = shopping({
    shoppingLists,
    inboxes,
    dishes,
    now: () => ++clock,
    newId: () => `id-${++id}`,
    readClipboard: async () => clipboard,
    sendText: async (text) => {
      sent.push(text);
      return 'shared';
    },
  });
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

    expect(keptEntries(await inboxes.load()).map((entry) => entry.label)).toEqual([
      'lait',
      'farine',
    ]);
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

  it('adds proposals to check as items to check', async () => {
    await app.captureText('riz, compote ?');

    const list = await app.validateInbox();

    expect(itemsToCheck(list).map((item) => item.label)).toEqual(['compote']);
    expect(itemsToBuy(list).map((item) => item.label)).toEqual(['riz']);
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

describe('pasting from the clipboard', () => {
  it('captures the text held by the clipboard', async () => {
    clipboard = { kind: 'text', text: 'pain, beurre' };

    const pasted = await app.pasteFromClipboard();

    expect(pasted.outcome).toBe('captured');
    expect(proposedLabels(await inboxes.load())).toEqual(['pain', 'beurre']);
  });

  it('reports an empty clipboard without touching the inbox', async () => {
    clipboard = { kind: 'empty' };
    sent = [];

    expect((await app.pasteFromClipboard()).outcome).toBe('empty');
    expect(proposedLabels(await inboxes.load())).toEqual([]);
  });

  it('reports a clipboard that cannot be read', async () => {
    clipboard = { kind: 'unavailable' };

    expect((await app.pasteFromClipboard()).outcome).toBe('unavailable');
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

  it('restores the list exactly as it was before a removal', async () => {
    await app.addItem('pain');
    await app.addItem('sucre');
    await app.addItem('sel');
    await app.toggleItem(await idOf('pain'));
    const before = await app.shoppingList();
    await app.removeItem(await idOf('sucre'));
    await app.clearChecked();

    const restored = await app.restoreList(before);

    expect(restored).toEqual(before);
    expect(await shoppingLists.load()).toEqual(before);
  });
});

describe('items to check', () => {
  it('turns an item to check into an item to buy, and back', async () => {
    await app.captureText('compote ?');
    await app.validateInbox();
    const id = await idOf('compote');

    expect(itemsToBuy(await app.setToCheck(id, false)).map((item) => item.label)).toEqual([
      'compote',
    ]);
    expect(itemsToCheck(await app.setToCheck(id, true)).map((item) => item.label)).toEqual([
      'compote',
    ]);
    expect(itemsToCheck(await shoppingLists.load()).map((item) => item.label)).toEqual(['compote']);
  });

  it('switches a proposal between certain and to check', async () => {
    await app.captureText('farine');

    const inbox = await app.toggleProposalToCheck(await proposalIdOf('farine'));

    expect(inbox.proposals[0]?.toCheck).toBe(true);
    expect((await inboxes.load()).proposals[0]?.toCheck).toBe(true);
  });
});

describe('sending the list', () => {
  it('sends the list as text', async () => {
    await app.addItem('pain');
    await app.captureText('compote ?');
    await app.validateInbox();

    expect(await app.sendList()).toBe('shared');
    expect(sent).toEqual(['pain\ncompote ?']);
  });

  it('sends nothing when nothing is left to buy or check', async () => {
    await app.addItem('pain');
    await app.toggleItem(await idOf('pain'));

    expect(await app.sendList()).toBe('nothing-to-send');
    expect(sent).toEqual([]);
  });
});

describe('dishes', () => {
  const groups = async () =>
    (await inboxes.load()).proposals.map((proposal) => `${proposal.label}|${proposal.dish ?? '-'}`);

  it('defines a dish from a proposal and expands it at once', async () => {
    await app.captureText('omelette, pain');

    const result = await app.defineDishFromProposal(
      await proposalIdOf('omelette'),
      'œufs\nfromage ?',
    );

    expect(result.ok).toBe(true);
    expect(await groups()).toEqual(['œufs|omelette', 'fromage|omelette', 'pain|-']);
    expect((await dishes.load()).map((dish) => dish.name)).toEqual(['omelette']);
  });

  it('refuses a dish without ingredient and remembers nothing', async () => {
    await app.captureText('omelette');

    expect(await app.defineDishFromProposal(await proposalIdOf('omelette'), ' ')).toEqual({
      ok: false,
      error: 'no-ingredient',
    });
    expect(await dishes.load()).toEqual([]);
    expect(await groups()).toEqual(['omelette|-']);
  });

  it('recognises remembered dishes in every capture', async () => {
    await app.captureText('omelette');
    await app.defineDishFromProposal(await proposalIdOf('omelette'), 'œufs');
    await app.abandonInbox();

    await app.captureShared({ text: 'Omelette' });
    expect(await groups()).toEqual(['œufs|omelette']);

    await app.abandonInbox();
    clipboard = { kind: 'text', text: 'omelette, sel' };
    await app.pasteFromClipboard();
    expect(await groups()).toEqual(['œufs|omelette', 'sel|-']);
  });

  it('updates a dish, refreshing its group and the next recognitions', async () => {
    await app.captureText('omelette');
    await app.defineDishFromProposal(await proposalIdOf('omelette'), 'œufs');

    await app.updateDish('omelette', 'œufs\nciboulette');
    expect(await groups()).toEqual(['œufs|omelette', 'ciboulette|omelette']);
    expect(await dishes.load()).toHaveLength(1);

    await app.abandonInbox();
    await app.captureText('omelette');
    expect(await groups()).toEqual(['œufs|omelette', 'ciboulette|omelette']);
  });

  it('keeps a recognised dish as a plain item for this inbox only', async () => {
    await app.captureText('omelette');
    await app.defineDishFromProposal(await proposalIdOf('omelette'), 'œufs');

    await app.keepDishAsItem('omelette');
    expect(await groups()).toEqual(['omelette|-']);
    expect((await dishes.load()).map((dish) => dish.name)).toEqual(['omelette']);

    await app.validateInbox();
    await app.captureText('omelette');
    expect(await groups()).toEqual(['œufs|omelette']);
  });

  it('keeps a dish to define as a plain item', async () => {
    await app.captureText('Lundi 3 : gratin / carottes');

    await app.keepAsItem(await proposalIdOf('gratin'));

    expect(labels(await app.validateInbox())).toEqual(['gratin', 'carottes']);
  });

  it('discards a whole dish', async () => {
    await app.captureText('omelette, pain');
    await app.defineDishFromProposal(await proposalIdOf('omelette'), 'œufs\nlait');

    await app.toggleDish('omelette');

    expect(keptEntries(await inboxes.load()).map((entry) => entry.label)).toEqual(['pain']);
  });
});
