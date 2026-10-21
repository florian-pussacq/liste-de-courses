import type { DefineDishError } from '../domain/dish';
import type { EditProposalError } from '../domain/inbox';
import type { RenameItemError } from '../domain/shopping-list';

const MESSAGES: Record<RenameItemError | EditProposalError | DefineDishError, string> = {
  'empty-label': 'Le libellé ne peut pas être vide.',
  'duplicate-label': 'Cet article est déjà dans la liste.',
  'item-not-found': "Cet article n'existe plus.",
  'proposal-not-found': "Cet article proposé n'existe plus.",
  'empty-name': 'Le plat doit avoir un nom.',
  'no-ingredient': 'Indique au moins un ingrédient.',
};

export const messageFor = (error: keyof typeof MESSAGES): string => MESSAGES[error];
