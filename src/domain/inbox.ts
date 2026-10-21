import { splitIntoEntries, type Entry } from './captured-text';
import { cleanLabel, labelKey } from './label';
import { failure, success, type Result } from './result';

export type ProposalId = string;

export interface Proposal {
  readonly id: ProposalId;
  readonly label: string;
  readonly discarded: boolean;
  readonly toCheck: boolean;
}

export interface Inbox {
  readonly proposals: readonly Proposal[];
  // Shown back to the user so they can check that nothing was missed.
  readonly capturedTexts: readonly string[];
}

export type ProposalError = 'empty-label';
export type EditProposalError = ProposalError | 'proposal-not-found';

export const emptyInbox = (): Inbox => ({ proposals: [], capturedTexts: [] });

export const proposedLabels = (inbox: Inbox): string[] =>
  inbox.proposals.map((proposal) => proposal.label);

export const keptEntries = (inbox: Inbox): Entry[] =>
  inbox.proposals
    .filter((proposal) => !proposal.discarded)
    .map(({ label, toCheck }) => ({ label, toCheck }));

const newProposal = (id: ProposalId, { label, toCheck }: Entry): Proposal => ({
  id,
  label,
  toCheck,
  discarded: false,
});

// An item is never proposed twice; a certain item settles a pending doubt about it.
function mergeProposal(
  proposals: readonly Proposal[],
  entry: Entry,
  newId: () => ProposalId,
): readonly Proposal[] {
  const key = labelKey(entry.label);
  const existing = proposals.find((proposal) => labelKey(proposal.label) === key);
  if (!existing) return [...proposals, newProposal(newId(), entry)];
  if (entry.toCheck || !existing.toCheck) return proposals;
  return proposals.map((proposal) =>
    proposal.id === existing.id ? { ...proposal, toCheck: false } : proposal,
  );
}

export function captureText(inbox: Inbox, capturedText: string, newId: () => ProposalId): Inbox {
  const text = capturedText.trim();
  if (text === '') return inbox;
  return {
    proposals: splitIntoEntries(text).reduce(
      (proposals, entry) => mergeProposal(proposals, entry, newId),
      inbox.proposals,
    ),
    capturedTexts: [...inbox.capturedTexts, text],
  };
}

export function addProposal(
  inbox: Inbox,
  rawLabel: string,
  newId: () => ProposalId,
): Result<Inbox, ProposalError> {
  const label = cleanLabel(rawLabel);
  if (label === '') return failure('empty-label');
  return success({
    ...inbox,
    proposals: mergeProposal(inbox.proposals, { label, toCheck: false }, newId),
  });
}

export function editProposal(
  inbox: Inbox,
  id: ProposalId,
  rawLabel: string,
): Result<Inbox, EditProposalError> {
  const label = cleanLabel(rawLabel);
  if (label === '') return failure('empty-label');
  if (!inbox.proposals.some((proposal) => proposal.id === id)) return failure('proposal-not-found');
  return success({
    ...inbox,
    proposals: inbox.proposals.map((proposal) =>
      proposal.id === id ? { ...proposal, label } : proposal,
    ),
  });
}

// Discarding is reversible until validation: the proposal stays visible, marked as discarded.
export function toggleProposal(inbox: Inbox, id: ProposalId): Inbox {
  return {
    ...inbox,
    proposals: inbox.proposals.map((proposal) =>
      proposal.id === id ? { ...proposal, discarded: !proposal.discarded } : proposal,
    ),
  };
}

export function toggleProposalToCheck(inbox: Inbox, id: ProposalId): Inbox {
  return {
    ...inbox,
    proposals: inbox.proposals.map((proposal) =>
      proposal.id === id ? { ...proposal, toCheck: !proposal.toCheck } : proposal,
    ),
  };
}
