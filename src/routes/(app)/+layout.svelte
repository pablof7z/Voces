<script lang="ts">
  import Layout from '$lib/components/Layout.svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  const { children }: Props = $props();
</script>

<Layout>
  {@render children()}
</Layout>
