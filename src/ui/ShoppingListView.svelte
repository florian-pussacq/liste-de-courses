<script lang="ts">
  import type { Shopping } from '../application/shopping';
  import { checkedItems, itemsToBuy, type ShoppingList } from '../domain/shopping-list';
  import ItemRow from './ItemRow.svelte';
  import { messageFor } from './messages';

  interface Props {
    app: Shopping;
    list: ShoppingList;
    pending: number;
    onopeninbox: () => void;
  }

  let { app, list = $bindable(), pending, onopeninbox }: Props = $props();

  let newLabel = $state('');
  let error = $state('');

  const toBuy = $derived(itemsToBuy(list));
  const taken = $derived(checkedItems(list));

  async function add(event: SubmitEvent) {
    event.preventDefault();
    const result = await app.addItem(newLabel);
    if (!result.ok) {
      error = messageFor(result.error);
      return;
    }
    list = result.value;
    newLabel = '';
    error = '';
  }
</script>

<header>
  <h1>Liste de courses</h1>
  <button type="button" onclick={onopeninbox}>
    {pending > 0 ? `${pending} article${pending > 1 ? 's' : ''} à valider` : 'Coller du texte'}
  </button>
</header>

<main>
  <form onsubmit={add}>
    <input aria-label="Nouvel article" placeholder="Ajouter un article" bind:value={newLabel} />
    <button type="submit">Ajouter</button>
  </form>
  {#if error}<p role="alert">{error}</p>{/if}

  {#if list.items.length === 0}
    <p class="empty">
      La liste est vide. Ajoute un article ci-dessus, colle du texte ou partage un message vers
      l'application.
    </p>
  {/if}

  {#if toBuy.length > 0}
    <ul aria-label="À prendre">
      {#each toBuy as item (item.id)}
        <ItemRow {app} {item} onchange={(changed) => (list = changed)} />
      {/each}
    </ul>
  {/if}

  {#if taken.length > 0}
    <section aria-label="Pris">
      <h2>Pris</h2>
      <ul aria-label="Pris">
        {#each taken as item (item.id)}
          <ItemRow {app} {item} onchange={(changed) => (list = changed)} />
        {/each}
      </ul>
      <button type="button" onclick={async () => (list = await app.clearChecked())}>
        Retirer les articles pris
      </button>
    </section>
  {/if}
</main>
