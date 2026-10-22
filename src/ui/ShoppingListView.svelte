<script lang="ts">
  import type { Shopping } from '../application/shopping';
  import {
    checkedItems,
    isInStore,
    itemsToBuy,
    itemsToCheck,
    type BatchAddition,
    type Item,
    type ListedAgain,
    type ShoppingList,
  } from '../domain/shopping-list';
  import type { Quantity } from '../domain/quantity';
  import ItemRow from './ItemRow.svelte';
  import ItemToCheckRow from './ItemToCheckRow.svelte';
  import PlusIcon from './PlusIcon.svelte';

  interface Props {
    app: Shopping;
    list: ShoppingList;
    pending: number;
    // Items removed by the last change, while it can still be undone.
    removed: number;
    onundo: () => void;
    report?: Pick<BatchAddition, 'added' | 'alreadyListed'>;
    onclosereport: () => void;
    onpaste: () => void;
    onadd: () => void;
    onopeninbox: () => void;
    onactions: (item: Item) => void;
    onhistory: () => void;
  }

  let {
    app,
    list = $bindable(),
    pending,
    removed,
    onundo,
    report,
    onclosereport,
    onpaste,
    onadd,
    onopeninbox,
    onactions,
    onhistory,
  }: Props = $props();

  let basketOpen = $state(false);
  // The dock is fixed and grows with its banners: the list keeps room to scroll above it.
  let dockHeight = $state(180);
  let sendNotice = $state('');

  const SEND_NOTICES: Record<string, string> = {
    copied: 'Liste copiée : colle-la dans ta messagerie.',
    unavailable: "Impossible d'envoyer la liste depuis ce téléphone.",
  };

  async function send() {
    sendNotice = SEND_NOTICES[await app.sendList()] ?? '';
  }

  const toBuy = $derived(itemsToBuy(list));
  const toCheck = $derived(itemsToCheck(list));
  const basket = $derived(checkedItems(list));
  // The quantity controls serve the preparation: in store, the thumb that checks lands on them.
  const inStore = $derived(isInStore(list));
  // Items to check are not counted until the doubt is settled.
  const total = $derived(toBuy.length + basket.length);
  const progress = $derived(total === 0 ? 0 : Math.round((basket.length / total) * 100));

  const toggle = async (item: Item) => (list = await app.toggleItem(item.id));
  const setQuantity = async (item: Item, quantity: Quantity | undefined) =>
    (list = await app.setItemQuantity(item.id, quantity));
  const alreadyHave = async (item: Item) => (list = await app.removeItem(item.id));
  const needed = async (item: Item) => (list = await app.setToCheck(item.id, false));
  const quantityChange = ({ before, after }: NonNullable<ListedAgain['quantity']>) =>
    `${before} → ${after}`;
  const plural = (count: number, word: string) => `${count} ${word}${count > 1 ? 's' : ''}`;
</script>

{#snippet labels(title: string, listed: readonly ListedAgain[])}
  <strong>{title}</strong> :
  {#each listed as { label, quantity }, index (index)}<span class="capitalized">{label}</span
    >{quantity ? ` (${quantityChange(quantity)})` : ''}{index < listed.length - 1
      ? ', '
      : ''}{/each}
{/snippet}

<header>
  <div class="title">
    {#if list.items.length === 0}
      <h1>Liste de courses</h1>
    {:else if total === 0}
      <h1>À vérifier d'abord</h1>
    {:else if toBuy.length === 0}
      <h1>Tout est pris</h1>
    {:else}
      <h1>{toBuy.length}&nbsp;<span>à prendre</span></h1>
    {/if}
    <div class="header-actions">
      <button
        type="button"
        class="header-action"
        aria-label="Historique des achats"
        onclick={onhistory}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      </button>
      <button
        type="button"
        class="header-action"
        aria-label="Envoyer la liste"
        disabled={toBuy.length + toCheck.length === 0}
        onclick={send}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
        </svg>
      </button>
    </div>
  </div>
  {#if sendNotice}<p class="send-notice" role="status">{sendNotice}</p>{/if}
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

<main style:padding-bottom="{dockHeight + 24}px">
  {#if list.items.length === 0}
    <p class="empty">
      La liste est vide. Colle une liste copiée dans une autre application, ou ajoute un article
      avec le bouton +. Un appui long sur un article permet ensuite de le modifier ou de le
      supprimer.
    </p>
  {/if}

  {#if toCheck.length > 0}
    <section class="to-check" aria-labelledby="to-check-title">
      <h2 id="to-check-title">À vérifier avant de partir ({toCheck.length})</h2>
      <ul aria-label="À vérifier">
        {#each toCheck as item (item.id)}
          <ItemToCheckRow {item} onhave={alreadyHave} onneed={needed} {onactions} />
        {/each}
      </ul>
    </section>
  {/if}

  {#if toBuy.length > 0}
    <ul aria-label="À prendre">
      {#each toBuy as item (item.id)}
        <ItemRow
          {item}
          ontoggle={toggle}
          {onactions}
          onquantity={setQuantity}
          adjustable={!inStore}
        />
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
            <ItemRow
              {item}
              ontoggle={toggle}
              {onactions}
              onquantity={setQuantity}
              adjustable={false}
            />
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

  <!-- When everything is taken, removing the taken items already empties the list. -->
  {#if toBuy.length + toCheck.length > 0}
    <button type="button" class="button clear" onclick={async () => (list = await app.clearList())}>
      Vider la liste
    </button>
  {/if}
</main>

<nav aria-label="Ajouter des articles" bind:clientHeight={dockHeight}>
  {#if report}
    <div class="banner report" role="status">
      <div>
        {#if report.added.length > 0}
          <p>
            {@render labels(
              report.added.length > 1 ? 'Ajoutés' : 'Ajouté',
              report.added.map((label) => ({ label })),
            )}
          </p>
        {/if}
        {#if report.alreadyListed.length > 0}
          <p>
            {@render labels('Déjà dans la liste', report.alreadyListed)}
          </p>
        {/if}
      </div>
      <button type="button" class="close" aria-label="Fermer le bilan" onclick={onclosereport}
        >×</button
      >
    </div>
  {/if}
  {#if removed > 0}
    <div class="banner undo" role="status">
      <span>{plural(removed, 'article')} retiré{removed > 1 ? 's' : ''}</span>
      <button type="button" onclick={onundo}>Annuler</button>
    </div>
  {/if}
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
      <PlusIcon size={26} />
    </button>
  </div>
</nav>

<style>
  header {
    padding: 28px 24px 12px;
  }

  .title {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .header-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  .header-action {
    width: var(--target);
    height: var(--target);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--ink);
    border-radius: 16px;
    background: transparent;
  }

  .header-action:disabled {
    opacity: 0.35;
    cursor: default;
  }

  .send-notice {
    margin: 10px 0 0;
    font-weight: 600;
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
    padding: 8px 12px;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .to-check {
    margin-bottom: 20px;
  }

  .to-check h2 {
    margin: 4px 12px 10px;
    font-size: 1rem;
    font-weight: 700;
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

  .banner {
    width: 100%;
    max-width: 40rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 4px 4px 4px 18px;
    border-radius: 18px;
    background: var(--ink);
    color: var(--ground);
    font-weight: 600;
  }

  .report p {
    margin: 8px 0;
  }

  .report .close {
    align-self: flex-start;
    width: var(--target);
    height: var(--target);
    flex-shrink: 0;
    border: none;
    background: transparent;
    color: var(--ground);
    font-size: 1.6rem;
  }

  .clear {
    margin: 24px 12px 0;
  }

  .undo button {
    min-height: var(--target);
    padding: 0 16px;
    border: none;
    border-radius: 14px;
    background: var(--accent);
    color: var(--on-accent);
    font-weight: 800;
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
</style>
