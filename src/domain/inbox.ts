import { splitIntoEntries } from './captured-text';
import { cleanLabel } from './label';
import { failure, success, type Result } from './result';

export type ProposalId = string;

export interface Proposal {
  readonly id: ProposalId;
  readonly label: string;
  readonly discarded: boolean;
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

export const keptLabels = (inbox: Inbox): string[] =>
  inbox.proposals.filter((proposal) => !proposal.discarded).map((proposal) => proposal.label);

const newProposal = (id: ProposalId, label: string): Proposal => ({ id, label, discarded: false });

export function captureText(inbox: Inbox, capturedText: string, newId: () => ProposalId): Inbox {
  const text = capturedText.trim();
  if (text === '') return inbox;
  const captured = splitIntoEntries(text).map(({ label }) => newProposal(newId(), label));
  return {
    proposals: [...inbox.proposals, ...captured],
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
  return success({ ...inbox, proposals: [...inbox.proposals, newProposal(newId(), label)] });
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
