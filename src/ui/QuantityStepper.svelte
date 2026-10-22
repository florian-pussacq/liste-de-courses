<script lang="ts">
  import { stepQuantity, type Quantity } from '../domain/quantity';

  interface Props {
    label: string;
    quantity: Quantity | undefined;
    // 0 lets the quantity go back to unspecified, 1 keeps at least one unit.
    floor: 0 | 1;
    onchange: (quantity: Quantity | undefined) => void;
  }

  const { label, quantity, floor, onchange }: Props = $props();

  const lowered = $derived(stepQuantity(quantity, -1, floor));
  const raised = $derived(stepQuantity(quantity, 1, floor));
</script>

<div class="stepper" role="group" aria-label="Quantité de {label}">
  <button
    type="button"
    aria-label="Diminuer {label}"
    disabled={lowered === quantity}
    onclick={() => onchange(lowered)}>−</button
  >
  <output>{quantity ?? '–'}</output>
  <button
    type="button"
    aria-label="Augmenter {label}"
    disabled={raised === quantity}
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

  output {
    min-width: 2ch;
    text-align: center;
    font-size: 1.15rem;
    font-weight: 800;
  }
</style>
