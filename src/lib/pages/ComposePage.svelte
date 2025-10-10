<script lang="ts">
  import { goto } from '$app/navigation';
  import ComposeDialog from '$lib/components/ComposeDialog.svelte';

  let showDialog = $state(true);

  function handleClose() {
    goto('/');
  }

  function handlePublished() {
    goto('/');
  }
</script>

<ComposeDialog bind:open={showDialog} onClose={handleClose} onPublished={handlePublished} />
