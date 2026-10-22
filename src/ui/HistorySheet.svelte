<script lang="ts">
  import type { Shopping } from '../application/shopping';
  import { labelKey } from '../domain/label';
  import {
    purchasesByDay,
    searchPurchases,
    type PurchasedArticle,
    type PurchaseHistory,
  } from '../domain/purchase-history';
  import type { ShoppingList } from '../domain/shopping-list';
  import QuantityBadge from './QuantityBadge.svelte';
  import Sheet from './Sheet.svelte';

  interface Props {
    app: Shopping;
    list: ShoppingList;
    onchange: (list: ShoppingList) => void;
    onclose: () => void;
  }

  const { app, list, onchange, onclose }: Props = $props();

  let history: PurchaseHistory | undefined = $state.raw();
  let query = $state('');
  let confirming = $state(false);
  const days = $derived(history && purchasesByDay(history));
  const results = $derived(history && searchPurchases(history, query));
  // A search replaces the days; clearing it brings them back.
  const shownDays = $derived(results ? [] : (days ?? []));

  $effect(() => {
    void app.purchaseHistory().then((loaded) => (history = loaded));
  });

  async function clear() {
    history = await app.clearPurchaseHistory();
    confirming = false;
  }

  // Already to buy or to check: putting it back would only add up the quantities by mistake.
  const inList = ({ label }: PurchasedArticle) =>
    list.items.some((item) => !item.checked && labelKey(item.label) === labelKey(label));

  const buyAgain = async (article: PurchasedArticle) => onchange(await app.buyAgain(article));

  // The year is only worth reading when it is not the current one.
  function dateTitle(date: Date): string {
    const sameYear = date.getFullYear() === new Date().getFullYear();
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      ...(!sameYear && { year: 'numeric' }),
    }).format(date);
  }

  function dayTitle(day: string): string {
    const [year = 0, month = 1, date = 1] = day.split('-').map(Number);
    return dateTitle(new Date(year, month - 1, date));
  }
</script>

<Sheet title="Historique des achats" {onclose}>
  {#if days && days.length > 0}
    <input
      class="search"
      type="search"
      aria-label="Rechercher un article"
      placeholder="Rechercher un article"
      bind:value={query}
    />
  {/if}
  {#if days?.length === 0}
    <p class="empty">Aucun achat enregistré pour l’instant.</p>
  {/if}
  {#if results}
    {#if results.length === 0}
      <p class="empty">Aucun achat ne correspond à « {query.trim()} ».</p>
    {:else}
      <ul aria-label="Articles trouvés" class="results">
        {#each results as article (labelKey(article.label))}
          <li>
            <div>
              <QuantityBadge quantity={article.lastQuantity} /><span class="capitalized"
                >{article.label}</span
              >
              <p class="detail">
                {article.purchaseCount}&nbsp;achat{article.purchaseCount > 1 ? 's' : ''} · dernier :
                {dateTitle(new Date(article.lastTakenAt))}
              </p>
            </div>
            {#if inList(article)}
              <span class="in-list">Dans la liste</span>
            {:else}
              <button
                type="button"
                class="button"
                aria-label="Remettre {article.label}"
                onclick={() => buyAgain(article)}>Remettre</button
              >
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  {/if}
  {#each shownDays as { day, purchases } (day)}
    <section aria-labelledby="day-{day}">
      <h3 id="day-{day}" class="capitalized">{dayTitle(day)}</h3>
      <ul>
        {#each purchases as purchase, index (index)}
          <li>
            <QuantityBadge quantity={purchase.quantity} /><span class="capitalized"
              >{purchase.label}</span
            >
          </li>
        {/each}
      </ul>
    </section>
  {/each}
  {#if confirming}
    <p class="confirm" role="alert">
      Effacer tous les achats de l’historique ? La liste ne change pas.
    </p>
    <div class="actions">
      <button type="button" class="button danger" onclick={clear}>Effacer tout</button>
      <button type="button" class="button" onclick={() => (confirming = false)}>Garder</button>
    </div>
  {:else}
    <div class="actions">
      {#if days && days.length > 0}
        <button type="button" class="button" onclick={() => (confirming = true)}
          >Effacer l’historique</button
        >
      {/if}
      <button type="button" class="button" onclick={onclose}>Fermer</button>
    </div>
  {/if}
</Sheet>

<style>
  .confirm {
    margin: 20px 0 0;
    font-weight: 700;
  }

  .danger {
    border-color: var(--sheet-alert);
    color: var(--sheet-alert);
  }

  .empty {
    color: var(--surface-muted);
  }

  .search {
    width: 100%;
    min-height: var(--target);
    margin: 4px 0 16px;
    padding: 0 16px;
    border: none;
    border-radius: 14px;
    background: var(--ground);
    color: var(--ink);
    font: inherit;
  }

  .results li {
    justify-content: space-between;
    gap: 12px;
    padding: 8px 0;
  }

  .detail {
    margin: 4px 0 0;
    color: var(--surface-muted);
    font-size: 0.85rem;
    font-weight: 500;
  }

  .in-list {
    flex-shrink: 0;
    color: var(--surface-muted);
    font-weight: 700;
  }

  section + section {
    margin-top: 20px;
  }

  h3 {
    margin: 0 0 8px;
    font-size: 1.1rem;
    font-weight: 800;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  li {
    display: flex;
    align-items: center;
    font-weight: 600;
  }
</style>
