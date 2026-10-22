<script lang="ts">
  import type { Shopping } from '../application/shopping';
  import type { ShoppingList } from '../domain/shopping-list';
  import { messageFor } from './messages';
  import PlusIcon from './PlusIcon.svelte';
  import Sheet from './Sheet.svelte';

  interface Props {
    app: Shopping;
    onchange: (list: ShoppingList) => void;
    onclose: () => void;
  }

  const { app, onchange, onclose }: Props = $props();

  let newLabel = $state('');
  let error = $state('');

  // The field is emptied before the item is stored, so that typing the next one is never lost.
  async function add(event: SubmitEvent) {
    event.preventDefault();
    const label = newLabel;
    newLabel = '';
    const result = await app.addItem(label);
    if (!result.ok) {
      newLabel = label;
      error = messageFor(result.error);
      return;
    }
    error = '';
    onchange(result.value);
  }
</script>

<Sheet title="Ajouter des articles" hint="Ajoute autant d'articles que tu veux." {onclose}>
  <form class="field" onsubmit={add}>
    <!-- svelte-ignore a11y_autofocus -->
    <input aria-label="Nouvel article" placeholder="Pain, lait…" bind:value={newLabel} autofocus />
    <button type="submit" class="button primary icon" aria-label="Ajouter"
      ><PlusIcon size={24} /></button
    >
  </form>
  {#if error}<p class="alert" role="alert">{error}</p>{/if}
  <div class="actions">
    <button type="button" class="button" onclick={onclose}>Terminé</button>
  </div>
</Sheet>
