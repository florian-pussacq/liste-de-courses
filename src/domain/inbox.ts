import { splitIntoLabels } from './captured-text';
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
}

export type ProposalError = 'empty-label';
export type EditProposalError = ProposalError | 'proposal-not-found';

export const emptyInbox = (): Inbox => ({ proposals: [] });

export const proposedLabels = (inbox: Inbox): string[] =>
  inbox.proposals.map((proposal) => proposal.label);

export const keptLabels = (inbox: Inbox): string[] =>
  inbox.proposals.filter((proposal) => !proposal.discarded).map((proposal) => proposal.label);

const newProposal = (id: ProposalId, label: string): Proposal => ({ id, label, discarded: false });

export function captureText(inbox: Inbox, capturedText: string, newId: () => ProposalId): Inbox {
  const captured = splitIntoLabels(capturedText).map((label) => newProposal(newId(), label));
  return { proposals: [...inbox.proposals, ...captured] };
}

export function addProposal(
  inbox: Inbox,
  rawLabel: string,
  newId: () => ProposalId,
): Result<Inbox, ProposalError> {
  const label = cleanLabel(rawLabel);
  if (label === '') return failure('empty-label');
  return success({ proposals: [...inbox.proposals, newProposal(newId(), label)] });
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
    proposals: inbox.proposals.map((proposal) =>
      proposal.id === id ? { ...proposal, label } : proposal,
    ),
  });
}

// Discarding is reversible until validation: the proposal stays visible, marked as discarded.
export function toggleProposal(inbox: Inbox, id: ProposalId): Inbox {
  return {
    proposals: inbox.proposals.map((proposal) =>
      proposal.id === id ? { ...proposal, discarded: !proposal.discarded } : proposal,
    ),
  };
}
