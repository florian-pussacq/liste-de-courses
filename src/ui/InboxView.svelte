<script lang="ts">
  import type { Shopping } from '../application/shopping';
  import type { Inbox } from '../domain/inbox';
  import type { ShoppingList } from '../domain/shopping-list';
  import { messageFor } from './messages';

  interface Props {
    app: Shopping;
    inbox: Inbox;
    emptyShare?: boolean;
    onvalidated: (list: ShoppingList) => void;
    onclose: () => void;
  }

  let { app, inbox = $bindable(), emptyShare = false, onvalidated, onclose }: Props = $props();

  let capturedText = $state('');
  let newLabel = $state('');
  let error = $state('');

  // Fields are emptied before storing, so that typing the next entry is never lost.
  async function propose(event: SubmitEvent) {
    event.preventDefault();
    const text = capturedText;
    capturedText = '';
    inbox = await app.captureText(text);
  }

  async function addProposal(event: SubmitEvent) {
    event.preventDefault();
    const label = newLabel;
    newLabel = '';
    const result = await app.addProposal(label);
    if (!result.ok) {
      newLabel = label;
      error = messageFor(result.error);
      return;
    }
    inbox = result.value;
    error = '';
  }

  async function edit(id: string, input: HTMLInputElement) {
    const result = await app.editProposal(id, input.value);
    if (!result.ok) {
      error = messageFor(result.error);
      input.value = inbox.proposals.find((proposal) => proposal.id === id)?.label ?? '';
      return;
    }
    inbox = result.value;
    error = '';
  }

  async function validate() {
    const list = await app.validateInbox();
    inbox = await app.inbox();
    onvalidated(list);
  }

  async function abandon() {
    inbox = await app.abandonInbox();
    onclose();
  }
</script>

<header>
  <h1>Boîte de réception</h1>
  <button type="button" onclick={onclose}>Retour à la liste</button>
</header>

<main>
  <form onsubmit={propose}>
    <textarea
      aria-label="Texte à découper"
      placeholder="Colle ici une liste ou un message"
      bind:value={capturedText}></textarea>
    <button type="submit">Proposer les articles</button>
  </form>

  {#if inbox.proposals.length === 0}
    <p class="empty">
      {emptyShare
        ? 'Le texte partagé ne contient aucun article.'
        : 'Aucun article proposé pour le moment.'}
    </p>
  {:else}
    <ul aria-label="Articles proposés">
      {#each inbox.proposals as proposal (proposal.id)}
        <li>
          <input
            aria-label="Article proposé {proposal.label}"
            value={proposal.label}
            onchange={(event) => edit(proposal.id, event.currentTarget)}
          />
          <button
            type="button"
            aria-label="Écarter {proposal.label}"
            onclick={async () => (inbox = await app.discardProposal(proposal.id))}>✕</button
          >
        </li>
      {/each}
    </ul>
  {/if}

  <form onsubmit={addProposal}>
    <input aria-label="Article à proposer" placeholder="Ajouter un article" bind:value={newLabel} />
    <button type="submit">Ajouter</button>
  </form>
  {#if error}<p role="alert">{error}</p>{/if}

  <footer>
    <button
      type="button"
      class="primary"
      disabled={inbox.proposals.length === 0}
      onclick={validate}
    >
      Valider {inbox.proposals.length} article{inbox.proposals.length > 1 ? 's' : ''}
    </button>
    <button type="button" onclick={abandon}>Abandonner</button>
  </footer>
</main>
