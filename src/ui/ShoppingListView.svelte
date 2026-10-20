<script lang="ts">
  import type { Shopping } from '../application/shopping';
  import { checkedItems, itemsToBuy, type Item, type ShoppingList } from '../domain/shopping-list';
  import ItemRow from './ItemRow.svelte';

  interface Props {
    app: Shopping;
    list: ShoppingList;
    pending: number;
    onpaste: () => void;
    onadd: () => void;
    onopeninbox: () => void;
    onactions: (item: Item) => void;
  }

  let {
    app,
    list = $bindable(),
    pending,
    onpaste,
    onadd,
    onopeninbox,
    onactions,
  }: Props = $props();

  let basketOpen = $state(false);

  const toBuy = $derived(itemsToBuy(list));
  const basket = $derived(checkedItems(list));
  const total = $derived(list.items.length);
  const progress = $derived(total === 0 ? 0 : Math.round((basket.length / total) * 100));

  const toggle = async (item: Item) => (list = await app.toggleItem(item.id));
  const plural = (count: number, word: string) => `${count} ${word}${count > 1 ? 's' : ''}`;
</script>

<header>
  {#if total === 0}
    <h1>Liste de courses</h1>
  {:else if toBuy.length === 0}
    <h1>Tout est pris</h1>
  {:else}
    <h1>{toBuy.length}&nbsp;<span>à prendre</span></h1>
  {/if}
  {#if total > 0}
    <p class="count">{basket.length} / {total} pris</p>
    <div
      class="progress"
      role="progressbar"
      aria-label="Progression des courses"
      aria-valuemin="0"
      aria-valuemax={total}
      aria-valuenow={basket.length}
    >
      <div style:width="{progress}%"></div>
    </div>
  {/if}
</header>

<main>
  {#if total === 0}
    <p class="empty">
      La liste est vide. Colle une liste copiée dans une autre application, ou ajoute un article
      avec le bouton +. Un appui long sur un article permet ensuite de le modifier ou de le
      supprimer.
    </p>
  {/if}

  {#if toBuy.length > 0}
    <ul aria-label="À prendre">
      {#each toBuy as item (item.id)}
        <ItemRow {item} ontoggle={toggle} {onactions} />
      {/each}
    </ul>
  {/if}

  {#if basket.length > 0}
    <section class="basket">
      <button
        type="button"
        class="basket-toggle"
        aria-expanded={basketOpen}
        onclick={() => (basketOpen = !basketOpen)}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12l5 5L20 7" /></svg>
        {plural(basket.length, 'article')} dans le panier
      </button>
      {#if basketOpen}
        <ul aria-label="Panier">
          {#each basket as item (item.id)}
            <ItemRow {item} ontoggle={toggle} {onactions} />
          {/each}
        </ul>
        <button
          type="button"
          class="button"
          onclick={async () => (list = await app.clearChecked())}
        >
          Retirer les articles pris
        </button>
      {/if}
    </section>
  {/if}
</main>

<nav aria-label="Ajouter des articles">
  {#if pending > 0}
    <button type="button" class="pending" onclick={onopeninbox}>
      {plural(pending, 'article')} à trier
    </button>
  {/if}
  <div class="dock">
    <button type="button" class="paste" onclick={onpaste}>
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <rect x="8" y="3" width="8" height="4" rx="1" />
        <path d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      </svg>
      Coller une liste
    </button>
    <button type="button" class="add" aria-label="Ajouter un article" onclick={onadd}>
      <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
    </button>
  </div>
</nav>

<style>
  header {
    padding: 28px 24px 12px;
  }

  h1 {
    margin: 0;
    font-size: 3.1rem;
    line-height: 0.95;
    font-weight: 800;
    letter-spacing: -0.03em;
  }

  h1 span {
    font-size: 1.2rem;
    font-weight: 600;
    letter-spacing: 0;
  }

  .count {
    margin: 8px 0 10px;
    color: var(--ink-muted);
    font-weight: 600;
  }

  .progress {
    height: 8px;
    border-radius: 999px;
    background: var(--surface-muted);
    overflow: hidden;
  }

  .progress div {
    height: 100%;
    border-radius: 999px;
    background: var(--progress-fill);
    transition: width 200ms ease-out;
  }

  main {
    max-width: 40rem;
    margin: 0 auto;
    padding: 8px 12px 180px;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .empty {
    margin: 16px 12px;
    color: var(--ink-muted);
  }

  .basket {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .basket ul {
    align-self: stretch;
  }

  .basket-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: var(--target);
    padding: 0 12px;
    border: none;
    background: transparent;
    color: var(--ink-muted);
    font-weight: 600;
  }

  .basket .button {
    margin: 8px 12px;
  }

  svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  nav {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 24px 16px calc(20px + env(safe-area-inset-bottom));
    background: linear-gradient(to top, var(--ground) 70%, transparent);
  }

  .pending {
    min-height: 40px;
    padding: 0 18px;
    border: none;
    border-radius: 999px;
    background: var(--accent);
    color: var(--on-accent);
    font-weight: 700;
  }

  .dock {
    width: 100%;
    max-width: 40rem;
    display: flex;
    gap: 10px;
  }

  .paste {
    flex: 1;
    min-height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    border: none;
    border-radius: 20px;
    background: var(--ink);
    color: var(--ground);
    font-size: 1.05rem;
    font-weight: 700;
  }

  .paste svg {
    stroke: var(--accent);
    width: 22px;
    height: 22px;
  }

  .add {
    width: 60px;
    height: 60px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 20px;
    background: var(--accent);
    color: var(--on-accent);
  }

  .add svg {
    width: 26px;
    height: 26px;
    stroke-width: 2.8;
  }
</style>
