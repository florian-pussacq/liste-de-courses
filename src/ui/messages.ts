import type { EditProposalError } from '../domain/inbox';
import type { RenameItemError } from '../domain/shopping-list';

const MESSAGES: Record<RenameItemError | EditProposalError, string> = {
  'empty-label': 'Le libellé ne peut pas être vide.',
  'duplicate-label': 'Cet article est déjà dans la liste.',
  'item-not-found': "Cet article n'existe plus.",
  'proposal-not-found': "Cet article proposé n'existe plus.",
};

export const messageFor = (error: keyof typeof MESSAGES): string => MESSAGES[error];
