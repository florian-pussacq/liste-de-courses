<script lang="ts">
  import { untrack } from 'svelte';
  import type { Shopping } from '../application/shopping';
  import type { Inbox } from '../domain/inbox';
  import type { ShoppingList } from '../domain/shopping-list';
  import InboxView from './InboxView.svelte';
  import ShoppingListView from './ShoppingListView.svelte';

  interface Props {
    app: Shopping;
    initialList: ShoppingList;
    initialInbox: Inbox;
    openInbox?: boolean;
  }

  const { app, initialList, initialInbox, openInbox = false }: Props = $props();

  // Props only seed the state: from then on, the views own it.
  let list = $state(untrack(() => initialList));
  let inbox = $state(untrack(() => initialInbox));
  let view: 'list' | 'inbox' = $state(untrack(() => (openInbox ? 'inbox' : 'list')));
</script>

{#if view === 'inbox'}
  <InboxView
    {app}
    bind:inbox
    onvalidated={(validated) => {
      list = validated;
      view = 'list';
    }}
    onclose={() => (view = 'list')}
  />
{:else}
  <ShoppingListView
    {app}
    bind:list
    pending={inbox.proposals.length}
    onopeninbox={() => (view = 'inbox')}
  />
{/if}
