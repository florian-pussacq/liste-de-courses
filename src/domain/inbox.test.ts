import { describe, expect, it } from 'vitest';
import {
  addProposal,
  captureText,
  discardProposal,
  editProposal,
  emptyInbox,
  proposedLabels,
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

  it('discards a proposal', () => {
    const inbox = captured('lait, stp');

    expect(proposedLabels(discardProposal(inbox, idOf(inbox, 'stp')))).toEqual(['lait']);
  });

  it('adds a proposal by hand', () => {
    const result = addProposal(captured('lait'), 'farine', () => 'manual');

    expect(result.ok && result.value.proposals).toEqual([
      { id: 'proposal-1', label: 'lait' },
      { id: 'manual', label: 'farine' },
    ]);
  });

  it('refuses to add a blank proposal', () => {
    expect(addProposal(emptyInbox(), ' ', () => 'manual')).toEqual({
      ok: false,
      error: 'empty-label',
    });
  });
});
