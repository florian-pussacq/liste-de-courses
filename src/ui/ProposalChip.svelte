<script lang="ts">
  import type { Proposal } from '../domain/inbox';
  import QuantityBadge from './QuantityBadge.svelte';

  interface Props {
    proposal: Proposal;
    ontoggle: (proposal: Proposal) => void;
    onedit: (proposal: Proposal) => void;
  }

  const { proposal, ontoggle, onedit }: Props = $props();

  // A long press emits `contextmenu` on Android, as do a right click and the keyboard menu key.
  function edit(event: MouseEvent) {
    event.preventDefault();
    onedit(proposal);
  }
</script>

<li>
  <button
    type="button"
    class="chip"
    class:discarded={proposal.discarded}
    aria-label="{proposal.discarded ? 'Remettre' : 'Écarter'} {proposal.quantity === undefined
      ? ''
      : `${proposal.quantity} `}{proposal.label}{proposal.toCheck ? ', à vérifier' : ''}"
    onclick={() => ontoggle(proposal)}
    oncontextmenu={edit}
  >
    <QuantityBadge quantity={proposal.quantity} /><span class="capitalized">{proposal.label}</span>
    {#if proposal.toCheck}<span class="doubt" aria-hidden="true">?</span>{/if}
  </button>
</li>

<style>
  .chip {
    --badge-background: var(--on-accent);
    --badge-color: var(--accent);
    min-height: var(--target);
    padding: 8px 18px;
    border: 2px solid var(--accent);
    border-radius: 999px;
    background: var(--accent);
    color: var(--on-accent);
    font-size: 1.05rem;
    font-weight: 700;
    text-align: left;
    overflow-wrap: anywhere;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }

  .doubt {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.4em;
    height: 1.4em;
    margin-left: 6px;
    border-radius: 999px;
    background: var(--on-accent);
    color: var(--accent);
    font-size: 0.85em;
    font-weight: 800;
  }

  .chip.discarded .doubt {
    background: var(--surface-muted);
    color: var(--ink);
  }

  .chip.discarded {
    border-style: dashed;
    border-color: var(--ink-muted);
    background: transparent;
    color: var(--surface-muted);
    font-weight: 500;
    text-decoration: line-through;
  }
</style>
