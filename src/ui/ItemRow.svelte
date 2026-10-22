<script lang="ts">
  import type { Quantity } from '../domain/quantity';
  import type { Item } from '../domain/shopping-list';
  import QuantityBadge from './QuantityBadge.svelte';
  import QuantityStepper from './QuantityStepper.svelte';

  interface Props {
    item: Item;
    ontoggle: (item: Item) => void;
    onactions: (item: Item) => void;
    onquantity: (item: Item, quantity: Quantity | undefined) => void;
  }

  const { item, ontoggle, onactions, onquantity }: Props = $props();
  // Only an item to buy that already has a quantity gets the controls: the rest of the line,
  // and every other line, stays a single target to check.
  const adjustable = $derived(!item.checked && item.quantity !== undefined);

  // A long press emits `contextmenu` on Android, as do a right click and the keyboard menu key.
  function openActions(event: MouseEvent) {
    event.preventDefault();
    onactions(item);
  }
</script>

<li class:adjustable>
  <button
    type="button"
    role="checkbox"
    aria-checked={item.checked}
    class:checked={item.checked}
    onclick={() => ontoggle(item)}
    oncontextmenu={openActions}
  >
    <span class="mark" aria-hidden="true">
      {#if item.checked}
        <svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7" /></svg>
      {/if}
    </span>
    <span class="label"
      >{#if !adjustable}<QuantityBadge quantity={item.quantity} />{/if}<span class="capitalized"
        >{item.label}</span
      ></span
    >
  </button>
  {#if adjustable}
    <QuantityStepper
      label={item.label}
      quantity={item.quantity}
      floor={1}
      onchange={(quantity) => onquantity(item, quantity)}
    />
  {/if}
</li>

<style>
  li {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  button[role='checkbox'] {
    flex: 1;
    min-width: 0;
    min-height: 60px;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 10px 14px;
    border: none;
    border-radius: var(--radius);
    background: var(--surface);
    text-align: left;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }

  li.adjustable {
    padding-right: 8px;
    border-radius: var(--radius);
    background: var(--surface);
  }

  li.adjustable button[role='checkbox'] {
    background: transparent;
  }

  .mark {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2.5px solid var(--ink);
    border-radius: 999px;
  }

  .label {
    font-size: 1.15rem;
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  .checked {
    min-height: 48px;
    background: transparent;
    color: var(--ink-muted);
  }

  .checked .mark {
    border-color: var(--mark-fill);
    background: var(--mark-fill);
  }

  .checked .label {
    font-weight: 400;
    text-decoration: line-through;
  }

  svg {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: var(--mark-check);
    stroke-width: 3.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
</style>
