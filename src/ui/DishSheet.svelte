<script lang="ts">
  import { untrack } from 'svelte';
  import Sheet from './Sheet.svelte';

  interface Props {
    name: string;
    ingredientsText?: string;
    // Resolves to an error message, or to nothing once the dish is remembered.
    onsave: (ingredientsText: string) => Promise<string | undefined>;
    onclose: () => void;
  }

  const { name, ingredientsText = '', onsave, onclose }: Props = $props();

  let draft = $state(untrack(() => ingredientsText));
  let error = $state('');

  async function save(event: SubmitEvent) {
    event.preventDefault();
    error = (await onsave(draft)) ?? '';
    if (!error) onclose();
  }
</script>

<Sheet
  title={name}
  hint="Un ingrédient par ligne. Termine par « ? » ce que tu as souvent déjà."
  {onclose}
>
  <form class="field" onsubmit={save}>
    <!-- svelte-ignore a11y_autofocus -->
    <textarea aria-label="Liste des ingrédients de {name}" bind:value={draft} autofocus></textarea>
    <button type="submit" class="button primary">Enregistrer le plat</button>
  </form>
  {#if error}<p class="alert" role="alert">{error}</p>{/if}
  <div class="actions">
    <button type="button" class="button" onclick={onclose}>Annuler</button>
  </div>
</Sheet>
