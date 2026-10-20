<script lang="ts">
  import type { Item } from '../domain/shopping-list';

  interface Props {
    item: Item;
    onhave: (item: Item) => void;
    onneed: (item: Item) => void;
    onactions: (item: Item) => void;
  }

  const { item, onhave, onneed, onactions }: Props = $props();

  // A long press emits `contextmenu` on Android, as do a right click and the keyboard menu key.
  function openActions(event: MouseEvent) {
    event.preventDefault();
    onactions(item);
  }
</script>

<li oncontextmenu={openActions}>
  <span class="label">{item.label}</span>
  <button
    type="button"
    class="have"
    aria-label="On a déjà {item.label}"
    onclick={() => onhave(item)}
  >
    On en a
  </button>
  <button type="button" class="need" aria-label="Il faut {item.label}" onclick={() => onneed(item)}>
    Il en faut
  </button>
</li>

<style>
  li {
    min-height: 60px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 6px 6px 16px;
    border: 2px dashed var(--ink-muted);
    border-radius: var(--radius);
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }

  .label {
    flex: 1;
    font-size: 1.15rem;
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  button {
    min-height: var(--target);
    padding: 0 12px;
    border-radius: 14px;
    font-weight: 700;
    white-space: nowrap;
  }

  .have {
    border: 2px solid var(--ink-muted);
    background: transparent;
  }

  .need {
    border: 2px solid var(--accent);
    background: var(--accent);
    color: var(--on-accent);
  }
</style>
