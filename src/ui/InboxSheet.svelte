<script lang="ts">
  import type { Shopping } from '../application/shopping';
  import { keptEntries, type Inbox, type Proposal } from '../domain/inbox';
  import type { ShoppingList } from '../domain/shopping-list';
  import { messageFor } from './messages';
  import { labelKey } from '../domain/label';
  import DishSheet from './DishSheet.svelte';
  import ProposalChip from './ProposalChip.svelte';
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
  let editingId: string | undefined = $state();
  const editing = $derived(inbox.proposals.find((proposal) => proposal.id === editingId));
  let draft = $state('');
  let error = $state('');
  const typingOpen = $derived((notice !== undefined && !reading) || inbox.proposals.length === 0);

  type Segment =
    | { readonly key: string; readonly proposal: Proposal }
    | { readonly key: string; readonly dish: string; readonly proposals: readonly Proposal[] };

  // Consecutive ingredients of the same dish are shown as one group under its name.
  const segments = $derived(
    inbox.proposals.reduce<Segment[]>((grouped, proposal) => {
      const last = grouped.at(-1);
      if (proposal.dish === undefined) return [...grouped, { key: proposal.id, proposal }];
      if (last && 'dish' in last && labelKey(last.dish) === labelKey(proposal.dish)) {
        return [...grouped.slice(0, -1), { ...last, proposals: [...last.proposals, proposal] }];
      }
      return [...grouped, { key: proposal.id, dish: proposal.dish, proposals: [proposal] }];
    }, []),
  );

  type DishEditing =
    | { readonly kind: 'define'; readonly proposalId: string; readonly name: string }
    | { readonly kind: 'update'; readonly name: string; readonly ingredientsText: string };
  let dishEditing: DishEditing | undefined = $state();

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

  const toggle = async (proposal: Proposal) => (inbox = await app.toggleProposal(proposal.id));

  function defineDish() {
    if (!editing) return;
    dishEditing = { kind: 'define', proposalId: editing.id, name: editing.label };
    editingId = undefined;
  }

  // A long press emits `contextmenu` on Android, as do a right click and the keyboard menu key.
  async function editDish(event: MouseEvent, name: string) {
    event.preventDefault();
    const dish = await app.dish(name);
    if (!dish) return;
    const ingredientsText = dish.ingredients
      .map(({ label, toCheck }) => (toCheck ? `${label} ?` : label))
      .join('\n');
    dishEditing = { kind: 'update', name: dish.name, ingredientsText };
  }

  async function saveDish(ingredientsText: string): Promise<string | undefined> {
    if (!dishEditing) return undefined;
    const result =
      dishEditing.kind === 'define'
        ? await app.defineDishFromProposal(dishEditing.proposalId, ingredientsText)
        : await app.updateDish(dishEditing.name, ingredientsText);
    if (!result.ok) return messageFor(result.error);
    inbox = result.value;
    return undefined;
  }

  function startEditing(proposal: Proposal) {
    editingId = proposal.id;
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
    editingId = undefined;
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
      {#each segments as segment (segment.key)}
        {#if 'dish' in segment}
          {@const allDiscarded = segment.proposals.every((proposal) => proposal.discarded)}
          <li class="dish">
            <button
              type="button"
              class="dish-name"
              class:discarded={allDiscarded}
              aria-label="{allDiscarded ? 'Remettre' : 'Écarter'} le plat {segment.dish}"
              onclick={async () => (inbox = await app.toggleDish(segment.dish))}
              oncontextmenu={(event) => editDish(event, segment.dish)}
            >
              {segment.dish}
            </button>
            <ul aria-label="Ingrédients de {segment.dish}" class="chips">
              {#each segment.proposals as proposal (proposal.id)}
                <ProposalChip {proposal} ontoggle={toggle} onedit={startEditing} />
              {/each}
            </ul>
          </li>
        {:else}
          <ProposalChip proposal={segment.proposal} ontoggle={toggle} onedit={startEditing} />
        {/if}
      {/each}
    </ul>
  {/if}

  {#if editing}
    <form class="field" onsubmit={saveEdit}>
      <!-- svelte-ignore a11y_autofocus -->
      <input aria-label="Corriger {editing.label}" bind:value={draft} autofocus />
      <button type="submit" class="button primary">Corriger</button>
    </form>
    <button
      type="button"
      class="button"
      onclick={async () => editing && (inbox = await app.toggleProposalToCheck(editing.id))}
    >
      {editing.toCheck ? 'Rendre certain' : 'Marquer à vérifier'}
    </button>
    {#if editing.dish === undefined}
      <button type="button" class="button" onclick={defineDish}>C'est un plat</button>
    {/if}
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

{#if dishEditing}
  <DishSheet
    name={dishEditing.name}
    ingredientsText={dishEditing.kind === 'update' ? dishEditing.ingredientsText : ''}
    onsave={saveDish}
    onclose={() => (dishEditing = undefined)}
  />
{/if}

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

  .dish {
    flex-basis: 100%;
    padding: 10px 12px 2px;
    border: 2px solid color-mix(in srgb, var(--accent) 60%, transparent);
    border-radius: 22px;
  }

  .dish .chips {
    margin-bottom: 8px;
  }

  .dish-name {
    min-height: var(--target);
    padding: 0 6px;
    border: none;
    background: transparent;
    color: var(--ground);
    font-size: 1.15rem;
    font-weight: 800;
    text-align: left;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }

  .dish-name.discarded {
    color: var(--surface-muted);
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
