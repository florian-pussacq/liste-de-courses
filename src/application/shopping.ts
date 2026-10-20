import { sharedText, type SharedContent } from '../domain/captured-text';
import * as inboxes from '../domain/inbox';
import {
  emptyInbox,
  type EditProposalError,
  type Inbox,
  type ProposalError,
} from '../domain/inbox';
import type { Result } from '../domain/result';
import * as lists from '../domain/shopping-list';
import type { AddItemError, ItemId, RenameItemError, ShoppingList } from '../domain/shopping-list';
import type { Dependencies } from './ports';

export type Shopping = ReturnType<typeof shopping>;

export type PasteOutcome =
  | { readonly outcome: 'captured'; readonly inbox: Inbox }
  | { readonly outcome: 'empty' }
  | { readonly outcome: 'unavailable' };

export function shopping({
  shoppingLists,
  inboxes: inboxStore,
  now,
  newId,
  readClipboard,
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

  const captureText = (capturedText: string): Promise<Inbox> =>
    changeInbox((inbox) => inboxes.captureText(inbox, capturedText, newId));

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
    abandonInbox: (): Promise<Inbox> => changeInbox(emptyInbox),

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
    clearChecked: (): Promise<ShoppingList> => changeList(lists.clearChecked),
  };
}
