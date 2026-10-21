import { splitIntoEntries, type Entry } from './captured-text';
import { findDish, type Dish } from './dish';
import { cleanLabel, labelKey } from './label';
import { failure, success, type Result } from './result';

export type ProposalId = string;

export interface Proposal {
  readonly id: ProposalId;
  readonly label: string;
  readonly discarded: boolean;
  readonly toCheck: boolean;
  // Name of the dish this proposal is an ingredient of, if any.
  readonly dish?: string;
  // An unknown dish name: nothing to buy until it is defined or kept as an item.
  readonly dishToDefine?: true;
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

const isAboutADish = (proposal: Proposal) =>
  proposal.dish !== undefined || proposal.dishToDefine === true;

// Dishes first, then plain items, each in the order received. Storage keeps the received
// order so that insertions at a proposal's place stay simple.
export const reviewOrder = (inbox: Inbox): Proposal[] => [
  ...inbox.proposals.filter(isAboutADish),
  ...inbox.proposals.filter((proposal) => !isAboutADish(proposal)),
];

export const keptEntries = (inbox: Inbox): Entry[] =>
  reviewOrder(inbox)
    .filter((proposal) => !proposal.discarded && !proposal.dishToDefine)
    .map(({ label, toCheck }) => ({ label, toCheck }));

const newProposal = (
  id: ProposalId,
  { label, toCheck, isDish }: Entry,
  dish?: string,
): Proposal => ({
  id,
  label,
  toCheck,
  discarded: false,
  ...(dish !== undefined && { dish }),
  ...(dish === undefined && isDish && { dishToDefine: true }),
});

const belongsTo = (proposal: Proposal, dishName: string) =>
  proposal.dish !== undefined && labelKey(proposal.dish) === labelKey(dishName);

// A doubt about a dish is a doubt about each of its ingredients.
const ingredientsOf = (dish: Dish, doubtful: boolean): readonly Entry[] =>
  doubtful ? dish.ingredients.map((entry) => ({ ...entry, toCheck: true })) : dish.ingredients;

// An item is never proposed twice; a certain item settles a pending doubt about it.
// New proposals are inserted at `at`, in order; known ones stay where they are.
function mergeInto(
  proposals: readonly Proposal[],
  entries: readonly Entry[],
  at: number,
  newId: () => ProposalId,
  dish?: string,
): readonly Proposal[] {
  let merged = [...proposals];
  let insertAt = at;
  for (const entry of entries) {
    const key = labelKey(entry.label);
    const existing = merged.find((proposal) => labelKey(proposal.label) === key);
    if (!existing) {
      merged.splice(insertAt++, 0, newProposal(newId(), entry, dish));
    } else if (!entry.toCheck && existing.toCheck) {
      merged = merged.map((proposal) =>
        proposal.id === existing.id ? { ...proposal, toCheck: false } : proposal,
      );
    }
  }
  return merged;
}

const append = (
  proposals: readonly Proposal[],
  entries: readonly Entry[],
  newId: () => ProposalId,
  dish?: string,
) => mergeInto(proposals, entries, proposals.length, newId, dish);

export function captureText(
  inbox: Inbox,
  capturedText: string,
  newId: () => ProposalId,
  dishes: readonly Dish[] = [],
): Inbox {
  const text = capturedText.trim();
  if (text === '') return inbox;
  const proposals = splitIntoEntries(text).reduce((current, entry) => {
    const dish = findDish(dishes, entry.label);
    if (!dish) return append(current, [entry], newId);
    if (current.some((proposal) => belongsTo(proposal, dish.name))) return current;
    return append(current, ingredientsOf(dish, entry.toCheck), newId, dish.name);
  }, inbox.proposals);
  return { proposals, capturedTexts: [...inbox.capturedTexts, text] };
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
    proposals: append(inbox.proposals, [{ label, toCheck: false }], newId),
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

export function expandIntoDish(
  inbox: Inbox,
  id: ProposalId,
  dish: Dish,
  newId: () => ProposalId,
): Inbox {
  const index = inbox.proposals.findIndex((proposal) => proposal.id === id);
  const proposal = inbox.proposals[index];
  if (!proposal) return inbox;
  const others = inbox.proposals.filter((candidate) => candidate.id !== id);
  return {
    ...inbox,
    proposals: mergeInto(others, ingredientsOf(dish, proposal.toCheck), index, newId, dish.name),
  };
}

// The group takes the new definition at its place; earlier discards are forgotten.
export function refreshDish(inbox: Inbox, dish: Dish, newId: () => ProposalId): Inbox {
  const index = inbox.proposals.findIndex((proposal) => belongsTo(proposal, dish.name));
  if (index === -1) return inbox;
  const others = inbox.proposals.filter((proposal) => !belongsTo(proposal, dish.name));
  return { ...inbox, proposals: mergeInto(others, dish.ingredients, index, newId, dish.name) };
}

export function toggleDish(inbox: Inbox, dishName: string): Inbox {
  const group = inbox.proposals.filter((proposal) => belongsTo(proposal, dishName));
  const discarded = !group.every((proposal) => proposal.discarded);
  return {
    ...inbox,
    proposals: inbox.proposals.map((proposal) =>
      belongsTo(proposal, dishName) ? { ...proposal, discarded } : proposal,
    ),
  };
}

export function keepAsItem(inbox: Inbox, id: ProposalId): Inbox {
  return {
    ...inbox,
    proposals: inbox.proposals.map((proposal) =>
      proposal.id === id ? asPlainItem(proposal) : proposal,
    ),
  };
}

function asPlainItem(proposal: Proposal): Proposal {
  const { dishToDefine, ...plain } = proposal;
  return plain;
}

// For this inbox only: the remembered dish keeps its definition.
export function keepDishAsItem(inbox: Inbox, dishName: string, newId: () => ProposalId): Inbox {
  const index = inbox.proposals.findIndex((proposal) => belongsTo(proposal, dishName));
  const name = inbox.proposals[index]?.dish;
  if (name === undefined) return inbox;
  const others = inbox.proposals.filter((proposal) => !belongsTo(proposal, dishName));
  return {
    ...inbox,
    proposals: mergeInto(others, [{ label: name, toCheck: false }], index, newId),
  };
}
