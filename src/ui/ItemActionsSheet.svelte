<script lang="ts">
  import { untrack } from 'svelte';
  import type { Shopping } from '../application/shopping';
  import type { Quantity } from '../domain/quantity';
  import type { Item, ShoppingList } from '../domain/shopping-list';
  import { messageFor } from './messages';
  import QuantityStepper from './QuantityStepper.svelte';
  import Sheet from './Sheet.svelte';

  interface Props {
    app: Shopping;
    item: Item;
    onchange: (list: ShoppingList) => void;
    onclose: () => void;
  }

  const { app, item, onchange, onclose }: Props = $props();

  let draft = $state(untrack(() => item.label));
  let error = $state('');

  async function rename(event: SubmitEvent) {
    event.preventDefault();
    const result = await app.renameItem(item.id, draft);
    if (!result.ok) {
      error = messageFor(result.error);
      return;
    }
    onchange(result.value);
    onclose();
  }

  async function change(update: Promise<ShoppingList>) {
    onchange(await update);
    onclose();
  }

  // The sheet stays open while adjusting, so its quantity follows the changes.
  let quantity = $state(untrack(() => item.quantity));

  async function setQuantity(next: Quantity | undefined) {
    quantity = next;
    onchange(await app.setItemQuantity(item.id, next));
  }
</script>

<Sheet title={item.label} {onclose}>
  <form class="field" onsubmit={rename}>
    <input aria-label="Libellé de {item.label}" bind:value={draft} />
    <button type="submit" class="button primary">Enregistrer</button>
  </form>
  {#if error}<p class="alert" role="alert">{error}</p>{/if}
  {#if !item.checked}
    <div class="quantity">
      <span>Quantité</span>
      <QuantityStepper label={item.label} {quantity} onchange={setQuantity} />
    </div>
  {/if}
  <div class="actions">
    {#if !item.checked}
      <button
        type="button"
        class="button"
        onclick={() => change(app.setToCheck(item.id, !item.toCheck))}
      >
        {item.toCheck ? 'Il en faut' : 'Marquer à vérifier'}
      </button>
    {/if}
    <button type="button" class="button" onclick={() => change(app.removeItem(item.id))}>
      Supprimer {item.label}
    </button>
    <button type="button" class="button" onclick={onclose}>Fermer</button>
  </div>
</Sheet>

<style>
  .quantity {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin: 12px 0;
    font-weight: 700;
  }
</style>
