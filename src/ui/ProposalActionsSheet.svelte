<script lang="ts">
  import { untrack } from 'svelte';
  import type { Shopping } from '../application/shopping';
  import type { Inbox, Proposal } from '../domain/inbox';
  import type { Quantity } from '../domain/quantity';
  import { messageFor } from './messages';
  import QuantityStepper from './QuantityStepper.svelte';
  import Sheet from './Sheet.svelte';

  interface Props {
    app: Shopping;
    proposal: Proposal;
    onchange: (inbox: Inbox) => void;
    ondefinedish: (proposal: Proposal) => void;
    onclose: () => void;
  }

  const { app, proposal, onchange, ondefinedish, onclose }: Props = $props();

  let draft = $state(untrack(() => proposal.label));
  let error = $state('');

  async function correct(event: SubmitEvent) {
    event.preventDefault();
    const result = await app.editProposal(proposal.id, draft);
    if (!result.ok) {
      error = messageFor(result.error);
      return;
    }
    onchange(result.value);
    onclose();
  }

  // The sheet stays open while adjusting, so its quantity follows the changes.
  let quantity = $state(untrack(() => proposal.quantity));

  async function setQuantity(next: Quantity | undefined) {
    quantity = next;
    onchange(await app.setProposalQuantity(proposal.id, next));
  }

  async function toggleToCheck() {
    onchange(await app.toggleProposalToCheck(proposal.id));
    onclose();
  }
</script>

<Sheet title={proposal.label} {onclose}>
  <form class="field" onsubmit={correct}>
    <input aria-label="Corriger {proposal.label}" bind:value={draft} />
    <button type="submit" class="button primary">Corriger</button>
  </form>
  {#if error}<p class="alert" role="alert">{error}</p>{/if}
  {#if proposal.dishToDefine === undefined}
    <div class="quantity">
      <span>Quantité</span>
      <QuantityStepper label={proposal.label} {quantity} onchange={setQuantity} />
    </div>
  {/if}
  <div class="actions">
    <button type="button" class="button" onclick={toggleToCheck}>
      {proposal.toCheck ? 'Rendre certain' : 'Marquer à vérifier'}
    </button>
    {#if proposal.dish === undefined}
      <button type="button" class="button" onclick={() => ondefinedish(proposal)}>
        C'est un plat
      </button>
    {/if}
    <button type="button" class="button" onclick={onclose}>Fermer</button>
  </div>
</Sheet>

<style>
  .quantity {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin: 12px 0;
    font-weight: 700;
  }
</style>
