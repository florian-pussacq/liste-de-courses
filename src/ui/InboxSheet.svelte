<script lang="ts">
  import { untrack } from 'svelte';
  import type { Shopping } from '../application/shopping';
  import { keptEntries, reviewOrder, type Inbox, type Proposal } from '../domain/inbox';
  import type { BatchAddition } from '../domain/shopping-list';
  import { messageFor } from './messages';
  import { labelKey } from '../domain/label';
  import DishActionsSheet from './DishActionsSheet.svelte';
  import DishSheet from './DishSheet.svelte';
  import ProposalActionsSheet from './ProposalActionsSheet.svelte';
  import ProposalChip from './ProposalChip.svelte';
  import Sheet from './Sheet.svelte';

  interface Props {
    app: Shopping;
    inbox: Inbox;
    notice?: string;
    reading?: boolean;
    onvalidated: (addition: BatchAddition) => void;
    onclose: () => void;
  }

  let { app, inbox = $bindable(), notice, reading = false, onvalidated, onclose }: Props = $props();

  let capturedText = $state('');
  let newLabel = $state('');
  let error = $state('');
  // A notice is about the capture that raised it: once a text is received, it is outdated.
  const capturesAtOpening = untrack(() => inbox.capturedTexts.length);
  const visibleNotice = $derived(
    inbox.capturedTexts.length === capturesAtOpening ? notice : undefined,
  );
  let actionsFor: Proposal | undefined = $state();
  let dishActionsFor: string | undefined = $state();
  const typingOpen = $derived((notice !== undefined && !reading) || inbox.proposals.length === 0);

  type Segment =
    | { readonly key: string; readonly proposal: Proposal }
    | { readonly key: string; readonly toDefine: Proposal }
    | { readonly key: string; readonly dish: string; readonly proposals: readonly Proposal[] };

  // Consecutive ingredients of the same dish are shown as one group under its name.
  const segments = $derived(
    reviewOrder(inbox).reduce<Segment[]>((grouped, proposal) => {
      const last = grouped.at(-1);
      if (proposal.dishToDefine) return [...grouped, { key: proposal.id, toDefine: proposal }];
      if (proposal.dish === undefined) return [...grouped, { key: proposal.id, proposal }];
      if (last && 'dish' in last && labelKey(last.dish) === labelKey(proposal.dish)) {
        return [...grouped.slice(0, -1), { ...last, proposals: [...last.proposals, proposal] }];
      }
      return [...grouped, { key: proposal.id, dish: proposal.dish, proposals: [proposal] }];
    }, []),
  );

  // Explained once, on the first dish to define, rather than repeated on each of them.
  const firstToDefine = $derived(inbox.proposals.find((proposal) => proposal.dishToDefine)?.id);
  const received = $derived(inbox.capturedTexts.length);

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

  function defineDish(proposal: Proposal) {
    actionsFor = undefined;
    dishEditing = { kind: 'define', proposalId: proposal.id, name: proposal.label };
  }

  async function editDish(name: string) {
    dishActionsFor = undefined;
    const dish = await app.dish(name);
    if (!dish) return;
    const ingredientsText = dish.ingredients
      .map(({ label, toCheck }) => (toCheck ? `${label} ?` : label))
      .join('\n');
    dishEditing = { kind: 'update', name: dish.name, ingredientsText };
  }

  async function keepDishAsItem(name: string) {
    dishActionsFor = undefined;
    inbox = await app.keepDishAsItem(name);
  }

  // A long press emits `contextmenu` on Android, as do a right click and the keyboard menu key.
  function openActions(event: MouseEvent, open: () => void) {
    event.preventDefault();
    open();
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

  async function validate() {
    const addition = await app.validateInbox();
    inbox = await app.inbox();
    onvalidated(addition);
  }

  async function abandon() {
    inbox = await app.abandonInbox();
    onclose();
  }
</script>

<Sheet
  {title}
  hint={inbox.proposals.length > 0
    ? 'Touche un article pour l’écarter ou le remettre, appui long pour plus d’actions.'
    : undefined}
  {onclose}
>
  {#if visibleNotice}<p class="notice" role="status">{visibleNotice}</p>{/if}

  {#if received > 0}
    <details class="received">
      <summary>{received} texte{received > 1 ? 's' : ''} reçu{received > 1 ? 's' : ''}</summary>
      <section aria-label="Textes reçus">
        {#each inbox.capturedTexts as text, index (index)}
          <blockquote>{text}</blockquote>
        {/each}
      </section>
    </details>
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
              oncontextmenu={(event) => openActions(event, () => (dishActionsFor = segment.dish))}
            >
              <span class="capitalized">{segment.dish}</span>
            </button>
            <button
              type="button"
              class="more"
              aria-label="Actions du plat {segment.dish}"
              onclick={() => (dishActionsFor = segment.dish)}>⋯</button
            >
            <ul aria-label="Ingrédients de {segment.dish}" class="chips">
              {#each segment.proposals as proposal (proposal.id)}
                <ProposalChip {proposal} ontoggle={toggle} onedit={(p) => (actionsFor = p)} />
              {/each}
            </ul>
          </li>
        {:else if 'toDefine' in segment}
          {@const proposal = segment.toDefine}
          <li class="dish to-define">
            <button
              type="button"
              class="dish-name"
              class:discarded={proposal.discarded}
              aria-label="{proposal.discarded
                ? 'Remettre'
                : 'Écarter'} le plat à définir {proposal.label}"
              onclick={() => toggle(proposal)}
              oncontextmenu={(event) => openActions(event, () => (actionsFor = proposal))}
            >
              <span class="capitalized">{proposal.label}</span>{#if proposal.toCheck}&nbsp;?{/if}
            </button>
            {#if proposal.id === firstToDefine}
              <p class="to-define-hint">
                Un plat inconnu n'ajoute rien à la liste tant qu'il n'est pas défini.
              </p>
            {/if}
            <div class="to-define-actions">
              <button
                type="button"
                class="button define"
                aria-label="Définir le plat {proposal.label}"
                onclick={() => defineDish(proposal)}>Définir</button
              >
              <button
                type="button"
                class="button keep"
                aria-label="Garder {proposal.label} comme article"
                onclick={async () => (inbox = await app.keepAsItem(proposal.id))}
                >C'est un article</button
              >
            </div>
          </li>
        {:else}
          <ProposalChip
            proposal={segment.proposal}
            ontoggle={toggle}
            onedit={(p) => (actionsFor = p)}
          />
        {/if}
      {/each}
    </ul>
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

  <div class="actions validation">
    <button type="button" class="button" onclick={abandon}>Annuler</button>
    <button type="button" class="button primary" disabled={kept === 0} onclick={validate}>
      Ajouter {kept} à la liste
    </button>
  </div>
</Sheet>

{#if actionsFor}
  <ProposalActionsSheet
    {app}
    proposal={actionsFor}
    onchange={(changed) => (inbox = changed)}
    ondefinedish={defineDish}
    onclose={() => (actionsFor = undefined)}
  />
{/if}

{#if dishActionsFor !== undefined}
  {@const name = dishActionsFor}
  <DishActionsSheet
    {name}
    onedit={() => editDish(name)}
    onkeepasitem={() => keepDishAsItem(name)}
    onclose={() => (dishActionsFor = undefined)}
  />
{/if}

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
    margin: 0 0 12px;
  }

  .received section {
    display: flex;
    flex-direction: column;
    gap: 6px;
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

  .dish {
    position: relative;
  }

  .dish:not(.to-define) .dish-name {
    max-width: calc(100% - var(--target) - 8px);
  }

  .more {
    position: absolute;
    top: 6px;
    right: 8px;
    width: var(--target);
    height: var(--target);
    border: none;
    border-radius: 14px;
    background: transparent;
    color: var(--ground);
    font-size: 1.4rem;
    font-weight: 800;
  }

  .to-define {
    border-style: dashed;
    padding-bottom: 12px;
  }

  .to-define-hint {
    margin: 0 6px 10px;
    color: var(--surface-muted);
    font-size: 0.85rem;
  }

  .to-define-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .to-define .define {
    border-color: var(--accent);
    background: var(--accent);
    color: var(--on-accent);
  }

  .dish-name.discarded {
    color: var(--surface-muted);
    text-decoration: line-through;
  }

  details {
    margin-top: 8px;
  }

  /* The sheet scrolls; the way out of it stays at hand. */
  .validation {
    position: sticky;
    bottom: calc(-20px - env(safe-area-inset-bottom));
    margin-inline: -20px;
    padding: 12px 20px calc(20px + env(safe-area-inset-bottom));
    margin-bottom: calc(-20px - env(safe-area-inset-bottom));
    background: var(--ink);
  }

  summary {
    padding: 12px 0;
    color: var(--surface-muted);
    font-weight: 600;
    cursor: pointer;
  }
</style>
