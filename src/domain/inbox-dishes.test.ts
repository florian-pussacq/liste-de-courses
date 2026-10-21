import { describe, expect, it } from 'vitest';
import type { Dish } from './dish';
import {
  captureText,
  emptyInbox,
  expandIntoDish,
  keepAsItem,
  keepDishAsItem,
  keptEntries,
  refreshDish,
  reviewOrder,
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
  inbox.proposals.map(({ label, dish, toCheck, discarded, dishToDefine }) =>
    [
      label,
      dish ?? (dishToDefine ? 'to-define' : '-'),
      toCheck ? '?' : '',
      discarded ? 'x' : '',
    ].join('|'),
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

describe('dishes to define', () => {
  it('proposes an unknown dish name of a menu line as a dish to define', () => {
    expect(
      view(captureText(emptyInbox(), 'Lundi 3 : gratin / carottes', sequentialIds(), [])),
    ).toEqual(['gratin|to-define||', 'carottes|-||']);
  });

  it('recognises a known dish name of a menu line as a dish', () => {
    expect(
      view(captureText(emptyInbox(), 'Lundi 3 : risotto / carottes', sequentialIds(), [risotto])),
    ).toEqual(['riz|risotto||', 'parmesan|risotto|?|', 'carottes|-||']);
  });

  it('does not add a dish to define on validation', () => {
    const inbox = captureText(emptyInbox(), 'Lundi 3 : gratin / carottes', sequentialIds(), []);

    expect(keptEntries(inbox).map((entry) => entry.label)).toEqual(['carottes']);
  });

  it('keeps a dish to define as a plain item', () => {
    const inbox = captureText(emptyInbox(), 'Lundi 3 : gratin / carottes', sequentialIds(), []);

    const kept = keepAsItem(inbox, idOf(inbox, 'gratin'));

    expect(view(kept)).toEqual(['gratin|-||', 'carottes|-||']);
    expect(keptEntries(kept).map((entry) => entry.label)).toEqual(['gratin', 'carottes']);
  });

  it('defines a dish to define, replacing it by its group', () => {
    const newId = sequentialIds();
    const inbox = captureText(emptyInbox(), 'Lundi 3 : risotto ? / carottes', newId, []);

    expect(view(expandIntoDish(inbox, idOf(inbox, 'risotto'), risotto, newId))).toEqual([
      'riz|risotto|?|',
      'parmesan|risotto|?|',
      'carottes|-||',
    ]);
  });
});

describe('keeping a recognised dish as a plain item', () => {
  it('replaces the group by a plain proposal named after the dish, at its place', () => {
    const newId = sequentialIds();
    const inbox = captureText(emptyInbox(), 'pain, risotto, lait', newId, [risotto]);

    expect(view(keepDishAsItem(inbox, 'Risotto', newId))).toEqual([
      'pain|-||',
      'risotto|-||',
      'lait|-||',
    ]);
  });
});

describe('review order', () => {
  const reviewed = (inbox: Inbox) => view({ ...inbox, proposals: reviewOrder(inbox) });

  it('presents dishes, recognised or to define, before plain items', () => {
    const inbox = captureText(
      emptyInbox(),
      'Lundi 3 : risotto / carottes\nMardi 4 : gratin / brocolis',
      sequentialIds(),
      [risotto],
    );

    expect(reviewed(inbox)).toEqual([
      'riz|risotto||',
      'parmesan|risotto|?|',
      'gratin|to-define||',
      'carottes|-||',
      'brocolis|-||',
    ]);
  });

  it('adds kept items to the list in the review order', () => {
    const inbox = captureText(emptyInbox(), 'carottes\nLundi 3 : risotto', sequentialIds(), [
      risotto,
    ]);

    expect(keptEntries(inbox).map((entry) => entry.label)).toEqual(['riz', 'parmesan', 'carottes']);
  });
});
