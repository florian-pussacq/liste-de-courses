<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    hint?: string;
    onclose: () => void;
    children: Snippet;
  }

  const { title, hint, onclose, children }: Props = $props();

  let dialog: HTMLDialogElement;

  // A modal dialog gives focus trapping, Escape and an inert background for free.
  $effect(() => {
    dialog.showModal();
  });
</script>

<dialog bind:this={dialog} class="sheet" aria-label={title} {onclose}>
  <h2>{title}</h2>
  {#if hint}<p class="hint">{hint}</p>{/if}
  {@render children()}
</dialog>
