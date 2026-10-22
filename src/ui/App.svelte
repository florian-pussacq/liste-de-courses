<script lang="ts">
  import { untrack } from 'svelte';
  import type { Shopping } from '../application/shopping';
  import type { Inbox } from '../domain/inbox';
  import type { Item, ShoppingList } from '../domain/shopping-list';
  import AddItemSheet from './AddItemSheet.svelte';
  import InboxSheet from './InboxSheet.svelte';
  import ItemActionsSheet from './ItemActionsSheet.svelte';
  import ShoppingListView from './ShoppingListView.svelte';

  interface Props {
    app: Shopping;
    initialList: ShoppingList;
    initialInbox: Inbox;
    openInbox?: boolean;
    emptyShare?: boolean;
  }

  const { app, initialList, initialInbox, openInbox = false, emptyShare = false }: Props = $props();

  type Sheet =
    | { readonly kind: 'none' }
    | { readonly kind: 'inbox'; readonly notice?: string; readonly reading?: boolean }
    | { readonly kind: 'add' }
    | { readonly kind: 'actions'; readonly item: Item };

  // Props only seed the state: from then on, the views own it.
  let list = $state(untrack(() => initialList));
  let inbox = $state(untrack(() => initialInbox));
  let sheet: Sheet = $state(
    untrack(() =>
      openInbox
        ? {
            kind: 'inbox',
            notice: emptyShare ? 'Le texte partagé ne contient aucun article.' : undefined,
          }
        : { kind: 'none' },
    ),
  );

  const closeSheet = () => (sheet = { kind: 'none' });

  const UNDO_DELAY_MS = 6000;
  // Any change that removes items can be undone, for a while. Any other change makes the
  // snapshot outdated: undoing then would also revert that change, so the offer is withdrawn.
  let shownList = untrack(() => list);
  let beforeRemoval: ShoppingList | undefined = $state.raw();
  $effect(() => {
    const previous = shownList;
    shownList = list;
    if (list === previous) return;
    beforeRemoval = list.items.length < previous.items.length ? previous : undefined;
  });
  $effect(() => {
    if (!beforeRemoval) return;
    const expiry = setTimeout(() => (beforeRemoval = undefined), UNDO_DELAY_MS);
    return () => clearTimeout(expiry);
  });
  const removed = $derived(beforeRemoval ? beforeRemoval.items.length - list.items.length : 0);

  async function undoRemoval() {
    if (beforeRemoval) list = await app.restoreList($state.snapshot(beforeRemoval));
  }

  // The inbox opens at once: the browser may wait on a permission prompt the user ignores,
  // and typing by hand must stay possible meanwhile.
  async function paste() {
    sheet = { kind: 'inbox', notice: 'Lecture du presse-papiers…', reading: true };
    const pasted = await app.pasteFromClipboard();
    if (sheet.kind !== 'inbox') return;
    if (pasted.outcome === 'captured') {
      inbox = pasted.inbox;
      sheet = { kind: 'inbox' };
      return;
    }
    sheet = {
      kind: 'inbox',
      notice:
        pasted.outcome === 'empty'
          ? 'Le presse-papiers est vide. Colle ou écris ta liste ci-dessous.'
          : "Le presse-papiers n'a pas pu être lu. Colle ou écris ta liste ci-dessous.",
    };
  }
</script>

<ShoppingListView
  {app}
  bind:list
  pending={inbox.proposals.length}
  {removed}
  onundo={undoRemoval}
  onpaste={paste}
  onadd={() => (sheet = { kind: 'add' })}
  onopeninbox={() => (sheet = { kind: 'inbox' })}
  onactions={(item) => (sheet = { kind: 'actions', item })}
/>

{#if sheet.kind === 'inbox'}
  <InboxSheet
    {app}
    bind:inbox
    notice={sheet.notice}
    reading={sheet.reading}
    onvalidated={(addition) => {
      list = addition.list;
      closeSheet();
    }}
    onclose={closeSheet}
  />
{:else if sheet.kind === 'add'}
  <AddItemSheet {app} onchange={(changed) => (list = changed)} onclose={closeSheet} />
{:else if sheet.kind === 'actions'}
  <ItemActionsSheet
    {app}
    item={sheet.item}
    onchange={(changed) => {
      list = changed;
      closeSheet();
    }}
    onclose={closeSheet}
  />
{/if}
