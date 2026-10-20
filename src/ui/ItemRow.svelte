<script lang="ts">
  import type { Shopping } from '../application/shopping';
  import type { Item, ShoppingList } from '../domain/shopping-list';
  import { messageFor } from './messages';

  interface Props {
    app: Shopping;
    item: Item;
    onchange: (list: ShoppingList) => void;
  }

  const { app, item, onchange }: Props = $props();

  let editing = $state(false);
  let draft = $state('');
  let error = $state('');

  function startEditing() {
    draft = item.label;
    error = '';
    editing = true;
  }

  async function rename(event: SubmitEvent) {
    event.preventDefault();
    const result = await app.renameItem(item.id, draft);
    if (!result.ok) {
      error = messageFor(result.error);
      return;
    }
    editing = false;
    onchange(result.value);
  }
</script>

<li class:checked={item.checked}>
  {#if editing}
    <form onsubmit={rename}>
      <!-- svelte-ignore a11y_autofocus -->
      <input aria-label="Libellé de {item.label}" bind:value={draft} autofocus />
      <button type="submit">Enregistrer</button>
      <button type="button" onclick={() => (editing = false)}>Annuler</button>
    </form>
    {#if error}<p role="alert">{error}</p>{/if}
  {:else}
    <label>
      <input
        type="checkbox"
        checked={item.checked}
        onchange={async () => onchange(await app.toggleItem(item.id))}
      />
      <span>{item.label}</span>
    </label>
    <button type="button" aria-label="Modifier {item.label}" onclick={startEditing}>✎</button>
    <button
      type="button"
      aria-label="Supprimer {item.label}"
      onclick={async () => onchange(await app.removeItem(item.id))}>✕</button
    >
  {/if}
</li>
