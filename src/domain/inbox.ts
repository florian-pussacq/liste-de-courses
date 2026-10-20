import { splitIntoLabels } from './captured-text';
import { cleanLabel } from './label';
import { failure, success, type Result } from './result';

export type ProposalId = string;

export interface Proposal {
  readonly id: ProposalId;
  readonly label: string;
}

export interface Inbox {
  readonly proposals: readonly Proposal[];
}

export type ProposalError = 'empty-label';
export type EditProposalError = ProposalError | 'proposal-not-found';

export const emptyInbox = (): Inbox => ({ proposals: [] });

export const proposedLabels = (inbox: Inbox): string[] =>
  inbox.proposals.map((proposal) => proposal.label);

export function captureText(inbox: Inbox, capturedText: string, newId: () => ProposalId): Inbox {
  const captured = splitIntoLabels(capturedText).map((label) => ({ id: newId(), label }));
  return { proposals: [...inbox.proposals, ...captured] };
}

export function addProposal(
  inbox: Inbox,
  rawLabel: string,
  newId: () => ProposalId,
): Result<Inbox, ProposalError> {
  const label = cleanLabel(rawLabel);
  if (label === '') return failure('empty-label');
  return success({ proposals: [...inbox.proposals, { id: newId(), label }] });
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

export function discardProposal(inbox: Inbox, id: ProposalId): Inbox {
  return { proposals: inbox.proposals.filter((proposal) => proposal.id !== id) };
}
