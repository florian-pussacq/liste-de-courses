import { describe, expect, it } from 'vitest';
import type { Dish } from './dish';
import {
  captureText,
  emptyInbox,
  expandIntoDish,
  keptEntries,
  refreshDish,
  toggleDish,
  toggleProposal,
  type Inbox,
} from './inbox';

function sequentialIds() {
  let next = 0;
  return () => `p${++next}`;
}

const risotto: Dish = {
  id: 'd1',
  name: 'risotto',
  ingredients: [
    { label: 'riz', toCheck: false },
    { label: 'parmesan', toCheck: true },
  ],
};

const view = (inbox: Inbox) =>
  inbox.proposals.map(({ label, dish, toCheck, discarded }) =>
    [label, dish ?? '-', toCheck ? '?' : '', discarded ? 'x' : ''].join('|'),
  );

const idOf = (inbox: Inbox, label: string) => {
  const proposal = inbox.proposals.find((candidate) => candidate.label === label);
  if (!proposal) throw new Error(`No proposal "${label}"`);
  return proposal.id;
};

describe('recognising dishes', () => {
  it('replaces a known dish by its ingredients, grouped under its name', () => {
    expect(view(captureText(emptyInbox(), 'Risotto, pain', sequentialIds(), [risotto]))).toEqual([
      'riz|risotto||',
      'parmesan|risotto|?|',
      'pain|-||',
    ]);
  });

  it('proposes an unknown label as a plain item', () => {
    expect(view(captureText(emptyInbox(), 'soupe', sequentialIds(), [risotto]))).toEqual([
      'soupe|-||',
    ]);
  });

  it('proposes a dish received twice only once', () => {
    const text = 'Lundi 3 : risotto\nMardi 4 : risotto';

    expect(view(captureText(emptyInbox(), text, sequentialIds(), [risotto]))).toEqual([
      'riz|risotto||',
      'parmesan|risotto|?|',
    ]);
  });

  it('turns every ingredient of a doubtful dish into an item to check', () => {
    expect(view(captureText(emptyInbox(), 'risotto ?', sequentialIds(), [risotto]))).toEqual([
      'riz|risotto|?|',
      'parmesan|risotto|?|',
    ]);
  });

  it('leaves an ingredient already proposed alone where it is', () => {
    const newId = sequentialIds();
    const inbox = captureText(captureText(emptyInbox(), 'riz', newId, []), 'risotto', newId, [
      risotto,
    ]);

    expect(view(inbox)).toEqual(['riz|-||', 'parmesan|risotto|?|']);
  });
});

describe('discarding a whole dish', () => {
  const inbox = () => captureText(emptyInbox(), 'risotto, pain', sequentialIds(), [risotto]);

  it('discards all the ingredients of a dish, then puts them back', () => {
    const discarded = toggleDish(inbox(), 'Risotto');
    expect(keptEntries(discarded).map((entry) => entry.label)).toEqual(['pain']);

    expect(keptEntries(toggleDish(discarded, 'risotto')).map((entry) => entry.label)).toEqual([
      'riz',
      'parmesan',
      'pain',
    ]);
  });

  it('discards the whole dish when only some ingredients were discarded', () => {
    const partly = toggleProposal(inbox(), idOf(inbox(), 'riz'));

    expect(keptEntries(toggleDish(partly, 'risotto')).map((entry) => entry.label)).toEqual([
      'pain',
    ]);
  });

  it('keeps each ingredient discardable on its own', () => {
    const start = inbox();

    expect(keptEntries(toggleProposal(start, idOf(start, 'riz')))).toEqual([
      { label: 'parmesan', toCheck: true },
      { label: 'pain', toCheck: false },
    ]);
  });
});

describe('defining and updating a dish from the inbox', () => {
  it('replaces a plain proposal by the dish group, at its place', () => {
    const newId = sequentialIds();
    const start = captureText(emptyInbox(), 'pain, risotto, lait', newId, []);

    expect(view(expandIntoDish(start, idOf(start, 'risotto'), risotto, newId))).toEqual([
      'pain|-||',
      'riz|risotto||',
      'parmesan|risotto|?|',
      'lait|-||',
    ]);
  });

  it('refreshes a dish group with the new definition, at its place', () => {
    const newId = sequentialIds();
    const start = toggleDish(
      captureText(emptyInbox(), 'risotto, pain', newId, [risotto]),
      'risotto',
    );
    const updated: Dish = {
      ...risotto,
      ingredients: [...risotto.ingredients, { label: 'bouillon', toCheck: false }],
    };

    expect(view(refreshDish(start, updated, newId))).toEqual([
      'riz|risotto||',
      'parmesan|risotto|?|',
      'bouillon|risotto||',
      'pain|-||',
    ]);
  });
});
