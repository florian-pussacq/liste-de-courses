<script lang="ts">
  import type { Shopping } from '../application/shopping';
  import { keptEntries, type Inbox, type Proposal } from '../domain/inbox';
  import type { ShoppingList } from '../domain/shopping-list';
  import { messageFor } from './messages';
  import Sheet from './Sheet.svelte';

  interface Props {
    app: Shopping;
    inbox: Inbox;
    notice?: string;
    reading?: boolean;
    onvalidated: (list: ShoppingList) => void;
    onclose: () => void;
  }

  let { app, inbox = $bindable(), notice, reading = false, onvalidated, onclose }: Props = $props();

  let capturedText = $state('');
  let newLabel = $state('');
  let editing: Proposal | undefined = $state();
  let draft = $state('');
  let error = $state('');
  const typingOpen = $derived((notice !== undefined && !reading) || inbox.proposals.length === 0);

  const kept = $derived(keptEntries(inbox).length);
  const title = $derived(
    inbox.proposals.length === 0
      ? 'Aucun article à trier'
      : `${kept} article${kept > 1 ? 's' : ''} trouvé${kept > 1 ? 's' : ''}`,
  );

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

  // A long press emits `contextmenu` on Android, as do a right click and the keyboard menu key.
  function startEditing(event: MouseEvent, proposal: Proposal) {
    event.preventDefault();
    editing = proposal;
    draft = proposal.label;
    error = '';
  }

  async function saveEdit(event: SubmitEvent) {
    event.preventDefault();
    if (!editing) return;
    const result = await app.editProposal(editing.id, draft);
    if (!result.ok) {
      error = messageFor(result.error);
      return;
    }
    inbox = result.value;
    editing = undefined;
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

<Sheet
  {title}
  hint={inbox.proposals.length > 0
    ? 'Touche un article pour l’écarter ou le remettre, appui long pour le corriger.'
    : undefined}
  {onclose}
>
  {#if notice}<p class="notice" role="status">{notice}</p>{/if}

  {#if inbox.capturedTexts.length > 0}
    <section aria-label="Textes reçus" class="received">
      {#each inbox.capturedTexts as text, index (index)}
        <blockquote>{text}</blockquote>
      {/each}
    </section>
  {/if}

  {#if inbox.proposals.length > 0}
    <ul aria-label="Articles proposés" class="chips">
      {#each inbox.proposals as proposal (proposal.id)}
        <li>
          <button
            type="button"
            class="chip"
            class:discarded={proposal.discarded}
            aria-label="{proposal.discarded ? 'Remettre' : 'Écarter'} {proposal.label}"
            onclick={async () => (inbox = await app.toggleProposal(proposal.id))}
            oncontextmenu={(event) => startEditing(event, proposal)}
          >
            {proposal.label}
          </button>
        </li>
      {/each}
    </ul>
  {/if}

  {#if editing}
    <form class="field" onsubmit={saveEdit}>
      <!-- svelte-ignore a11y_autofocus -->
      <input aria-label="Corriger {editing.label}" bind:value={draft} autofocus />
      <button type="submit" class="button primary">Corriger</button>
    </form>
  {/if}

  <form class="field" onsubmit={addProposal}>
    <input aria-label="Article à proposer" placeholder="Ajouter un article" bind:value={newLabel} />
    <button type="submit" class="button">Ajouter</button>
  </form>
  {#if error}<p class="alert" role="alert">{error}</p>{/if}

  <details open={typingOpen}>
    <summary>Coller ou écrire une liste à la main</summary>
    <form class="field" onsubmit={propose}>
      <textarea
        aria-label="Texte à découper"
        placeholder="Une liste, un message…"
        bind:value={capturedText}></textarea>
      <button type="submit" class="button">Proposer les articles</button>
    </form>
  </details>

  <div class="actions">
    <button type="button" class="button" onclick={abandon}>Annuler</button>
    <button type="button" class="button primary" disabled={kept === 0} onclick={validate}>
      Ajouter {kept} à la liste
    </button>
  </div>
</Sheet>

<style>
  .notice {
    margin: 0 0 12px;
    padding: 10px 14px;
    border-radius: 14px;
    background: var(--accent);
    color: var(--on-accent);
    font-weight: 600;
  }

  .received {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
  }

  blockquote {
    margin: 0;
    padding: 10px 14px;
    border-radius: 14px;
    background: color-mix(in srgb, var(--ground) 10%, transparent);
    color: var(--surface-muted);
    font-size: 0.85rem;
    white-space: pre-line;
  }

  .chips {
    list-style: none;
    margin: 0 0 8px;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .chip {
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

  .chip.discarded {
    border-style: dashed;
    border-color: var(--ink-muted);
    background: transparent;
    color: var(--surface-muted);
    font-weight: 500;
    text-decoration: line-through;
  }

  details {
    margin-top: 8px;
  }

  summary {
    padding: 12px 0;
    color: var(--surface-muted);
    font-weight: 600;
    cursor: pointer;
  }
</style>
