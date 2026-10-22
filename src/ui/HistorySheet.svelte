<script lang="ts">
  import type { Shopping } from '../application/shopping';
  import { purchasesByDay, type Day, type PurchaseDay } from '../domain/purchase-history';
  import QuantityBadge from './QuantityBadge.svelte';
  import Sheet from './Sheet.svelte';

  interface Props {
    app: Shopping;
    onclose: () => void;
  }

  const { app, onclose }: Props = $props();

  let days: PurchaseDay[] | undefined = $state();
  let confirming = $state(false);

  async function clear() {
    days = purchasesByDay(await app.clearPurchaseHistory());
    confirming = false;
  }
  $effect(() => {
    void app.purchaseHistory().then((history) => (days = purchasesByDay(history)));
  });

  // The year is only worth reading when it is not the current one.
  function dayTitle(day: Day): string {
    const [year = 0, month = 1, date = 1] = day.split('-').map(Number);
    const sameYear = year === new Date().getFullYear();
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      ...(!sameYear && { year: 'numeric' }),
    }).format(new Date(year, month - 1, date));
  }
</script>

<Sheet title="Historique des achats" {onclose}>
  {#if days?.length === 0}
    <p class="empty">Aucun achat enregistré pour l’instant.</p>
  {/if}
  {#each days ?? [] as { day, purchases } (day)}
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
