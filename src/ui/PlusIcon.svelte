<script lang="ts">
  interface Props {
    size: number;
  }

  const { size }: Props = $props();
</script>

<svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size}>
  <path d="M12 5v14M5 12h14" />
</svg>

<style>
  svg {
    display: block;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.8;
    stroke-linecap: round;
  }
</style>
