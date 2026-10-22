<script lang="ts">
  import { quantityOf, stepQuantity, type Quantity } from '../domain/quantity';

  interface Props {
    label: string;
    quantity: Quantity | undefined;
    onchange: (quantity: Quantity | undefined) => void;
  }

  const { label, quantity, onchange }: Props = $props();

  const lowered = $derived(stepQuantity(quantity, -1));
  const raised = $derived(stepQuantity(quantity, 1));
</script>

<div class="stepper" role="group" aria-label="Quantité de {label}">
  <button
    type="button"
    aria-label="Diminuer {label}"
    disabled={lowered === quantityOf(quantity)}
    onclick={() => onchange(lowered)}>−</button
  >
  <span class="value">{quantityOf(quantity)}</span>
  <button
    type="button"
    aria-label="Augmenter {label}"
    disabled={raised === quantityOf(quantity)}
    onclick={() => onchange(raised)}>+</button
  >
</div>

<style>
  .stepper {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  button {
    width: var(--target);
    height: var(--target);
    border: 2px solid currentColor;
    border-radius: 14px;
    background: transparent;
    font-size: 1.4rem;
    font-weight: 800;
    line-height: 1;
  }

  button:disabled {
    opacity: 0.3;
  }

  .value {
    min-width: 2ch;
    text-align: center;
    font-size: 1.15rem;
    font-weight: 800;
  }
</style>
