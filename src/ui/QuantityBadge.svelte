<script lang="ts">
  import type { Quantity } from '../domain/quantity';

  interface Props {
    quantity: Quantity | undefined;
  }

  const { quantity }: Props = $props();
</script>

{#if quantity !== undefined}<span class="quantity">{quantity}</span>{/if}

<style>
  .quantity {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.7em;
    height: 1.7em;
    margin-right: 8px;
    padding: 0 6px;
    border-radius: 999px;
    background: var(--badge-background, var(--accent));
    color: var(--badge-color, var(--on-accent));
    font-size: 0.85em;
    font-weight: 800;
    vertical-align: middle;
  }
</style>
