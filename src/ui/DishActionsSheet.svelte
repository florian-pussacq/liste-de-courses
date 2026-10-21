<script lang="ts">
  import Sheet from './Sheet.svelte';

  interface Props {
    name: string;
    onedit: () => void;
    onkeepasitem: () => void;
    onclose: () => void;
  }

  const { name, onedit, onkeepasitem, onclose }: Props = $props();
</script>

<Sheet title={name} hint="Ce plat reste mémorisé, quoi que tu choisisses ici." {onclose}>
  <div class="actions">
    <button type="button" class="button primary" onclick={onedit}>Modifier les ingrédients</button>
    <button type="button" class="button" onclick={onkeepasitem}>
      Garder comme article cette fois
    </button>
    <button type="button" class="button" onclick={onclose}>Fermer</button>
  </div>
</Sheet>
