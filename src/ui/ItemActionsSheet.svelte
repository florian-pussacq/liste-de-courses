<script lang="ts">
  import { untrack } from 'svelte';
  import type { Shopping } from '../application/shopping';
  import type { Item, ShoppingList } from '../domain/shopping-list';
  import { messageFor } from './messages';
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
  }
</script>

<Sheet title={item.label} {onclose}>
  <form class="field" onsubmit={rename}>
    <input aria-label="Libellé de {item.label}" bind:value={draft} />
    <button type="submit" class="button primary">Enregistrer</button>
  </form>
  {#if error}<p class="alert" role="alert">{error}</p>{/if}
  <div class="actions">
    <button
      type="button"
      class="button"
      onclick={async () => onchange(await app.removeItem(item.id))}
    >
      Supprimer {item.label}
    </button>
    <button type="button" class="button" onclick={onclose}>Fermer</button>
  </div>
</Sheet>
