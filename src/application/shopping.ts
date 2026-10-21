import { sharedText, type SharedContent } from '../domain/captured-text';
import * as inboxes from '../domain/inbox';
import {
  emptyInbox,
  type EditProposalError,
  type Inbox,
  type ProposalError,
} from '../domain/inbox';
import {
  defineDish,
  findDish,
  rememberDish,
  type DefineDishError,
  type Dish,
} from '../domain/dish';
import { failure, success, type Result } from '../domain/result';
import * as lists from '../domain/shopping-list';
import type { AddItemError, ItemId, RenameItemError, ShoppingList } from '../domain/shopping-list';
import { listAsText } from '../domain/list-text';
import type { Dependencies, SendOutcome } from './ports';

export type Shopping = ReturnType<typeof shopping>;

export type PasteOutcome =
  | { readonly outcome: 'captured'; readonly inbox: Inbox }
  | { readonly outcome: 'empty' }
  | { readonly outcome: 'unavailable' };

export function shopping({
  shoppingLists,
  inboxes: inboxStore,
  dishes: dishStore,
  now,
  newId,
  readClipboard,
  sendText,
}: Dependencies) {
  async function changeList(change: (list: ShoppingList) => ShoppingList): Promise<ShoppingList> {
    const list = change(await shoppingLists.load());
    await shoppingLists.save(list);
    return list;
  }

  async function tryChangeList<E>(
    change: (list: ShoppingList) => Result<ShoppingList, E>,
  ): Promise<Result<ShoppingList, E>> {
    const result = change(await shoppingLists.load());
    if (result.ok) await shoppingLists.save(result.value);
    return result;
  }

  async function changeInbox(change: (inbox: Inbox) => Inbox): Promise<Inbox> {
    const inbox = change(await inboxStore.load());
    await inboxStore.save(inbox);
    return inbox;
  }

  async function tryChangeInbox<E>(
    change: (inbox: Inbox) => Result<Inbox, E>,
  ): Promise<Result<Inbox, E>> {
    const result = change(await inboxStore.load());
    if (result.ok) await inboxStore.save(result.value);
    return result;
  }

  async function captureText(capturedText: string): Promise<Inbox> {
    const dishes = await dishStore.load();
    return changeInbox((inbox) => inboxes.captureText(inbox, capturedText, newId, dishes));
  }

  // Defining a dish under a known name replaces it: the returned dish is the one remembered.
  async function remember(
    name: string,
    ingredientsText: string,
  ): Promise<Result<Dish, DefineDishError>> {
    const defined = defineDish(name, ingredientsText, newId);
    if (!defined.ok) return defined;
    const dishes = rememberDish(await dishStore.load(), defined.value);
    await dishStore.save(dishes);
    const remembered = findDish(dishes, defined.value.name) ?? defined.value;
    return success(remembered);
  }

  return {
    shoppingList: (): Promise<ShoppingList> => shoppingLists.load(),
    inbox: (): Promise<Inbox> => inboxStore.load(),

    captureText,
    captureShared: (content: SharedContent): Promise<Inbox> => captureText(sharedText(content)),
    async pasteFromClipboard(): Promise<PasteOutcome> {
      const content = await readClipboard();
      if (content.kind !== 'text') return { outcome: content.kind };
      return { outcome: 'captured', inbox: await captureText(content.text) };
    },
    addProposal: (label: string): Promise<Result<Inbox, ProposalError>> =>
      tryChangeInbox((inbox) => inboxes.addProposal(inbox, label, newId)),
    editProposal: (id: string, label: string): Promise<Result<Inbox, EditProposalError>> =>
      tryChangeInbox((inbox) => inboxes.editProposal(inbox, id, label)),
    toggleProposal: (id: string): Promise<Inbox> =>
      changeInbox((inbox) => inboxes.toggleProposal(inbox, id)),
    toggleProposalToCheck: (id: string): Promise<Inbox> =>
      changeInbox((inbox) => inboxes.toggleProposalToCheck(inbox, id)),
    abandonInbox: (): Promise<Inbox> => changeInbox(emptyInbox),

    async defineDishFromProposal(
      proposalId: string,
      ingredientsText: string,
    ): Promise<Result<Inbox, DefineDishError | 'proposal-not-found'>> {
      const proposal = (await inboxStore.load()).proposals.find(({ id }) => id === proposalId);
      if (!proposal) return failure('proposal-not-found');
      const remembered = await remember(proposal.label, ingredientsText);
      if (!remembered.ok) return remembered;
      const inbox = await changeInbox((current) =>
        inboxes.expandIntoDish(current, proposalId, remembered.value, newId),
      );
      return success(inbox);
    },
    async updateDish(
      name: string,
      ingredientsText: string,
    ): Promise<Result<Inbox, DefineDishError>> {
      const remembered = await remember(name, ingredientsText);
      if (!remembered.ok) return remembered;
      const inbox = await changeInbox((current) =>
        inboxes.refreshDish(current, remembered.value, newId),
      );
      return success(inbox);
    },
    keepDishAsItem: (name: string): Promise<Inbox> =>
      changeInbox((inbox) => inboxes.keepDishAsItem(inbox, name, newId)),
    keepAsItem: (id: string): Promise<Inbox> =>
      changeInbox((inbox) => inboxes.keepAsItem(inbox, id)),
    toggleDish: (name: string): Promise<Inbox> =>
      changeInbox((inbox) => inboxes.toggleDish(inbox, name)),
    dish: async (name: string): Promise<Dish | undefined> => findDish(await dishStore.load(), name),

    // The list is saved before the inbox is emptied: if the second write fails,
    // validating again is harmless because duplicates are not added twice.
    async validateInbox(): Promise<ShoppingList> {
      const entries = inboxes.keptEntries(await inboxStore.load());
      const list = await changeList((current) =>
        lists.addItems(current, entries, { now: now(), newId }),
      );
      await inboxStore.save(emptyInbox());
      return list;
    },

    addItem: (label: string): Promise<Result<ShoppingList, AddItemError>> =>
      tryChangeList((list) => lists.addItem(list, label, { now: now(), newId })),
    renameItem: (id: ItemId, label: string): Promise<Result<ShoppingList, RenameItemError>> =>
      tryChangeList((list) => lists.renameItem(list, id, label, now())),
    removeItem: (id: ItemId): Promise<ShoppingList> =>
      changeList((list) => lists.removeItem(list, id)),
    toggleItem: (id: ItemId): Promise<ShoppingList> =>
      changeList((list) => lists.toggleItem(list, id, now())),
    setToCheck: (id: ItemId, toCheck: boolean): Promise<ShoppingList> =>
      changeList((list) => lists.setToCheck(list, id, toCheck, now())),
    clearChecked: (): Promise<ShoppingList> => changeList(lists.clearChecked),

    async sendList(): Promise<SendOutcome | 'nothing-to-send'> {
      const text = listAsText(await shoppingLists.load());
      return text === '' ? 'nothing-to-send' : sendText(text);
    },
  };
}
