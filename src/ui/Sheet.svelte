<script lang="ts">
  import { untrack, type Snippet } from 'svelte';

  interface Props {
    title: string;
    hint?: string;
    // By default a modal dialog focuses its first field, which opens the keyboard on a phone.
    focusSheet?: boolean;
    onclose: () => void;
    children: Snippet;
  }

  const { title, hint, focusSheet = false, onclose, children }: Props = $props();

  let dialog: HTMLDialogElement;

  // A modal dialog gives focus trapping, Escape and an inert background for free.
  $effect(() => {
    dialog.showModal();
    if (untrack(() => focusSheet)) dialog.focus();
  });
</script>

<dialog
  bind:this={dialog}
  class="sheet"
  aria-label={title}
  tabindex={focusSheet ? -1 : undefined}
  {onclose}
>
  <h2>{title}</h2>
  {#if hint}<p class="hint">{hint}</p>{/if}
  {@render children()}
</dialog>
