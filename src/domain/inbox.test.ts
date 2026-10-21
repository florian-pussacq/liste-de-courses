import { describe, expect, it } from 'vitest';
import {
  addProposal,
  captureText,
  editProposal,
  emptyInbox,
  keptEntries,
  proposedLabels,
  toggleProposalToCheck,
  toggleProposal,
  type Inbox,
} from './inbox';

function sequentialIds() {
  let next = 0;
  return () => `proposal-${++next}`;
}

const captured = (text: string, inbox: Inbox = emptyInbox(), newId = sequentialIds()) =>
  captureText(inbox, text, newId);

const idOf = (inbox: Inbox, label: string) => {
  const proposal = inbox.proposals.find((candidate) => candidate.label === label);
  if (!proposal) throw new Error(`No proposal "${label}"`);
  return proposal.id;
};

describe('capturing text', () => {
  it('proposes the labels found in the captured text', () => {
    expect(proposedLabels(captured('lait, œufs'))).toEqual(['lait', 'œufs']);
  });

  it('gives each proposal its own identity', () => {
    expect(captured('lait, œufs').proposals.map((proposal) => proposal.id)).toEqual([
      'proposal-1',
      'proposal-2',
    ]);
  });

  it('appends a new capture to the pending proposals', () => {
    const newId = sequentialIds();
    const inbox = captured('beurre', captured('pain', emptyInbox(), newId), newId);

    expect(proposedLabels(inbox)).toEqual(['pain', 'beurre']);
  });

  it('proposes nothing for blank text', () => {
    expect(proposedLabels(captured('   '))).toEqual([]);
  });

  it('remembers the captured texts in the order they arrived', () => {
    const newId = sequentialIds();
    const inbox = captured(
      'beurre',
      captured('pense à prendre du pain stp', emptyInbox(), newId),
      newId,
    );

    expect(inbox.capturedTexts).toEqual(['pense à prendre du pain stp', 'beurre']);
  });

  it('does not remember blank texts', () => {
    expect(captured('  \n ').capturedTexts).toEqual([]);
  });
});

describe('correcting proposals', () => {
  it('replaces the label of a proposal', () => {
    const inbox = captured('pense à prendre du lait stp');
    const result = editProposal(inbox, idOf(inbox, 'pense à prendre du lait stp'), ' lait ');

    expect(result.ok && proposedLabels(result.value)).toEqual(['lait']);
  });

  it('refuses a blank label', () => {
    const inbox = captured('lait');

    expect(editProposal(inbox, idOf(inbox, 'lait'), '  ')).toEqual({
      ok: false,
      error: 'empty-label',
    });
  });

  it('reports an unknown proposal', () => {
    expect(editProposal(captured('lait'), 'unknown', 'beurre')).toEqual({
      ok: false,
      error: 'proposal-not-found',
    });
  });

  it('discards a proposal, which is then no longer kept', () => {
    const inbox = captured('lait, stp');

    const sorted = toggleProposal(inbox, idOf(inbox, 'stp'));

    expect(sorted.proposals.find((proposal) => proposal.label === 'stp')?.discarded).toBe(true);
    expect(keptEntries(sorted).map((entry) => entry.label)).toEqual(['lait']);
  });

  it('puts a discarded proposal back', () => {
    const inbox = captured('confiture');
    const id = idOf(inbox, 'confiture');

    expect(keptEntries(toggleProposal(toggleProposal(inbox, id), id))).toEqual([
      { label: 'confiture', toCheck: false },
    ]);
  });

  it('adds a proposal by hand', () => {
    const result = addProposal(captured('lait'), 'farine', () => 'manual');

    expect(result.ok && result.value.capturedTexts).toEqual(['lait']);
    expect(result.ok && result.value.proposals).toEqual([
      { id: 'proposal-1', label: 'lait', discarded: false, toCheck: false },
      { id: 'manual', label: 'farine', discarded: false, toCheck: false },
    ]);
  });

  it('refuses to add a blank proposal', () => {
    expect(addProposal(emptyInbox(), ' ', () => 'manual')).toEqual({
      ok: false,
      error: 'empty-label',
    });
  });
});

describe('proposals to check', () => {
  it('marks proposals ending with a question mark as to check', () => {
    expect(
      captured('riz\ncompote ?').proposals.map(({ label, toCheck }) => [label, toCheck]),
    ).toEqual([
      ['riz', false],
      ['compote', true],
    ]);
  });

  it('makes a proposal to check certain, and back', () => {
    const inbox = captured('compote ?');
    const id = idOf(inbox, 'compote');

    const certain = toggleProposalToCheck(inbox, id);
    expect(certain.proposals[0]?.toCheck).toBe(false);
    expect(toggleProposalToCheck(certain, id).proposals[0]?.toCheck).toBe(true);
  });

  it('keeps the to-check state of the proposals that were not discarded', () => {
    const inbox = captured('riz, compote ?, stp');

    expect(keptEntries(toggleProposal(inbox, idOf(inbox, 'stp')))).toEqual([
      { label: 'riz', toCheck: false },
      { label: 'compote', toCheck: true },
    ]);
  });

  it('adds proposals by hand as certain', () => {
    const result = addProposal(emptyInbox(), 'farine', () => 'manual');

    expect(result.ok && result.value.proposals[0]?.toCheck).toBe(false);
  });
});

describe('merging duplicate proposals', () => {
  it('proposes an item received twice only once', () => {
    expect(proposedLabels(captured('carottes\nCarottes'))).toEqual(['carottes']);
  });

  it('does not propose again an item already pending from an earlier capture', () => {
    const newId = sequentialIds();

    expect(proposedLabels(captured('Pain', captured('pain', emptyInbox(), newId), newId))).toEqual([
      'pain',
    ]);
  });

  it('makes a proposal to check certain when the item arrives as certain', () => {
    const newId = sequentialIds();
    const inbox = captured('parmesan', captured('parmesan ?', emptyInbox(), newId), newId);

    expect(inbox.proposals).toHaveLength(1);
    expect(inbox.proposals[0]?.toCheck).toBe(false);
  });

  it('keeps a certain proposal certain when the item arrives as a doubt', () => {
    const newId = sequentialIds();

    expect(captured('riz ?', captured('riz', emptyInbox(), newId), newId).proposals).toEqual([
      { id: 'proposal-1', label: 'riz', discarded: false, toCheck: false },
    ]);
  });

  it('does not add by hand an item already proposed', () => {
    const result = addProposal(captured('lait'), 'Lait', () => 'manual');

    expect(result.ok && proposedLabels(result.value)).toEqual(['lait']);
  });
});
